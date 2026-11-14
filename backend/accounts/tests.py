from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient


class AccountApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_public_registration_creates_regular_consumer(self):
        response = self.client.post(
            '/api/auth/register/',
            {
                'username': 'new-customer',
                'email': 'customer@example.com',
                'password': 'secure-password-123',
                'password2': 'secure-password-123',
                'is_staff': True,
                'is_superuser': True,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username='new-customer')
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_current_user_endpoint_reports_superuser_role(self):
        user = User.objects.create_user(
            username='shop-owner',
            password='secure-password-123',
            is_superuser=True,
            is_staff=True,
        )
        self.client.force_authenticate(user=user)

        response = self.client.get('/api/auth/me/')

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['is_superuser'])

    def test_current_user_endpoint_requires_authentication(self):
        response = self.client.get('/api/auth/me/')

        self.assertEqual(response.status_code, 401)
