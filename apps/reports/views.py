from django.shortcuts import render
from apps.accounts.views import admin_required


@admin_required
def reports_view(request):
    return render(request, "reports.html")