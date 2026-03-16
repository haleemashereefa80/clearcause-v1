import random
from rest_framework import serializers
from .models import (
    User, KYCDocument, Campaign, CampaignImage, CampaignUpdate,
    CampaignDocument, Donation, BankAccount, Withdrawal,
    WithdrawalDocument, Volunteer, VerificationAssignment,
    Notification, NGOProfile, VerificationDocument, AuditLog, CampaignMedia
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'mobile', 'role', 'profile_photo_url', 'city', 'state', 'kyc_status', 'is_email_verified', 'is_staff', 'is_active')
        read_only_fields = ('id', 'is_email_verified', 'kyc_status')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('email', 'password', 'full_name', 'mobile', 'role')

    def create(self, validated_data):
        # Generate a username since it's required by AbstractUser
        email = validated_data['email']
        username = email.split('@')[0] + "_" + str(random.randint(1000, 9999))
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            mobile=validated_data.get('mobile', ''),
            role=validated_data.get('role', 'donor')
        )
        return user

class KYCDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCDocument
        fields = '__all__'
        read_only_fields = ('id', 'user', 'status', 'reviewed_at', 'reviewed_by')

class CampaignImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignImage
        fields = '__all__'

class CampaignMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignMedia
        fields = '__all__'

class CampaignUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignUpdate
        fields = '__all__'

class CampaignDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignDocument
        fields = '__all__'

class VerificationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationDocument
        fields = '__all__'
        read_only_fields = ('id', 'is_verified', 'uploaded_at', 'verified_at', 'verified_by')

class VerificationAssignmentSerializer(serializers.ModelSerializer):
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)
    volunteer_name = serializers.CharField(source='volunteer.user.full_name', read_only=True)
    volunteer_email = serializers.CharField(source='volunteer.user.email', read_only=True)
    documents = VerificationDocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = VerificationAssignment
        fields = '__all__'
        read_only_fields = ('id', 'assigned_by', 'assigned_at')

class CampaignSerializer(serializers.ModelSerializer):
    images = CampaignImageSerializer(many=True, read_only=True)
    media = CampaignMediaSerializer(many=True, read_only=True)
    updates = CampaignUpdateSerializer(many=True, read_only=True)
    documents = CampaignDocumentSerializer(many=True, read_only=True)
    verifications = VerificationAssignmentSerializer(many=True, read_only=True)
    organizer_profile_name = serializers.CharField(source='organizer.full_name', read_only=True)
    
    class Meta:
        model = Campaign
        fields = '__all__'
        read_only_fields = ('id', 'slug', 'organizer', 'raised_amount', 'donor_count', 'status', 'is_verified', 'is_featured', 'created_at', 'updated_at')

class AdminCampaignSerializer(serializers.ModelSerializer):
    """Lightweight serializer for admin campaign listing (no nested relations)."""
    organizer_name = serializers.CharField(source='organizer.full_name', read_only=True)
    
    class Meta:
        model = Campaign
        fields = [
            'id', 'title', 'slug', 'category', 'status', 'goal_amount', 'raised_amount',
            'donor_count', 'is_verified', 'is_featured', 'is_urgent', 'organizer_name',
            'beneficiary_name', 'rejection_reason', 'end_date', 'created_at', 'updated_at',
        ]

class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = '__all__'
        read_only_fields = ('id', 'status', 'gateway_order_id', 'gateway_payment_id', 'receipt_url', 'created_at')

class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = '__all__'
        read_only_fields = ('id', 'user', 'is_verified', 'created_at')

class WithdrawalDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = WithdrawalDocument
        fields = '__all__'

class WithdrawalSerializer(serializers.ModelSerializer):
    documents = WithdrawalDocumentSerializer(many=True, read_only=True)
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)
    organizer_name = serializers.CharField(source='organizer.full_name', read_only=True)
    organizer_kyc_status = serializers.CharField(source='organizer.kyc_status', read_only=True)
    bank_account_details = BankAccountSerializer(source='bank_account', read_only=True)
    
    class Meta:
        model = Withdrawal
        fields = '__all__'
        read_only_fields = ('id', 'organizer', 'status', 'processed_by', 'requested_at', 'processed_at')

class NGOProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = NGOProfile
        fields = '__all__'
        read_only_fields = ('id', 'is_approved', 'created_at')

class VolunteerSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    active_assignments_count = serializers.IntegerField(read_only=True)
    pending_reports_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Volunteer
        fields = '__all__'
        read_only_fields = ('id', 'total_completed', 'created_by', 'created_at')

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('id', 'created_at')

class VerificationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationDocument
        fields = '__all__'
        read_only_fields = ('id', 'is_verified', 'uploaded_at', 'verified_at', 'verified_by')

class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True, default='System')
    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = ('id', 'timestamp')
