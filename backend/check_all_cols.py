import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()
from django.db import connection

cursor = connection.cursor()
tables = ['core_campaignimage', 'core_campaignupdate', 'core_campaigndocument']

for t in tables:
    cursor.execute(f"SELECT * FROM {t} LIMIT 0")
    colnames = [desc[0] for desc in cursor.description]
    print(f"{t}:")
    for col in colnames:
        print(f"  - {col}")
