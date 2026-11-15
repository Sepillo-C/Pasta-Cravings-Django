from django.shortcuts import render
from apps.accounts.views import admin_required


@admin_required
def inventory_list(request):
    return render(request, "inventory.html")