from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token

User = get_user_model()

class AccountsAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='auth_test_user',
            email='testuser@example.com',
            password='TestPassword123!',
            first_name='Test',
            last_name='User'
        )

    def test_valid_registration(self):
        response = self.client.post('/api/accounts/register/', {
            'username': 'new_buyer',
            'email': 'new_buyer@example.com',
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!',
            'first_name': 'New',
            'last_name': 'Buyer'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'new_buyer')

    def test_duplicate_username_registration(self):
        response = self.client.post('/api/accounts/register/', {
            'username': 'auth_test_user',
            'email': 'different@example.com',
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_email_registration(self):
        response = self.client.post('/api/accounts/register/', {
            'username': 'unique_user',
            'email': 'testuser@example.com',
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_mismatch_registration(self):
        response = self.client.post('/api/accounts/register/', {
            'username': 'mismatch_user',
            'email': 'mismatch@example.com',
            'password': 'Password123!',
            'password_confirm': 'MismatchPassword456!'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success_and_failure(self):
        # Valid login
        response = self.client.post('/api/accounts/login/', {
            'username': 'auth_test_user',
            'password': 'TestPassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        token = response.data['token']

        # Invalid password
        fail_response = self.client.post('/api/accounts/login/', {
            'username': 'auth_test_user',
            'password': 'WrongPassword!'
        })
        self.assertEqual(fail_response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Profile access with token
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        profile_res = self.client.get('/api/accounts/profile/')
        self.assertEqual(profile_res.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_res.data['username'], 'auth_test_user')

        # Logout deletes token
        logout_res = self.client.post('/api/accounts/logout/')
        self.assertEqual(logout_res.status_code, status.HTTP_200_OK)
        self.assertFalse(Token.objects.filter(key=token).exists())
