import random
import uuid
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from django.utils import timezone
from core.models import (
    User, Campaign, Donation, Volunteer, NGOProfile, 
    CampaignImage, CampaignUpdate, CampaignDocument, VerificationAssignment, 
    VerificationDocument, BankAccount, Withdrawal, WithdrawalDocument, Notification,
    KYCDocument
)

CATEGORIES = ['medical', 'education', 'disaster', 'animal', 'ngo', 'others']
CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow']
STATES = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'West Bengal']

CAMPAIGN_TITLES = [
    "Help {name} fight {condition}", "Support {name}'s {condition} treatment",
    "Emergency funds for {name}'s surgery", "{name} needs your help for {condition}",
    "Give {name} a second chance at life", "Stand with {name} against {condition}",
]
CONDITIONS = ['cancer', 'heart surgery', 'kidney failure', 'accident recovery', 'brain tumor', 'liver transplant', 'bone marrow transplant']
NAMES = ['Arjun', 'Priya', 'Rahul', 'Sunita', 'Mohan', 'Kavita', 'Vijay', 'Anita', 'Sanjay', 'Meera', 'Ravi', 'Deepa']

class Command(BaseCommand):
    help = 'Seed the database with comprehensive sample data for end-to-end testing'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database with end-to-end data...')

        # 1. Create Admin
        admin, created = User.objects.get_or_create(
            email='admin@clearcause.com',
            defaults={
                'username': 'admin',
                'password': 'Admin@123',
                'full_name': 'ClearCause Admin',
                'role': 'admin',
                'is_email_verified': True
            }
        )
        if created:
            admin.set_password('Admin@123')
            admin.save()
            self.stdout.write(f'  Created admin: admin@clearcause.com')

        # 2. Create NGO Users and Profiles
        ngos = []
        for i in range(5):
            email = f'ngo{i+1}@example.com'
            name = f'Save the Children {i+1}'
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': f'ngo{i+1}',
                    'full_name': name,
                    'role': 'ngo',
                    'is_email_verified': True,
                    'kyc_status': 'verified'
                }
            )
            # NGO Profile
            NGOProfile.objects.get_or_create(
                user=user,
                defaults={
                    'org_name': name,
                    'registration_number': f'NGO-REG-{random.randint(1000, 9999)}',
                    'pan': f'ABCDE{random.randint(1000, 9999)}F',
                    'address': f'{random.randint(1, 100)}, NGO Colony, {random.choice(CITIES)}',
                    'mission': f'To provide {random.choice(CATEGORIES)} support to those in need.',
                    'is_approved': True,
                    'is_80g_eligible': True
                }
            )

            # NGO KYC state distribution (Always ensure)
            kyc_status_options = ['approved', 'approved', 'pending', 'under_review', 'rejected']
            selected_kyc_status = kyc_status_options[i % len(kyc_status_options)]
            
            user.kyc_status = 'verified' if selected_kyc_status == 'approved' else ('rejected' if selected_kyc_status == 'rejected' else 'pending')
            user.save()

            KYCDocument.objects.update_or_create(
                user=user,
                target='organizer',
                document_type='gst_cert',
                defaults={
                    'document_number': f'GST{random.randint(100000, 999999)}',
                    'document_front': 'https://picsum.photos/seed/gst/800/600',
                    'status': selected_kyc_status,
                    'rejection_reason': "GST certificate is expired." if selected_kyc_status == 'rejected' else None
                }
            )
            ngos.append(user)
        self.stdout.write(f'  Ensured {len(ngos)} NGOs with KYC')

        # 3. Create Volunteers
        volunteers = []
        for i in range(5):
            email = f'volunteer{i+1}@example.com'
            name = f'Volunteer {NAMES[i%len(NAMES)]}'
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': f'volunteer{i+1}',
                    'full_name': name,
                    'role': 'volunteer',
                    'is_email_verified': True
                }
            )
            if created:
                user.set_password('Test@123')
                user.save()
                Volunteer.objects.create(
                    user=user,
                    region=random.choice(CITIES),
                    specialisation=random.choice(['medical', 'education', 'general']),
                    availability_status='available',
                    created_by=admin
                )
            volunteers.append(user.volunteer_profile)
        self.stdout.write(f'  Ensured {len(volunteers)} Volunteers')

        # 4. Create Organizers
        organizers = []
        for i in range(10):
            email = f'organizer{i+1}@example.com'
            name = f'{random.choice(NAMES)} {random.choice(NAMES)}'
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': f'organizer{i+1}',
                    'full_name': name,
                    'role': 'organizer',
                    'is_email_verified': True,
                    'city': random.choice(CITIES),
                    'state': random.choice(STATES),
                    'kyc_status': 'verified'
                }
            )
            if created:
                user.set_password('Test@123')
                user.save()

            # Organizer KYC state distribution (Always ensure)
            kyc_status_options = ['approved', 'approved', 'pending', 'pending', 'under_review', 'under_review', 'rejected', 'approved', 'approved', 'pending']
            selected_kyc_status = kyc_status_options[i % len(kyc_status_options)]
            
            user.kyc_status = 'verified' if selected_kyc_status == 'approved' else ('rejected' if selected_kyc_status == 'rejected' else 'pending')
            user.save()

            # Add KYC docs for organizers
            KYCDocument.objects.update_or_create(
                user=user,
                target='organizer',
                document_type='aadhaar',
                defaults={
                    'document_number': f'{random.randint(1000, 9999)} {random.randint(1000, 9999)} {random.randint(1000, 9999)}',
                    'document_front': f'https://picsum.photos/seed/aadhaar{user.id}/800/600',
                    'status': selected_kyc_status,
                    'rejection_reason': "Aadhaar photo is blurry." if selected_kyc_status == 'rejected' else None
                }
            )
            KYCDocument.objects.update_or_create(
                user=user,
                target='organizer',
                document_type='pan',
                defaults={
                    'document_number': f'ABCDE{random.randint(1000, 9999)}F',
                    'document_front': f'https://picsum.photos/seed/pan{user.id}/800/600',
                    'status': selected_kyc_status,
                    'rejection_reason': "PAN card details don't match." if selected_kyc_status == 'rejected' else None
                }
            )
            organizers.append(user)
        self.stdout.write(f'  Ensured {len(organizers)} Organizers with KYC')

        # 5. Create Donors
        donors = []
        for i in range(15):
            email = f'donor{i+1}@example.com'
            name = f'{random.choice(NAMES)} Donor'
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': f'donor{i+1}',
                    'full_name': name,
                    'role': 'donor',
                    'is_email_verified': True
                }
            )
            if created:
                user.set_password('Test@123')
                user.save()
            donors.append(user)
        self.stdout.write(f'  Ensured {len(donors)} Donors')

        # 6. Create Campaigns
        campaigns = []
        for i in range(25):
            organizer = random.choice(organizers + ngos)
            name = NAMES[i % len(NAMES)]
            condition = CONDITIONS[i % len(CONDITIONS)]
            title = random.choice(CAMPAIGN_TITLES).format(name=name, condition=condition)
            slug = slugify(f"{title}-{uuid.uuid4().hex[:6]}")
            
            goal = random.randint(5, 50) * 10000
            # Ensure some are in review for testing the review page
            if i < 8:
                status = 'pending_review'
            elif i < 12:
                status = 'volunteer_assigned'
            else:
                status = random.choice(['approved', 'completed', 'suspended'])
            
            campaign, created = Campaign.objects.get_or_create(
                slug=slug,
                defaults={
                    'organizer': organizer,
                    'title': title,
                    'description': f"<h2>Help {name} Recover</h2><p>{name} has been diagnosed with {condition}. The medical bills are piling up and we need your support. "
                                   f"The surgery costs around {goal} INR. Every small contribution counts.</p><p>We have already reached out to friends and family, but we still have a long way to go.</p>",
                    'category': random.choice(CATEGORIES),
                    'beneficiary_name': name if random.random() > 0.3 else organizer.full_name,
                    'beneficiary_relationship': random.choice(['self', 'child', 'parent', 'friend']),
                    'goal_amount': goal,
                    'raised_amount': random.randint(1000, goal // 2) if status in ['approved', 'completed'] else 0,
                    'status': status,
                    'is_verified': status == 'approved',
                    'end_date': date.today() + timedelta(days=random.randint(30, 90))
                }
            )
            if created:
                # Add images
                CampaignImage.objects.create(campaign=campaign, image='https://images.unsplash.com/photo-1576091160550-217359f47f6a?auto=format&fit=crop&q=80&w=800', display_order=0)
                # Add documents
                CampaignDocument.objects.create(
                    campaign=campaign,
                    document_type='hospital_bill',
                    document='https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    file_name='hospital_bill.pdf'
                )
                CampaignDocument.objects.create(
                    campaign=campaign,
                    document_type='doctor_letter',
                    document='https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    file_name='diagnostic_report.pdf'
                )
            campaigns.append(campaign)
        self.stdout.write(f'  Ensured {len(campaigns)} Campaigns')

        # 7. Create Verification Assignments
        review_campaigns = [c for c in campaigns if c.status in ['pending_review', 'volunteer_assigned']]
        for i, campaign in enumerate(review_campaigns[:10]):
            volunteer = volunteers[i % len(volunteers)]
            assignment, created = VerificationAssignment.objects.get_or_create(
                campaign=campaign,
                volunteer=volunteer,
                defaults={
                    'assigned_by': admin,
                    'status': 'assigned' if i % 2 == 0 else 'in_progress',
                    'deadline': timezone.now() + timedelta(days=3)
                }
            )
            if created and i % 2 != 0:
                VerificationDocument.objects.create(
                    assignment=assignment,
                    document_type='aadhaar',
                    file='https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=800'
                )
        self.stdout.write(f'  Created {VerificationAssignment.objects.count()} Verification Assignments')

        # 8. Create Donations
        approved_campaigns = [c for c in campaigns if c.status == 'approved']
        donation_count = 0
        for campaign in approved_campaigns:
            for _ in range(random.randint(2, 8)):
                donor = random.choice(donors)
                amount = random.choice([500, 1000, 2000, 5000, 10000])
                Donation.objects.create(
                    campaign=campaign,
                    donor=donor,
                    donor_name=donor.full_name,
                    donor_email=donor.email,
                    amount=amount,
                    status='completed',
                    payment_gateway='razorpay',
                    gateway_payment_id=f'pay_{uuid.uuid4().hex[:12]}'
                )
                campaign.raised_amount = float(campaign.raised_amount) + amount
                campaign.donor_count += 1
                campaign.save()
                donation_count += 1
        self.stdout.write(f'  Created {donation_count} Donations')

        # 9. Create Bank Accounts & Withdrawals
        total_withdrawals_seeded = 0
        all_eligible_users = list(set([c.organizer for c in approved_campaigns]))
        for user in all_eligible_users:
            prefix = '91' if user.role == 'organizer' else 'NGO'
            account, _ = BankAccount.objects.get_or_create(
                user=user,
                defaults={
                    'account_holder_name': user.full_name if user.role == 'organizer' else user.ngo_profile.org_name,
                    'account_number': f'{prefix}{random.randint(10000000, 99999999)}',
                    'ifsc_code': 'SBIN0001234',
                    'account_type': 'savings' if user.role == 'organizer' else 'ngo',
                    'is_verified': True
                }
            )
            
            user_campaigns = Campaign.objects.filter(organizer=user, status='approved')
            for campaign in user_campaigns:
                if float(campaign.raised_amount) > 5000:
                    status_options = ['pending', 'approved', 'under_review', 'completed', 'transfer_initiated', 'rejected']
                    selected_status = random.choice(status_options)
                    
                    # Requirement: Approved/Completed/Initiated withdrawals must have verified KYC
                    if selected_status in ['approved', 'completed', 'transfer_initiated']:
                        user.kyc_status = 'verified'
                        user.save()
                    elif selected_status == 'rejected':
                        if random.random() > 0.5:
                            user.kyc_status = 'rejected'
                            user.save()

                    withdrawal = Withdrawal.objects.create(
                        campaign=campaign,
                        organizer=user,
                        bank_account=account,
                        amount=float(campaign.raised_amount) * random.randint(20, 40) // 100,
                        status=selected_status,
                        transfer_option='bank' if user.role == 'organizer' else 'ngo',
                        rejection_reason="Invalid bank details." if selected_status == 'rejected' else None
                    )
                    
                    # 10. Add Withdrawal Documents (Evidence)
                    WithdrawalDocument.objects.create(
                        withdrawal=withdrawal,
                        document_type='hospital_bill',
                        document='placeholder.pdf',
                        amount_covered=float(withdrawal.amount) * 0.8
                    )
                    if random.random() > 0.5:
                        WithdrawalDocument.objects.create(
                            withdrawal=withdrawal,
                            document_type='pharmacy_receipt',
                            document='placeholder.pdf',
                            amount_covered=float(withdrawal.amount) * 0.2
                        )
                    
                    total_withdrawals_seeded += 1
        self.stdout.write(f'  Created {total_withdrawals_seeded} withdrawals and documents')

        self.stdout.write(self.style.SUCCESS('SUCCESS: End-to-end sample data seeded successfully!'))
        self.stdout.write('Test Logins (Password: Test@123):')
        self.stdout.write('  Admin:     admin@clearcause.com / Admin@123')
        self.stdout.write('  Volunteer: volunteer1@example.com')
        self.stdout.write('  NGO:       ngo1@example.com')
        self.stdout.write('  Organizer: organizer1@example.com')
