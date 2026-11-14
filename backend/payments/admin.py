from django.contrib import admin

# Register your models here.
from .models import Payment



@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'payment_method', 'amount', 'payment_status', 'transaction_reference', 'verified_by', 'created_at', 'updated_at')

    list_filter = ('payment_method', 'payment_status', 'created_at', 'updated_at')

    search_fields = ('order__id', 'verified_by__username' , 'transaction_reference')
    
    readonly_fields = ('created_at', 'updated_at')