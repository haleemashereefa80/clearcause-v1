import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()
from django.db import connection

tables = ['core_campaign', 'core_campaignimage', 'core_campaignupdate', 'core_campaigndocument']
cursor = connection.cursor()

for t in tables:
    cursor.execute(f"SELECT table_schema, column_name FROM information_schema.columns WHERE table_name = '{t}'")
    results = cursor.fetchall()
    print(f"{t}: {results}")
