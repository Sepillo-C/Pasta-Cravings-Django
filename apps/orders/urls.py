from django.urls import path
from . import views

app_name = "orders"

urlpatterns = [
    path("", views.order_list_create, name="order-list-create"),
    path("<int:pk>/", views.order_detail, name="order-detail"),
    path("<int:pk>/status/", views.update_order_status, name="order-status"),
]