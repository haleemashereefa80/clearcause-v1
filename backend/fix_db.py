import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()
from django.db import connection

sql = "ALTER TABLE core_campaignimage ADD COLUMN campaign_id UUID REFERENCES core_campaign(id) ON DELETE CASCADE;"
try:
    with connection.cursor() as cursor:
        cursor.execute(sql)
    print("SUCCESS: Added campaign_id to core_campaignimage")
except Exception as e:
    print(f"ERROR: {e}")
