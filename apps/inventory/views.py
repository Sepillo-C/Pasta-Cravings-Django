import json

from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from apps.accounts.views import admin_required
from .models import InventoryItem


@admin_required
def inventory_list(request):
    return render(request, "inventory.html")


@admin_required
@require_http_methods(["GET", "POST"])
def inventory_api(request):
    if request.method == "GET":
        items = InventoryItem.objects.all()

        data = [{
            "id": item.id,
            "product": item.product,
            "quantity": item.quantity,
            "unit": item.unit,
            "minimumStock": item.minimum_stock,
        } for item in items]

        return JsonResponse(data, safe=False)

    try:
        data = json.loads(request.body)
        product = str(data.get("product", "")).strip()
        unit = str(data.get("unit", "")).strip()
        quantity = data.get("quantity")
        minimum_stock = data.get("minimumStock")

        if not product or len(product) > 150 or not unit or len(unit) > 30:
            return JsonResponse({"error": "Enter valid product and unit details."}, status=400)

        if (
            isinstance(quantity, bool) or
            isinstance(minimum_stock, bool) or
            not isinstance(quantity, int) or
            not isinstance(minimum_stock, int) or
            quantity < 0 or minimum_stock < 0
        ):
            return JsonResponse({"error": "Enter valid stock quantities."}, status=400)

        item = InventoryItem.objects.create(
            product=product,
            quantity=quantity,
            unit=unit,
            minimum_stock=minimum_stock,
        )

        return JsonResponse({"id": item.id, "message": "Inventory item added."}, status=201)

    except (json.JSONDecodeError, TypeError):
        return JsonResponse({"error": "Invalid request data."}, status=400)


@admin_required
@require_http_methods(["PATCH"])
def inventory_update(request, pk):
    item = get_object_or_404(InventoryItem, pk=pk)

    try:
        data = json.loads(request.body)
        product = str(data.get("product", "")).strip()
        unit = str(data.get("unit", "")).strip()
        quantity = data.get("quantity")
        minimum_stock = data.get("minimumStock")

        if not product or len(product) > 150 or not unit or len(unit) > 30:
            return JsonResponse({"error": "Enter valid product and unit details."}, status=400)

        if (
            isinstance(quantity, bool) or
            isinstance(minimum_stock, bool) or
            not isinstance(quantity, int) or
            not isinstance(minimum_stock, int) or
            quantity < 0 or minimum_stock < 0
        ):
            return JsonResponse({"error": "Enter valid stock quantities."}, status=400)

        item.product = product
        item.quantity = quantity
        item.unit = unit
        item.minimum_stock = minimum_stock
        item.save()

        return JsonResponse({"message": "Inventory item updated."})

    except (json.JSONDecodeError, TypeError):
        return JsonResponse({"error": "Invalid request data."}, status=400)