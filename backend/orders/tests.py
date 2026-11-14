from django.test import TestCase

# Create your tests here.
from datetime import date, time
from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from products.models import Cake, Category
from cart.models import Cart, CartItem
from payments.models import Payment
from .models import Order, OrderItem


class AdminOrderApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            username='customer',
            password='customer-password',
        )
        self.superuser = User.objects.create_superuser(
            username='shop-owner',
            email='owner@example.com',
            password='owner-password',
        )
        category = Category.objects.create(name='Celebration')
        self.cake = Cake.objects.create(
            name='Vanilla cake',
            price=Decimal('20.00'),
            category=category,
            stock=5,
        )
        self.order = Order.objects.create(
            user=self.customer,
            reciever_name='Customer',
            reciever_phone_number='5551234567',
            delivery_address='10 Cake Street',
            delivery_date=date(2026, 10, 25),
            delivery_time=time(15, 30),
            city='Sweetville',
            total_price=Decimal('40.00'),
        )
        OrderItem.objects.create(
            order=self.order,
            cake=self.cake,
            quantity=2,
            price=Decimal('20.00'),
        )

    def test_superuser_can_list_consumer_orders_and_items(self):
        self.client.force_authenticate(user=self.superuser)

        response = self.client.get('/api/orders/admin/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]['username'], 'customer')
        self.assertEqual(response.data[0]['items'][0]['cake_name'], 'Vanilla cake')
        self.assertEqual(response.data[0]['items'][0]['line_total'], '40.00')

    def test_superuser_can_update_order_status(self):
        self.client.force_authenticate(user=self.superuser)

        response = self.client.patch(
            f'/api/orders/admin/{self.order.id}/',
            {'status': 'processing', 'payment_status': 'paid'},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'processing')
        self.assertEqual(self.order.payment_status, 'paid')

    def test_regular_customer_cannot_manage_orders(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.get('/api/orders/admin/')

        self.assertEqual(response.status_code, 403)

    def test_customer_can_list_only_their_own_orders(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.get('/api/orders/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['items'][0]['cake_name'], 'Vanilla cake')

    def test_customer_can_create_order_from_cart(self):
        cart = Cart.objects.create(user=self.customer)
        CartItem.objects.create(cart=cart, product=self.cake, quantity=2)
        self.client.force_authenticate(user=self.customer)

        response = self.client.post('/api/orders/', {
            'reciever_name': 'Customer',
            'reciever_phone_number': '5551234567',
            'delivery_address': '10 Cake Street',
            'city': 'Sweetville',
            'delivery_date': '2026-11-10',
            'delivery_time': '15:30',
            'payment_method': 'cod',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['order']['total_price'], '40.00')
        self.assertEqual(response.data['order']['items'][0]['quantity'], 2)
        self.assertEqual(self.cake.__class__.objects.get(pk=self.cake.pk).stock, 3)
        self.assertFalse(cart.items.exists())
        self.assertTrue(Payment.objects.filter(order_id=response.data['order']['id']).exists())

    def test_customer_cannot_create_order_when_cart_is_empty(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.post('/api/orders/', {
            'reciever_name': 'Customer',
            'reciever_phone_number': '5551234567',
            'delivery_address': '10 Cake Street',
            'city': 'Sweetville',
            'delivery_date': '2026-11-10',
            'delivery_time': '15:30',
        }, format='json')

        self.assertEqual(response.status_code, 400)
