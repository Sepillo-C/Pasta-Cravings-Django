from django.contrib import admin

from .models import CompanySettings


@admin.register(CompanySettings)
class CompanySettingsAdmin(admin.ModelAdmin):
    list_display = (
        "company_name",
        "contact_details",
        "opening_time",
        "closing_time",
        "updated_at",
    )