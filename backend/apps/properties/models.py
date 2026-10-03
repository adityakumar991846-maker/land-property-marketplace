from django.db import models
from django.conf import settings
from django.utils.text import slugify
import math
import builtins

class Property(models.Model):
    PROPERTY_TYPES = [
        ('agricultural_land', 'Agricultural Land / Farmland'),
        ('residential_land', 'Residential Plot / Land'),
        ('commercial_land', 'Commercial Land'),
        ('industrial_land', 'Industrial Land'),
        ('house', 'House / Single Family Home'),
        ('apartment', 'Apartment / Condominium'),
        ('commercial_building', 'Commercial Building / Office'),
        ('ranch', 'Ranch / Acreage'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('pending', 'Pending / Under Review'),
        ('sold', 'Sold'),
        ('unpublished', 'Unpublished'),
        ('rejected', 'Rejected'),
    ]

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='properties'
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, blank=True)
    property_type = models.CharField(max_length=40, choices=PROPERTY_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='published')
    price = models.DecimalField(max_digits=14, decimal_places=2)
    area_sqft = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    area_acres = models.FloatField(null=True, blank=True)

    description = models.TextField()
    short_description = models.CharField(max_length=300, blank=True)

    # Location
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='United States')
    zip_code = models.CharField(max_length=20, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    # Conditional Residential Specs
    bedrooms = models.IntegerField(null=True, blank=True)
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)

    # Land & Development Specs
    zoning_classification = models.CharField(max_length=100, blank=True, default='')
    road_access = models.BooleanField(default=True)
    water_rights = models.BooleanField(default=False)
    electricity = models.BooleanField(default=True)
    soil_type = models.CharField(max_length=100, blank=True, default='')
    topography = models.CharField(max_length=100, blank=True, default='')
    property_tax_annual = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Meta
    is_featured = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Properties'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)[:250]
        if not self.short_description and self.description:
            self.short_description = self.description[:280] + ('...' if len(self.description) > 280 else '')
        if self.area_acres and not self.area_sqft:
            self.area_sqft = self.area_acres * 43560
        elif self.area_sqft and not self.area_acres:
            self.area_acres = round(float(self.area_sqft) / 43560, 2)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - ${self.price}"

    @property
    def cover_image(self):
        cover = self.images.filter(is_cover=True).first()
        if not cover:
            cover = self.images.first()
        if cover:
            return cover.display_url
        return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'

    def calculate_distance(self, user_lat, user_lng):
        """Calculates distance in kilometers using the Haversine formula."""
        if self.latitude is None or self.longitude is None:
            return None
        r = 6371.0 # Earth's radius in kilometers
        d_lat = math.radians(self.latitude - user_lat)
        d_lng = math.radians(self.longitude - user_lng)
        a = (math.sin(d_lat / 2) ** 2 +
             math.cos(math.radians(user_lat)) * math.cos(math.radians(self.latitude)) *
             math.sin(d_lng / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(r * c, 2)

class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image_url = models.CharField(max_length=500, blank=True, default='')
    image_file = models.ImageField(upload_to='properties/', null=True, blank=True)
    is_cover = models.BooleanField(default=False)
    caption = models.CharField(max_length=200, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_cover', 'id']

    @builtins.property
    def display_url(self):
        if self.image_file:
            return self.image_file.url
        return self.image_url or 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
