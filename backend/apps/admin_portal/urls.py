from django.urls import path
from .views import (
    AdminDashboardStatsView,
    AdminUserListView,
    AdminUserActionView,
    AdminPropertyListView,
    AdminPropertyActionView,
    AdminReportListView,
    AdminReportActionView
)

urlpatterns = [
    path('stats/', AdminDashboardStatsView.as_view(), name='admin-stats'),
    path('users/', AdminUserListView.as_view(), name='admin-users'),
    path('users/<int:pk>/', AdminUserActionView.as_view(), name='admin-user-action'),
    path('users/<int:pk>/toggle-active/', AdminUserActionView.as_view(), name='admin-user-toggle-active'),
    path('properties/', AdminPropertyListView.as_view(), name='admin-properties'),
    path('properties/<int:pk>/', AdminPropertyActionView.as_view(), name='admin-property-action'),
    path('properties/<int:pk>/status/', AdminPropertyActionView.as_view(), name='admin-property-status'),
    path('reports/', AdminReportListView.as_view(), name='admin-reports'),
    path('reports/<int:pk>/', AdminReportActionView.as_view(), name='admin-report-action'),
    path('reports/<int:pk>/status/', AdminReportActionView.as_view(), name='admin-report-status'),
]
