import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()
from django.db import connection

cursor = connection.cursor()

# Find all schemas containing core_campaignimage
cursor.execute("SELECT table_schema FROM information_schema.tables WHERE table_name = 'core_campaignimage'")
schemas = [r[0] for r in cursor.fetchall()]
print(f"Schemas containing core_campaignimage: {schemas}")

for s in schemas:
    cursor.execute(f"""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = '{s}' AND table_name = 'core_campaignimage'
    """)
    cols = [r[0] for r in cursor.fetchall()]
    print(f"Schema {s}.core_campaignimage columns: {cols}")

# Check search_path
cursor.execute("SHOW search_path")
print(f"Current search_path: {cursor.fetchone()[0]}")
