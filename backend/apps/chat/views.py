from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from apps.properties.models import Property
from django.contrib.auth import get_user_model

User = get_user_model()

class ConversationListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        conversations = Conversation.objects.filter(
            Q(buyer=user) | Q(seller=user)
        ).select_related('buyer', 'seller', 'property').prefetch_related('messages')
        serializer = ConversationSerializer(conversations, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        property_id = request.data.get('property_id')
        seller_id = request.data.get('seller_id')
        initial_message = request.data.get('message', '').strip()

        prop = None
        seller = None

        if property_id:
            try:
                prop = Property.objects.select_related('seller').get(pk=property_id)
                seller = prop.seller
            except Property.DoesNotExist:
                return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)
        elif seller_id:
            try:
                seller = User.objects.get(pk=seller_id)
            except User.DoesNotExist:
                return Response({'error': 'Seller not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error': 'Either property_id or seller_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        if user == seller:
            return Response({'error': 'You cannot initiate a conversation with yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        conv, created = Conversation.objects.get_or_create(
            buyer=user,
            seller=seller,
            property=prop
        )

        if initial_message:
            Message.objects.create(
                conversation=conv,
                sender=user,
                content=initial_message
            )

        serializer = ConversationSerializer(conv, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class ConversationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_conversation(self, pk, user):
        try:
            conv = Conversation.objects.select_related('buyer', 'seller', 'property').get(pk=pk)
            if user != conv.buyer and user != conv.seller and not user.is_staff:
                return None
            return conv
        except Conversation.DoesNotExist:
            return None

    def get(self, request, pk):
        conv = self.get_conversation(pk, request.user)
        if not conv:
            return Response({'error': 'Conversation not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ConversationSerializer(conv, context={'request': request})
        return Response(serializer.data)

class MessageListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_conversation(self, pk, user):
        try:
            conv = Conversation.objects.get(pk=pk)
            if user != conv.buyer and user != conv.seller and not user.is_staff:
                return None
            return conv
        except Conversation.DoesNotExist:
            return None

    def get(self, request, pk):
        conv = self.get_conversation(pk, request.user)
        if not conv:
            return Response({'error': 'Conversation not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)

        # Mark unread messages from other user as read
        Message.objects.filter(conversation=conv, is_read=False).exclude(sender=request.user).update(is_read=True)

        messages = conv.messages.select_related('sender').all()
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, pk):
        conv = self.get_conversation(pk, request.user)
        if not conv:
            return Response({'error': 'Conversation not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Message content cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        msg = Message.objects.create(
            conversation=conv,
            sender=request.user,
            content=content
        )
        conv.save(update_fields=['updated_at'])

        # Broadcast to any active WebSocket listeners
        try:
            from asgiref.sync import async_to_sync
            from channels.layers import get_channel_layer
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f'chat_{conv.id}',
                    {
                        'type': 'chat_message',
                        'message': {
                            'id': msg.id,
                            'conversation_id': conv.id,
                            'sender_id': request.user.id,
                            'sender_name': request.user.full_name,
                            'sender_username': request.user.username,
                            'content': msg.content,
                            'is_read': msg.is_read,
                            'created_at': msg.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                        }
                    }
                )
        except Exception:
            pass

        serializer = MessageSerializer(msg, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MarkConversationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            conv = Conversation.objects.get(pk=pk)
            if request.user != conv.buyer and request.user != conv.seller and not request.user.is_staff:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

        count = Message.objects.filter(conversation=conv, is_read=False).exclude(sender=request.user).update(is_read=True)
        return Response({'message': f'{count} message(s) marked as read'})
