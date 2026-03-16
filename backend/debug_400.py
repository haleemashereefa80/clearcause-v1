
import requests
import json
import uuid

BASE_URL = 'http://localhost:8000/api/v1'

# 1. Login to get token
login_data = {
    "email": "admin@clearcause.com", # Assuming this user exists from previous seeds
    "password": "adminpassword"
}
try:
    res = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
    token = res.json()['access']
    headers = {"Authorization": f"Bearer {token}"}
    print("Logged in successfully.")
except Exception as e:
    print(f"Login failed: {e}")
    # Try another user if admin fails
    login_data = {"email": "donor@example.com", "password": "password123"}
    res = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
    token = res.json()['access']
    headers = {"Authorization": f"Bearer {token}"}
    print("Logged in as test user.")

# 2. Test Campaign Creation
campaign_data = {
    "category": "environment",
    "title": "Test Environment Campaign " + str(uuid.uuid4())[:8],
    "beneficiary_name": "Test Beneficiary",
    "beneficiary_relationship": "self",
    "goal_amount": "50000",
    "description": "Test description"
}
res = requests.post(f"{BASE_URL}/campaigns/", data=campaign_data, headers=headers)
print(f"Campaign creation status: {res.status_code}")
if res.status_code != 201:
    print(f"Error: {res.text}")
    exit()

campaign_id = res.json()['id']
print(f"Campaign ID: {campaign_id}")

# 3. Test Unknown categories
bad_campaign_data = campaign_data.copy()
bad_campaign_data["category"] = "animals" # Frontend sends 'animals', model has 'animal'
res = requests.post(f"{BASE_URL}/campaigns/", data=bad_campaign_data, headers=headers)
print(f"Category 'animals' status: {res.status_code} (Expected 400 if Choice mismatch)")
if res.status_code == 400:
    print(f"Error: {res.text}")

# 4. Test KYC Documents URL
kyc_data = {
    "campaign": campaign_id,
    "document_type": "aadhaar",
    "document_number": "123456789012"
}
# Purposefully test the frontend's wrong URL
res = requests.post(f"{BASE_URL}/kyc-documents/", data=kyc_data, headers=headers)
print(f"KYC documents status (wrong URL): {res.status_code}")

# 5. Test KYC correct URL
res = requests.post(f"{BASE_URL}/kyc/submit/", data=kyc_data, headers=headers)
print(f"KYC correct URL status: {res.status_code}")
if res.status_code != 201:
    print(f"Error: {res.text}")
