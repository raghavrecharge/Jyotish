#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:8001"
API_URL = "http://localhost:8001/api"

# Step 1: Login to get token
login_data = {
    "username": "demo@astroos.com",
    "password": "demo123"
}

print("Logging in...")
response = requests.post(f"{API_URL}/auth/login", data=login_data)
print(f"Status: {response.status_code}")

if response.status_code != 200:
    print("Login failed. Let's setup demo first...")
    setup_response = requests.post(f"{API_URL}/demo/setup")
    print(f"Setup response: {setup_response.status_code}")
    print(setup_response.text)
    
    # Now try login again
    response = requests.post(f"{API_URL}/auth/login", data=login_data)
    print(f"Login status: {response.status_code}")

if response.status_code == 200:
    token_data = response.json()
    token = token_data.get("access_token")
    print(f"Got token: {token[:20]}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get profile list
    profiles_response = requests.get(f"{API_URL}/profiles", headers=headers)
    print(f"Profiles response status: {profiles_response.status_code}")
    profiles = profiles_response.json()
    
    if profiles and len(profiles) > 0:
        profile_id = profiles[0]["id"]
        print(f"Using profile ID: {profile_id}")
        
        # Get Ashtakavarga summary
        ashtaka_response = requests.get(f"{API_URL}/ashtakavarga/{profile_id}/summary", headers=headers)
        print(f"Ashtakavarga status: {ashtaka_response.status_code}")
        
        if ashtaka_response.status_code == 200:
            ashtaka_data = ashtaka_response.json()
            print("\n=== BAV Matrix ===")
            print("House | Sun | Moon | Mars | Mercury | Jupiter | Venus | Saturn | Total")
            print("------|-----|------|------|---------|---------|-------|--------|-------")
            
            for row in ashtaka_data.get("bav_table", []):
                house = row["house"]
                sun = row.get("sun", 0)
                moon = row.get("moon", 0)
                mars = row.get("mars", 0)
                mercury = row.get("mercury", 0)
                jupiter = row.get("jupiter", 0)
                venus = row.get("venus", 0)
                saturn = row.get("saturn", 0)
                total = row.get("total", 0)
                print(f"  {house:2d}  |  {sun} |  {moon}   |  {mars}   |   {mercury}    |    {jupiter}    |  {venus}   |  {saturn}    |  {total:3d}")
            
            print(f"\nTotal points: {ashtaka_data.get('total_points', 0)}")
            print(f"Average per house: {ashtaka_data.get('average_points', 0):.2f}")
            
            print("\n=== Reference Data ===")
            ref_data = {
                1: 31, 2: 29, 3: 39, 4: 30, 5: 19, 6: 19, 7: 31, 8: 28, 9: 27, 10: 27, 11: 28, 12: 29
            }
            print(f"Reference total: {sum(ref_data.values())}")
            
        else:
            print(f"Error: {ashtaka_response.text}")
    else:
        print("No profiles found")
else:
    print(f"Login response: {response.text}")
