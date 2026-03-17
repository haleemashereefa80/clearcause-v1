import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify

class User(AbstractUser):
    ROLE_CHOICES = (
        ('organizer', 'Organizer'),
        ('donor', 'Donor'),
        ('volunteer', 'Volunteer'),
        ('ngo', 'NGO'),
        ('admin', 'Admin'),
    )
    KYC_STATUS_CHOICES = (
        ('unverified', 'Unverified'),
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    mobile = models.CharField(max_length=15, blank=True, null=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='donor')
    profile_photo_url = models.URLField(max_length=500, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    is_email_verified = models.BooleanField(default=False)
    kyc_status = models.CharField(max_length=20, choices=KYC_STATUS_CHOICES, default='unverified')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'full_name']
    
    # Login lockout fields
    login_attempts = models.IntegerField(default=0)
    last_failed_login = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email

class KYCDocument(models.Model):
    DOCUMENT_TYPE_CHOICES = (
        ('aadhaar', 'Aadhaar Card'), ('pan', 'PAN Card'), ('voter_id', 'Voter ID'),
        ('passport', 'Passport'), ('driving_license', 'Driving License'),
        ('relationship_proof', 'Relationship Proof'), ('gst_cert', 'GST Certificate'),
        ('80g_cert', '80G Certificate'), ('fcra_cert', 'FCRA Certificate'),
        ('selfie', 'Selfie Upload'), ('bank_passbook', 'Bank Passbook Front Page'),
    )
    TARGET_CHOICES = (
        ('organizer', 'Organizer'), ('beneficiary', 'Beneficiary'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='kyc_documents')
    campaign = models.ForeignKey('Campaign', on_delete=models.CASCADE, null=True, blank=True, related_name='kyc_documents')
    target = models.CharField(max_length=20, choices=TARGET_CHOICES, default='organizer')
    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPE_CHOICES)
    document_number = models.CharField(max_length=50, blank=True, null=True)
    document_front = models.FileField(upload_to='kyc/front/', null=True, blank=True)
    document_back = models.FileField(upload_to='kyc/back/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_kycs')

class Campaign(models.Model):
    CATEGORY_CHOICES = (
        ('medical', 'Medical'), ('education', 'Education'), ('sports', 'Sports'),
        ('disaster', 'Disaster Relief'), ('ngo', 'NGO'), ('animals', 'Animal Welfare'),
        ('community', 'Community Development'),
        ('memorial', 'Memorial'), ('birthday', 'Birthday'), ('marathon', 'Marathon'),
        ('wedding', 'Wedding'), ('environment', 'Environment'), ('others', 'Others'),
    )
    STATUS_CHOICES = (
        ('draft', 'Draft'), ('pending_review', 'Pending Review'),
        ('volunteer_assigned', 'Volunteer Assigned'),
        ('verification_in_progress', 'Verification in Progress'),
        ('report_submitted', 'Report Submitted'), ('approved', 'Approved'),
        ('rejected', 'Rejected'), ('needs_more_info', 'Needs More Info'),
        ('paused', 'Paused'), ('completed', 'Completed'), ('suspended', 'Suspended'),
    )
    BENEFICIARY_RELATIONSHIP_CHOICES = (
        ('self', 'Self'), ('spouse', 'Spouse'), ('child', 'Child'), 
        ('parent', 'Parent'), ('sibling', 'Sibling'), ('friend', 'Friend'), 
        ('other', 'Other'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaigns')
    organizer_name = models.CharField(max_length=255, blank=True, null=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, unique=True)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    other_category_reason = models.CharField(max_length=255, blank=True, null=True)
    beneficiary_name = models.CharField(max_length=255)
    beneficiary_relationship = models.CharField(max_length=100, choices=BENEFICIARY_RELATIONSHIP_CHOICES)
    goal_amount = models.DecimalField(max_digits=12, decimal_places=2)
    raised_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    donor_count = models.IntegerField(default=0)
    cover_image = models.ImageField(upload_to='campaigns/covers/', blank=True, null=True)
    video_url = models.URLField(max_length=500, blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')
    is_verified = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_urgent = models.BooleanField(default=False)
    rejection_reason = models.TextField(blank=True, null=True)
    admin_notes = models.TextField(blank=True, null=True)
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            self.slug = base_slug
            # Handle collision
            count = 1
            while Campaign.objects.filter(slug=self.slug).exists():
                self.slug = f"{base_slug}-{str(self.id)[:8]}"
                if Campaign.objects.filter(slug=self.slug).exists(): # if still exists, use random
                   import secrets
                   self.slug = f"{base_slug}-{secrets.token_hex(4)}"
                break # Only need to append once to make it unique in most cases
        super().save(*args, **kwargs)

class CampaignMedia(models.Model):
    MEDIA_TYPE_CHOICES = (
        ('image', 'Image'),
        ('video', 'Video'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='gallery')
    file = models.FileField(upload_to='campaigns/gallery/', null=True, blank=True)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES, default='image')
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class CampaignImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='campaigns/images/', null=True, blank=True)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class CampaignUpdate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='updates')
    content = models.TextField()
    image = models.ImageField(upload_to='campaigns/updates/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class CampaignDocument(models.Model):
    DOC_TYPE_CHOICES = (
        ('hospital_bill', 'Hospital Bill'), ('prescription', 'Prescription'),
        ('doctor_letter', 'Doctor Letter'), ('school_letter', 'School Letter'),
        ('relationship_proof', 'Relationship Proof'), ('other', 'Other'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=30, choices=DOC_TYPE_CHOICES)
    document = models.FileField(upload_to='campaigns/documents/', null=True, blank=True)
    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Donation(models.Model):
    GATEWAY_CHOICES = (('razorpay', 'Razorpay'),)
    STATUS_CHOICES = (
        ('pending', 'Pending'), ('completed', 'Completed'),
        ('failed', 'Failed'), ('refunded', 'Refunded'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='donations')
    donor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='donations')
    donor_name = models.CharField(max_length=255)
    donor_email = models.EmailField()
    donor_mobile = models.CharField(max_length=15, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    tip_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    pan_number = models.CharField(max_length=10, blank=True, null=True)
    payment_gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES, default='razorpay')
    gateway_order_id = models.CharField(max_length=255, blank=True, null=True)
    gateway_payment_id = models.CharField(max_length=255, unique=True, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_anonymous = models.BooleanField(default=False)
    donor_message = models.TextField(blank=True, null=True)
    receipt_url = models.URLField(max_length=500, blank=True, null=True)
    failure_reason = models.TextField(blank=True, null=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    utm_source = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class BankAccount(models.Model):
    ACCOUNT_TYPE_CHOICES = (
        ('savings', 'Savings'), ('current', 'Current'), 
        ('hospital', 'Hospital'), ('ngo', 'NGO'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bank_accounts')
    campaign = models.ForeignKey('Campaign', on_delete=models.CASCADE, null=True, blank=True, related_name='bank_accounts')
    account_holder_name = models.CharField(max_length=255)
    account_number = models.CharField(max_length=20)
    bank_name = models.CharField(max_length=255, blank=True, null=True)
    branch_name = models.CharField(max_length=255, blank=True, null=True)
    ifsc_code = models.CharField(max_length=11)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES, default='savings')
    bank_proof = models.FileField(upload_to='bank/proofs/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class Withdrawal(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'), ('under_review', 'Under Review'),
        ('approved', 'Approved'), ('transfer_initiated', 'Transfer Initiated'),
        ('completed', 'Completed'), ('rejected', 'Rejected'),
    )
    TRANSFER_CHOICES = (
        ('bank', 'Beneficiary Bank Account'), ('hospital', 'Hospital Account'),
        ('ngo', 'NGO Account'), ('vendor', 'Vendor Account'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='withdrawals')
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='withdrawals')
    bank_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transfer_option = models.CharField(max_length=20, choices=TRANSFER_CHOICES, default='bank')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True, null=True)
    transfer_reference = models.CharField(max_length=255, blank=True, null=True)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_withdrawals')
    requested_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

class WithdrawalDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    withdrawal = models.ForeignKey(Withdrawal, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=50)
    document = models.FileField(upload_to='withdrawals/documents/', null=True, blank=True)
    amount_covered = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Volunteer(models.Model):
    SPECIALISATION_CHOICES = (
        ('medical', 'Medical'), ('education', 'Education'), 
        ('ngo', 'NGO'), ('general', 'General'),
    )
    AVAILABILITY_CHOICES = (
        ('available', 'Available'), ('busy', 'Busy'), ('on_leave', 'On Leave'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='volunteer_profile')
    region = models.CharField(max_length=100)
    specialisation = models.CharField(max_length=20, choices=SPECIALISATION_CHOICES, default='general')
    availability_status = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default='available')
    total_completed = models.IntegerField(default=0)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_volunteers')
    created_at = models.DateTimeField(auto_now_add=True)

class VerificationAssignment(models.Model):
    STATUS_CHOICES = (
        ('assigned', 'Assigned'), ('in_progress', 'In Progress'),
        ('report_submitted', 'Report Submitted'), ('completed', 'Completed'),
    )
    # Choices updated to match user requirements
    ID_VERIFIED_CHOICES = (('yes', 'Yes'), ('no', 'No'), ('partial', 'Partial'))
    BENEFICIARY_VERIFIED_CHOICES = (('yes', 'Yes'), ('no', 'No'), ('na', 'N/A'))
    DOCS_AUTHENTIC_CHOICES = (('yes', 'Yes'), ('no', 'No'), ('suspicious', 'Suspicious'))
    STORY_ACCURACY_CHOICES = (('accurate', 'Accurate'), ('partial', 'Partial'), ('inaccurate', 'Inaccurate'))
    RISK_CHOICES = (('low', 'Low'), ('medium', 'Medium'), ('high', 'High'))
    REC_CHOICES = (('approve', 'Approve'), ('reject', 'Reject'), ('needs_more_info', 'Needs More Info'))

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='verifications')
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name='assignments')
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_verifications')
    assigned_at = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='assigned')
    
    # Structured Report Fields
    report_text = models.TextField(blank=True, null=True) # Detailed verification notes (min 100 chars)
    identity_verified = models.CharField(max_length=10, choices=ID_VERIFIED_CHOICES, null=True, blank=True)
    beneficiary_verified = models.CharField(max_length=10, choices=BENEFICIARY_VERIFIED_CHOICES, null=True, blank=True)
    documents_authentic = models.CharField(max_length=10, choices=DOCS_AUTHENTIC_CHOICES, null=True, blank=True)
    site_visit_conducted = models.BooleanField(default=False)
    story_accuracy = models.CharField(max_length=15, choices=STORY_ACCURACY_CHOICES, null=True, blank=True)
    risk_rating = models.CharField(max_length=10, choices=RISK_CHOICES, null=True, blank=True)
    recommendation = models.CharField(max_length=20, choices=REC_CHOICES, null=True, blank=True)
    
    evidence_urls = models.JSONField(default=list, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class NGOProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ngo_profile')
    org_name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=100)
    pan = models.CharField(max_length=10)
    address = models.TextField()
    mission = models.TextField()
    website_url = models.URLField(max_length=500, blank=True, null=True)
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    is_80g_eligible = models.BooleanField(default=False)
    certificate_80g_url = models.URLField(max_length=500, blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class VerificationDocument(models.Model):
    DOCUMENT_TYPE_CHOICES = (
        ('aadhaar', 'Aadhaar Card'),
        ('pan', 'PAN Card'),
        ('bank_details', 'Bank Details'),
        ('other', 'Other Evidence'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey(VerificationAssignment, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES)
    file = models.FileField(upload_to='verifications/documents/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_verification_docs')

    def __str__(self):
        return f"{self.document_type} - {self.assignment.campaign.title}"

class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=100)
    resource_id = models.CharField(max_length=100)
    details = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.action} - {self.timestamp}"
