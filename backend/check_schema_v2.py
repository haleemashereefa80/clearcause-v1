import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
import django
django.setup()
from django.db import connection

cursor = connection.cursor()
tables = ['core_campaign', 'core_campaignimage', 'core_campaignupdate', 'core_campaigndocument']

output_file = r'c:\Users\Shereefa H\OneDrive - Pace Wisdom Solutions Pvt Ltd\Desktop\clearcause\backend\schema_details.txt'
with open(output_file, 'w') as f:
    for t in tables:
        f.write(f"--- TABLE: {t} ---\n")
        cursor.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{t}' AND table_schema = 'public'")
        rows = cursor.fetchall()
        for row in rows:
            f.write(f"Column: {row[0]} | Type: {row[1]}\n")
        f.write("\n")
print(f"Schema details written to {output_file}")
