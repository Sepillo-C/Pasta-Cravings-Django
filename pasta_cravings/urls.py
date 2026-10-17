from django.contrib import admin
from django.urls import path, include
from . import views   

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("apps.home.urls")),
    path("accounts/", include("apps.accounts.urls")),
    path("reports/", include("apps.reports.urls")),
    path("dashboard/", views.dashboard, name="dashboard"),
]