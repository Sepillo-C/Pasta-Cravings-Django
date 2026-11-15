from django.db import models
from django.utils import timezone


class Expense(models.Model):

    class Category(models.TextChoices):
        INGREDIENTS = "Ingredients", "Ingredients"
        PACKAGING = "Packaging", "Packaging"
        ELECTRICITY = "Electricity", "Electricity"
        DRINKS = "Drinks", "Drinks"
        OTHER = "Other", "Other"

    description = models.CharField(max_length=200)
    category = models.CharField(
        max_length=30,
        choices=Category.choices,
        default=Category.OTHER,
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    expense_date = models.DateField(default=timezone.localdate)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-expense_date", "-id"]

    def __str__(self):
        return self.description