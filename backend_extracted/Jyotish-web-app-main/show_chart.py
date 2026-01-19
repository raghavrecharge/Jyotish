#!/usr/bin/env python3
import requests
import json

# Login
login_data = {"username": "demo@astroos.com", "password": "demo123"}
response = requests.post("http://localhost:3000/api/auth/login", data=login_data)
token = response.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

# Get chart
chart_response = requests.get("http://localhost:3000/api/charts/1", headers=headers)
print(json.dumps(chart_response.json(), indent=2))
