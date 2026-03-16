from rest_framework import views, permissions
from rest_framework.response import Response
from django.db.models import Sum, Count
from .models import Campaign, Donation, Withdrawal
from .serializers import CampaignSerializer, DonationSerializer

class DashboardSummaryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Organizer Metrics
        user_campaigns = Campaign.objects.filter(organizer=user)
        total_raised = user_campaigns.aggregate(Sum('raised_amount'))['raised_amount__sum'] or 0
        campaign_count = user_campaigns.count()
        pending_withdrawals = Withdrawal.objects.filter(organizer=user, status='pending').count()
        
        # Recent donations to user's campaigns
        recent_received = Donation.objects.filter(
            campaign__organizer=user, 
            status='completed'
        ).order_by('-id')[:5] # Using -id as proxy for -created_at if created_at is same

        # Donor Metrics
        user_donations = Donation.objects.filter(donor=user, status='completed')
        total_donated = user_donations.aggregate(Sum('amount'))['amount__sum'] or 0
        donated_campaign_count = user_donations.values('campaign').distinct().count()
        
        # Recent donations made by user
        recent_made = user_donations.order_by('-id')[:5]

        return Response({
            'organizer': {
                'total_raised': float(total_raised),
                'campaign_count': campaign_count,
                'pending_withdrawals': pending_withdrawals,
                'recent_donations': DonationSerializer(recent_received, many=True).data
            },
            'donor': {
                'total_donated': float(total_donated),
                'donated_campaign_count': donated_campaign_count,
                'recent_donations': DonationSerializer(recent_made, many=True).data
            },
            'user': {
                'full_name': user.full_name,
                'role': user.role,
                'kyc_status': user.kyc_status
            }
        })
