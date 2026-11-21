from django.urls import path
from . import views

urlpatterns = [
    path("", views.customer_view, name="customer"),
    path(
        "delete/<int:pk>/",
        views.delete_customer_view,
        name="delete_customer"
    ),
]