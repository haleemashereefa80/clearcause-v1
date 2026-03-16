import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
cursor = connection.cursor()

def check_table(table_name):
    cursor.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table_name}';")
    columns = {row[0]: row[1] for row in cursor.fetchall()}
    print(f"\nTable {table_name}:")
    for col, dtype in columns.items():
        print(f"  - {col}: {dtype}")

tables_to_check = [
    'core_user',
    'core_verificationassignment',
    'core_campaigndocument',
    'core_campaignimage',
    'core_campaignupdate'
]

for table in tables_to_check:
    check_table(table)
