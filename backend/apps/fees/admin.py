from django.contrib import admin

from .models import FeeCategory, FeeStructure, Invoice, InvoiceItem, Payment


@admin.register(FeeCategory)
class FeeCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "organization", "is_active")
    search_fields = ("name", "code")


@admin.register(FeeStructure)
class FeeStructureAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "academic_year", "class_level", "amount", "is_active")
    list_filter = ("academic_year", "is_active")
    search_fields = ("name",)


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 0


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ("is_reversed",)


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("number", "student", "total_amount", "paid_amount", "status", "is_active")
    list_filter = ("status", "is_active")
    search_fields = ("number", "student__first_name", "student__last_name")
    inlines = [InvoiceItemInline, PaymentInline]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("receipt_number", "invoice", "amount", "method", "is_reversed", "paid_at")
    list_filter = ("method", "is_reversed")
    search_fields = ("receipt_number", "transaction_id")
