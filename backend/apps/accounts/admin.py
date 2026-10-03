from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_seller', 'is_staff', 'is_active')
    list_filter = ('is_seller', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Seller & Profile Info', {'fields': ('phone_number', 'bio', 'is_seller', 'avatar_url', 'company_name', 'license_number')}),
    )
