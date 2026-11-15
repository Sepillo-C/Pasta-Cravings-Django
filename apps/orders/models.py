from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Order(models.Model):

    class Status(models.TextChoices):
        PREPARING = "PREPARING", "Preparing"
        COMPLETED = "COMPLETED", "Completed"

    customer_name = models.CharField(
        max_length=150,
        default="Walk-in Customer"
    )

    order_date = models.DateTimeField(auto_now_add=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PREPARING
    )

    payment_method = models.CharField(
        max_length=50,
        default="Cash"
    )

    order_type = models.CharField(
        max_length=20,
        default="Dine In"
    )

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00")
    )

    service_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00")
    )

    ppn = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00")
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00")
    )

    cash_received = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00")
    )

    change_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00")
    )

    def __str__(self):
        return f"Order #{self.id} - {self.customer_name}"


class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product_name = models.CharField(max_length=150)

    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"

    @property
    def line_total(self):
        return self.quantity * self.unit_price