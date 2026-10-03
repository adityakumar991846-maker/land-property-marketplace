import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from urllib.parse import parse_qs

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'

        # Authenticate user from scope or query string token
        self.user = await self.get_user_from_scope()

        if not self.user or not self.user.is_authenticated:
            # Try token from query string
            query_string = self.scope.get('query_string', b'').decode('utf-8')
            params = parse_qs(query_string)
            token_key = params.get('token', [None])[0]
            if token_key:
                self.user = await self.get_user_from_token(token_key)

        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        # Check if user is participant of conversation
        is_participant = await self.verify_participant(self.conversation_id, self.user)
        if not is_participant:
            await self.close(code=4003)
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'conversation_id': self.conversation_id,
            'user': self.user.username
        }))

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('action', 'send_message')

            if action == 'send_message':
                content = data.get('content', '').strip()
                if not content:
                    return

                msg_data = await self.save_message(self.conversation_id, self.user, content)

                # Broadcast message to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': msg_data
                    }
                )

            elif action == 'mark_read':
                await self.mark_messages_read(self.conversation_id, self.user)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'read_receipt',
                        'read_by_id': self.user.id,
                        'conversation_id': self.conversation_id
                    }
                )
        except Exception as e:
            await self.send(text_data=json.dumps({'error': str(e)}))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': event['message']
        }))

    async def read_receipt(self, event):
        await self.send(text_data=json.dumps({
            'type': 'messages_read',
            'read_by_id': event['read_by_id'],
            'conversation_id': event['conversation_id']
        }))

    @database_sync_to_async
    def get_user_from_scope(self):
        user = self.scope.get('user')
        if user and user.is_authenticated:
            return user
        return None

    @database_sync_to_async
    def get_user_from_token(self, token_key):
        try:
            token = Token.objects.select_related('user').get(key=token_key)
            return token.user
        except Token.DoesNotExist:
            return None

    @database_sync_to_async
    def verify_participant(self, conv_id, user):
        from .models import Conversation
        try:
            conv = Conversation.objects.get(pk=conv_id)
            return user == conv.buyer or user == conv.seller or user.is_staff
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, conv_id, user, content):
        from .models import Conversation, Message
        from django.utils import timezone
        conv = Conversation.objects.get(pk=conv_id)
        conv.updated_at = timezone.now()
        conv.save(update_fields=['updated_at'])

        msg = Message.objects.create(
            conversation=conv,
            sender=user,
            content=content
        )
        return {
            'id': msg.id,
            'conversation_id': conv.id,
            'sender_id': user.id,
            'sender_name': user.full_name,
            'sender_username': user.username,
            'content': msg.content,
            'is_read': msg.is_read,
            'created_at': msg.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        }

    @database_sync_to_async
    def mark_messages_read(self, conv_id, user):
        from .models import Conversation, Message
        conv = Conversation.objects.get(pk=conv_id)
        Message.objects.filter(conversation=conv, is_read=False).exclude(sender=user).update(is_read=True)
