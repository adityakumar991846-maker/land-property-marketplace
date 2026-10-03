from rest_framework import serializers
from .models import Conversation, Message
from apps.accounts.serializers import UserSerializer
from apps.properties.serializers import PropertyCardSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    is_me = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_name', 'sender_username', 'content', 'is_read', 'created_at', 'is_me']
        read_only_fields = ['id', 'sender', 'created_at', 'is_me']

    def get_is_me(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.sender == request.user
        return False

class ConversationSerializer(serializers.ModelSerializer):
    buyer = UserSerializer(read_only=True)
    seller = UserSerializer(read_only=True)
    property = PropertyCardSerializer(read_only=True)
    other_participant = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'buyer', 'seller', 'property', 'other_participant',
            'last_message', 'unread_count', 'created_at', 'updated_at'
        ]

    def get_other_participant(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        other = obj.get_other_participant(request.user)
        return UserSerializer(other).data

    def get_last_message(self, obj):
        msg = obj.last_message
        if msg:
            return {
                'id': msg.id,
                'content': msg.content,
                'created_at': msg.created_at,
                'sender_id': msg.sender_id,
                'is_read': msg.is_read
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        return obj.unread_count_for_user(request.user)
