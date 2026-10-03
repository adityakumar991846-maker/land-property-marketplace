from django.db import models
from django.conf import settings
from apps.properties.models import Property

class Report(models.Model):
    REPORT_TYPES = [
        ('suspicious_listing', 'Suspicious / Fraudulent Listing'),
        ('inaccurate_info', 'Inaccurate / Misleading Information'),
        ('inappropriate_content', 'Inappropriate Photos or Content'),
        ('problematic_user', 'Problematic / Abusive User'),
        ('other', 'Other Reason'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('investigating', 'Under Investigation'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]

    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submitted_reports')
    property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True, blank=True, related_name='reports')
    reported_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reports_against')

    reason = models.CharField(max_length=50, choices=REPORT_TYPES)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report #{self.id} ({self.reason}) by {self.reporter.username}"
