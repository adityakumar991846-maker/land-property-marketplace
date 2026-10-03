from django.contrib import admin
from .models import Property, PropertyImage

class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'property_type', 'price', 'city', 'state', 'status', 'seller', 'is_featured', 'created_at')
    list_filter = ('property_type', 'status', 'is_featured', 'state')
    search_fields = ('title', 'description', 'city', 'state', 'seller__username', 'seller__email')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [PropertyImageInline]

@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ('property', 'is_cover', 'caption', 'created_at')
