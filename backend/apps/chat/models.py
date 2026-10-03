from django.db import models
from django.conf import settings
from apps.properties.models import Property
import builtins

class Conversation(models.Model):
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='buyer_conversations')
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='seller_conversations')
    property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True, blank=True, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        unique_together = ('buyer', 'seller', 'property')

    def __str__(self):
        prop_title = self.property.title if self.property else "General"
        return f"{self.buyer.username} <-> {self.seller.username} ({prop_title})"

    def get_other_participant(self, user):
        return self.seller if user == self.buyer else self.buyer

    @builtins.property
    def last_message(self):
        return self.messages.order_by('-created_at').first()

    def unread_count_for_user(self, user):
        return self.messages.filter(is_read=False).exclude(sender=user).count()

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Msg from {self.sender.username} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"
