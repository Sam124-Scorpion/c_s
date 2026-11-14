from django.db import models


# Create your models here.

class Category(models.Model):
    name = models.CharField(max_length=100 , unique=True)

    description = models.TextField(blank=True, null=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Cake(models.Model):
    name = models.CharField(max_length=100)

    description = models.TextField(blank=True, null=True)

    price = models.DecimalField(max_digits=10, decimal_places=2)

    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='cakes')

    weight = models.CharField(max_length=10, help_text="Weight in kg" , blank=True)

    stock = models.PositiveIntegerField(default=0)

    # image = models.ImageField(upload_to='cake_images/', blank=True, null=True)

    is_featured = models.BooleanField(default=False)

    is_available = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class CakeImage(models.Model):
    
    cake = models.ForeignKey(Cake, on_delete=models.CASCADE, related_name='images')

    image = models.ImageField(upload_to='cake_images/')

    created_at = models.DateTimeField(auto_now_add=True)

    is_primary = models.BooleanField(default=False)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Image for {self.cake.name}"