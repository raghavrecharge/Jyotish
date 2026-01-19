#!/usr/bin/env python3
import requests
import json

# Login
login_data = {"username": "demo@astroos.com", "password": "demo123"}
response = requests.post("http://localhost:3000/api/auth/login", data=login_data)
token = response.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

# Get all profiles
profiles_response = requests.get("http://localhost:3000/api/profiles", headers=headers)
profiles = profiles_response.json()

print("=== All Profiles ===")
for p in profiles:
    print(f"ID: {p['id']}, Name: {p['name']}, Birth: {p['birth_date']}, Place: {p['birth_place']}")
