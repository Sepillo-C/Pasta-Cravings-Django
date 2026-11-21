from django.contrib import admin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "total_orders")
    search_fields = ("name",)

    def total_orders(self, obj):
        return obj.orders.count()

    total_orders.short_description = "Total Orders"