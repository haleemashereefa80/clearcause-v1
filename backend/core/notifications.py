import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from django.conf import settings

def send_email_notification(to_email, subject, content):
    """
    Sends an email using Brevo (formerly Sendinblue).
    """
    if not settings.EMAIL_HOST_PASSWORD:
        print("\n" + "="*50)
        print(f"DEVELOPMENT MODE: Email to {to_email}")
        print(f"Subject: {subject}")
        print(f"Content: {content}")
        print("="*50 + "\n")
        return True
        
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = settings.EMAIL_HOST_PASSWORD

    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
    
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": to_email}],
        reply_to={"email": settings.DEFAULT_FROM_EMAIL, "name": "ClearCause Support"},
        sender={"email": settings.DEFAULT_FROM_EMAIL, "name": "ClearCause"},
        subject=subject,
        html_content=content
    )

    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        print(f"✅ Email sent successfully to {to_email} via Brevo!")
        return True
    except ApiException as e:
        print(f"❌ ERROR: Failed to send email via Brevo.")
        print(f"Sender: {settings.DEFAULT_FROM_EMAIL}")
        print(f"Details: {e}")
        return False
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR sending email: {str(e)}")
        return False

# Notification Templates Helpers
def send_otp_email(email, otp):
    subject = "Your Login OTP"
    content = f"<h3>Your login OTP is: <b>{otp}</b></h3><p>Valid for 10 minutes.</p>"
    return send_email_notification(email, subject, content)

def send_donation_confirmation(email, amount, campaign_name):
    subject = "Thank you for your donation!"
    content = f"<p>You successfully donated Rs. {amount} to <b>{campaign_name}</b>. Thank you for your support!</p>"
    return send_email_notification(email, subject, content)

def send_campaign_status_update(email, campaign_name, status, reason=None):
    subject = f"Campaign {status.capitalize()}: {campaign_name}"
    content = f"<p>Your campaign <b>{campaign_name}</b> has been {status}.</p>"
    if reason:
        content += f"<p>Reason: {reason}</p>"
    return send_email_notification(email, subject, content)
def send_kyc_status_update(email, document_type, status, reason=None):
    subject = f"KYC Document {status.capitalize()}: {document_type}"
    content = f"<p>Your KYC document <b>{document_type}</b> has been <b>{status}</b>.</p>"
    if status == 'rejected' and reason:
        content += f"<div style='margin-top: 20px; padding: 15px; background: #FFF5F5; border-left: 4px solid #F56565;'><p><b>Reason for rejection:</b></p><p>{reason}</p></div>"
    elif status == 'approved':
        content += "<p>Your document has been verified successfully. Thank you for your patience!</p>"
    elif status == 'under_review':
        content += "<p>Our team is currently reviewing your documents. We will notify you once a decision is made.</p>"
    
    return send_email_notification(email, subject, content)
