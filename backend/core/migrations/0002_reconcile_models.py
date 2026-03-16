# Generated manually to reconcile model changes

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        # ==========================================
        # KYCDocument: Restructure from old schema
        # ==========================================
        # Remove old fields
        migrations.RemoveField(model_name='kycdocument', name='aadhaar_number'),
        migrations.RemoveField(model_name='kycdocument', name='pan_number'),
        migrations.RemoveField(model_name='kycdocument', name='aadhaar_front_url'),
        migrations.RemoveField(model_name='kycdocument', name='aadhaar_back_url'),
        migrations.RemoveField(model_name='kycdocument', name='pan_card_url'),

        # Add new fields
        migrations.AddField(
            model_name='kycdocument',
            name='target',
            field=models.CharField(choices=[('organizer', 'Organizer'), ('beneficiary', 'Beneficiary')], default='organizer', max_length=20),
        ),
        migrations.AddField(
            model_name='kycdocument',
            name='document_type',
            field=models.CharField(choices=[
                ('aadhaar', 'Aadhaar Card'), ('pan', 'PAN Card'), ('voter_id', 'Voter ID'),
                ('passport', 'Passport'), ('driving_license', 'Driving License'),
                ('relationship_proof', 'Relationship Proof'), ('gst_cert', 'GST Certificate'),
                ('80g_cert', '80G Certificate'), ('fcra_cert', 'FCRA Certificate'),
            ], default='aadhaar', max_length=30),
        ),
        migrations.AddField(
            model_name='kycdocument',
            name='document_number',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='kycdocument',
            name='document_front',
            field=models.FileField(default='', upload_to='kyc/front/'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='kycdocument',
            name='document_back',
            field=models.FileField(blank=True, null=True, upload_to='kyc/back/'),
        ),

        # ==========================================
        # BankAccount: Add bank_proof + choices
        # ==========================================
        migrations.AddField(
            model_name='bankaccount',
            name='bank_proof',
            field=models.FileField(blank=True, null=True, upload_to='bank/proofs/'),
        ),
        migrations.AlterField(
            model_name='bankaccount',
            name='account_type',
            field=models.CharField(choices=[('savings', 'Savings'), ('current', 'Current'), ('hospital', 'Hospital'), ('ngo', 'NGO')], default='savings', max_length=20),
        ),

        # ==========================================
        # Campaign: cover_image_url -> cover_image
        # ==========================================
        migrations.RemoveField(model_name='campaign', name='cover_image_url'),
        migrations.AddField(
            model_name='campaign',
            name='cover_image',
            field=models.ImageField(blank=True, null=True, upload_to='campaigns/covers/'),
        ),

        # ==========================================
        # Withdrawal: Add transfer_option
        # ==========================================
        migrations.AddField(
            model_name='withdrawal',
            name='transfer_option',
            field=models.CharField(choices=[('bank', 'Beneficiary Bank Account'), ('hospital', 'Hospital Account'), ('ngo', 'NGO Account'), ('vendor', 'Vendor Account')], default='bank', max_length=20),
        ),

        # ==========================================
        # WithdrawalDocument: document_url -> document (FileField)
        # ==========================================
        migrations.RemoveField(model_name='withdrawaldocument', name='document_url'),
        migrations.AddField(
            model_name='withdrawaldocument',
            name='document',
            field=models.FileField(default='', upload_to='withdrawals/documents/'),
            preserve_default=False,
        ),

        # ==========================================
        # NEW: VerificationDocument
        # ==========================================
        migrations.CreateModel(
            name='VerificationDocument',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('document_type', models.CharField(choices=[('aadhaar', 'Aadhaar Card'), ('pan', 'PAN Card'), ('bank_details', 'Bank Details'), ('other', 'Other Evidence')], max_length=20)),
                ('file', models.FileField(upload_to='verifications/documents/')),
                ('is_verified', models.BooleanField(default=False)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('verified_at', models.DateTimeField(blank=True, null=True)),
                ('assignment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='core.verificationassignment')),
                ('verified_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='verified_verification_docs', to=settings.AUTH_USER_MODEL)),
            ],
        ),

        # ==========================================
        # NEW: AuditLog
        # ==========================================
        migrations.CreateModel(
            name='AuditLog',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('action', models.CharField(max_length=255)),
                ('resource_type', models.CharField(max_length=100)),
                ('resource_id', models.CharField(max_length=100)),
                ('details', models.JSONField(default=dict)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
