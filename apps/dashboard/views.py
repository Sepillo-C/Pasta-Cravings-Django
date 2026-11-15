from django.shortcuts import render
from apps.accounts.views import admin_required


@admin_required
def dashboard_view(request):
    return render(request, "dashboard.html")