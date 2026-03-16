from django.utils import timezone
from django.db.models import Sum, Count, Q
from datetime import timedelta
from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import (
    Volunteer, VerificationAssignment, Campaign, User, Withdrawal,
    KYCDocument, Donation, VerificationDocument, AuditLog, BankAccount, NGOProfile
)
from .serializers import (
    VolunteerSerializer, VerificationAssignmentSerializer,
    CampaignSerializer, UserSerializer, WithdrawalSerializer,
    KYCDocumentSerializer, VerificationDocumentSerializer,
    AuditLogSerializer, BankAccountSerializer, DonationSerializer,
    AdminCampaignSerializer, NGOProfileSerializer
)
from .notifications import send_kyc_status_update


class IsAdminRole(permissions.BasePermission):
    """Only allow users with role='admin' or is_staff=True."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role == 'admin' or request.user.is_staff
        )


# ==========================================
# VOLUNTEER ViewSets (for volunteer portal)
# ==========================================

class VolunteerViewSet(viewsets.ModelViewSet):
    queryset = Volunteer.objects.all()
    serializer_class = VolunteerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Volunteer.objects.all()
        if self.request.user.role == 'admin' or self.request.user.is_staff:
            # Annotate with active assignment count for admin
            qs = qs.annotate(
                active_assignments_count=Count('assignments', filter=Q(assignments__status__in=['assigned', 'in_progress'])),
                pending_reports_count=Count('assignments', filter=Q(assignments__status='report_submitted'))
            )
            return qs
        return qs.filter(user=self.request.user)
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current volunteer's profile."""
        try:
            volunteer = Volunteer.objects.get(user=request.user)
            return Response(VolunteerSerializer(volunteer).data)
        except Volunteer.DoesNotExist:
            return Response({'error': 'Volunteer profile not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], permission_classes=[IsAdminRole])
    def create_volunteer(self, request):
        """Admin creates a new volunteer user and profile."""
        email = request.data.get('email', '').lower().strip()
        password = request.data.get('password')
        full_name = request.data.get('full_name')
        mobile = request.data.get('mobile')
        region = request.data.get('region')
        specialisation = request.data.get('specialisation', 'general')

        if not email or not password or not full_name:
            return Response({'error': 'Email, password, and full name are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Create User
        import random
        username = email.split('@')[0] + "_" + str(random.randint(1000, 9999))
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            full_name=full_name,
            mobile=mobile,
            role='volunteer'
        )

        # Create Volunteer Profile
        volunteer = Volunteer.objects.create(
            user=user,
            region=region,
            specialisation=specialisation,
            created_by=request.user
        )

        return Response(VolunteerSerializer(volunteer).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def update_availability(self, request, pk=None):
        """Volunteer updates their own availability status."""
        volunteer = self.get_object()
        # Ensure ONLY the volunteer themselves (or an admin) can update this
        if request.user.role != 'admin' and not request.user.is_staff and volunteer.user != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
        new_status = request.data.get('status')
        if new_status not in dict(Volunteer.AVAILABILITY_CHOICES):
            return Response({'error': f'Invalid status. Choose from: {", ".join(dict(Volunteer.AVAILABILITY_CHOICES).keys())}'}, status=status.HTTP_400_BAD_REQUEST)
            
        volunteer.availability_status = new_status
        volunteer.save()
        return Response({'status': 'Availability updated', 'availability_status': volunteer.availability_status})


class VerificationAssignmentViewSet(viewsets.ModelViewSet):
    queryset = VerificationAssignment.objects.all()
    serializer_class = VerificationAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin' or self.request.user.is_staff:
            return VerificationAssignment.objects.all()
        return VerificationAssignment.objects.filter(volunteer__user=self.request.user)

    @action(detail=True, methods=['post'])
    def report(self, request, pk=None):
        """Volunteer submits verification report with document uploads."""
        assignment = self.get_object()
        if assignment.volunteer.user != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        assignment.report_text = request.data.get('report_text')
        assignment.identity_verified = request.data.get('identity_verified')
        assignment.beneficiary_verified = request.data.get('beneficiary_verified')
        assignment.documents_authentic = request.data.get('documents_authentic')
        assignment.site_visit_conducted = request.data.get('site_visit_conducted', False)
        assignment.story_accuracy = request.data.get('story_accuracy')
        assignment.risk_rating = request.data.get('risk_rating')
        assignment.recommendation = request.data.get('recommendation')
        assignment.status = 'report_submitted'
        assignment.submitted_at = timezone.now()
        assignment.save()

        # Update campaign status
        campaign = assignment.campaign
        campaign.status = 'report_submitted'
        campaign.save()

        return Response({'status': 'Report submitted successfully'})

    @action(detail=True, methods=['post'], url_path='upload-document')
    def upload_document(self, request, pk=None):
        """Volunteer uploads verification documents (Aadhaar/PAN/Bank)."""
        assignment = self.get_object()
        if assignment.volunteer.user != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        document_type = request.data.get('document_type')
        file = request.FILES.get('file')

        if not file or not document_type:
            return Response({'error': 'file and document_type are required'}, status=status.HTTP_400_BAD_REQUEST)

        doc = VerificationDocument.objects.create(
            assignment=assignment,
            document_type=document_type,
            file=file,
        )
        return Response(VerificationDocumentSerializer(doc).data, status=status.HTTP_201_CREATED)


class VerificationDocumentViewSet(viewsets.ModelViewSet):
    queryset = VerificationDocument.objects.all()
    serializer_class = VerificationDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        assignment_id = self.request.query_params.get('assignment')
        qs = VerificationDocument.objects.all()
        if assignment_id:
            qs = qs.filter(assignment_id=assignment_id)
        return qs


# ==========================================
# ADMIN ViewSets
# ==========================================

class AdminDashboardView(views.APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=now.weekday())
        month_start = today_start.replace(day=1)

        completed_donations = Donation.objects.filter(status='completed')

        stats = {
            'total_campaigns': Campaign.objects.count(),
            'active_campaigns': Campaign.objects.filter(status='approved').count(),
            'pending_campaigns': Campaign.objects.filter(status='pending_review').count(),
            'total_users': User.objects.count(),
            'new_users_today': User.objects.filter(created_at__gte=today_start).count(),
            'pending_kyc': KYCDocument.objects.filter(status='pending').count(),
            'pending_withdrawals': Withdrawal.objects.filter(status='pending').count(),

            # Donation metrics
            'daily_donations': float(completed_donations.filter(created_at__gte=today_start).aggregate(total=Sum('amount'))['total'] or 0),
            'weekly_donations': float(completed_donations.filter(created_at__gte=week_start).aggregate(total=Sum('amount'))['total'] or 0),
            'monthly_donations': float(completed_donations.filter(created_at__gte=month_start).aggregate(total=Sum('amount'))['total'] or 0),
            'total_donations_amount': float(completed_donations.aggregate(total=Sum('amount'))['total'] or 0),
            'total_donations_count': completed_donations.count(),

            # Revenue
            'platform_tips': float(completed_donations.aggregate(total=Sum('tip_amount'))['total'] or 0),

            # Alerts
            'flagged_campaigns': Campaign.objects.filter(status='suspended').count(),
            'failed_payments': Donation.objects.filter(status='failed').count(),
        }
        return Response(stats)


class AdminCampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.select_related('organizer').all().order_by('-created_at')
    pagination_class = None
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CampaignSerializer
        return AdminCampaignSerializer

    def get_queryset(self):
        qs = Campaign.objects.select_related('organizer').all().order_by('-created_at')
        status_filter = self.request.query_params.get('status')
        category = self.request.query_params.get('category')
        is_flagged = self.request.query_params.get('flagged')

        if status_filter:
            qs = qs.filter(status=status_filter)
        if category:
            qs = qs.filter(category=category)
        if is_flagged == 'true':
            qs = qs.filter(status='suspended')
        return qs

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        campaign = self.get_object()
        campaign.status = 'approved'
        campaign.is_verified = True
        campaign.save()
        
        # Complete any active assignments
        VerificationAssignment.objects.filter(
            campaign=campaign, 
            status__in=['assigned', 'in_progress', 'report_submitted']
        ).update(status='completed')
        AuditLog.objects.create(
            user=request.user, action='campaign_approved',
            resource_type='Campaign', resource_id=str(campaign.id),
        )
        return Response({'status': 'Campaign approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        campaign = self.get_object()
        campaign.status = 'rejected'
        campaign.rejection_reason = request.data.get('reason')
        campaign.save()
        
        # Complete any active assignments
        VerificationAssignment.objects.filter(
            campaign=campaign, 
            status__in=['assigned', 'in_progress', 'report_submitted']
        ).update(status='completed')
        AuditLog.objects.create(
            user=request.user, action='campaign_rejected',
            resource_type='Campaign', resource_id=str(campaign.id),
            details={'reason': request.data.get('reason')},
        )
        return Response({'status': 'Campaign rejected'})

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        campaign = self.get_object()
        campaign.status = 'suspended'
        campaign.save()
        AuditLog.objects.create(
            user=request.user, action='campaign_suspended',
            resource_type='Campaign', resource_id=str(campaign.id),
        )
        return Response({'status': 'Campaign suspended'})

    @action(detail=True, methods=['post'])
    def feature(self, request, pk=None):
        campaign = self.get_object()
        campaign.is_featured = not campaign.is_featured
        campaign.save()
        return Response({'status': f'Campaign featured: {campaign.is_featured}'})

    @action(detail=True, methods=['post'], url_path='assign-volunteer')
    def assign_volunteer(self, request, pk=None):
        campaign = self.get_object()
        volunteer_id = request.data.get('volunteer_id')
        deadline = request.data.get('deadline')

        assignment = VerificationAssignment.objects.create(
            campaign=campaign,
            volunteer_id=volunteer_id,
            assigned_by=request.user,
            deadline=deadline,
            status='assigned'
        )
        campaign.status = 'volunteer_assigned'
        campaign.save()
        AuditLog.objects.create(
            user=request.user, action='volunteer_assigned',
            resource_type='Campaign', resource_id=str(campaign.id),
            details={'volunteer_id': str(volunteer_id)},
        )
        return Response(VerificationAssignmentSerializer(assignment).data)

    @action(detail=True, methods=['post'], url_path='verify-document/(?P<doc_id>[^/.]+)')
    def verify_document(self, request, pk=None, doc_id=None):
        """Admin marks a volunteer-uploaded document as verified."""
        try:
            doc = VerificationDocument.objects.get(pk=doc_id, assignment__campaign_id=pk)
        except VerificationDocument.DoesNotExist:
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)

        doc.is_verified = True
        doc.verified_at = timezone.now()
        doc.verified_by = request.user
        doc.save()
        AuditLog.objects.create(
            user=request.user, action='verification_doc_verified',
            resource_type='VerificationDocument', resource_id=str(doc.id),
        )
        return Response(VerificationDocumentSerializer(doc).data)


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        qs = User.objects.all().order_by('-created_at')
        search = self.request.query_params.get('search')
        role = self.request.query_params.get('role')
        kyc = self.request.query_params.get('kyc_status')

        if search:
            qs = qs.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(mobile__icontains=search)
            )
        if role:
            qs = qs.filter(role=role)
        if kyc:
            qs = qs.filter(kyc_status=kyc)
        return qs

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        AuditLog.objects.create(
            user=request.user, action='user_suspended',
            resource_type='User', resource_id=str(user.id),
        )
        return Response({'status': 'User suspended'})

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'status': 'User activated'})


class AdminWithdrawalViewSet(viewsets.ModelViewSet):
    queryset = Withdrawal.objects.all().order_by('-requested_at')
    serializer_class = WithdrawalSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        qs = Withdrawal.objects.all().order_by('-requested_at')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        withdrawal = self.get_object()
        withdrawal.status = 'approved'
        withdrawal.processed_by = request.user
        withdrawal.processed_at = timezone.now()
        withdrawal.save()
        AuditLog.objects.create(
            user=request.user, action='withdrawal_approved',
            resource_type='Withdrawal', resource_id=str(withdrawal.id),
        )
        return Response({'status': 'Withdrawal approved'})

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        withdrawal = self.get_object()
        withdrawal.status = 'under_review'
        withdrawal.processed_by = request.user
        withdrawal.processed_at = timezone.now()
        withdrawal.save()
        AuditLog.objects.create(
            user=request.user, action='withdrawal_to_review',
            resource_type='Withdrawal', resource_id=str(withdrawal.id),
        )
        return Response({'status': 'Withdrawal moved to review'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        withdrawal = self.get_object()
        withdrawal.status = 'rejected'
        withdrawal.rejection_reason = request.data.get('reason')
        withdrawal.processed_by = request.user
        withdrawal.processed_at = timezone.now()
        withdrawal.save()
        AuditLog.objects.create(
            user=request.user, action='withdrawal_rejected',
            resource_type='Withdrawal', resource_id=str(withdrawal.id),
            details={'reason': request.data.get('reason')},
        )
        return Response({'status': 'Withdrawal rejected'})


class AdminKYCViewSet(viewsets.ModelViewSet):
    queryset = KYCDocument.objects.all().order_by('-submitted_at')
    serializer_class = KYCDocumentSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        qs = KYCDocument.objects.all().order_by('-submitted_at')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        kyc = self.get_object()
        kyc.status = 'approved'
        kyc.reviewed_at = timezone.now()
        kyc.reviewed_by = request.user
        kyc.save()
        
        # Check if we should update the User's overall KYC status
        user = kyc.user
        # Simple logic: if at least one doc is approved and none are pending/rejected (for that target), 
        # or just mark as verified based on admin approval of this doc.
        # In this system, user.kyc_status='verified' usually means they are clear.
        user.kyc_status = 'verified'
        user.save()

        send_kyc_status_update(user.email, kyc.document_type, 'approved')

        AuditLog.objects.create(
            user=request.user, action='kyc_approved',
            resource_type='KYCDocument', resource_id=str(kyc.id),
        )
        return Response({'status': 'KYC approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        kyc = self.get_object()
        reason = request.data.get('reason')
        kyc.status = 'rejected'
        kyc.rejection_reason = reason
        kyc.reviewed_at = timezone.now()
        kyc.reviewed_by = request.user
        kyc.save()
        
        user = kyc.user
        user.kyc_status = 'rejected'
        user.save()

        send_kyc_status_update(user.email, kyc.document_type, 'rejected', reason)

        AuditLog.objects.create(
            user=request.user, action='kyc_rejected',
            resource_type='KYCDocument', resource_id=str(kyc.id),
            details={'reason': reason},
        )
        return Response({'status': 'KYC rejected'})

    @action(detail=True, methods=['post'])
    def under_review(self, request, pk=None):
        kyc = self.get_object()
        kyc.status = 'under_review'
        kyc.reviewed_at = timezone.now()
        kyc.reviewed_by = request.user
        kyc.save()

        user = kyc.user
        user.kyc_status = 'pending'
        user.save()

        send_kyc_status_update(user.email, kyc.document_type, 'under_review')

        AuditLog.objects.create(
            user=request.user, action='kyc_under_review',
            resource_type='KYCDocument', resource_id=str(kyc.id),
        )
        return Response({'status': 'KYC moved to under review'})


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminRole]


class AdminNGOViewSet(viewsets.ModelViewSet):
    queryset = NGOProfile.objects.all().order_by('-created_at')
    serializer_class = NGOProfileSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        qs = NGOProfile.objects.all().order_by('-created_at')
        status = self.request.query_params.get('status')
        if status == 'approved':
            qs = qs.filter(is_approved=True)
        elif status == 'pending':
            qs = qs.filter(is_approved=False)
        return qs

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        profile = self.get_object()
        profile.is_approved = True
        profile.save()
        
        # Also update user kyc_status
        user = profile.user
        user.kyc_status = 'verified'
        user.save()
        
        AuditLog.objects.create(
            user=request.user, action='ngo_approved',
            resource_type='NGOProfile', resource_id=str(profile.id),
        )
        return Response({'status': 'NGO profile approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        profile = self.get_object()
        profile.is_approved = False
        profile.save()
        
        # Update user status if needed
        user = profile.user
        user.kyc_status = 'rejected'
        user.save()
        
        AuditLog.objects.create(
            user=request.user, action='ngo_rejected',
            resource_type='NGOProfile', resource_id=str(profile.id),
            details={'reason': request.data.get('reason')}
        )
        return Response({'status': 'NGO profile rejected'})
