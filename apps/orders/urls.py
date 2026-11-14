from django.urls import path
from . import views

urlpatterns = [
    path("", views.orders, name="orders"),
    path(
        "toggle/<int:order_id>/",
        views.toggle_order_status,
        name="toggle_order_status"
    ),
]
