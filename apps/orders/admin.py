from django.contrib import admin
from .models import Order

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "customer_name",
        "id",
        "menu_name",
        "order_date",
        "status",
    )

    list_filter = ("status", "order_date")

    search_fields = (
        "id",
        "customer_name",
        "menu_name",
    )

    readonly_fields = ("id", "order_date")

    ordering = ("-order_date",)