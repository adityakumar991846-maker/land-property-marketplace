from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/properties/', include('apps.properties.urls')),
    path('api/cart/', include('apps.cart.urls')),
    path('api/favorites/', include('apps.favorites.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/admin/', include('apps.admin_portal.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
