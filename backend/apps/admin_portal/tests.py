from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.properties.models import Property

User = get_user_model()

class AdminPortalSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='admin_boss',
            email='boss@example.com',
            password='AdminPassword123!',
            is_staff=True,
            is_superuser=True
        )
        self.regular_user = User.objects.create_user(
            username='regular_buyer',
            email='regular@example.com',
            password='BuyerPassword123!'
        )
        self.prop = Property.objects.create(
            seller=self.admin,
            title='Admin Review Parcel',
            property_type='commercial_land',
            price=500000,
            area_acres=2.0,
            address='100 Downtown',
            city='Seattle',
            state='Washington',
            status='pending'
        )

    def test_unauthorized_user_blocked_from_admin(self):
        # Unauthenticated request
        response = self.client.get('/api/admin/stats/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Non-staff authenticated user receives 403 Forbidden
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get('/api/admin/stats/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response_users = self.client.get('/api/admin/users/')
        self.assertEqual(response_users.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_access_and_moderation(self):
        self.client.force_authenticate(user=self.admin)

        # Stats access
        stats_res = self.client.get('/api/admin/stats/')
        self.assertEqual(stats_res.status_code, status.HTTP_200_OK)
        self.assertIn('total_users', stats_res.data['stats'])

        # Moderate property (approve/publish)
        mod_res = self.client.post(f'/api/admin/properties/{self.prop.id}/status/', {
            'status': 'published'
        })
        self.assertEqual(mod_res.status_code, status.HTTP_200_OK)
        self.prop.refresh_from_db()
        self.assertEqual(self.prop.status, 'published')

        # Toggle user active status
        toggle_res = self.client.post(f'/api/admin/users/{self.regular_user.id}/toggle-active/')
        self.assertEqual(toggle_res.status_code, status.HTTP_200_OK)
        self.regular_user.refresh_from_db()
        self.assertFalse(self.regular_user.is_active)
