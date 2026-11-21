from django.db import models


class Customer(models.Model):
    name = models.CharField(max_length=150, default="Walk-in Customer")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Customer C{self.pk:03d}"