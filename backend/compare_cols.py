import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()
from django.db import connection

cursor = connection.cursor()

print("--- SELECT * ---")
cursor.execute("SELECT * FROM core_campaignimage LIMIT 0")
print(f"cursor.description: {[desc[0] for desc in cursor.description]}")

print("--- information_schema ---")
cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'core_campaignimage'")
print(f"information_schema.columns: {[r[0] for r in cursor.fetchall()]}")

print("--- pg_attribute ---")
cursor.execute("""
    SELECT a.attname
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'core_campaignimage' AND n.nspname = 'public' AND a.attnum > 0 AND NOT a.attisdropped
""")
print(f"pg_attribute: {[r[0] for r in cursor.fetchall()]}")
