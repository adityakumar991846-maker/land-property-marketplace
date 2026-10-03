from rest_framework import serializers
from .models import Report
from apps.accounts.serializers import UserSerializer
from apps.properties.serializers import PropertyCardSerializer

class ReportSerializer(serializers.ModelSerializer):
    reporter = UserSerializer(read_only=True)
    property_data = PropertyCardSerializer(source='property', read_only=True)
    reported_user_data = UserSerializer(source='reported_user', read_only=True)
    property_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    reported_user_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Report
        fields = [
            'id', 'reporter', 'property', 'property_id', 'property_data',
            'reported_user', 'reported_user_id', 'reported_user_data',
            'reason', 'description', 'status', 'admin_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reporter', 'status', 'admin_notes', 'created_at', 'updated_at']
