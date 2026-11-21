import json

from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required

from apps.orders.models import Order, OrderItem
from apps.customers.models import Customer
from apps.products.models import Product


SERVICE_CHARGE = Decimal("0.00")


@login_required
def pos_view(request):
    products = Product.objects.filter(
        status="Available"
    ).order_by("id")

    categories = (
        products.order_by("category")
        .values_list("category", flat=True)
        .distinct()
    )

    return render(request, "pos.html", {
        "products": products,
        "categories": categories,
    })


@login_required
@require_POST
def save_order(request):
    try:
        data = json.loads(request.body)

        if not isinstance(data, dict):
            return JsonResponse(
                {"error": "Invalid request data."},
                status=400
            )

        items = data.get("items", [])
        cash = Decimal(str(data.get("cash", "0")))

        order_type = str(
            data.get("order_type", "Walk-In")
        ).strip().lower()

        order_types = {
            "walk-in": "Walk-In",
            "walk in": "Walk-In",
            "to go": "To Go",
        }

        order_type = order_types.get(order_type)

        if not order_type:
            return JsonResponse(
                {"error": "Invalid order type."},
                status=400
            )

        if not isinstance(items, list) or not items:
            return JsonResponse(
                {"error": "Your order is empty."},
                status=400
            )

        if not cash.is_finite() or cash < 0:
            return JsonResponse(
                {"error": "Invalid cash amount."},
                status=400
            )

        validated_items = []
        product_ids = []

        for item in items:
            if not isinstance(item, dict):
                raise ValueError("Invalid order item.")

            product_id = int(item.get("product_id", 0))
            quantity = int(item.get("quantity", 0))

            if product_id < 1:
                raise ValueError("Invalid product.")

            if quantity < 1:
                raise ValueError("Invalid product quantity.")

            product_ids.append(product_id)

            validated_items.append({
                "product_id": product_id,
                "quantity": quantity,
            })

        with transaction.atomic():
            products = Product.objects.select_for_update().filter(
                id__in=product_ids,
                status="Available"
            ).in_bulk()

            subtotal = Decimal("0.00")
            order_items = []

            for item in validated_items:
                product = products.get(item["product_id"])

                if not product:
                    return JsonResponse(
                        {
                            "error": (
                                "A product in your order is no longer "
                                "available. Please refresh the POS."
                            )
                        },
                        status=400
                    )

                price = product.price.quantize(
                    Decimal("0.01"),
                    rounding=ROUND_HALF_UP
                )

                quantity = item["quantity"]
                subtotal += price * quantity

                order_items.append({
                    "name": product.product,
                    "quantity": quantity,
                    "price": price,
                })

            subtotal = subtotal.quantize(
                Decimal("0.01"),
                rounding=ROUND_HALF_UP
            )

            total = subtotal + SERVICE_CHARGE

            if cash < total:
                return JsonResponse(
                    {
                        "error": (
                            f"Insufficient payment. "
                            f"Total: ₱{total:.2f}"
                        )
                    },
                    status=400
                )

            change = (cash - total).quantize(
                Decimal("0.01"),
                rounding=ROUND_HALF_UP
            )

            customer = Customer.objects.create(
                name="Walk-in Customer"
            )

            order = Order.objects.create(
                customer=customer,
                customer_name=customer.name,
                status=Order.Status.PREPARING,
                payment_method="Cash",
                order_type=order_type,
                subtotal=subtotal,
                service_charge=SERVICE_CHARGE,
                ppn=Decimal("0.00"),
                total_amount=total,
                cash_received=cash,
                change_amount=change
            )

            OrderItem.objects.bulk_create([
                OrderItem(
                    order=order,
                    product_name=item["name"],
                    quantity=item["quantity"],
                    unit_price=item["price"]
                )
                for item in order_items
            ])

        return JsonResponse({
            "message": "Payment successful. Order saved.",
            "order_id": order.id,
            "total": str(total),
            "change": str(change)
        }, status=201)

    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {"error": "Invalid request data."},
            status=400
        )

    except (ValueError, TypeError, InvalidOperation):
        return JsonResponse(
            {"error": "Invalid order or payment information."},
            status=400
        )