import razorpay
from django.conf import settings
from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Donation, Withdrawal, BankAccount, KYCDocument, Campaign, WithdrawalDocument
from .serializers import (
    DonationSerializer, WithdrawalSerializer,
    BankAccountSerializer, KYCDocumentSerializer, WithdrawalDocumentSerializer
)
from .notifications import send_donation_confirmation

def get_razorpay_client():
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class DonationViewSet(viewsets.ModelViewSet):
    serializer_class = DonationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Donation.objects.all()
        donor = self.request.query_params.get('donor')
        if donor == 'me' and self.request.user.is_authenticated:
            qs = qs.filter(donor=self.request.user)
        return qs

    @action(detail=False, methods=['post'], url_path='create-order')
    def create_order(self, request):
        campaign_id = request.data.get('campaign_id')
        amount = float(request.data.get('amount'))
        
        # Razorpay order creation
        client = get_razorpay_client()
        order_data = {
            'amount': int(amount * 100),  # amount in paise
            'currency': 'INR',
            'payment_capture': '1'
        }
        order = client.order.create(data=order_data)
        
        donation = Donation.objects.create(
            campaign_id=campaign_id,
            amount=amount,
            gateway_order_id=order['id'],
            donor=request.user if request.user.is_authenticated else None,
            donor_name=request.data.get('donor_name', 'Anonymous'),
            donor_email=request.data.get('donor_email', ''),
            donor_mobile=request.data.get('donor_mobile', ''),
            pan_number=request.data.get('pan_number', ''),
            status='pending'
        )
        
        return Response({
            'order_id': order['id'],
            'donation_id': donation.id,
            'amount': amount
        })

    @action(detail=False, methods=['post'], url_path='confirm')
    def confirm(self, request):
        payment_id = request.data.get('razorpay_payment_id')
        order_id = request.data.get('razorpay_order_id')
        signature = request.data.get('razorpay_signature')
        
        # Verify signature in production
        donation = Donation.objects.get(gateway_order_id=order_id)
        
        # Fetch payment details to get specific method
        try:
            client = get_razorpay_client()
            payment_details = client.payment.fetch(payment_id)
            donation.payment_method = payment_details.get('method')
        except Exception as e:
            print(f"Error fetching payment details: {e}")
            
        donation.gateway_payment_id = payment_id
        donation.status = 'completed'
        donation.save()
        
        # Update campaign raised amount
        campaign = donation.campaign
        campaign.raised_amount += donation.amount
        campaign.donor_count += 1
        campaign.save()
        
        send_donation_confirmation(donation.donor_email, donation.amount, campaign.title)
        
        return Response({'status': 'Payment confirmed'})

    @action(detail=False, methods=['post'], url_path='confirm-failure')
    def confirm_failure(self, request):
        order_id = request.data.get('razorpay_order_id')
        reason = request.data.get('reason', 'Unknown error')
        payment_id = request.data.get('razorpay_payment_id')
        
        try:
            donation = Donation.objects.get(gateway_order_id=order_id)
            donation.status = 'failed'
            donation.failure_reason = reason
            if payment_id:
                donation.gateway_payment_id = payment_id
            donation.save()
            return Response({'status': 'Failure recorded'})
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found'}, status=status.HTTP_404_NOT_FOUND)

class WithdrawalViewSet(viewsets.ModelViewSet):
    queryset = Withdrawal.objects.all()
    serializer_class = WithdrawalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Withdrawal.objects.all()
        return Withdrawal.objects.filter(organizer=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        
        # 1. Enforce KYC Status (Organizer & Beneficiary)
        # Check for approved organizer documents
        organizer_approved = KYCDocument.objects.filter(user=user, target='organizer', status='approved').exists()
        # Check for approved beneficiary documents
        beneficiary_approved = KYCDocument.objects.filter(user=user, target='beneficiary', status='approved').exists()
        
        if not organizer_approved or not beneficiary_approved:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Both Organizer and Beneficiary KYC must be 'approved' before requesting a withdrawal.")
            
        campaign = serializer.validated_data['campaign']
        amount = serializer.validated_data['amount']
        
        # 2. Balance check
        if amount > campaign.raised_amount:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Withdrawal amount exceeds campaign balance.")
            
        serializer.save(organizer=user, status='pending')

class BankAccountViewSet(viewsets.ModelViewSet):
    queryset = BankAccount.objects.all()
    serializer_class = BankAccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BankAccount.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class KYCDocumentViewSet(viewsets.ModelViewSet):
    queryset = KYCDocument.objects.all()
    serializer_class = KYCDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return KYCDocument.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status='pending')

class KYCViewSet(views.APIView):
    # Keeping for compatibility with /kyc/status/
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        kycs = KYCDocument.objects.filter(user=request.user)
        if kycs.exists():
            return Response(KYCDocumentSerializer(kycs, many=True).data)
        return Response({'status': 'not_submitted'})

class WithdrawalDocumentViewSet(viewsets.ModelViewSet):
    queryset = WithdrawalDocument.objects.all()
    serializer_class = WithdrawalDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only show documents for withdrawals the user owns
        return WithdrawalDocument.objects.filter(withdrawal__organizer=self.request.user)
