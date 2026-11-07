from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Customer
from .forms import CustomerForm


@login_required
def customer_records_view(request):
    return render(request, "customer_records.html")


@login_required
def customer_view(request):
    customers_list = Customer.objects.all()

    context = {
        "customers": customers_list,
        "form": CustomerForm(),
    }

    return render(request, "customer_records.html", context)


@login_required
def add_customer_view(request):
    if request.method == "POST":
        form = CustomerForm(request.POST)

        if form.is_valid():
            form.save()

    return redirect("customer")


@login_required
def edit_customer_view(request, pk):
    customer = get_object_or_404(Customer, pk=pk)

    if request.method == "POST":
        form = CustomerForm(request.POST, instance=customer)

        if form.is_valid():
            form.save()

    return redirect("customer")