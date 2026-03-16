import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()
from core.models import Campaign
from core.serializers import CampaignSerializer
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

factory = APIRequestFactory()
request = factory.get('/')

# Get any campaign ID
c = Campaign.objects.first()
if not c:
    print("No campaigns found")
    exit()

print(f"Testing serialization for campaign ID: {c.id}")
try:
    serializer = CampaignSerializer(c)
    data = serializer.data
    print("SUCCESS")
    # print(data)
except Exception as e:
    import traceback
    traceback.print_exc()
