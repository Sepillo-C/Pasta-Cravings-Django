from django.contrib import admin
from django.urls import path
from apps.home.views import home, menu

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", home, name="home"),
    path("menu/", menu, name="menu"),
]