"""Aggregation endpoints for the Principal dashboard (principal-dashboard.md §1)."""
from datetime import timedelta
from decimal import Decimal

from django.db.models import Sum
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.attendance.models import Attendance
from apps.audit.models import AuditLog
from apps.fees.models import Invoice, Payment
from apps.students.models import Student
from apps.teachers.models import Teacher


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        scope = (
            {}
            if (user.is_superuser or user.is_platform_admin)
            else {"organization_id": user.organization_id}
        )

        today = timezone.localdate()
        month_start = today.replace(day=1)

        students = Student.objects.filter(is_active=True, **scope).count()
        teachers = Teacher.objects.filter(is_active=True, **scope).count()

        todays = Attendance.objects.filter(date=today, is_active=True, **scope)
        total_marked = todays.count()
        present = todays.filter(status__in=["present", "late", "half_day"]).count()
        attendance_pct = round(present / total_marked * 100, 1) if total_marked else None

        collected = (
            Payment.objects.filter(
                is_reversed=False, is_active=True,
                paid_at__date__gte=month_start, **scope,
            ).aggregate(s=Sum("amount"))["s"]
            or 0
        )

        open_invoices = Invoice.objects.filter(
            is_active=True, status__in=["unpaid", "partial", "overdue"], **scope
        ).aggregate(total=Sum("total_amount"), paid=Sum("paid_amount"))
        dues = (open_invoices["total"] or 0) - (open_invoices["paid"] or 0)

        recent_audit = list(
            AuditLog.objects.filter(**scope)
            .order_by("-created_at")[:5]
            .values("action", "actor__email", "object_type", "created_at")
        )

        return Response({
            "students": students,
            "teachers": teachers,
            "attendance_today_pct": attendance_pct,
            "attendance_marked_today": total_marked,
            "fee_collected_this_month": float(collected),
            "outstanding_dues": float(dues),
            "recent_activity": recent_audit,
        })


class DashboardAnalyticsView(APIView):
    """Time-series + table data for the dashboard-01 style layout."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        scope = (
            {}
            if (user.is_superuser or user.is_platform_admin)
            else {"organization_id": user.organization_id}
        )
        today = timezone.localdate()

        # --- Fee collection: last 30 days, bucketed by day ---
        start = today - timedelta(days=29)
        buckets: dict = {}
        for paid_at, amount in Payment.objects.filter(
            is_reversed=False, is_active=True, paid_at__date__gte=start, **scope
        ).values_list("paid_at", "amount"):
            d = timezone.localtime(paid_at).date() if timezone.is_aware(paid_at) else paid_at.date()
            buckets[d] = buckets.get(d, Decimal("0")) + amount
        fees_series = []
        for i in range(30):
            d = start + timedelta(days=i)
            fees_series.append({"date": d.strftime("%b %d"), "amount": float(buckets.get(d, 0))})

        # --- Month-over-month change ---
        month_start = today.replace(day=1)
        last_month_end = month_start - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)

        def _sum(qs):
            return qs.aggregate(s=Sum("amount"))["s"] or Decimal("0")

        this_m = _sum(Payment.objects.filter(is_reversed=False, is_active=True, paid_at__date__gte=month_start, **scope))
        last_m = _sum(Payment.objects.filter(is_reversed=False, is_active=True, paid_at__date__range=(last_month_start, last_month_end), **scope))
        fees_change_pct = (
            round(float((this_m - last_m) / last_m) * 100, 1) if last_m else None
        )

        # --- Students month-over-month ---
        this_students = Student.objects.filter(
            is_active=True, created_at__date__gte=month_start, **scope
        ).count()
        last_students = Student.objects.filter(
            is_active=True,
            created_at__date__range=(last_month_start, last_month_end),
            **scope,
        ).count()
        students_change_pct = (
            round((this_students - last_students) / last_students * 100, 1)
            if last_students
            else None
        )

        # --- Fees: last 7 days, weekday labels (reuses the daily buckets) ---
        fees_week = []
        for i in range(7):
            d = today - timedelta(days=6 - i)
            fees_week.append({"day": d.strftime("%a"), "amount": float(buckets.get(d, 0))})

        # --- Attendance present-% : last 7 days ---
        att_start = today - timedelta(days=6)
        att_buckets: dict = {}
        for row in Attendance.objects.filter(
            date__gte=att_start, is_active=True, **scope
        ).values("date", "status"):
            pres, tot = att_buckets.get(row["date"], (0, 0))
            tot += 1
            if row["status"] in ("present", "late", "half_day"):
                pres += 1
            att_buckets[row["date"]] = (pres, tot)
        attendance_series = []
        for i in range(7):
            d = att_start + timedelta(days=i)
            pres, tot = att_buckets.get(d, (0, 0))
            attendance_series.append({
                "day": d.strftime("%a"),
                "pct": round(pres / tot * 100, 1) if tot else 0,
            })

        # --- Recent students (table) ---
        recent = (
            Student.objects.filter(is_active=True, **scope)
            .select_related("class_level", "section")
            .order_by("-created_at")[:8]
        )
        recent_students = [
            {
                "id": str(s.id),
                "name": s.full_name,
                "admission_number": s.admission_number,
                "class_level": s.class_level.name if s.class_level_id else "—",
                "section": s.section.name if s.section_id else "—",
                "status": s.status,
            }
            for s in recent
        ]

        # --- Recent invoices ---
        recent_invoices = [
            {
                "id": str(inv.id),
                "student": inv.student.full_name if inv.student_id else "—",
                "number": inv.number,
                "amount": float(inv.total_amount),
                "status": inv.status,
            }
            for inv in Invoice.objects.filter(is_active=True, **scope)
            .select_related("student")
            .order_by("-issue_date", "-created_at")[:5]
        ]

        return Response({
            "fees_series": fees_series,
            "fees_week": fees_week,
            "attendance_series": attendance_series,
            "fees_change_pct": fees_change_pct,
            "students_change_pct": students_change_pct,
            "recent_students": recent_students,
            "recent_invoices": recent_invoices,
        })
