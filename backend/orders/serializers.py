from rest_framework import serializers
from django.db import transaction
from rest_framework.exceptions import ValidationError

from cart.models import Cart
from payments.models import Payment
from products.models import Cake
from .models import Order, OrderItem
from .email import send_order_confirmation_email

class AdminOrderItemSerializer(serializers.ModelSerializer):
    cake_name = serializers.CharField(source='cake.name', read_only=True)


    line_total = serializers.DecimalField(
        source='total_price',
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = OrderItem
        fields = ['id', 'cake', 'cake_name', 'quantity', 'price', 'line_total']


class AdminOrderSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    items = AdminOrderItemSerializer(many=True, read_only=True)


    class Meta:
        model = Order
        fields = [
            'id',
            'username',
            'reciever_name',
            'reciever_phone_number',
            'delivery_address',
            'city',
            'delivery_date',
            'delivery_time',
            'special_instructions',
            'status',
            'payment_status',
            'total_price',
            'items',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'username',
            'reciever_name',
            'reciever_phone_number',
            'delivery_address',
            'city',
            'delivery_date',
            'delivery_time',
            'special_instructions',
            'total_price',
            'items',
            'created_at',
            'updated_at',
        ]

class CustomerOrderItemSerializer(serializers.ModelSerializer):
    cake_name = serializers.CharField(source='cake.name', read_only=True)


    line_total = serializers.DecimalField(
        source='total_price',
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = OrderItem
        fields = ['id', 'cake', 'cake_name', 'quantity', 'price', 'line_total']


class CustomerOrderSerializer(serializers.ModelSerializer):
    items = CustomerOrderItemSerializer(many=True, read_only=True)


    class Meta:
        model = Order
        fields = [
            'id',
            'reciever_name',
            'reciever_phone_number',
            'delivery_address',
            'city',
            'delivery_date',
            'delivery_time',
            'special_instructions',
            'status',
            'payment_status',
            'total_price',
            'items',
            'created_at',
        ]

class CustomerOrderCreateSerializer(serializers.Serializer):


    reciever_name = serializers.CharField(max_length=100)
    reciever_phone_number = serializers.CharField(max_length=15)
    delivery_address = serializers.CharField()
    city = serializers.CharField(max_length=50)
    delivery_date = serializers.DateField()
    delivery_time = serializers.TimeField()

    special_instructions = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    payment_method = serializers.ChoiceField(
        choices=Payment.PAYMENT_METHOD_CHOICES,
        default='cod',
    )

    def create(self, validated_data):

        user = self.context['request'].user
        payment_method = validated_data.pop('payment_method')

        with transaction.atomic():

            cart = Cart.objects.select_for_update().filter(
                user=user
            ).first()

            if cart is None:
                raise ValidationError({
                    'cart': 'Your cart is empty.'
                })

            cart_items = list(
                cart.items.select_related('product')
            )

            if not cart_items:
                raise ValidationError({
                    'cart': 'Your cart is empty.'
                })

            total_price = 0
            order_lines = []

            # Validate product availability and stock.
            for cart_item in cart_items:

                cake = Cake.objects.select_for_update().get(
                    pk=cart_item.product_id
                )

                if not cake.is_available:
                    raise ValidationError({
                        'cart': f'{cake.name} is no longer available.'
                    })

                if cake.stock < cart_item.quantity:
                    raise ValidationError({
                        'cart': f'Not enough stock for {cake.name}.'
                    })

                line_total = cake.price * cart_item.quantity
                total_price += line_total

                order_lines.append((
                    cart_item.quantity,
                    cake,
                    cake.price,
                ))

            # Create the order.
            order = Order.objects.create(
                user=user,
                total_price=total_price,
                **validated_data,
            )

            # Create order items.
            for quantity, cake, price in order_lines:

                OrderItem.objects.create(
                    order=order,
                    cake=cake,
                    quantity=quantity,
                    price=price,
                )

                # COD: Reduce stock immediately.
                # UPI: Reduce stock after admin verifies payment.
                if payment_method == 'cod':

                    cake.stock -= quantity

                    cake.save(
                        update_fields=['stock', 'updated_at']
                    )

            # Create payment record.
            Payment.objects.create(
                order=order,
                payment_method=payment_method,
                amount=total_price,
                payment_status='pending',
            )

            # Empty the customer's cart.
            cart.items.all().delete()

        if payment_method == 'cod':
            send_order_confirmation_email(order)

        return order

