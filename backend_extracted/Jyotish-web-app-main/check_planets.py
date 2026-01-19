#!/usr/bin/env python3
import requests

# Login
login_data = {"username": "demo@astroos.com", "password": "demo123"}
response = requests.post("http://localhost:3000/api/auth/login", data=login_data)
token = response.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

# Get chart
chart_response = requests.get("http://localhost:3000/api/charts/1", headers=headers)
chart = chart_response.json()

print("=== Planetary Positions for Profile 1 ===")
print("Planet   | House | Longitude")
print("---------|-------|----------")
for planet in chart.get("planets", {}).values():
    print(f"{planet['name']:8s} |  {planet['house']:2d}   | {planet['longitude']:.2f}°")
