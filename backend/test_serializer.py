import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()

from core.models import Campaign
from core.serializers import CampaignSerializer

c = Campaign.objects.first()
print("Campaign:", c.title if c else "None")
print("Status:", c.status if c else "None")

try:
    s = CampaignSerializer(c)
    data = s.data
    print("SUCCESS - keys:", list(data.keys()))
except Exception as e:
    import traceback
    traceback.print_exc()
