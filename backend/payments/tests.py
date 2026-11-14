from django.test import TestCase

from datetime import date, time
from decimal import Decimal

from django.contrib.auth.models import User
from rest_framework.test import APIClient

from orders.models import Order
from .models import Payment


class SubmitPaymentReferenceTests(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(username='customer', password='password')
		self.order = Order.objects.create(
			user=self.user,
			reciever_name='Customer',
			reciever_phone_number='5551234567',
			delivery_address='10 Cake Street',
			delivery_date=date(2026, 11, 10),
			delivery_time=time(15, 30),
			city='Sweetville',
			total_price=Decimal('20.00'),
		)
		self.payment = Payment.objects.create(
			order=self.order,
			payment_method='upi',
			amount=Decimal('20.00'),
			payment_status='pending',
		)
		self.client = APIClient()
		self.client.force_authenticate(user=self.user)

	def test_customer_can_submit_upi_reference(self):
		response = self.client.post('/api/payments/submit-reference/', {
			'order_id': self.order.id,
			'transaction_reference': 'UPI123456',
		}, format='json')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['payment_status'], 'pending')
		self.payment.refresh_from_db()
		self.assertEqual(self.payment.transaction_reference, 'UPI123456')
