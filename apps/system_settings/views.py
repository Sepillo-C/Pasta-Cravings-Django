from django.shortcuts import render, redirect

from apps.accounts.views import admin_required
from .models import CompanySettings
from .forms import CompanySettingsForm


@admin_required
def settings_view(request):
    company_settings, created = CompanySettings.objects.get_or_create(
        pk=1,
        defaults={
            "company_name": "Pasta Cravings",
        }
    )

    if request.method == "POST":
        form = CompanySettingsForm(
            request.POST,
            instance=company_settings
        )

        if form.is_valid():
            form.save()
            return redirect("system_settings:settings")
    else:
        form = CompanySettingsForm(instance=company_settings)

    return render(request, "settings.html", {
        "form": form,
        "company_settings": company_settings,
    })