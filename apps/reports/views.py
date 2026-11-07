from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def customer_records_view(request):
    return render(request, "reports.html")

@login_required
def reports_view(request):
    return render(request, "reports.html")