from django.db import models


class InventoryItem(models.Model):
    product = models.CharField(max_length=150)
    quantity = models.PositiveIntegerField(default=0)
    unit = models.CharField(max_length=30)
    minimum_stock = models.PositiveIntegerField(default=5)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["product"]

    def __str__(self):
        return self.product

    @property
    def is_low_stock(self):
        return self.quantity <= self.minimum_stock