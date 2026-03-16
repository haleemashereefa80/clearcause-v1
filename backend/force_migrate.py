import os
import django
from django.core.management import call_command

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

try:
    print("Running makemigrations...")
    call_command('makemigrations', 'core', interactive=False)
    print("Running migrate...")
    call_command('migrate', 'core', interactive=False)
    print("Success!")
except Exception as e:
    print(f"Error: {e}")
