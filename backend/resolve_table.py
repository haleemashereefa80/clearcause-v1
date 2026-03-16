import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()
from django.db import connection

cursor = connection.cursor()

# List all tables named core_campaignimage in any schema
cursor.execute("SELECT table_schema FROM information_schema.tables WHERE table_name = 'core_campaignimage'")
res = cursor.fetchall()
print(f"Schemas containing core_campaignimage: {res}")

for schema_row in res:
    s = schema_row[0]
    cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_schema = '{s}' AND table_name = 'core_campaignimage'")
    cols = [r[0] for r in cursor.fetchall()]
    print(f"Table {s}.core_campaignimage columns: {cols}")

# Check which table is actually selected by a naked query
cursor.execute("SELECT 'core_campaignimage'::regclass::oid")
oid = cursor.fetchone()[0]
cursor.execute(f"SELECT n.nspname as schema, c.relname as table FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.oid = {oid}")
actual = cursor.fetchone()
print(f"Naked query 'core_campaignimage' resolves to: {actual[0]}.{actual[1]}")
