from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from apps.properties.models import Property
from apps.reports.models import Report
from apps.chat.models import Message
from apps.accounts.serializers import UserSerializer
from apps.properties.serializers import PropertyCardSerializer, PropertyDetailSerializer
from apps.reports.serializers import ReportSerializer

from apps.core.permissions import IsAdminOrStaff

User = get_user_model()

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminOrStaff]

    def get(self, request):
        total_users = User.objects.count()
        total_sellers = User.objects.filter(is_seller=True).count()
        total_buyers = total_users - total_sellers

        total_properties = Property.objects.count()
        active_properties = Property.objects.filter(status='published').count()
        pending_properties = Property.objects.filter(status='pending').count()
        sold_properties = Property.objects.filter(status='sold').count()
        rejected_properties = Property.objects.filter(status='rejected').count()

        total_reports = Report.objects.count()
        pending_reports = Report.objects.filter(status='pending').count()
        total_messages = Message.objects.count()

        recent_users = UserSerializer(User.objects.order_by('-date_joined')[:5], many=True).data
        recent_properties = PropertyCardSerializer(Property.objects.order_by('-created_at')[:5], many=True, context={'request': request}).data
        recent_reports = ReportSerializer(Report.objects.order_by('-created_at')[:5], many=True).data

        return Response({
            'stats': {
                'total_users': total_users,
                'total_sellers': total_sellers,
                'total_buyers': total_buyers,
                'total_properties': total_properties,
                'active_properties': active_properties,
                'pending_properties': pending_properties,
                'sold_properties': sold_properties,
                'rejected_properties': rejected_properties,
                'total_reports': total_reports,
                'pending_reports': pending_reports,
                'total_messages': total_messages,
            },
            'recent_users': recent_users,
            'recent_properties': recent_properties,
            'recent_reports': recent_reports
        })

class AdminUserListView(APIView):
    permission_classes = [IsAdminOrStaff]

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        q = request.query_params.get('q', '').strip()
        if q:
            users = users.filter(
                Q(username__icontains=q) |
                Q(email__icontains=q) |
                Q(first_name__icontains=q) |
                Q(last_name__icontains=q) |
                Q(company_name__icontains=q)
            )

        role = request.query_params.get('role')
        if role == 'seller':
            users = users.filter(is_seller=True)
        elif role == 'buyer':
            users = users.filter(is_seller=False)
        elif role == 'staff':
            users = users.filter(is_staff=True)

        is_active = request.query_params.get('is_active')
        if is_active in ['true', 'false']:
            users = users.filter(is_active=(is_active == 'true'))

        return Response(UserSerializer(users, many=True).data)

class AdminUserActionView(APIView):
    permission_classes = [IsAdminOrStaff]

    def patch(self, request, pk):
        try:
            target_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if 'is_active' in request.data:
            target_user.is_active = bool(request.data['is_active'])
        elif request.path.endswith('toggle-active/'):
            target_user.is_active = not target_user.is_active

        if 'is_seller' in request.data:
            target_user.is_seller = bool(request.data['is_seller'])
        if 'is_staff' in request.data and request.user.is_superuser:
            target_user.is_staff = bool(request.data['is_staff'])

        target_user.save()
        return Response({
            'message': f'User {target_user.username} updated',
            'user': UserSerializer(target_user).data
        })

    def post(self, request, pk):
        return self.patch(request, pk)

class AdminPropertyListView(APIView):
    permission_classes = [IsAdminOrStaff]

    def get(self, request):
        props = Property.objects.select_related('seller').all().order_by('-created_at')

        status_param = request.query_params.get('status')
        if status_param:
            props = props.filter(status=status_param)

        q = request.query_params.get('q', '').strip()
        if q:
            props = props.filter(
                Q(title__icontains=q) |
                Q(city__icontains=q) |
                Q(state__icontains=q) |
                Q(seller__username__icontains=q)
            )

        return Response(PropertyCardSerializer(props, many=True, context={'request': request}).data)

class AdminPropertyActionView(APIView):
    permission_classes = [IsAdminOrStaff]

    def patch(self, request, pk):
        try:
            prop = Property.objects.get(pk=pk)
        except Property.DoesNotExist:
            return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status:
            prop.status = new_status

        if 'is_featured' in request.data:
            prop.is_featured = bool(request.data['is_featured'])

        prop.save()
        return Response({
            'message': f'Property status updated to {prop.status}',
            'property': PropertyCardSerializer(prop, context={'request': request}).data
        })

    def post(self, request, pk):
        return self.patch(request, pk)

    def delete(self, request, pk):
        try:
            prop = Property.objects.get(pk=pk)
            prop.delete()
            return Response({'message': 'Property removed by administrator'})
        except Property.DoesNotExist:
            return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)

class AdminReportListView(APIView):
    permission_classes = [IsAdminOrStaff]

    def get(self, request):
        reports = Report.objects.select_related('reporter', 'property', 'reported_user').all().order_by('-created_at')
        status_param = request.query_params.get('status')
        if status_param:
            reports = reports.filter(status=status_param)
        return Response(ReportSerializer(reports, many=True).data)

class AdminReportActionView(APIView):
    permission_classes = [IsAdminOrStaff]

    def patch(self, request, pk):
        try:
            report = Report.objects.get(pk=pk)
        except Report.DoesNotExist:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status:
            report.status = new_status
        if 'admin_notes' in request.data:
            report.admin_notes = request.data['admin_notes']

        report.save()
        return Response({
            'message': f'Report status updated to {report.status}',
            'report': ReportSerializer(report).data
        })

    def post(self, request, pk):
        return self.patch(request, pk)
