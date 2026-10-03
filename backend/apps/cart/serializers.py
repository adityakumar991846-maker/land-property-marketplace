from rest_framework import serializers
from .models import Cart, CartItem
from apps.properties.serializers import PropertyCardSerializer

class CartItemSerializer(serializers.ModelSerializer):
    property = PropertyCardSerializer(read_only=True)
    property_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'property', 'property_id', 'notes', 'offer_amount', 'added_at']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_value = serializers.ReadOnlyField()
    item_count = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_value', 'item_count', 'updated_at']
