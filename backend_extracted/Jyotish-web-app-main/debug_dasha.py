#!/usr/bin/env python3
"""Debug script to test Vimshottari Dasha calculations"""

from datetime import datetime

# Test data from the image:
# The image shows Moon dasha ending on 19/07/1993
# This suggests birth was approximately 10 years before if starting in Moon dasha
# Or some time before if in a different dasha

# From API response, birth appears to be: 1990-01-15 10:30:00
# Let's calculate what moon longitude would give us the dates in the image

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

# Image shows:
# Moon ends: 19/07/1993
# Mars ends: 19/07/2000 (7 years after)
# Rahu ends: 19/07/2018 (18 years after)
# Jupiter ends: 19/07/2034 (16 years after)

# This sequence (Moon, Mars, Rahu, Jupiter) matches Vimshottari sequence
# If Moon ends on 19/07/1993, and Moon period is 10 years,
# Then Moon started on 19/07/1983

# What was before Moon? Looking at sequence: KETU, VENUS, SUN, MOON...
# So before Moon is SUN (6 years)
# Sun would have ended on 19/07/1983 and started on 19/07/1977

# Before Sun is VENUS (20 years)
# Venus would have ended on 19/07/1977 and started on 19/07/1957

# If birth is 1990-01-15 10:30:00, then at birth:
# We're in Venus dasha (1957-1977)? No, that's way before birth
# We're in Sun dasha (1977-1983)? No, birth is after that
# We're in Moon dasha (1983-1993)? Yes! Birth at 1990 is during Moon dasha

# So at birth (1990-01-15), we're 6.5 years into Moon's 10-year dasha
# Balance = 10 - 6.5 = 3.5 years
# Moon should end at birth + 3.5 years = 1993.5 ≈ July 1993 ✓

# Working backwards:
# If Moon ends on 19/07/1993 and balance from birth (15/01/1990) is 3.5 years
# Then Moon started 10 years before end: 19/07/1983
# Birth to Moon end = 15/01/1990 to 19/07/1993 = ~3.51 years ✓

# Now, what moon longitude gives Moon dasha with this balance?
# Balance = 3.5 years out of 10 = 0.35 of the period
# Balance fraction = 0.35
# This means: 1 - (degree_in_nakshatra / nakshatra_span) = 0.35
# So: degree_in_nakshatra / nakshatra_span = 0.65
# degree_in_nakshatra = 0.65 * 13.333... = 8.667 degrees

# Moon dasha nakshatras are: Rohini (4th), Hasta (13th), Shravana (22nd)
# Rohini: 40° to 53.333° (index 3)
# Hasta: 160° to 173.333° (index 12)
# Shravana: 280° to 293.333° (index 21)

# Let's try Rohini (index 3): 40° + 8.667° = 48.667°
# Let's try Hasta (index 12): 160° + 8.667° = 168.667°
# Let's try Shravana (index 21): 280° + 8.667° = 288.667°

print("Testing different Moon longitudes for birth: 1990-01-15 10:30:00")
print("Expected Moon dasha ending: 1993-07-19")
print()

test_longitudes = [48.667, 168.667, 288.667]

for moon_long in test_longitudes:
    lord, balance, nak_idx = get_starting_dasha(moon_long)
    print(f"Moon longitude: {moon_long:.3f}°")
    print(f"Nakshatra index: {nak_idx}")
    print(f"Starting dasha lord: {lord}")
    print(f"Balance years: {balance:.4f}")
    
    from datetime import timedelta
    birth_date = datetime(1990, 1, 15, 10, 30, 0)
    end_date = birth_date + timedelta(days=balance * 365.25)
    print(f"Dasha end date: {end_date.strftime('%Y-%m-%d')}")
    print()
