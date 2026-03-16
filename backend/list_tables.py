import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()
from django.db import connection

cursor = connection.cursor()

# List all tables starting with core_
cursor.execute("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename LIKE 'core_%'")
tables = [r[0] for r in cursor.fetchall()]
print(f"Tables: {tables}")

for t in tables:
    cursor.execute(f"""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = '{t}'
    """)
    cols = cursor.fetchall()
    print(f"{t}: {cols}")
