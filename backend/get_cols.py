import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()
from django.db import connection

cursor = connection.cursor()
cursor.execute("SELECT * FROM core_campaignimage LIMIT 0")
colnames = [desc[0] for desc in cursor.description]
print(f"Columns in core_campaignimage: {colnames}")
