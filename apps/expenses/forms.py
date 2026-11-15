from django import forms
from .models import Expense


class ExpenseForm(forms.ModelForm):

    class Meta:
        model = Expense
        fields = [
            "description",
            "category",
            "amount",
            "expense_date",
        ]

        widgets = {
            "description": forms.TextInput(attrs={
                "placeholder": "Enter expense description",
            }),
            "category": forms.Select(),
            "amount": forms.NumberInput(attrs={
                "placeholder": "0.00",
                "min": "0.01",
                "step": "0.01",
            }),
            "expense_date": forms.DateInput(attrs={
                "type": "date",
            }),
        }

    def clean_amount(self):
        amount = self.cleaned_data["amount"]

        if amount <= 0:
            raise forms.ValidationError(
                "Amount must be greater than zero."
            )

        return amount