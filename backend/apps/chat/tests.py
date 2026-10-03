from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from channels.testing import WebsocketCommunicator
from realestate_project.asgi import application
from apps.properties.models import Property
from apps.chat.models import Conversation, Message

User = get_user_model()

class ChatWebSocketTests(TestCase):
    async def test_websocket_chat_connection_and_messaging(self):
        # Create buyer and seller
        seller = await User.objects.acreate(
            username='ws_seller',
            email='ws_seller@example.com',
            first_name='WS',
            last_name='Seller',
            is_seller=True
        )
        buyer = await User.objects.acreate(
            username='ws_buyer',
            email='ws_buyer@example.com',
            first_name='WS',
            last_name='Buyer'
        )

        buyer_token = await Token.objects.acreate(user=buyer)

        prop = await Property.objects.acreate(
            seller=seller,
            title='WebSocket Test Parcel',
            property_type='agricultural_land',
            price=150000,
            area_acres=10.0,
            address='123 Stream Way',
            city='Portland',
            state='Oregon',
            status='published'
        )

        conv = await Conversation.objects.acreate(
            buyer=buyer,
            seller=seller,
            property=prop
        )

        # Test unauthorized connection without token
        unauth_communicator = WebsocketCommunicator(
            application,
            f'/ws/chat/{conv.id}/'
        )
        connected, close_code = await unauth_communicator.connect()
        self.assertFalse(connected)
        self.assertEqual(close_code, 4001)

        # Test authorized connection with buyer token
        communicator = WebsocketCommunicator(
            application,
            f'/ws/chat/{conv.id}/?token={buyer_token.key}'
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Receive connection confirmation
        response = await communicator.receive_json_from()
        self.assertEqual(response.get('type'), 'connection_established')
        self.assertEqual(response.get('user'), 'ws_buyer')

        # Send chat message via WebSocket
        await communicator.send_json_to({
            'action': 'send_message',
            'content': 'Hello from WebSocket test!'
        })

        # Receive broadcasted message
        msg_response = await communicator.receive_json_from()
        self.assertEqual(msg_response.get('type'), 'new_message')
        self.assertEqual(msg_response['message']['content'], 'Hello from WebSocket test!')
        self.assertEqual(msg_response['message']['sender_username'], 'ws_buyer')

        # Verify message persisted in database
        persisted = await Message.objects.filter(conversation=conv).afirst()
        self.assertIsNotNone(persisted)
        self.assertEqual(persisted.content, 'Hello from WebSocket test!')

        # Disconnect
        await communicator.disconnect()
