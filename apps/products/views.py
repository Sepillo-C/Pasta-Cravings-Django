from django.shortcuts import render, redirect, get_object_or_404
from .models import Product
from .forms import ProductForm


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


def add_product_view(request):
    if request.method == "POST":
        form = ProductForm(request.POST)
        if form.is_valid():
            form.save()

    return redirect("product")


def edit_product_view(request, pk):
    product = get_object_or_404(Product, pk=pk)

    if request.method == "POST":
        form = ProductForm(request.POST, instance=product)
        if form.is_valid():
            form.save()

    return redirect("product")