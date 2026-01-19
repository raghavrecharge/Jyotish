"""
Verify D9 (Navamsa) calculation for Saturn
Saturn D1: 264.98° (Rasi 9 = Sagittarius, which is 24.98° in the sign)
Expected Karakamsha: Rasi 8 (Scorpio) per AstroSage
"""

# Saturn details
saturn_longitude = 264.98
saturn_rasi = int(saturn_longitude / 30.0)  # Should be 8 (0-indexed), or 9 (1-indexed)
saturn_degree_in_rasi = saturn_longitude % 30.0

print("=" * 70)
print("SATURN D9 (NAVAMSA) CALCULATION VERIFICATION")
print("=" * 70)
print(f"\nSaturn D1 Longitude: {saturn_longitude}°")
print(f"Saturn D1 Rasi: {saturn_rasi} (0-indexed) = Rasi {saturn_rasi + 1} (1-indexed)")
print(f"Saturn Degree in Rasi: {saturn_degree_in_rasi:.2f}°")

# Identify sign type
fiery = [0, 4, 8]  # Aries (0), Leo (4), Sagittarius (8)
earthy = [1, 5, 9]  # Taurus (1), Virgo (5), Capricorn (9)
airy = [2, 6, 10]  # Gemini (2), Libra (6), Aquarius (10)
watery = [3, 7, 11]  # Cancer (3), Scorpio (7), Pisces (11)

if saturn_rasi in fiery:
    sign_type = "Fiery (Aries, Leo, Sagittarius)"
    navamsa_start = saturn_rasi
elif saturn_rasi in earthy:
    sign_type = "Earthy (Taurus, Virgo, Capricorn)"
    navamsa_start = 9  # Starts from Capricorn
elif saturn_rasi in airy:
    sign_type = "Airy (Gemini, Libra, Aquarius)"
    navamsa_start = 6  # Starts from Libra
else:
    sign_type = "Watery (Cancer, Scorpio, Pisces)"
    navamsa_start = 3  # Starts from Cancer

print(f"Sign Type: {sign_type}")
print(f"Navamsa starts from Rasi: {navamsa_start} (0-indexed) = {navamsa_start + 1} (1-indexed)")

# Calculate which navamsa division
division_size = 30.0 / 9  # 3.333° per navamsa
division_index = int(saturn_degree_in_rasi / division_size)

print(f"\nNavamsa Division Size: {division_size:.3f}° per pada")
print(f"Division Index (pada): {division_index} (0-indexed, range 0-8)")

# Calculate D9 rasi
d9_rasi_0indexed = (navamsa_start + division_index) % 12
d9_rasi_1indexed = d9_rasi_0indexed + 1

print(f"\nCalculation: ({navamsa_start} + {division_index}) % 12 = {d9_rasi_0indexed}")
print(f"D9 Rasi (0-indexed): {d9_rasi_0indexed}")
print(f"D9 Rasi (1-indexed): {d9_rasi_1indexed}")

# Map to sign names
sign_names = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
              "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
d9_sign_name = sign_names[d9_rasi_0indexed]

print(f"D9 Sign Name: {d9_sign_name}")

print("\n" + "=" * 70)
print("COMPARISON WITH ASTROSAGE")
print("=" * 70)
print(f"Our calculation: D9 Rasi {d9_rasi_1indexed} ({d9_sign_name})")
print(f"AstroSage shows: Karakamsha Rasi 8 (Scorpio)")

if d9_rasi_1indexed == 8:
    print("\n✓ MATCH! Our D9 calculation is correct!")
else:
    print(f"\n✗ MISMATCH! We get Rasi {d9_rasi_1indexed} but expect Rasi 8")
    print("\nDEBUGGING:")
    print(f"  - Saturn is in Sagittarius (fiery sign, rasi index {saturn_rasi})")
    print(f"  - Degree in sign: {saturn_degree_in_rasi:.2f}°")
    print(f"  - Pada: {division_index} (each pada = {division_size:.3f}°)")
    print(f"  - Formula: Fiery signs start from same sign + pada")
    print(f"  - So: Sagittarius (8) + pada ({division_index}) = {d9_rasi_0indexed}")
    print(f"\nFor Karakamsha to be Rasi 8 (Scorpio), we need D9 to be rasi 7 (0-indexed)")
    print(f"This would require pada = -1, which is impossible.")
    print(f"\nPossible explanations:")
    print(f"1. AstroSage uses different D9 formula")
    print(f"2. AstroSage has different Saturn D1 position")
    print(f"3. AstroSage uses different Atmakaraka (not Saturn)")

    if h.get('planets'):
        print(f"  House {h_num} (Rasi {h['rasi']}): {[p['planet'] for p in h['planets']]}")

print('\n=== SWAMSA ===')
print(f"Ascendant: Rasi {data['swamsa']['ascendant_rasi']}")
print("Houses:")
for h_num in range(1, 13):
    h = data['swamsa']['houses'].get(str(h_num), {})
    if h.get('planets'):
        print(f"  House {h_num} (Rasi {h['rasi']}): {[p['planet'] for p in h['planets']]}")
