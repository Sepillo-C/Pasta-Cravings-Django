from django.urls import path
from . import views

app_name = "pos"

urlpatterns = [
    path("", views.pos_view, name="pos"),
    path("save-order/", views.save_order, name="save-order"),
]