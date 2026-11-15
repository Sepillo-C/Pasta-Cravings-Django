from django.shortcuts import render, redirect, get_object_or_404
from apps.accounts.views import admin_required
from .models import Product
from .forms import ProductForm


@admin_required
def product_view(request):
    products_list = Product.objects.all().order_by("id")

    categories = (
        Product.objects.order_by("category")
        .values_list("category", flat=True)
        .distinct()
    )

    context = {
        "products": products_list,
        "categories": categories,
        "form": ProductForm(),
    }

    return render(request, "product_records.html", context)


@admin_required
def add_product_view(request):
    if request.method == "POST":
        form = ProductForm(request.POST)

        if form.is_valid():
            form.save()

    return redirect("product")


@admin_required
def edit_product_view(request, pk):
    product = get_object_or_404(Product, pk=pk)

    if request.method == "POST":
        form = ProductForm(request.POST, instance=product)

        if form.is_valid():
            form.save()

    return redirect("product")