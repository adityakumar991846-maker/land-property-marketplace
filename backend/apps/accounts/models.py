from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    phone_number = models.CharField(max_length=20, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    is_seller = models.BooleanField(default=False)
    avatar_url = models.URLField(max_length=500, blank=True, default='')
    company_name = models.CharField(max_length=150, blank=True, default='')
    license_number = models.CharField(max_length=50, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username

    @property
    def full_name(self):
        name = f"{self.first_name} {self.last_name}".strip()
        return name if name else self.username
