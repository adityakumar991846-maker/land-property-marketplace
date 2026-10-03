from rest_framework import serializers
from .models import Property, PropertyImage
from apps.accounts.serializers import UserSerializer
from apps.core.validators import validate_image_file

class PropertyImageSerializer(serializers.ModelSerializer):
    display_url = serializers.ReadOnlyField()

    class Meta:
        model = PropertyImage
        fields = ['id', 'display_url', 'image_url', 'image_file', 'is_cover', 'caption', 'created_at']

    def validate_image_file(self, value):
        if value:
            validate_image_file(value)
        return value

    def validate(self, attrs):
        image_url = attrs.get('image_url')
        image_file = attrs.get('image_file')
        if not image_url and not image_file:
            raise serializers.ValidationError("Either a valid image file upload or an image URL is required.")
        return attrs

class PropertyCardSerializer(serializers.ModelSerializer):
    cover_image = serializers.ReadOnlyField()
    property_type_display = serializers.CharField(source='get_property_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    seller_name = serializers.CharField(source='seller.full_name', read_only=True)
    seller_company = serializers.CharField(source='seller.company_name', read_only=True)
    distance_km = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'slug', 'property_type', 'property_type_display',
            'status', 'status_display', 'price', 'area_sqft', 'area_acres',
            'short_description', 'address', 'city', 'state', 'zip_code',
            'latitude', 'longitude', 'cover_image', 'seller', 'seller_name',
            'seller_company', 'is_featured', 'bedrooms', 'bathrooms',
            'road_access', 'created_at', 'distance_km'
        ]

    def get_distance_km(self, obj):
        # Passed via context if nearby search was requested
        request = self.context.get('request')
        if not request:
            return None
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        if lat and lng:
            try:
                return obj.calculate_distance(float(lat), float(lng))
            except (ValueError, TypeError):
                return None
        return None

class PropertyDetailSerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    seller = UserSerializer(read_only=True)
    cover_image = serializers.ReadOnlyField()
    property_type_display = serializers.CharField(source='get_property_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    distance_km = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = '__all__'

    def get_distance_km(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        if lat and lng:
            try:
                return obj.calculate_distance(float(lat), float(lng))
            except (ValueError, TypeError):
                return None
        return None

class PropertyCreateUpdateSerializer(serializers.ModelSerializer):
    images_urls = serializers.ListField(
        child=serializers.CharField(max_length=500),
        write_only=True,
        required=False
    )

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'property_type', 'status', 'price',
            'area_acres', 'area_sqft', 'description', 'short_description',
            'address', 'city', 'state', 'zip_code', 'latitude', 'longitude',
            'bedrooms', 'bathrooms', 'zoning_classification',
            'road_access', 'water_rights', 'electricity', 'soil_type',
            'topography', 'property_tax_annual', 'images_urls'
        ]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be a positive number greater than 0.")
        return value

    def validate(self, attrs):
        prop_type = attrs.get('property_type', getattr(self.instance, 'property_type', None))
        bedrooms = attrs.get('bedrooms', getattr(self.instance, 'bedrooms', None))

        # Check residential spec relevance
        if prop_type in ['house', 'apartment'] and bedrooms is not None and bedrooms < 0:
            raise serializers.ValidationError({"bedrooms": "Bedrooms cannot be negative."})
        return attrs

    def create(self, validated_data):
        images_urls = validated_data.pop('images_urls', [])
        user = self.context['request'].user
        validated_data['seller'] = user
        # Auto-grant seller role if not already marked
        if not user.is_seller:
            user.is_seller = True
            user.save(update_fields=['is_seller'])

        property_obj = Property.objects.create(**validated_data)

        # Attach images if provided
        for i, url in enumerate(images_urls):
            PropertyImage.objects.create(
                property=property_obj,
                image_url=url,
                is_cover=(i == 0)
            )

        return property_obj

    def update(self, instance, validated_data):
        images_urls = validated_data.pop('images_urls', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if images_urls is not None and len(images_urls) > 0:
            # Add new images or replace
            for i, url in enumerate(images_urls):
                PropertyImage.objects.create(
                    property=instance,
                    image_url=url,
                    is_cover=(i == 0 and not instance.images.filter(is_cover=True).exists())
                )

        return instance
