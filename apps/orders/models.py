from django.db import models

class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        COMPLETED = "COMPLETED", "Completed"
        REJECTED = "REJECTED", "Rejected"

    customer_name = models.CharField(max_length=150)
    id = models.AutoField(primary_key=True)
    menu_name = models.CharField(max_length=150)

    order_date = models.DateTimeField(auto_now_add=True, db_index=True)

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )

    class Meta:
        ordering = ["-order_date", "-id"]

    def __str__(self):
        return f"Order #{self.pk} - {self.customer_name}"