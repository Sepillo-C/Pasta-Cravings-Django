import json
from datetime import date

from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods

from .models import Order


def order_to_dict(order):
    return {
        "id": order.id,
        "customer": order.customer_name,
        "menu": order.menu_name,
        "date": order.order_date.isoformat(),
        "status": order.status,
    }


def read_json(request):
    try:
        data = json.loads(request.body or "{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise ValueError("Request body must contain valid JSON.")

    if not isinstance(data, dict):
        raise ValueError("JSON body must be an object.")

    return data


@require_http_methods(["GET", "POST"])
def order_list_create(request):

    if request.method == "GET":
        orders = Order.objects.all()

        search = request.GET.get("q", "").strip()
        status = request.GET.get("status", "").strip().upper()
        start_date = request.GET.get("start_date", "").strip()
        end_date = request.GET.get("end_date", "").strip()

        # Search by ID, customer, or menu
        if search:
            if search.startswith("#") and search[1:].isdigit():
                orders = orders.filter(id=int(search[1:]))
            else:
                filters = (
                    Q(customer_name__icontains=search)
                    | Q(menu_name__icontains=search)
                )

                if search.isdigit():
                    filters |= Q(id=int(search))

                orders = orders.filter(filters)

        # Filter by status
        valid_statuses = Order.Status.values

        if status and status != "ALL":
            if status not in valid_statuses:
                return JsonResponse(
                    {"error": "Invalid order status."},
                    status=400
                )

            orders = orders.filter(status=status)

        # Filter by date
        try:
            if start_date:
                orders = orders.filter(
                    order_date__date__gte=date.fromisoformat(start_date)
                )

            if end_date:
                orders = orders.filter(
                    order_date__date__lte=date.fromisoformat(end_date)
                )

        except ValueError:
            return JsonResponse(
                {"error": "Date must use YYYY-MM-DD format."},
                status=400
            )

        # Pagination
        try:
            page_size = min(
                max(int(request.GET.get("page_size", 10)), 1), 100
            )
            page_number = max(int(request.GET.get("page", 1)), 1)

        except ValueError:
            return JsonResponse(
                {"error": "Invalid pagination values."},
                status=400
            )

        paginator = Paginator(orders, page_size)

        try:
            page_obj = paginator.page(page_number)

        except (EmptyPage, PageNotAnInteger):
            page_obj = paginator.page(paginator.num_pages or 1)

        return JsonResponse({
            "results": [
                order_to_dict(order)
                for order in page_obj.object_list
            ],
            "pagination": {
                "page": page_obj.number,
                "page_size": page_size,
                "total_orders": paginator.count,
                "total_pages": paginator.num_pages,
                "has_next": page_obj.has_next(),
                "has_previous": page_obj.has_previous(),
            }
        })

    # Create new order
    try:
        data = read_json(request)

        customer = str(data.get("customer", "")).strip()
        menu = str(data.get("menu", "")).strip()

        if not customer or not menu:
            return JsonResponse(
                {"error": "Customer and menu are required."},
                status=400
            )

        if len(customer) > 150 or len(menu) > 150:
            return JsonResponse(
                {"error": "Customer and menu must be 150 characters or fewer."},
                status=400
            )

        order = Order.objects.create(
            customer_name=customer,
            menu_name=menu,
        )

        return JsonResponse(
            {
                "message": "Order created successfully.",
                "order": order_to_dict(order)
            },
            status=201
        )

    except (ValueError, TypeError):
        return JsonResponse(
            {"error": "Invalid order data."},
            status=400
        )


@require_http_methods(["GET", "DELETE"])
def order_detail(request, pk):

    order = get_object_or_404(Order, pk=pk)

    if request.method == "GET":
        return JsonResponse({
            "order": order_to_dict(order)
        })

    order.delete()

    return JsonResponse({
        "message": "Order deleted successfully."
    })


@require_http_methods(["PATCH"])
def update_order_status(request, pk):

    order = get_object_or_404(Order, pk=pk)

    try:
        data = read_json(request)
        new_status = str(data.get("status", "")).strip().upper()

    except ValueError as error:
        return JsonResponse(
            {"error": str(error)},
            status=400
        )

    if new_status not in Order.Status.values:
        return JsonResponse(
            {
                "error": "Status must be PENDING, COMPLETED, or REJECTED."
            },
            status=400
        )

    order.status = new_status
    order.save(update_fields=["status"])

    return JsonResponse({
        "message": "Order status updated successfully.",
        "order": order_to_dict(order)
    })