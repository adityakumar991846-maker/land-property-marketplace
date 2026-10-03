from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.properties.models import Property, PropertyImage
from apps.cart.models import Cart, CartItem
from apps.favorites.models import Favorite
from apps.chat.models import Conversation, Message

User = get_user_model()

class TerraTradeBackendTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Users
        self.seller = User.objects.create_user(
            username='seller1',
            email='seller1@example.com',
            password='Password123!',
            is_seller=True,
            first_name='John',
            last_name='Seller'
        )
        self.buyer = User.objects.create_user(
            username='buyer1',
            email='buyer1@example.com',
            password='Password123!',
            is_seller=False,
            first_name='Alice',
            last_name='Buyer'
        )
        self.admin = User.objects.create_superuser(
            username='admin1',
            email='admin1@example.com',
            password='Password123!',
            is_staff=True,
            is_superuser=True
        )

        # Properties
        self.prop1 = Property.objects.create(
            seller=self.seller,
            title='10-Acre Pine Valley Farmland',
            property_type='agricultural_land',
            price=250000,
            area_acres=10.0,
            description='Prime farming soil with water rights and barn.',
            address='123 Country Road',
            city='Salem',
            state='Oregon',
            latitude=44.9429,
            longitude=-123.0351,
            status='published'
        )
        PropertyImage.objects.create(
            property=self.prop1,
            image_url='https://example.com/test.jpg',
            is_cover=True
        )

    def test_user_authentication(self):
        """Test login endpoint and token generation"""
        response = self.client.post('/api/accounts/login/', {
            'username': 'buyer1',
            'password': 'Password123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'buyer1')

    def test_property_search_and_filter(self):
        """Test search and filter endpoints"""
        # Search by keyword
        response = self.client.get('/api/properties/', {'q': 'Pine Valley'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertTrue(len(results) >= 1)

        # Filter by property type
        response = self.client.get('/api/properties/', {'property_type': 'agricultural_land'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertTrue(len(results) >= 1)

        # Filter by price range
        response = self.client.get('/api/properties/', {'min_price': '200000', 'max_price': '300000'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertTrue(len(results) >= 1)

    def test_seller_property_creation_and_permission(self):
        """Test seller creating a listing and unauthorized buyer blocked"""
        # Unauthenticated create should fail
        response = self.client.post('/api/properties/seller/listings/', {
            'title': 'Unauthorized plot',
            'price': 100000,
            'property_type': 'residential_land'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Authenticated seller can create
        self.client.force_authenticate(user=self.seller)
        response = self.client.post('/api/properties/seller/listings/', {
            'title': 'New 5-Acre Wooded Lot',
            'property_type': 'residential_land',
            'price': 120000,
            'area_acres': 5.0,
            'description': 'Beautiful wooded retreat',
            'address': '55 Pine Ridge',
            'city': 'Bend',
            'state': 'Oregon',
            'status': 'published'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        new_id = response.data['id']

        # Buyer cannot edit or delete this seller's listing
        self.client.force_authenticate(user=self.buyer)
        edit_response = self.client.put(f'/api/properties/seller/listings/{new_id}/', {
            'title': 'Hacked title'
        })
        self.assertEqual(edit_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_favorites(self):
        """Test adding and removing favorites"""
        self.client.force_authenticate(user=self.buyer)

        # Toggle favorite (add)
        response = self.client.post('/api/favorites/toggle/', {'property_id': self.prop1.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_favorite'])
        self.assertTrue(Favorite.objects.filter(user=self.buyer, property=self.prop1).exists())

        # Toggle favorite again (remove)
        response = self.client.post('/api/favorites/toggle/', {'property_id': self.prop1.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_favorite'])

    def test_cart_behavior(self):
        """Test adding property to cart, duplicate prevention, and notes"""
        self.client.force_authenticate(user=self.buyer)

        # Add to cart
        response = self.client.post('/api/cart/items/', {
            'property_id': self.prop1.id,
            'notes': 'Interested in offering $240k',
            'offer_amount': 240000
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Duplicate addition should be gracefully handled
        response_dup = self.client.post('/api/cart/items/', {
            'property_id': self.prop1.id
        })
        self.assertEqual(response_dup.status_code, status.HTTP_200_OK)
        self.assertTrue(response_dup.data.get('already_in_cart', False))

        # Check cart
        cart_res = self.client.get('/api/cart/')
        self.assertEqual(cart_res.status_code, status.HTTP_200_OK)
        self.assertEqual(cart_res.data['item_count'], 1)

    def test_chat_permissions(self):
        """Test conversation creation and privacy between participants"""
        self.client.force_authenticate(user=self.buyer)

        # Create conversation with seller
        response = self.client.post('/api/chat/conversations/', {
            'property_id': self.prop1.id,
            'message': 'Hello, is this still available?'
        })
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        conv_id = response.data['id']

        # Third-party user cannot access this conversation
        other_user = User.objects.create_user(username='intruder', password='password123')
        self.client.force_authenticate(user=other_user)
        access_res = self.client.get(f'/api/chat/conversations/{conv_id}/messages/')
        self.assertEqual(access_res.status_code, status.HTTP_404_NOT_FOUND)
