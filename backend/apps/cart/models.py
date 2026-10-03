from django.db import models
from django.conf import settings
from apps.properties.models import Property

class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart of {self.user.username}"

    @property
    def total_value(self):
        return sum(item.property.price for item in self.items.all())

    @property
    def item_count(self):
        return self.items.count()

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='cart_entries')
    notes = models.CharField(max_length=300, blank=True, default='')
    offer_amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('cart', 'property')
        ordering = ['-added_at']

    def __str__(self):
        return f"{self.property.title} in cart {self.cart.id}"
