
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.db import connection

checks = {
    'core_bankaccount': ['bank_name', 'branch_name', 'campaign_id'],
    'core_campaigndocument': ['document', 'document_url'],
    'core_campaignimage': ['image', 'image_url'],
    'core_campaignupdate': ['image', 'image_url'],
    'core_kycdocument': ['campaign_id', 'document_front'],
    'core_verificationdocument': ['file'],
    'core_withdrawaldocument': ['document', 'document_type']
}

with open('audit_results.txt', 'w') as f:
    f.write("--- AUDIT START ---\n")
    for table, columns in checks.items():
        try:
            with connection.cursor() as cursor:
                cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}'")
                existing = [row[0] for row in cursor.fetchall()]
                missing = [c for c in columns if c not in existing]
                if missing:
                    f.write(f"TABLE: {table} | MISSING: {missing}\n")
                else:
                    f.write(f"TABLE: {table} | ALL_FOUND: {columns}\n")
        except Exception as e:
            f.write(f"ERROR: {table} | {e}\n")
    f.write("--- AUDIT END ---\n")
print("Audit complete. Results in audit_results.txt")
