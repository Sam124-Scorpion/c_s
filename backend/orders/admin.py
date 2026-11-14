from django.contrib import admin
from .models import Order, OrderItem
# Register your models here.




class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'id' , 'user' , 'reciever_name' , 'reciever_phone_number' , 'delivery_time' , 'delivery_address' , 'delivery_date' , 'status' , 'payment_status' , 'total_price' , 'created_at' , 'updated_at'
    ]
    list_filter = ['status', 'payment_status', 'delivery_date', 'city']
    search_fields = ['user__username', 'reciever_name', 'reciever_phone_number']

    readonly_fields = ['created_at', 'updated_at']

    inlines = [OrderItemInline]

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'cake', 'quantity', 'price']