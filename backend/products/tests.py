from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Cake, CakeImage, Category


class ProductAdminApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='shop-admin',
            password='test-password',
            is_superuser=True,
            is_staff=True,
        )
        self.category = Category.objects.create(name='Celebration')

    def test_category_list_returns_categories(self):
        response = self.client.get('/api/products/categories/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]['name'], 'Celebration')

    def test_admin_cake_list_includes_unavailable_cakes(self):
        Cake.objects.create(
            name='Hidden cake',
            price='20.00',
            category=self.category,
            is_available=False,
        )
        self.client.force_authenticate(user=self.admin)

        response = self.client.get('/api/products/admin/cakes/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertFalse(response.data[0]['is_available'])

    def test_admin_can_create_cake_with_category_id(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            '/api/products/admin/cakes/',
            {
                'name': 'Berry cake',
                'description': 'Fresh berries and cream',
                'price': '24.50',
                'stock': 4,
                'category_id': self.category.id,
                'is_available': True,
                'is_featured': True,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['category']['id'], self.category.id)
        self.assertTrue(response.data['is_featured'])
        self.assertEqual(Cake.objects.count(), 1)

    def test_admin_cake_list_requires_superuser_access(self):
        response = self.client.get('/api/products/admin/cakes/')

        self.assertEqual(response.status_code, 401)

    def test_staff_user_cannot_access_management_api(self):
        staff_user = User.objects.create_user(
            username='staff-user',
            password='test-password',
            is_staff=True,
        )
        self.client.force_authenticate(user=staff_user)

        response = self.client.get('/api/products/admin/cakes/')

        self.assertEqual(response.status_code, 403)

    def test_category_in_use_cannot_be_deleted(self):
        Cake.objects.create(
            name='Category cake',
            price='20.00',
            category=self.category,
        )
        self.client.force_authenticate(user=self.admin)

        response = self.client.delete(f'/api/products/admin/categories/{self.category.id}/')

        self.assertEqual(response.status_code, 400)
        self.assertIn('Cannot delete a category', response.data['detail'])

    def test_admin_can_set_primary_image_for_its_cake(self):
        cake = Cake.objects.create(
            name='Image cake',
            price='20.00',
            category=self.category,
        )
        old_primary = CakeImage.objects.create(
            cake=cake,
            image='cake_images/old.png',
            is_primary=True,
        )
        new_primary = CakeImage.objects.create(
            cake=cake,
            image='cake_images/new.png',
        )
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            f'/api/products/admin/cakes/{cake.id}/images/{new_primary.id}/primary',
            {'is_primary': True},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        old_primary.refresh_from_db()
        new_primary.refresh_from_db()
        self.assertFalse(old_primary.is_primary)
        self.assertTrue(new_primary.is_primary)

    def test_admin_cannot_change_primary_image_for_another_cake(self):
        cake = Cake.objects.create(
            name='First cake',
            price='20.00',
            category=self.category,
        )
        other_cake = Cake.objects.create(
            name='Another cake',
            price='22.00',
            category=self.category,
        )
        foreign_image = CakeImage.objects.create(
            cake=other_cake,
            image='cake_images/foreign.png',
        )
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            f'/api/products/admin/cakes/{cake.id}/images/{foreign_image.id}/primary',
            {'is_primary': True},
            format='json',
        )

        self.assertEqual(response.status_code, 404)
