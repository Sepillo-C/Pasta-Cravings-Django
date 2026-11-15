from django.contrib import admin
from .models import Expense


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "description",
        "category",
        "amount",
        "expense_date",
    )

    list_filter = ("category", "expense_date")
    search_fields = ("description",)