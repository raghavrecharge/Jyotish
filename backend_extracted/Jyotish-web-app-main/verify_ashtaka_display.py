#!/usr/bin/env python3
import requests

# Login
login_data = {"username": "demo@astroos.com", "password": "demo123"}
response = requests.post("http://localhost:3000/api/auth/login", data=login_data)
token = response.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

# Get Ashtakavarga data
response = requests.get("http://localhost:3000/api/ashtakavarga/1/summary", headers=headers)
data = response.json()

print("✓ Ashtakavarga endpoint working!")
print(f"  Ascendant Rasi: {data.get('ascendant_rasi')}")
print(f"  Has sav_by_bhava: {'sav_by_bhava' in data}")
print(f"  Has sav_by_house: {'sav_by_house' in data}")
print(f"  Total points: {data.get('total_points')}")

if data.get('sav_by_bhava'):
    print("\n✓ Sample Bhava data:")
    for bhava in [1, 2, 3]:
        bhava_data = data['sav_by_bhava'].get(str(bhava), {})
        print(f"  Bhava {bhava} (Rasi {bhava_data.get('rasi')}): {bhava_data.get('points')} points")
