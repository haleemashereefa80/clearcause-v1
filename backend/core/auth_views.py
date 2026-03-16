import random
import datetime
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import authenticate
from rest_framework import status, generics, permissions, views
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import UserSerializer, RegisterSerializer
from .notifications import send_email_notification # Updated reference

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        password = request.data.get('password', '')
        
        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Lockout Logic for Volunteers
        try:
            user_to_check = User.objects.get(email=email)
            if user_to_check.role == 'volunteer' and user_to_check.login_attempts >= 5:
                lockout_time = user_to_check.last_failed_login + timedelta(minutes=30)
                if timezone.now() < lockout_time:
                    wait_minutes = int((lockout_time - timezone.now()).total_seconds() / 60)
                    return Response({
                        'error': f'Account locked due to 5 failed attempts. Please try again in {max(1, wait_minutes)} minutes.'
                    }, status=status.HTTP_403_FORBIDDEN)
                else:
                    # Time has passed, reset for next attempt
                    user_to_check.login_attempts = 0
                    user_to_check.save()
        except User.DoesNotExist:
            user_to_check = None

        user = authenticate(email=email, password=password)
        # Fallback for older users or username-based login if needed, 
        # but with USERNAME_FIELD='email', email= is the standard way.
        if not user:
            user = authenticate(username=email, password=password)

        if user:
            # Success: reset attempts
            user.login_attempts = 0
            user.save()
            
            refresh = RefreshToken.for_user(user)
            # Add session timeout meta for frontend (8 hours)
            res_data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }
            if user.role == 'volunteer':
                res_data['session_timeout_ms'] = 8 * 60 * 60 * 1000
                
            return Response(res_data)
            
        # Failure: increment attempts for volunteers
        if user_to_check and user_to_check.role == 'volunteer':
            user_to_check.login_attempts += 1
            user_to_check.last_failed_login = timezone.now()
            user_to_check.save()
            
            if user_to_check.login_attempts == 5:
                # Notify Admin
                admin_users = User.objects.filter(role='admin')
                for admin in admin_users:
                    send_email_notification(
                        admin.email, 
                        "Security Alert: Volunteer Account Locked",
                        f"<p>The volunteer account <b>{user_to_check.email}</b> has been locked out after 5 failed login attempts.</p>"
                    )

        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self):
        return self.request.user
