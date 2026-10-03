from django.urls import path
from .views import FavoriteListView, FavoriteToggleView, FavoriteCheckView

urlpatterns = [
    path('', FavoriteListView.as_view(), name='favorite-list'),
    path('toggle/', FavoriteToggleView.as_view(), name='favorite-toggle'),
    path('check/<int:property_id>/', FavoriteCheckView.as_view(), name='favorite-check'),
]
