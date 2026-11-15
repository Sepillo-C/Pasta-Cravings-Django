from datetime import datetime
from decimal import Decimal

from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.http import require_GET

from apps.accounts.views import admin_required
from apps.orders.models import Order


def get_sales_summary(orders):
    from django.db.models import Sum, Count, Avg

    data = orders.aggregate(
        total_sales=Sum("total_amount"),
        gross_sales=Sum("subtotal"),
        tax=Sum("ppn"),
        service_charge=Sum("service_charge"),
        total_orders=Count("id"),
        average_order=Avg("total_amount"),
    )

    for key in ("total_sales", "gross_sales", "tax", "service_charge", "average_order"):
        data[key] = str(data[key] or Decimal("0.00"))

    return data


@admin_required
def reports_view(request):
    return render(request, "reports.html")


@admin_required
@require_GET
def daily_report(request):
    try:
        selected_date = datetime.strptime(
            request.GET.get("date", ""),
            "%Y-%m-%d"
        ).date()
    except ValueError:
        return JsonResponse({"error": "Invalid date."}, status=400)

    orders = Order.objects.filter(order_date__date=selected_date)

    return JsonResponse(get_sales_summary(orders))


@admin_required
@require_GET
def monthly_report(request):
    try:
        selected_month = datetime.strptime(
            request.GET.get("month", ""),
            "%Y-%m"
        )
    except ValueError:
        return JsonResponse({"error": "Invalid month."}, status=400)

    orders = Order.objects.filter(
        order_date__year=selected_month.year,
        order_date__month=selected_month.month
    )

    summary = get_sales_summary(orders)

    weeks = [Decimal("0.00") for _ in range(6)]

    for order in orders.only("order_date", "total_amount"):
        order_date = timezone.localtime(order.order_date)
        week_index = (order_date.day - 1) // 7
        weeks[week_index] += order.total_amount

    summary["weeks"] = [
        {
            "label": f"Week {index + 1}",
            "sales": str(sales)
        }
        for index, sales in enumerate(weeks)
    ]

    return JsonResponse(summary)