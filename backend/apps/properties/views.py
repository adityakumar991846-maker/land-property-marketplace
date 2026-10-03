from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q
from apps.core.pagination import StandardResultsSetPagination
from .models import Property, PropertyImage
from .serializers import (
    PropertyCardSerializer,
    PropertyDetailSerializer,
    PropertyCreateUpdateSerializer,
    PropertyImageSerializer
)

class PropertyListSearchAPIView(generics.ListAPIView):
    """
    Public Property Search & Discovery API with multi-field filtering, sorting,
    and geolocation / nearby radius calculations.
    """
    serializer_class = PropertyCardSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Property.objects.filter(status='published').select_related('seller').prefetch_related('images')
        params = self.request.query_params

        # Keyword Search
        q = params.get('q', '').strip() or params.get('search', '').strip()
        if q:
            queryset = queryset.filter(
                Q(title__icontains=q) |
                Q(description__icontains=q) |
                Q(address__icontains=q) |
                Q(city__icontains=q) |
                Q(state__icontains=q) |
                Q(zip_code__icontains=q) |
                Q(zoning_classification__icontains=q)
            )

        # Location filter
        location = params.get('location', '').strip()
        if location:
            queryset = queryset.filter(
                Q(city__icontains=location) |
                Q(state__icontains=location) |
                Q(zip_code__icontains=location) |
                Q(address__icontains=location)
            )

        # Property type
        prop_types = params.get('property_type', '').strip()
        if prop_types:
            type_list = [t.strip() for t in prop_types.split(',') if t.strip()]
            if type_list:
                queryset = queryset.filter(property_type__in=type_list)

        # Price range
        min_price = params.get('min_price')
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass

        max_price = params.get('max_price')
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass

        # Area range (in acres)
        min_area = params.get('min_area')
        if min_area:
            try:
                queryset = queryset.filter(area_acres__gte=float(min_area))
            except ValueError:
                pass

        max_area = params.get('max_area')
        if max_area:
            try:
                queryset = queryset.filter(area_acres__lte=float(max_area))
            except ValueError:
                pass

        # Bedrooms (for residential)
        bedrooms = params.get('bedrooms')
        if bedrooms:
            try:
                queryset = queryset.filter(bedrooms__gte=int(bedrooms))
            except ValueError:
                pass

        # Road access & utilities
        if params.get('road_access') == 'true':
            queryset = queryset.filter(road_access=True)
        if params.get('water_rights') == 'true':
            queryset = queryset.filter(water_rights=True)
        if params.get('electricity') == 'true':
            queryset = queryset.filter(electricity=True)

        # Sorting
        sort_by = params.get('sort_by', 'newest')
        if sort_by == 'price_asc':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_desc':
            queryset = queryset.order_by('-price')
        elif sort_by == 'area_desc':
            queryset = queryset.order_by('-area_acres')
        elif sort_by == 'updated':
            queryset = queryset.order_by('-updated_at')
        else: # 'newest' default
            queryset = queryset.order_by('-created_at')

        # Geolocation Nearby filtering
        lat = params.get('lat')
        lng = params.get('lng')
        radius_km = params.get('radius_km', '100')
        if lat and lng:
            try:
                user_lat = float(lat)
                user_lng = float(lng)
                max_km = float(radius_km)

                # Filter in Python using accurate Haversine calculation
                items = list(queryset)
                nearby_items = []
                for item in items:
                    dist = item.calculate_distance(user_lat, user_lng)
                    if dist is not None and dist <= max_km:
                        item.temp_dist = dist
                        nearby_items.append(item)

                if sort_by == 'distance':
                    nearby_items.sort(key=lambda x: getattr(x, 'temp_dist', 999999))
                return nearby_items
            except (ValueError, TypeError):
                pass

        return queryset

class PropertyDetailAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            prop = Property.objects.select_related('seller').prefetch_related('images').get(pk=pk)
        except Property.DoesNotExist:
            return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)

        # Only allow viewing non-published properties if current user is seller or staff
        if prop.status != 'published':
            if not request.user.is_authenticated or (request.user != prop.seller and not request.user.is_staff):
                return Response({'error': 'Property is not available'}, status=status.HTTP_403_FORBIDDEN)

        # Increment views count
        Property.objects.filter(pk=pk).update(views_count=prop.views_count + 1)
        prop.views_count += 1

        serializer = PropertyDetailSerializer(prop, context={'request': request})
        return Response(serializer.data)

class FeaturedPropertiesAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request):
        featured = Property.objects.filter(status='published', is_featured=True)[:6]
        if not featured.exists():
            featured = Property.objects.filter(status='published')[:6]
        serializer = PropertyCardSerializer(featured, many=True, context={'request': request})
        return Response(serializer.data)

class SellerPropertyListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        properties = Property.objects.filter(seller=request.user).order_by('-created_at')
        serializer = PropertyCardSerializer(properties, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = PropertyCreateUpdateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            property_obj = serializer.save()
            return Response(PropertyDetailSerializer(property_obj, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SellerPropertyDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Property.objects.get(pk=pk, seller=user)
        except Property.DoesNotExist:
            return None

    def get(self, request, pk):
        prop = self.get_object(pk, request.user)
        if not prop:
            return Response({'error': 'Property not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PropertyDetailSerializer(prop, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        prop = self.get_object(pk, request.user)
        if not prop:
            return Response({'error': 'Property not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PropertyCreateUpdateSerializer(prop, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated = serializer.save()
            return Response(PropertyDetailSerializer(updated, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        prop = self.get_object(pk, request.user)
        if not prop:
            return Response({'error': 'Property not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)
        prop.delete()
        return Response({'message': 'Property deleted successfully'}, status=status.HTTP_200_OK)

class SellerListingActionAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, action):
        try:
            prop = Property.objects.get(pk=pk, seller=request.user)
        except Property.DoesNotExist:
            return Response({'error': 'Property not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)

        if action == 'publish':
            prop.status = 'published'
        elif action == 'unpublish':
            prop.status = 'unpublished'
        elif action == 'mark_sold':
            prop.status = 'sold'
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

        prop.save(update_fields=['status', 'updated_at'])
        return Response({'message': f'Property marked as {prop.status}', 'status': prop.status})

class PropertyImageUploadAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, pk):
        try:
            prop = Property.objects.get(pk=pk, seller=request.user)
        except Property.DoesNotExist:
            return Response({'error': 'Property not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)

        # Check for multiple files
        files = request.FILES.getlist('images') or request.FILES.getlist('image')
        image_url = request.data.get('image_url')
        is_cover_req = request.data.get('is_cover', 'false').lower() == 'true'
        caption = request.data.get('caption', '')

        if not files and not image_url:
            return Response({'error': 'Either an image file upload or an image URL is required'}, status=status.HTTP_400_BAD_REQUEST)

        created_images = []

        # If files were uploaded
        if files:
            for idx, f in enumerate(files):
                serializer = PropertyImageSerializer(data={'image_file': f, 'caption': caption})
                if not serializer.is_valid():
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                is_cover = (is_cover_req and idx == 0) or (not prop.images.filter(is_cover=True).exists() and idx == 0)
                if is_cover:
                    prop.images.update(is_cover=False)

                img = PropertyImage.objects.create(
                    property=prop,
                    image_file=f,
                    is_cover=is_cover,
                    caption=caption
                )
                created_images.append(PropertyImageSerializer(img).data)
        elif image_url:
            serializer = PropertyImageSerializer(data={'image_url': image_url, 'caption': caption})
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if is_cover_req:
                prop.images.update(is_cover=False)

            img = PropertyImage.objects.create(
                property=prop,
                image_url=image_url,
                is_cover=is_cover_req or not prop.images.filter(is_cover=True).exists(),
                caption=caption
            )
            created_images.append(PropertyImageSerializer(img).data)

        if len(created_images) == 1:
            return Response(created_images[0], status=status.HTTP_201_CREATED)
        return Response({'uploaded': created_images, 'count': len(created_images)}, status=status.HTTP_201_CREATED)

    def delete(self, request, pk, image_id):
        try:
            prop = Property.objects.get(pk=pk, seller=request.user)
            img = prop.images.get(pk=image_id)
            img.delete()
            return Response({'message': 'Image deleted'})
        except Exception:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
