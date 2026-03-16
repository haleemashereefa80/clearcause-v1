import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()
from django.db import connection

cursor = connection.cursor()
try:
    cursor.execute('SELECT "id", "image", "display_order", "created_at", "campaign_id" FROM "core_campaignimage" LIMIT 1')
    res = cursor.fetchone()
    print("SUCCESS: Manual query worked")
    print("Result:", res)
except Exception as e:
    print(f"ERROR: {e}")
