from django.shortcuts import render, redirect, get_object_or_404
from apps.accounts.views import admin_required
from .models import Customer
from .forms import CustomerForm


@admin_required
def customer_view(request):
    customers_list = Customer.objects.all()

    context = {
        "customers": customers_list,
        "form": CustomerForm(),
    }

    return render(request, "customer_records.html", context)


@admin_required
def add_customer_view(request):
    if request.method == "POST":
        form = CustomerForm(request.POST)

        if form.is_valid():
            form.save()
            return redirect("customer")

        customers_list = Customer.objects.all()

        return render(request, "customer_records.html", {
            "customers": customers_list,
            "form": form,
        })

    return redirect("customer")


@admin_required
def edit_customer_view(request, pk):
    customer = get_object_or_404(Customer, pk=pk)

    if request.method == "POST":
        form = CustomerForm(request.POST, instance=customer)

        if form.is_valid():
            form.save()

    return redirect("customer")