import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()
from core.models import Campaign
from core.serializers import CampaignSerializer

c = Campaign.objects.first()
if not c:
    print("No campaigns found")
    exit()

print(f"Campaign: {c.title}")
try:
    s = CampaignSerializer(c)
    # Trigger nested serialization
    data = s.data
    print("Serialization successful")
    print("Keys in data:", data.keys())
except Exception as e:
    import traceback
    traceback.print_exc()
