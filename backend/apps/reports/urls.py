from django.urls import path
from .views import ReportSubmitView

urlpatterns = [
    path('', ReportSubmitView.as_view(), name='report-submit'),
]
