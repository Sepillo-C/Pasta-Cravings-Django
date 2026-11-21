from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Sum
from django.db.models.functions import Coalesce
from django.contrib import messages

from apps.accounts.views import admin_required
from .models import Customer


@admin_required
def customer_view(request):
    customers_list = (
        Customer.objects
        .annotate(
            total_orders=Coalesce(
                Sum("orders__items__quantity"),
                0
            )
        )
        .order_by("id")
    )

    return render(request, "customer_records.html", {
        "customers": customers_list,
    })


@admin_required
def delete_customer_view(request, pk):
    if request.method == "POST":
        customer = get_object_or_404(Customer, pk=pk)
        customer_id = customer.pk

        customer.delete()

        messages.success(
            request,
            f"Customer C{customer_id:03d} deleted successfully."
        )

    return redirect("customer")