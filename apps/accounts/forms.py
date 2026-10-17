from django import forms
import re


class LoginForm(forms.Form):

    email = forms.EmailField(
        label="Email",
        widget=forms.EmailInput(attrs={
            "placeholder": "example@gmail.com"
        })
    )

    password = forms.CharField(
        label="Password",
        widget=forms.PasswordInput(attrs={
            "placeholder": "Enter your password"
        })
    )

    def clean_email(self):
        email = self.cleaned_data.get("email")

        if not re.fullmatch(
            r"[A-Za-z0-9._%+-]+@gmail\.com", email
        ):
            raise forms.ValidationError(
                "Email must end with @gmail.com."
            )

        return email

    def clean_password(self):
        password = self.cleaned_data.get("password")

        if len(password) < 9:
            raise forms.ValidationError(
                "Password must have at least 9 characters."
            )

        if not re.search(r"[^A-Za-z0-9]", password):
            raise forms.ValidationError(
                "Password must contain at least one special character."
            )

        return password