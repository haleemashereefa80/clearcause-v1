from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Campaign, CampaignImage, CampaignUpdate, CampaignDocument, Donation, CampaignMedia
from .serializers import (
    CampaignSerializer, CampaignImageSerializer,
    CampaignUpdateSerializer, CampaignDocumentSerializer, DonationSerializer,
    CampaignMediaSerializer
)

class CampaignViewSet(viewsets.ModelViewSet):
    serializer_class = CampaignSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'beneficiary_name']
    ordering_fields = ['created_at', 'goal_amount', 'raised_amount']
    lookup_field = 'slug'

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]
        
        # Try slug first
        try:
            return queryset.get(slug=lookup_value)
        except (Campaign.DoesNotExist, Exception):
            # Fallback to ID
            try:
                import uuid
                uuid_val = uuid.UUID(lookup_value)
                return queryset.get(id=uuid_val)
            except (Campaign.DoesNotExist, ValueError):
                from django.http import Http404
                raise Http404("Campaign not found")

    def get_queryset(self):
        # By default, only show approved campaigns to the public
        qs = Campaign.objects.filter(status='approved')
        
        category = self.request.query_params.get('category')
        campaign_status = self.request.query_params.get('status')
        organizer = self.request.query_params.get('organizer')
        
        # If an authenticated user is viewing their own campaigns, show all their campaigns regardless of status
        if organizer == 'me' and self.request.user.is_authenticated:
            qs = Campaign.objects.filter(organizer=self.request.user)
            
        if category:
            qs = qs.filter(category=category)
            
        # If a specific status is requested, apply it (will combine with 'approved' default unless overridden by 'me')
        if campaign_status:
            qs = qs.filter(status=campaign_status)
            
        return qs

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'trending', 'featured', 'updates', 'donors']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user, status='draft')

    @action(detail=False, methods=['get'])
    def trending(self, request):
        campaigns = Campaign.objects.filter(status='approved').order_by('-donor_count')[:12]
        serializer = self.get_serializer(campaigns, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        campaigns = Campaign.objects.filter(is_featured=True, status='approved')[:6]
        serializer = self.get_serializer(campaigns, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def submit(self, request, slug=None):
        campaign = self.get_object()
        if campaign.organizer != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        campaign.status = 'pending_review'
        campaign.save()
        return Response({'status': 'Campaign submitted for review'})

    @action(detail=True, methods=['get'])
    def updates(self, request, slug=None):
        campaign = self.get_object()
        updates = campaign.updates.all()
        serializer = CampaignUpdateSerializer(updates, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def donors(self, request, slug=None):
        campaign = self.get_object()
        donations = campaign.donations.filter(status='completed')
        serializer = DonationSerializer(donations, many=True)
        return Response(serializer.data)

class CampaignImageViewSet(viewsets.ModelViewSet):
    queryset = CampaignImage.objects.all()
    serializer_class = CampaignImageSerializer
    permission_classes = [permissions.IsAuthenticated]

class CampaignUpdateViewSet(viewsets.ModelViewSet):
    queryset = CampaignUpdate.objects.all()
    serializer_class = CampaignUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

class CampaignDocumentViewSet(viewsets.ModelViewSet):
    queryset = CampaignDocument.objects.all()
    serializer_class = CampaignDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

class CampaignMediaViewSet(viewsets.ModelViewSet):
    queryset = CampaignMedia.objects.all()
    serializer_class = CampaignMediaSerializer
    permission_classes = [permissions.IsAuthenticated]
