#!/usr/bin/env python3
"""Find what moon longitude gives Venus as starting dasha"""

from datetime import datetime, timedelta

# Vimshottari periods
VIMSHOTTARI_PERIODS = {
    "KETU": 7, "VENUS": 20, "SUN": 6, "MOON": 10, "MARS": 7,
    "RAHU": 18, "JUPITER": 16, "SATURN": 19, "MERCURY": 17
}

VIMSHOTTARI_SEQUENCE = ["KETU", "VENUS", "SUN", "MOON", "MARS", "RAHU", "JUPITER", "SATURN", "MERCURY"]

def get_starting_dasha(moon_longitude):
    """Determine starting Maha Dasha based on Moon's nakshatra"""
    nakshatra_span = 360.0 / 27.0  # 13°20'
    nakshatra_index = int(moon_longitude / nakshatra_span)
    
    # Map nakshatra to dasha lord
    dasha_lords = [
        "KETU", "VENUS", "SUN",  # Ashwini, Bharani, Krittika
        "MOON", "MARS", "RAHU",   # Rohini, Mrigashira, Ardra
        "JUPITER", "SATURN", "MERCURY",  # Punarvasu, Pushya, Ashlesha
        "KETU", "VENUS", "SUN",   # Magha, Purva Phalguni, Uttara Phalguni
        "MOON", "MARS", "RAHU",   # Hasta, Chitra, Swati
        "JUPITER", "SATURN", "MERCURY",  # Vishakha, Anuradha, Jyeshtha
        "KETU", "VENUS", "SUN",   # Mula, Purva Ashadha, Uttara Ashadha
        "MOON", "MARS", "RAHU",   # Shravana, Dhanishta, Shatabhisha
        "JUPITER", "SATURN", "MERCURY"   # Purva Bhadrapada, Uttara Bhadrapada, Revati
    ]
    
    dasha_lord = dasha_lords[nakshatra_index]
    
    # Calculate balance of dasha
    degree_in_nakshatra = moon_longitude % nakshatra_span
    balance_fraction = 1 - (degree_in_nakshatra / nakshatra_span)
    balance_years = VIMSHOTTARI_PERIODS[dasha_lord] * balance_fraction
    
    return dasha_lord, balance_years, nakshatra_index

# Venus nakshatras: Bharani (1), Purva Phalguni (10), Purva Ashadha (19)
# These are at indices: 1, 10, 19
# Nakshatra ranges:
# Bharani: 13.33° to 26.67° (index 1)
# Purva Phalguni: 133.33° to 146.67° (index 10)  
# Purva Ashadha: 253.33° to 266.67° (index 19)

print("VENUS Nakshatra ranges:")
print("Bharani: 13.33° to 26.67°")
print("Purva Phalguni: 133.33° to 146.67°")
print("Purva Ashadha: 253.33° to 266.67°")
print()

# Test Moon longitudes that give VENUS as starting dasha
test_longitudes = [20.0, 140.0, 260.0]  # Middle of each Venus nakshatra

birth_date = datetime(1990, 1, 15, 10, 30, 0)

for moon_long in test_longitudes:
    lord, balance, nak_idx = get_starting_dasha(moon_long)
    print(f"Moon longitude: {moon_long:.3f}°")
    print(f"Nakshatra index: {nak_idx}")
    print(f"Starting dasha lord: {lord}")
    print(f"Balance years: {balance:.4f}")
    
    # Calculate full sequence from birth
    current_date = birth_date
    start_idx = VIMSHOTTARI_SEQUENCE.index(lord)
    
    # First dasha (with balance)
    end_date = current_date + timedelta(days=balance * 365.25)
    print(f"  {lord}: {current_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')} ({balance:.2f} years)")
    current_date = end_date
    
    # Next 5 dashas
    for i in range(1, 6):
        idx = (start_idx + i) % 9
        next_lord = VIMSHOTTARI_SEQUENCE[idx]
        years = VIMSHOTTARI_PERIODS[next_lord]
        end_date = current_date + timedelta(days=years * 365.25)
        print(f"  {next_lord}: {current_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')} ({years} years)")
        current_date = end_date
    
    print()
