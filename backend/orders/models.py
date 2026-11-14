from django.db import models
from django.contrib.auth.models import User
from products.models import Cake




class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')

    special_instructions = models.TextField(blank=True, null=True)

    reciever_name = models.CharField(max_length=100)
    reciever_phone_number = models.CharField(max_length=15)

    delivery_address = models.TextField()
    delivery_date = models.DateField()
    delivery_time = models.TimeField()

    city = models.CharField(max_length=50)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')

    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} for {self.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')

    cake = models.ForeignKey(Cake, on_delete=models.CASCADE)

    quantity = models.PositiveIntegerField(default=1)
    
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.cake.name} for Order {self.order.id}"
    
    @property
    def total_price(self):
        return self.quantity * self.price

# Create your models here.
