from django import forms

from .models import CompanySettings


class CompanySettingsForm(forms.ModelForm):
    class Meta:
        model = CompanySettings
        fields = [
            "company_name",
            "contact_details",
            "opening_time",
            "closing_time",
            "address",
            "facebook",
            "instagram",
        ]

        widgets = {
            "company_name": forms.TextInput(attrs={
                "placeholder": "Company name",
            }),
            "contact_details": forms.TextInput(attrs={
                "placeholder": "Enter contact details",
            }),
            "opening_time": forms.TimeInput(attrs={
                "type": "time",
            }),
            "closing_time": forms.TimeInput(attrs={
                "type": "time",
            }),
            "address": forms.TextInput(attrs={
                "placeholder": "Enter business address",
            }),
            "facebook": forms.URLInput(attrs={
                "placeholder": "Facebook",
            }),
            "instagram": forms.URLInput(attrs={
                "placeholder": "Instagram",
            }),
        }