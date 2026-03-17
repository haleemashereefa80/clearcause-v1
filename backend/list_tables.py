import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()
from django.db import connection

cursor = connection.cursor()

def check_table(t):
    try:
        cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '{t}'")
        cols = [r[0] for r in cursor.fetchall()]
        print(f"Table: {t}")
        for c in sorted(cols):
            print(f"  - {c}")
    except Exception as e:
        print(f"Table: {t} - Error {e}")

check_table('core_campaigndocument')
check_table('core_campaignimage')
check_table('core_campaignupdate')
check_table('core_donation')
