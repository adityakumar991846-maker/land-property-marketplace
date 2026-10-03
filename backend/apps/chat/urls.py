from django.urls import path
from .views import (
    ConversationListCreateView,
    ConversationDetailView,
    MessageListCreateView,
    MarkConversationReadView
)

urlpatterns = [
    path('conversations/', ConversationListCreateView.as_view(), name='conversation-list-create'),
    path('conversations/<int:pk>/', ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:pk>/messages/', MessageListCreateView.as_view(), name='conversation-messages'),
    path('conversations/<int:pk>/read/', MarkConversationReadView.as_view(), name='conversation-read'),
]
