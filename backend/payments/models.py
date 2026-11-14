from django.db import models

# Create your models here.
from django.conf import settings
from orders.models import Order


class Payment(models.Model):

    PAYMENT_METHOD_CHOICES = [
        ('upi', 'UPI'),
        ('cod', 'Cash on Delivery'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]       

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')

    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES)

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    transaction_reference = models.CharField(max_length=100, unique=True, null=True, blank=True)

    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES)

    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_payments')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"Payment for Order {self.order.id} - {self.payment_status}"