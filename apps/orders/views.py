from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from .models import Order


@login_required
def orders(request):
    order_list = Order.objects.prefetch_related(
        "items"
    ).order_by("-order_date")

    return render(request, "orders.html", {
        "orders": order_list
    })


@login_required
@require_POST
def toggle_order_status(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    if order.status == Order.Status.PREPARING:
        order.status = Order.Status.COMPLETED
    elif order.status == Order.Status.COMPLETED:
        order.status = Order.Status.PREPARING
    else:
        return JsonResponse(
            {"error": "This order cannot be updated."},
            status=400
        )

    order.save(update_fields=["status"])

    return JsonResponse({
        "status": order.status,
        "status_display": order.get_status_display()
    })
