from django.shortcuts import render, redirect, get_object_or_404
from .models import Customer
from .forms import CustomerForm


def customer_view(request):
    customers_list = Customer.objects.all()

    context = {
        "customers": customers_list,
        "form": CustomerForm(),
    }

    return render(request, "customer_records.html", context)


def add_customer_view(request):
    if request.method == "POST":
        form = CustomerForm(request.POST)

        if form.is_valid():
            form.save()

    return redirect("customer")


def edit_customer_view(request, pk):
    customer = get_object_or_404(Customer, pk=pk)

    if request.method == "POST":
        form = CustomerForm(request.POST, instance=customer)

        if form.is_valid():
            form.save()

    return redirect("customer")