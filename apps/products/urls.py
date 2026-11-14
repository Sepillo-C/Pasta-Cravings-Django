from django.urls import path
from . import views

urlpatterns = [
    path("", views.product_view, name="product"),
    path("add/", views.add_product_view, name="add_product"),
    path("edit/<int:pk>/", views.edit_product_view, name="edit_product"),
]