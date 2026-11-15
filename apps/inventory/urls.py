from django.urls import path
from . import views

urlpatterns = [
    path("", views.inventory_list, name="inventory"),
    path("api/", views.inventory_api, name="inventory_api"),
    path("api/<int:pk>/", views.inventory_update, name="inventory_update"),
]