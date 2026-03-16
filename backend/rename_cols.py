import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()
from django.db import connection

queries = [
    "ALTER TABLE core_campaignimage RENAME COLUMN image_url TO image;",
    "ALTER TABLE core_campaignupdate RENAME COLUMN image_url TO image;",
    "ALTER TABLE core_campaigndocument RENAME COLUMN document_url TO document;"
]

with connection.cursor() as cursor:
    for q in queries:
        try:
            cursor.execute(q)
            print(f"SUCCESS: {q}")
        except Exception as e:
            print(f"ERROR: {q} | {e}")
