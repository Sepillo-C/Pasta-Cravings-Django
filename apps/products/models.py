from django.db import models


class Product(models.Model):
    STATUS_CHOICES = [
        ("Available", "Available"),
        ("Unavailable", "Unavailable"),
    ]

    product = models.CharField(max_length=150)
    category = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Available"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.product