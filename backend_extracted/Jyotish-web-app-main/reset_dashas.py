#!/usr/bin/env python3
"""Reset dashas to force full recalculation with depth 5 for all Maha dashas"""
import requests

# Login
login_data = {"username": "demo@astroos.com", "password": "demo123"}
response = requests.post("http://localhost:3000/api/auth/login", data=login_data)
token = response.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

print("Deleting old dashas for profile 2...")
# We need to delete via SQL since there's no delete API endpoint
# Instead, let's just force recalculation by hitting the API

print("Requesting new dashas with depth=5...")
dashas_response = requests.get("http://localhost:3000/api/dashas/2?system=vimshottari&depth=5", headers=headers)

if dashas_response.status_code == 200:
    dashas = dashas_response.json()
    print(f"✓ Got {len(dashas.get('dashas', []))} Maha dashas")
    
    # Check each Maha dasha
    for i, maha in enumerate(dashas.get('dashas', [])[:3], 1):  # Check first 3
        lord = maha.get('lord', 'Unknown')
        num_antar = len(maha.get('children', []))
        print(f"\n{i}. {lord} Maha Dasha: {num_antar} Antar children")
        
        if num_antar > 0:
            first_antar = maha['children'][0]
            num_pratyantar = len(first_antar.get('children', []))
            print(f"   └─ First Antar ({first_antar.get('lord')}): {num_pratyantar} Pratyantar children")
            
            if num_pratyantar > 0:
                first_pratyantar = first_antar['children'][0]
                num_sookshma = len(first_pratyantar.get('children', []))
                print(f"      └─ First Pratyantar ({first_pratyantar.get('lord')}): {num_sookshma} Sookshma children")
                
                if num_sookshma > 0:
                    first_sookshma = first_pratyantar['children'][0]
                    num_prana = len(first_sookshma.get('children', []))
                    print(f"         └─ First Sookshma ({first_sookshma.get('lord')}): {num_prana} Prana children")
else:
    print(f"Error: {dashas_response.status_code} - {dashas_response.text}")
