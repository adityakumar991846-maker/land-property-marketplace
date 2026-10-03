from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Favorite
from .serializers import FavoriteSerializer
from apps.properties.models import Property

class FavoriteListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        favorites = Favorite.objects.filter(user=request.user).select_related('property', 'property__seller').prefetch_related('property__images')
        serializer = FavoriteSerializer(favorites, many=True, context={'request': request})
        return Response(serializer.data)

class FavoriteToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        property_id = request.data.get('property_id')
        if not property_id:
            return Response({'error': 'property_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            prop = Property.objects.get(pk=property_id)
        except Property.DoesNotExist:
            return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)

        fav = Favorite.objects.filter(user=request.user, property=prop).first()
        if fav:
            fav.delete()
            return Response({'is_favorite': False, 'message': 'Removed from saved properties'})
        else:
            Favorite.objects.create(user=request.user, property=prop)
            return Response({'is_favorite': True, 'message': 'Added to saved properties'})

class FavoriteCheckView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, property_id):
        is_favorite = Favorite.objects.filter(user=request.user, property_id=property_id).exists()
        return Response({'is_favorite': is_favorite})
