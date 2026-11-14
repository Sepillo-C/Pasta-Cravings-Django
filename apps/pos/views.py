
import json

from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_POST

from apps.orders.models import Order, OrderItem


PPN_RATE = Decimal("0.11")
SERVICE_CHARGE = Decimal("0.00")


def pos_view(request):
    return render(request, "pos.html")


@require_POST
def save_order(request):
    try:
        data = json.loads(request.body)

        items = data.get("items", [])
        cash = Decimal(str(data.get("cash", "0")))

        order_type = str(data.get("order_type", "Walk-in")).strip().lower()
        order_types = {
            "walk-in": "Walk-in",
            "walk in": "Walk-in",
            "to go": "To Go"
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

        subtotal = Decimal("0.00")
        validated_items = []

        for item in items:
            name = str(item.get("name", "")).strip()
            quantity = int(item.get("quantity", 0))
            price = Decimal(str(item.get("price", "0")))

            if not name or len(name) > 150:
                raise ValueError("Invalid product name.")

            if quantity < 1:
                raise ValueError("Invalid product quantity.")

            if price < 0:
                raise ValueError("Invalid product price.")

            subtotal += price * quantity

            validated_items.append({
                "name": name,
                "quantity": quantity,
                "price": price
            })

        subtotal = subtotal.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP
        )

        ppn = (subtotal * PPN_RATE).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP
        )

        total = subtotal + SERVICE_CHARGE + ppn

        if cash < total:
            return JsonResponse(
                {"error": "Insufficient payment."},
                status=400
            )

        change = cash - total

        with transaction.atomic():
            order = Order.objects.create(
                customer_name="Walk-in Customer",
                status=Order.Status.PREPARING,
                payment_method="Cash",
                order_type=order_type,
                subtotal=subtotal,
                service_charge=SERVICE_CHARGE,
                ppn=ppn,
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
                for item in validated_items
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
