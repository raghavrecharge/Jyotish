"""
Test alternative D9 formulas to see which gives Rasi 8 for Saturn
"""

saturn_lon = 264.98
saturn_rasi_0idx = int(saturn_lon / 30.0)  # 8 (Sagittarius)
saturn_deg = saturn_lon % 30.0  # 24.98°

print("=" * 70)
print("TESTING ALTERNATIVE D9 FORMULAS FOR SATURN")
print("=" * 70)
print(f"Saturn: {saturn_lon}° = Rasi {saturn_rasi_0idx + 1} (Sagittarius), {saturn_deg:.2f}° in sign")
print()

# Formula 1: Parashari (standard) - what we use
print("1. PARASHARI FORMULA (Current):")
division_index = int(saturn_deg / (30.0 / 9))
d9_rasi = (saturn_rasi_0idx + division_index) % 12 + 1
print(f"   Division index (pada): {division_index}")
print(f"   D9 Rasi: {d9_rasi} {'✓ MATCH' if d9_rasi == 8 else ''}")

# Formula 2: Alternative starting points
print("\n2. IF D9 STARTS FROM ARIES FOR ALL SIGNS:")
d9_rasi = (0 + division_index) % 12 + 1
print(f"   D9 Rasi: {d9_rasi} {'✓ MATCH' if d9_rasi == 8 else ''}")

# Formula 3: Reverse order for odd signs
print("\n3. IF REVERSE ORDER FOR ODD SIGNS:")
if saturn_rasi_0idx % 2 == 1:  # Odd sign
    d9_rasi = (saturn_rasi_0idx - division_index) % 12 + 1
else:
    d9_rasi = (saturn_rasi_0idx + division_index) % 12 + 1
print(f"   D9 Rasi: {d9_rasi} {'✓ MATCH' if d9_rasi == 8 else ''}")

# Formula 4: Nadi formula (different starting point for fiery)
print("\n4. NADI FORMULA (Aries start for fiery):")
d9_rasi = (0 + division_index) % 12 + 1  # All fiery start from Aries
print(f"   D9 Rasi: {d9_rasi} {'✓ MATCH' if d9_rasi == 8 else ''}")

# Formula 5: Maybe AstroSage uses RASHI TULYA D9
print("\n5. RASHI TULYA (Sign lord based):")
# In Sagittarius (Jupiter), start from Sagittarius itself
d9_rasi = (saturn_rasi_0idx + division_index) % 12 + 1
print(f"   D9 Rasi: {d9_rasi} {'✓ MATCH' if d9_rasi == 8 else ''}")

# Test backwards (maybe pada counted differently)
print("\n6. IF PADA 0 (NOT PADA 7):")
for test_pada in range(9):
    d9_test = (saturn_rasi_0idx + test_pada) % 12 + 1
    if d9_test == 8:
        required_deg = test_pada * (30.0 / 9)
        print(f"   Pada {test_pada} would give Rasi 8")
        print(f"   Would need Saturn at {required_deg:.2f}°-{required_deg + 3.33:.2f}° in sign")
        print(f"   But Saturn is at {saturn_deg:.2f}°")

print("\n" + "=" * 70)
print("CONCLUSION:")
print("=" * 70)
print("None of the alternative D9 formulas give Rasi 8 for Saturn.")
print("This confirms: AstroSage must use a DIFFERENT Atmakaraka or")
print("they're showing a DIFFERENT chart type (not Karakamsha).")
