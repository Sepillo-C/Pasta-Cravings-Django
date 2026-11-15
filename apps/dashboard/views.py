from datetime import timedelta
from decimal import Decimal

from django.shortcuts import render
from django.db.models import Sum, Count
from django.utils import timezone

from apps.accounts.views import admin_required
from apps.orders.models import Order, OrderItem
from apps.expenses.models import Expense
from apps.system_settings.models import CompanySettings


@admin_required
def dashboard_view(request):
    today = timezone.localdate()
    start_date = today - timedelta(days=6)

    # COMPANY SETTINGS
    company_settings = CompanySettings.objects.filter(pk=1).first()

    # OVERALL SALES STATISTICS
    totals = Order.objects.aggregate(
        revenue=Sum("subtotal"),
        orders=Count("id"),
    )

    total_revenue = totals["revenue"] or Decimal("0.00")
    total_orders = totals["orders"]

    # EXPENSE STATISTICS
    total_expenses = (
        Expense.objects.aggregate(total=Sum("amount"))["total"]
        or Decimal("0.00")
    )

    net_income = total_revenue - total_expenses

    recent_expenses = Expense.objects.order_by(
        "-expense_date", "-id"
    )[:5]

    # PREPARE LAST 7 DAYS
    daily_sales = {
        start_date + timedelta(days=i): Decimal("0.00")
        for i in range(7)
    }

    # PREPARE LAST 6 MONTHS
    months = []

    for i in range(5, -1, -1):
        month_index = today.year * 12 + today.month - 1 - i
        year, month = divmod(month_index, 12)
        months.append((year, month + 1))

    monthly_sales = {
        month: Decimal("0.00")
        for month in months
    }

    first_month = months[0]

    monthly_start = today.replace(
        year=first_month[0],
        month=first_month[1],
        day=1,
    )

    # FETCH ORDERS FOR BOTH CHARTS
    orders = Order.objects.filter(
        order_date__date__range=(monthly_start, today)
    ).values("order_date", "subtotal")

    for order in orders:
        order_date = order["order_date"]

        if timezone.is_aware(order_date):
            order_date = timezone.localtime(order_date)

        day = order_date.date()
        month_key = (day.year, day.month)

        if day in daily_sales:
            daily_sales[day] += order["subtotal"]

        if month_key in monthly_sales:
            monthly_sales[month_key] += order["subtotal"]

    # DAILY CHART
    chart_data = [
        {
            "label": day.strftime("%a"),
            "date": day.strftime("%b %d"),
            "value": float(amount),
        }
        for day, amount in daily_sales.items()
    ]

    # MONTHLY CHART
    monthly_chart_data = [
        {
            "label": f"{year}-{month:02d}",
            "date": f"{month:02d}/{year}",
            "value": float(amount),
        }
        for (year, month), amount in monthly_sales.items()
    ]

    # TOP 10 BEST-SELLING PRODUCTS
    top_selling = (
        OrderItem.objects
        .values("product_name")
        .annotate(total_quantity=Sum("quantity"))
        .order_by("-total_quantity")[:10]
    )

    dashboard_data = {
        "revenue": float(total_revenue),
        "total_orders": total_orders,
        "total_expenses": float(total_expenses),
        "net_income": float(net_income),
        "chart": chart_data,
        "monthly_chart": monthly_chart_data,
        "top_selling": list(top_selling),
    }

    return render(request, "dashboard.html", {
        "dashboard_data": dashboard_data,
        "company_settings": company_settings,
        "recent_expenses": recent_expenses,
    })