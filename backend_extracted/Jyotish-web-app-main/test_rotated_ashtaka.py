#!/usr/bin/env python3
import requests
import json

# Login
login_data = {"username": "demo@astroos.com", "password": "demo123"}
response = requests.post("http://localhost:3000/api/auth/login", data=login_data)
token = response.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

# Get Ashtakavarga
print("Fetching Ashtakavarga data...\n")
ashtaka_response = requests.get("http://localhost:3000/api/ashtakavarga/1/summary", headers=headers)

if ashtaka_response.status_code == 200:
    data = ashtaka_response.json()
    
    print(f"Ascendant Rasi: {data['ascendant_rasi']}\n")
    
    print("=== Original (Rasi-based, 1-12) ===")
    print("Rasi | Points")
    print("-----|-------")
    for rasi, points in sorted(data['sav_by_house'].items(), key=lambda x: int(x[0])):
        print(f"  {int(rasi):2d} | {points:3d}")
    
    print("\n=== Rotated (Bhava-based, starting from Ascendant) ===")
    print("Bhava | Rasi | Points")
    print("------|------|-------")
    for bhava in range(1, 13):
        bhava_data = data['sav_by_bhava'][str(bhava)]
        print(f"  {bhava:2d}  |  {bhava_data['rasi']:2d}  | {bhava_data['points']:3d}")
    
    print("\n=== BAV Table (Bhava-based) - First 3 rows ===")
    for row in data['bav_table_by_bhava'][:3]:
        print(f"Bhava {row['bhava']} (Rasi {row['rasi']}): Sun={row['sun']}, Moon={row['moon']}, Mars={row['mars']}, Total={row['total']}")
    
else:
    print(f"Error: {ashtaka_response.status_code} - {ashtaka_response.text}")
