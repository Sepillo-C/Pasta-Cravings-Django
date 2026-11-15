from datetime import time

from django.db import models


class CompanySettings(models.Model):
    company_name = models.CharField(
        max_length=150,
        default="Pasta Cravings"
    )
    contact_details = models.CharField(
        max_length=200,
        blank=True
    )
    opening_time = models.TimeField(
        default=time(12, 0)
    )
    closing_time = models.TimeField(
        default=time(20, 0)
    )
    address = models.CharField(
        max_length=255,
        blank=True
    )
    facebook = models.URLField(blank=True)
    instagram = models.URLField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Company Settings"
        verbose_name_plural = "Company Settings"

    def __str__(self):
        return self.company_name