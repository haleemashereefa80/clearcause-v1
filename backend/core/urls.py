from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .auth_views import RegisterView, LoginView, MeView
from .campaign_views import CampaignViewSet, CampaignImageViewSet, CampaignUpdateViewSet, CampaignDocumentViewSet, CampaignMediaViewSet
from .finance_views import DonationViewSet, WithdrawalViewSet, BankAccountViewSet, KYCViewSet, WithdrawalDocumentViewSet, KYCDocumentViewSet
from .admin_views import (
    VolunteerViewSet, VerificationAssignmentViewSet, VerificationDocumentViewSet,
    AdminDashboardView, AdminCampaignViewSet, AdminUserViewSet,
    AdminWithdrawalViewSet, AdminKYCViewSet, AuditLogViewSet, AdminNGOViewSet
)
from .dashboard_views import DashboardSummaryView

router = DefaultRouter()
router.register(r'campaigns', CampaignViewSet, basename='campaign')
router.register(r'campaign-images', CampaignImageViewSet)
router.register(r'campaign-updates', CampaignUpdateViewSet)
router.register(r'campaign-documents', CampaignDocumentViewSet)
router.register(r'campaign-media', CampaignMediaViewSet)
router.register(r'donations', DonationViewSet, basename='donation')
router.register(r'withdrawals', WithdrawalViewSet, basename='withdrawal')
router.register(r'withdrawal-documents', WithdrawalDocumentViewSet, basename='withdrawal-document')
router.register(r'bank-accounts', BankAccountViewSet, basename='bank-account')
router.register(r'kyc-documents', KYCDocumentViewSet, basename='kyc-document')
router.register(r'volunteers', VolunteerViewSet, basename='volunteer')
router.register(r'assignments', VerificationAssignmentViewSet, basename='assignment')
router.register(r'verification-documents', VerificationDocumentViewSet, basename='verification-document')

# Admin routers
router.register(r'admin/campaigns', AdminCampaignViewSet, basename='admin-campaign')
router.register(r'admin/users', AdminUserViewSet, basename='admin-user')
router.register(r'admin/withdrawals', AdminWithdrawalViewSet, basename='admin-withdrawal')
router.register(r'admin/kyc', AdminKYCViewSet, basename='admin-kyc')
router.register(r'admin/ngos', AdminNGOViewSet, basename='admin-ngo')
router.register(r'admin/audit-logs', AuditLogViewSet, basename='admin-audit-log')

urlpatterns = [
    path('', include(router.urls)),
    
    # Auth Endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/me/', MeView.as_view(), name='me'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # KYC Endpoints
    path('kyc/submit/', KYCViewSet.as_view(), name='kyc-submit'),
    path('kyc/status/', KYCViewSet.as_view(), name='kyc-status'),
    
    # Admin Dash
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    
    # Unified User Dash
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
]
