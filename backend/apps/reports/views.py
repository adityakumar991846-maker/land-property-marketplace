from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Report
from .serializers import ReportSerializer
from apps.properties.models import Property
from django.contrib.auth import get_user_model

User = get_user_model()

class ReportSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        reason = request.data.get('reason')
        description = request.data.get('description', '').strip()
        property_id = request.data.get('property_id')
        reported_user_id = request.data.get('reported_user_id')

        if not reason or not description:
            return Response({'error': 'Reason and description are required'}, status=status.HTTP_400_BAD_REQUEST)

        prop = None
        reported_user = None

        if property_id:
            try:
                prop = Property.objects.get(pk=property_id)
                reported_user = prop.seller
            except Property.DoesNotExist:
                return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)
        elif reported_user_id:
            try:
                reported_user = User.objects.get(pk=reported_user_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        report = Report.objects.create(
            reporter=request.user,
            property=prop,
            reported_user=reported_user,
            reason=reason,
            description=description
        )

        return Response({
            'message': 'Report submitted successfully. Our moderation team will review it.',
            'report_id': report.id
        }, status=status.HTTP_201_CREATED)
