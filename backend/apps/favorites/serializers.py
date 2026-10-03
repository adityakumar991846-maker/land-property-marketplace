from rest_framework import serializers
from .models import Favorite
from apps.properties.serializers import PropertyCardSerializer

class FavoriteSerializer(serializers.ModelSerializer):
    property = PropertyCardSerializer(read_only=True)
    property_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'property', 'property_id', 'created_at']
