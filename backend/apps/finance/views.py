import datetime

from django.db import transaction
from django.db.models import Q, Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.services import record_audit
from apps.communications.models import Notification
from apps.communications.services import notify
from apps.core.permissions import HasPermission
from apps.core.sequences import next_document_number
from apps.core.viewsets import TenantModelViewSet
from apps.fees.models import Payment

from . import services
from .models import Expense, PayrollRun, Payslip, SalaryStructure, Vendor
from .serializers import (
    ExpenseSerializer,
    PayrollRunSerializer,
    PayslipSerializer,
    SalaryStructureSerializer,
    VendorSerializer,
)


def _crud(view, manage):
    return {"list": view, "retrieve": view, "create": manage, "update": manage,
            "partial_update": manage, "destroy": manage}


class VendorViewSet(TenantModelViewSet):
    serializer_class = VendorSerializer
    audit_label = "vendor"
    permission_required = _crud("finance.view", "finance.expense.manage")
    filterset_fields = ["category", "status"]
    search_fields = ["name", "code", "contact_person", "phone", "email"]

    def get_queryset(self):
        amount = Expense._meta.get_field("amount")
        self.queryset = Vendor.objects.annotate(
            total_purchases=Coalesce(Sum("expenses__amount", filter=Q(
                expenses__status__in=("approved", "paid"), expenses__is_active=True)), 0, output_field=amount),
            outstanding=Coalesce(Sum("expenses__amount", filter=Q(
                expenses__status="approved", expenses__is_active=True)), 0, output_field=amount),
        )
        return super().get_queryset()

    @transaction.atomic
    def perform_create(self, serializer):
        super().perform_create(serializer, code=next_document_number(self._require_org(), "VND"))

    def perform_destroy(self, instance):
        if instance.expenses.exists():
            raise ValidationError("This vendor has expenses; mark it inactive instead.")
        super().perform_destroy(instance)


class ExpenseViewSet(TenantModelViewSet):
    queryset = Expense.objects.select_related("vendor", "receipt", "created_by", "decided_by")
    serializer_class = ExpenseSerializer
    audit_label = "expense"
    permission_required = {**_crud("finance.view", "finance.expense.manage"),
                           "approve": "finance.expense.approve", "reject": "finance.expense.approve",
                           "pay": "finance.expense.manage"}
    filterset_fields = {"category": ["exact"], "status": ["exact"], "vendor": ["exact"],
                        "expense_date": ["gte", "lte"]}
    search_fields = ["code", "description", "vendor__name"]

    @transaction.atomic
    def perform_create(self, serializer):
        super().perform_create(serializer, code=next_document_number(self._require_org(), "EXP"))

    def perform_destroy(self, instance):
        if instance.status != Expense.Status.PENDING:
            raise ValidationError("Only pending expenses can be deleted.")
        super().perform_destroy(instance)

    @transaction.atomic
    def _decide(self, request, status):
        exp = Expense.objects.select_for_update().get(pk=self.get_object().pk)
        if exp.status != Expense.Status.PENDING:
            raise ValidationError("This expense was already decided.")
        if exp.created_by_id == request.user.pk:
            raise ValidationError("You can't approve or reject an expense you recorded.")
        exp.status, exp.decided_by, exp.decided_at = status, request.user, timezone.now()
        exp.remarks = str(request.data.get("remarks", exp.remarks))[:255]
        exp.save()
        record_audit(action=f"expense.{status}", actor=request.user, instance=exp, request=request,
                     organization=request.user.organization, changes={"amount": str(exp.amount)})
        if exp.created_by:
            notify([exp.created_by], title=f"Expense {status}: {exp.code}", body=exp.description,
                   category=Notification.Category.APPROVALS, related=exp)
        return Response(ExpenseSerializer(exp).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        return self._decide(request, Expense.Status.APPROVED)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        return self._decide(request, Expense.Status.REJECTED)

    @action(detail=True, methods=["post"])
    def pay(self, request, pk=None):
        exp = self.get_object()
        if exp.status != Expense.Status.APPROVED:
            raise ValidationError("Only approved expenses can be paid.")
        exp.status, exp.paid_at = Expense.Status.PAID, timezone.now()
        exp.payment_method = request.data.get("payment_method", exp.payment_method)
        exp.updated_by = request.user
        exp.save()
        record_audit(action="expense.paid", actor=request.user, instance=exp, request=request,
                     organization=request.user.organization)
        return Response(ExpenseSerializer(exp).data)


class SalaryStructureViewSet(TenantModelViewSet):
    queryset = SalaryStructure.objects.select_related("teacher")
    serializer_class = SalaryStructureSerializer
    audit_label = "salary_structure"
    permission_required = _crud("payroll.manage", "payroll.manage")
    filterset_fields = ["teacher"]


class PayrollRunViewSet(TenantModelViewSet):
    queryset = PayrollRun.objects.select_related("approved_by")
    serializer_class = PayrollRunSerializer
    audit_label = "payroll_run"
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    permission_required = {**_crud("payroll.manage", "payroll.manage"),
                           "payslips": "payroll.manage", "generate": "payroll.manage",
                           "adjust": "payroll.manage", "approve": "payroll.approve", "pay": "payroll.approve"}

    @transaction.atomic
    def perform_create(self, serializer):
        y, m = map(int, serializer.validated_data["month"].split("-"))
        extra = {} if serializer.validated_data.get("working_days") else {
            "working_days": services.default_working_days(y, m)}
        super().perform_create(serializer, **extra)
        services.generate(serializer.instance)

    def perform_update(self, serializer):
        if serializer.instance.status != PayrollRun.Status.DRAFT:
            raise ValidationError("Only draft runs can be changed.")
        super().perform_update(serializer)

    def perform_destroy(self, instance):
        if instance.status != PayrollRun.Status.DRAFT:
            raise ValidationError("Approved or paid payroll can't be deleted.")
        super().perform_destroy(instance)

    @action(detail=True, methods=["get"])
    def payslips(self, request, pk=None):
        run = self.get_object()
        slips = run.payslips.select_related("teacher", "run")
        return Response({"run": PayrollRunSerializer(run).data, "totals": services.totals(run),
                         "payslips": PayslipSerializer(slips, many=True).data})

    @action(detail=True, methods=["post"])
    def generate(self, request, pk=None):
        run = self.get_object()
        services.generate(run)
        return self.payslips(request, pk)

    @action(detail=True, methods=["patch"], url_path=r"payslips/(?P<payslip_id>[0-9a-f-]{36})")
    def adjust(self, request, pk=None, payslip_id=None):
        """Bonus / extra deduction / note on one payslip of a draft run."""
        run = self.get_object()
        if run.status != PayrollRun.Status.DRAFT:
            raise ValidationError("Only draft runs can be adjusted.")
        slip = run.payslips.filter(pk=payslip_id).first()
        if slip is None:
            raise ValidationError({"payslip": "Not found."})
        data = PayslipSerializer(slip, data=request.data, partial=True)
        data.is_valid(raise_exception=True)
        for f in ("bonus", "other_deduction"):
            if data.validated_data.get(f, 0) < 0:
                raise ValidationError({f: "Can't be negative."})
        slip = data.save()
        slip.recompute()
        slip.save(update_fields=["net", "updated_at"])
        return Response(PayslipSerializer(slip).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        run = self.get_object()
        if run.status != PayrollRun.Status.DRAFT:
            raise ValidationError("Only draft runs can be approved.")
        if run.created_by_id == request.user.pk:
            raise ValidationError("Payroll must be approved by someone other than its preparer.")
        if not run.payslips.exists():
            raise ValidationError("There are no payslips in this run.")
        run.status, run.approved_by, run.approved_at = PayrollRun.Status.APPROVED, request.user, timezone.now()
        run.save()
        record_audit(action="payroll.approve", actor=request.user, instance=run, request=request,
                     organization=request.user.organization, changes=services.totals(run))
        return Response(PayrollRunSerializer(run).data)

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def pay(self, request, pk=None):
        """Release salaries: records one paid salary expense per payslip so
        finance reports include payroll."""
        run = PayrollRun.objects.select_for_update().get(pk=self.get_object().pk)
        if run.status != PayrollRun.Status.APPROVED:
            raise ValidationError("Only approved runs can be paid.")
        now = timezone.now()
        y, m = map(int, run.month.split("-"))
        for slip in run.payslips.select_related("teacher"):
            Expense.objects.create(
                organization_id=run.organization_id, code=next_document_number(run.organization_id, "EXP"),
                category=Expense.Category.TEACHER_SALARY, description=f"Salary {run.month}: {slip.teacher.full_name}",
                amount=slip.net, expense_date=datetime.date(y, m, 1), payment_method=slip.payment_method,
                status=Expense.Status.PAID, decided_by=run.approved_by, decided_at=run.approved_at,
                paid_at=now, payroll_run=run, created_by=request.user, updated_by=request.user,
            )
            if slip.teacher.user_id:
                notify([slip.teacher.user], title=f"Salary paid for {run.month}",
                       body=f"Net {slip.net}", category=Notification.Category.SYSTEM,
                       type=Notification.Type.SUCCESS, related=slip)
        run.status, run.paid_at = PayrollRun.Status.PAID, now
        run.save()
        record_audit(action="payroll.paid", actor=request.user, instance=run, request=request,
                     organization=request.user.organization, changes=services.totals(run))
        return Response(PayrollRunSerializer(run).data)


class FinanceSummaryView(APIView):
    """Income (fee collections) vs expenses per month, and expenses by category."""

    permission_classes = [IsAuthenticated, HasPermission]
    required_permission = "finance.view"

    def get(self, request):
        org = request.user.organization_id
        try:
            months = min(max(int(request.query_params.get("months", 6)), 1), 24)
        except ValueError:
            raise ValidationError({"months": "Must be a number."})
        today = timezone.localdate()
        y, m, trend = today.year, today.month, []
        for _ in range(months):
            income = Payment.objects.filter(organization_id=org, is_reversed=False, paid_at__year=y,
                                            paid_at__month=m).aggregate(t=Sum("amount"))["t"] or 0
            spent = Expense.objects.filter(organization_id=org, status=Expense.Status.PAID,
                                           expense_date__year=y, expense_date__month=m
                                           ).aggregate(t=Sum("amount"))["t"] or 0
            trend.append({"month": f"{y}-{m:02d}", "income": float(income), "expenses": float(spent),
                          "net": float(income - spent)})
            y, m = (y - 1, 12) if m == 1 else (y, m - 1)
        this_month = Expense.objects.filter(organization_id=org, expense_date__year=today.year,
                                            expense_date__month=today.month)
        by_category = {c: float(t) for c, t in this_month.filter(status=Expense.Status.PAID)
                       .values_list("category").annotate(t=Sum("amount"))}
        return Response({
            "trend": list(reversed(trend)),
            "this_month": {
                "paid": float(sum(by_category.values())),
                "by_category": by_category,
                "pending_approval": this_month.filter(status=Expense.Status.PENDING).count(),
                "approved_unpaid": float(Expense.objects.filter(organization_id=org, status="approved")
                                         .aggregate(t=Sum("amount"))["t"] or 0),
            },
            "payroll_due": float(Payslip.objects.filter(organization_id=org, run__status="approved")
                                 .aggregate(t=Sum("net"))["t"] or 0),
        })


class MyPayslipsView(APIView):
    """A teacher's own payslips (approved or paid runs only)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.teachers.services import get_teacher

        teacher = get_teacher(request.user)
        if teacher is None:
            return Response([])
        slips = Payslip.objects.filter(teacher=teacher, run__status__in=("approved", "paid")).select_related("run", "teacher")
        return Response(PayslipSerializer(slips.order_by("-run__month"), many=True).data)
