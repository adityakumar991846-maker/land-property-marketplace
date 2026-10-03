from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.properties.models import Property
from apps.reports.models import Report

User = get_user_model()

class ReportsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.seller = User.objects.create_user(username='rep_seller', password='password123')
        self.buyer = User.objects.create_user(username='rep_buyer', password='password123')
        self.admin = User.objects.create_superuser(username='rep_admin', password='password123')
        self.prop = Property.objects.create(
            seller=self.seller,
            title='Reportable Land',
            property_type='residential_land',
            price=80000,
            address='123 Elm',
            city='Bend',
            state='Oregon',
            status='published'
        )

    def test_submit_report_and_duplicate(self):
        self.client.force_authenticate(user=self.buyer)

        # Submit first report
        response = self.client.post('/api/reports/', {
            'property_id': self.prop.id,
            'reason': 'misleading_price',
            'description': 'Price in title does not match listed price.'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('report_id', response.data)

        # Duplicate report should be caught
        response_dup = self.client.post('/api/reports/', {
            'property_id': self.prop.id,
            'reason': 'misleading_price'
        })
        self.assertEqual(response_dup.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_manage_reports(self):
        # Create a report in DB
        report = Report.objects.create(
            reporter=self.buyer,
            property=self.prop,
            reason='spam',
            description='Duplicate listing'
        )

        # Admin fetches reports list
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/admin/reports/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(len(res.data) >= 1)

        # Admin resolves report
        update_res = self.client.post(f'/api/admin/reports/{report.id}/status/', {
            'status': 'resolved',
            'admin_notes': 'Reviewed and confirmed.'
        })
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        report.refresh_from_db()
        self.assertEqual(report.status, 'resolved')
