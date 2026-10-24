from django.urls import path
from . import views

urlpatterns = [
    path('', views.customer_view, name='customer'),
    path('add/', views.add_customer_view, name='add_customer'),
    path('edit/<int:pk>/', views.edit_customer_view, name='edit_customer'),
]