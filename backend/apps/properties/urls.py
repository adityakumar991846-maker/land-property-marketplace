from django.urls import path
from .views import (
    PropertyListSearchAPIView,
    PropertyDetailAPIView,
    FeaturedPropertiesAPIView,
    SellerPropertyListCreateAPIView,
    SellerPropertyDetailAPIView,
    SellerListingActionAPIView,
    PropertyImageUploadAPIView
)

urlpatterns = [
    # Public
    path('', PropertyListSearchAPIView.as_view(), name='property-list-search'),
    path('featured/', FeaturedPropertiesAPIView.as_view(), name='property-featured'),
    path('<int:pk>/', PropertyDetailAPIView.as_view(), name='property-detail'),

    # Seller management
    path('seller/listings/', SellerPropertyListCreateAPIView.as_view(), name='seller-properties'),
    path('seller/listings/<int:pk>/', SellerPropertyDetailAPIView.as_view(), name='seller-property-detail'),
    path('seller/listings/<int:pk>/images/', PropertyImageUploadAPIView.as_view(), name='seller-property-images'),
    path('seller/listings/<int:pk>/images/<int:image_id>/', PropertyImageUploadAPIView.as_view(), name='seller-property-image-delete'),
    path('seller/listings/<int:pk>/<str:action>/', SellerListingActionAPIView.as_view(), name='seller-property-action'),
]
