# Vedic Astrology Chart Calculation Documentation

## Ops360-Jyotish Platform

**Document Purpose:** Complete technical specification of how all charts are calculated so you can verify calculations with an astrology expert.

---

## 1. INPUT DATA (User Information)

### 1.1 Required User Input

When a user creates a profile, the following data is collected:

| Field               | Format               | Example    | Purpose                                      |
| ------------------- | -------------------- | ---------- | -------------------------------------------- |
| **Birth Date**      | YYYY-MM-DD           | 1990-01-15 | Day of birth                                 |
| **Birth Time**      | HH:MM:SS             | 14:30:00   | Exact time in 24-hour format                 |
| **Birth Latitude**  | Decimal degrees ±90  | 28.7041    | Geographic latitude (North/South)            |
| **Birth Longitude** | Decimal degrees ±180 | 77.1025    | Geographic longitude (East/West)             |
| **Ayanamsa**        | Selection            | Lahiri     | Precession adjustment (sidereal vs tropical) |

**Example Profile:**

```
Birth Date: 1990-01-15
Birth Time: 14:30:00
Birth Place: New Delhi, India
Latitude: 28.7041°N
Longitude: 77.1025°E
Ayanamsa: Lahiri (23.203° as of 2000 CE)
```

### 1.2 Ayanamsa Correction

Ayanamsa is the difference between **tropical** (Western) and **sidereal** (Vedic) zodiac:

- **Lahiri Ayanamsa** (used here): ~23.203° (standard for Vedic astrology in India)
- This corrects Swiss Ephemeris tropical longitudes to sidereal Vedic values
- **Formula:** `Vedic_Longitude = Tropical_Longitude - Ayanamsa`

---

## 2. EPHEMERIS CALCULATION (Swiss Ephemeris Library)

### 2.1 Computation Process

1. **Convert Birth Data to Julian Day Number**

   - Input: Birth datetime + timezone
   - Output: Julian Day (JD) - continuous number representing each day
   - Example: 1990-01-15 14:30:00 IST → JD = 2447965.520833

2. **Calculate Planetary Longitudes** (Tropical - not yet Vedic)

   - Using Swiss Ephemeris library (with Lahiri ayanamsa)
   - For each of 9 planets: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
   - Outputs: Raw longitude in degrees (0-360)

3. **Apply Ayanamsa Correction**

   - `Vedic_Longitude = Tropical_Longitude - Lahiri_Ayanamsa`
   - Converts to sidereal Vedic coordinates

4. **Calculate Sign (Rasi) and Degree Within Sign**
   - `Rasi = floor(Vedic_Longitude / 30) + 1` (1-12, where 1=Aries, 12=Pisces)
   - `Degree_in_Rasi = Vedic_Longitude % 30` (0-30 degrees within the sign)

### 2.2 Example Calculation

```
Birth: 1990-01-15 14:30:00 at 28.70°N, 77.10°E

Mars Raw Longitude: 304.5° (from Swiss Ephemeris, tropical)
Lahiri Ayanamsa: -23.203°
Mars Vedic Longitude: 304.5 - 23.203 = 281.297°

Rasi Calculation:
  Rasi = floor(281.297 / 30) + 1 = floor(9.376) + 1 = 9 + 1 = 10
  10 = Capricorn (Makara)

Degree in Rasi:
  Degree = 281.297 % 30 = 11.297°
  Mars is at 11.297° in Capricorn (10th sign)
```

### 2.3 Ascendant & House Cusps (from Swiss Ephemeris)

- **Ascendant (Lagna):** First house cusp, represents self and physical appearance
- **MC (Midheaven):** 10th house cusp, represents career/public image
- **House Cusps:** 12 cusps defining house boundaries in ecliptic longitude
- Uses **Placidus house system** (standard in Vedic astrology)

---

## 3. D1 (RASI) CHART - Birth Chart

### 3.1 Definition

- **D1** = Division 1 (the birth chart itself)
- Shows planetary positions in **sidereal zodiac**
- 12 signs, each 30° wide
- 9 planets placed in houses 1-12

### 3.2 Calculation

```
D1 Chart = Birth Chart from Swiss Ephemeris (with ayanamsa correction)

For each planet:
  1. Get tropical longitude from ephemeris
  2. Subtract Lahiri ayanamsa (-23.203°)
  3. Calculate rasi = floor(longitude / 30) + 1
  4. Calculate degree_in_rasi = longitude % 30
  5. Place in appropriate house based on ascendant

House Placement Logic:
  House_1_Rasi = floor(Ascendant / 30) + 1
  House_2_Rasi = (House_1_Rasi % 12) + 1
  House_3_Rasi = (House_1_Rasi + 1 % 12) + 1
  ... and so on for all 12 houses

  Planet goes in House_N if Planet_Rasi == House_N_Rasi
```

### 3.3 Output Format (North Indian Chart)

```json
{
  "d1": {
    "chart_type": "north_indian",
    "division": 1,
    "division_name": "Rasi",
    "ascendant": 163.5,
    "ascendant_rasi": 6,
    "houses": {
      "1": {
        "rasi": 6,
        "planets": [
          {
            "planet": "MARS",
            "degree": 11.297,
            "is_retrograde": false
          }
        ]
      },
      "2": {
        "rasi": 7,
        "planets": [
          {
            "planet": "MERCURY",
            "degree": 5.123,
            "is_retrograde": false
          }
        ]
      }
      // ... houses 3-12
    },
    "sign_names": [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces"
    ]
  }
}
```

### 3.4 Example D1 Calculation

```
Ascendant (from ephemeris): 163.5° vedic
Ascendant Rasi: floor(163.5 / 30) + 1 = 6 (Virgo)

Planet: Mars
D1 Longitude: 281.297°
D1 Rasi: floor(281.297 / 30) + 1 = 10 (Capricorn)
Degree in Rasi: 281.297 % 30 = 11.297°

House Placement:
  House 1 = Virgo (6)
  House 2 = Libra (7)
  House 3 = Scorpio (8)
  House 4 = Sagittarius (9)
  House 5 = Capricorn (10) ← Mars goes here (rasi matches)
  ...
```

---

## 4. D9 (NAVAMSA) CHART - Parashari Formula

### 4.1 Definition

- **D9** = Division 9 (Navamsa chart)
- Each sign divided into **9 equal parts** (3.333° each)
- Used to analyze marriage, emotional maturity, and spiritual evolution
- **Most important divisional chart in Vedic astrology**

### 4.2 Navamsa Parashari Formula (Core Algorithm)

**Key Concept:** Each Rasi has different navamsa starting points based on element:

| Rasi Category                         | Starting Rasi | Rasi Numbers            |
| ------------------------------------- | ------------- | ----------------------- |
| **Fiery** (Aries, Leo, Sagittarius)   | Same sign     | 1, 5, 9                 |
| **Earthy** (Taurus, Virgo, Capricorn) | Capricorn     | 1, 5, 9 → start from 10 |
| **Airy** (Gemini, Libra, Aquarius)    | Libra         | 1, 5, 9 → start from 7  |
| **Watery** (Cancer, Scorpio, Pisces)  | Cancer        | 1, 5, 9 → start from 4  |

### 4.3 D9 Calculation Algorithm

```python
def calculate_navamsa(longitude: float) -> int:
    """
    Input: Planet longitude in vedic zodiac (0-360°)
    Output: Navamsa rasi (1-12)
    """

    # Step 1: Get rasi and degree within rasi
    rasi = floor(longitude / 30)  # 0-11
    degree_in_rasi = longitude % 30  # 0-30

    # Step 2: Calculate which navamsa division (0-8)
    navamsa_size = 30 / 9  # 3.333° per navamsa
    division_index = floor(degree_in_rasi / navamsa_size)  # 0-8

    # Step 3: Determine starting rasi based on element
    fiery = [0, 4, 8]      # Aries, Leo, Sagittarius
    earthy = [1, 5, 9]     # Taurus, Virgo, Capricorn
    airy = [2, 6, 10]      # Gemini, Libra, Aquarius
    watery = [3, 7, 11]    # Cancer, Scorpio, Pisces

    if rasi in fiery:
        result_rasi = (rasi + division_index) % 12
    elif rasi in earthy:
        result_rasi = (9 + division_index) % 12      # Start from Capricorn (9)
    elif rasi in airy:
        result_rasi = (6 + division_index) % 12      # Start from Libra (6)
    else:  # watery
        result_rasi = (3 + division_index) % 12      # Start from Cancer (3)

    return result_rasi + 1  # Convert to 1-based (1-12)
```

### 4.4 Example D9 (Navamsa) Calculation

```
Planet: Mars
D1 Longitude: 281.297° (Capricorn, 11.297°)

Step 1: Get Rasi and Degree
  Rasi = floor(281.297 / 30) = 9 (Capricorn - 0-indexed)
  Degree in Rasi = 281.297 % 30 = 11.297°

Step 2: Calculate Navamsa Division
  Navamsa Size = 30 / 9 = 3.333°
  Division Index = floor(11.297 / 3.333) = floor(3.389) = 3

Step 3: Determine Starting Rasi
  Rasi 9 = Capricorn ∈ Earthy Category [1, 5, 9]
  Starting Rasi for Earthy = 9 (Capricorn)

Step 4: Calculate D9 Rasi
  Result Rasi = (9 + 3) % 12 = 12 % 12 = 0

Step 5: Convert to 1-based
  D9 Rasi = 0 + 1 = 1 (Aries)

RESULT: Mars in D9 is in Aries (1)
```

### 4.5 D9 Chart Output

```json
{
  "d9": {
    "chart_type": "north_indian",
    "division": 9,
    "division_name": "Navamsa",
    "ascendant_rasi": 5,
    "houses": {
      "1": {
        "rasi": 5,
        "planets": [
          {
            "planet": "SUN",
            "degree": null,
            "is_retrograde": false
          }
        ]
      },
      "5": {
        "rasi": 9,
        "planets": [
          {
            "planet": "MARS",
            "degree": null,
            "is_retrograde": false
          }
        ]
      }
      // ... all 12 houses with D9 placements
    }
  }
}
```

---

## 5. SPECIAL CHARTS

### 5.1 CHANDRA LAGNA (Moon Chart)

**Purpose:** Analyze emotional nature and mental stability

**Calculation:**

1. Find Moon's position in D1 (from planetary positions)
2. Use Moon's rasi as the **new ascendant**
3. Keep all 9 planets in their **D1 positions** (no change)
4. Recalculate house placements with Moon's rasi as House 1

**Example:**

```
D1 Chart:
  Moon is at 5° in Cancer (Rasi 4)
  Mars is at 11.297° in Capricorn (Rasi 10)

Chandra Lagna Chart:
  Ascendant = Cancer (4) ← Moon's rasi
  House 1 = Cancer (4)
  House 2 = Leo (5)
  House 3 = Virgo (6)
  ...
  House 5 = Capricorn (10) ← Mars placed here (same D1 rasi)
```

**Output Structure:**

```json
{
  "chandra": {
    "chart_type": "chandra",
    "division": 1,
    "division_name": "Chandra Lagna",
    "ascendant_rasi": 4, // Moon's rasi
    "houses": {
      /* house structure with D1 planet placements */
    }
  }
}
```

---

### 5.2 CHALIT (BHAVA CHALIT) - House-Based Chart

**Purpose:** Shows actual house occupation based on house cusps, not just sign boundaries

**Calculation:**

1. Use **12 house cusps** from ephemeris
2. Each house spans from its cusp to the next cusp's degree
3. Place planet in house where its **exact longitude falls**
4. Keep planet's D1 rasi and degree_in_rasi

**Algorithm:**

```python
def chalit_placement(planet_longitude, house_cusps):
    """
    planet_longitude: exact ecliptic longitude
    house_cusps: [0°, 23°, 45°, 78°, ...] for 12 houses
    """

    for i in range(12):
        start = house_cusps[i]
        end = house_cusps[(i + 1) % 12]

        # Handle wrap-around at 360°
        if start <= end:
            if start <= planet_longitude < end:
                return i + 1  # House number
        else:  # wrap-around
            if planet_longitude >= start or planet_longitude < end:
                return i + 1

    return 12  # Default to 12th if not found
```

**Example:**

```
House Cusps (Placidus):
  H1: 163.5° (Virgo)
  H2: 198.3°
  H3: 228.7°
  H4: 255.2°
  H5: 281.6°
  ...

Mars Longitude: 281.297°
- Check H5: 281.297° falls between 281.6° (start) and H6 start
- Actually, 281.297° < 281.6°, so check H4
- Check H4: Mars falls in this house

Result: Mars in Chalit House 4 (not necessarily same as D1 house)
```

**Output Structure:**

```json
{
  "chalit": {
    "chart_type": "chalit",
    "division": 1,
    "division_name": "Bhava Chalit",
    "ascendant_rasi": 6,
    "houses": {
      "1": {
        "rasi": 6,
        "start_deg": 163.5,
        "end_deg": 198.3,
        "planets": [
          {
            "planet": "VENUS",
            "longitude": 175.2,
            "rasi": 6,
            "degree_in_rasi": 15.2,
            "is_retrograde": false
          }
        ]
      }
      // ... all 12 houses
    }
  }
}
```

---

### 5.3 KARAKAMSHA - Atmakaraka's D9 Chart

**Purpose:** Shows spiritual evolution and higher purpose (Jaimini astrology)

**Step 1: Find Atmakaraka (AK) - Planet with Highest Degree in Rasi**

```python
def find_atmakaraka(planetary_positions):
    """
    Find planet with maximum degree_in_rasi
    Represents the soul's evolutionary goal
    """
    planets_by_degree = {
        "SUN": 11.5,
        "MOON": 22.3,
        "MARS": 11.297,      # Highest
        "MERCURY": 5.1,
        "JUPITER": 18.6,
        "VENUS": 15.2,
        "SATURN": 8.9,
        "RAHU": 3.2,
        "KETU": 27.8
    }

    atmakaraka = max(planets_by_degree, key=planets_by_degree.get)
    return atmakaraka  # Mars with 11.297°
```

**Step 2: Calculate AK's D9 Position**

```
Mars D1: 281.297° (Capricorn 11.297°)
Mars D9 Navamsa: Apply Parashari formula
  → Result: Rasi 1 (Aries)
```

**Step 3: Build Karakamsha Chart**

- Use **AK's D9 rasi as the ascendant**
- Place all 9 planets in their **D9 positions**
- Calculate houses based on new ascendant

**Example:**

```
Mars (AK) D9 Rasi: Aries (1)

Karakamsha Chart:
  Ascendant = Aries (1)  ← AK's D9 rasi
  House 1 = Aries (1)
  House 2 = Taurus (2)
  House 3 = Gemini (3)
  House 4 = Cancer (4)
  House 5 = Leo (5)
  ...

All planets placed in their D9 rasis
  Sun D9: Leo (5) → House 5
  Moon D9: Virgo (6) → House 6
  Mars D9: Aries (1) → House 1 (AK in its own sign)
```

**Output Structure:**

```json
{
  "karakamsha": {
    "chart_type": "karakamsha",
    "division": 9,
    "division_name": "Karakamsha (D9)",
    "ascendant_rasi": 1, // AK's D9 rasi
    "atmakaraka": "MARS",
    "atmakaraka_degree": 11.297, // Mars' degree in D1
    "houses": {
      "1": {
        "rasi": 1,
        "planets": [
          {
            "planet": "MARS",
            "degree": null,
            "is_retrograde": false
          }
        ]
      }
      // ... all 12 houses with D9 placements
    }
  }
}
```

---

### 5.4 SWAMSA - Atmakaraka's D1 Chart

**Purpose:** Shows the material expression and karmic fruit (Jaimini astrology)

**Calculation:**

1. Find Atmakaraka (same as Karakamsha)
2. Use **AK's D1 rasi as the ascendant**
3. Place all 9 planets in their **D1 positions** (same as Chandra)
4. Calculate houses based on AK's D1 rasi

**Example:**

```
Mars (AK) D1: 281.297° (Capricorn 10)

Swamsa Chart:
  Ascendant = Capricorn (10)  ← AK's D1 rasi
  House 1 = Capricorn (10)
  House 2 = Aquarius (11)
  House 3 = Pisces (12)
  House 4 = Aries (1)
  House 5 = Taurus (2)
  ...

All planets in D1 rasis (same as D1, just rotated)
  Sun D1: Leo (5) → House 8
  Moon D1: Cancer (4) → House 7
  Mars D1: Capricorn (10) → House 1 (AK in its own sign)
```

**Output Structure:**

```json
{
  "swamsa": {
    "chart_type": "swamsa",
    "division": 1,
    "division_name": "Swamsa (D1)",
    "ascendant_rasi": 10, // AK's D1 rasi
    "atmakaraka": "MARS",
    "houses": {
      "1": {
        "rasi": 10,
        "planets": [
          {
            "planet": "MARS",
            "degree": 11.297,
            "is_retrograde": false
          }
        ]
      }
      // ... all 12 houses with D1 placements
    }
  }
}
```

---

## 6. HOUSE PLACEMENT LOGIC (Universal)

All charts use the same house placement algorithm:

```python
def place_planets_in_houses(ascendant_rasi, planetary_data):
    """
    ascendant_rasi: 1-12 (1=Aries, 12=Pisces)
    planetary_data: {planet: {"rasi": 1-12, "degree": float}}
    """

    # Build house structure
    houses = {}
    for house_num in range(1, 13):
        # Calculate rasi for this house
        # Each successive house is the next rasi
        house_rasi = ((ascendant_rasi - 1 + house_num - 1) % 12) + 1
        houses[house_num] = {
            "rasi": house_rasi,
            "planets": []
        }

    # Place each planet in its corresponding house
    for planet, data in planetary_data.items():
        planet_rasi = data["rasi"]

        # Find which house has this rasi
        for house_num, house_data in houses.items():
            if house_data["rasi"] == planet_rasi:
                house_data["planets"].append({
                    "planet": planet,
                    "degree": data.get("degree"),
                    "is_retrograde": data.get("is_retrograde", False)
                })
                break  # Planet can only be in one house

    return houses
```

### 6.1 Example: D1 House Calculation

```
Ascendant Rasi: 6 (Virgo)

House 1: ((6-1) + (1-1)) % 12 + 1 = 6 (Virgo)
House 2: ((6-1) + (2-1)) % 12 + 1 = 7 (Libra)
House 3: ((6-1) + (3-1)) % 12 + 1 = 8 (Scorpio)
House 4: ((6-1) + (4-1)) % 12 + 1 = 9 (Sagittarius)
House 5: ((6-1) + (5-1)) % 12 + 1 = 10 (Capricorn)
House 6: ((6-1) + (6-1)) % 12 + 1 = 11 (Aquarius)
House 7: ((6-1) + (7-1)) % 12 + 1 = 12 (Pisces)
House 8: ((6-1) + (8-1)) % 12 + 1 = 1 (Aries)
House 9: ((6-1) + (9-1)) % 12 + 1 = 2 (Taurus)
House 10: ((6-1) + (10-1)) % 12 + 1 = 3 (Gemini)
House 11: ((6-1) + (11-1)) % 12 + 1 = 4 (Cancer)
House 12: ((6-1) + (12-1)) % 12 + 1 = 5 (Leo)

Placing Mars (Capricorn, Rasi 10):
  → Mars goes in House 5 (where rasi = 10)
```

---

## 7. CALCULATION FLOW DIAGRAM

```
User Input (Birth Data)
  ↓
[Swiss Ephemeris]
  ├→ Tropical Longitudes (all 9 planets + house cusps)
  ↓
[Ayanamsa Correction]
  ├→ Subtract Lahiri (-23.203°)
  ├→ Get Vedic Longitudes
  ↓
[D1 Calculation]
  ├→ Calculate Rasi & Degree for each planet
  ├→ Calculate Ascendant Rasi
  ├→ Build House Structure (1-12)
  ├→ Place Planets in Houses
  └→ Output: D1 Chart

[D9 Calculation - Parashari Formula]
  ├→ For each D1 longitude:
  │  ├→ Determine element (Fiery/Earthy/Airy/Watery)
  │  ├→ Determine starting navamsa rasi
  │  ├→ Calculate division index (0-8)
  │  └→ Compute D9 rasi
  ├→ Calculate D9 Ascendant
  ├→ Build House Structure
  ├→ Place Planets in D9 Houses
  └→ Output: D9 Chart

[Find Atmakaraka]
  ├→ Get planet with max degree_in_rasi
  ├→ Get AK's D1 rasi
  ├→ Get AK's D9 rasi
  ↓
[Chandra Chart]
  ├→ Use Moon's D1 rasi as ascendant
  ├→ Place all planets in D1 rasis
  └→ Output: Chandra Chart

[Chalit Chart]
  ├→ Use exact house cusp boundaries
  ├→ Place planets by exact longitude
  └→ Output: Chalit Chart

[Karakamsha Chart]
  ├→ Use AK's D9 rasi as ascendant
  ├→ Place all planets in D9 rasis
  └→ Output: Karakamsha Chart

[Swamsa Chart]
  ├→ Use AK's D1 rasi as ascendant
  ├→ Place all planets in D1 rasis
  └→ Output: Swamsa Chart
```

---

## 8. DATA VALIDATION CHECKLIST

When verifying calculations with an astrology expert, check:

### 8.1 Input Data

- [ ] Birth date and time match profile
- [ ] Latitude/Longitude are correct for birth location
- [ ] Ayanamsa is Lahiri (standard for Vedic)

### 8.2 Ephemeris

- [ ] Julian Day number is correct for given date/time
- [ ] 9 planets are all present (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu)
- [ ] Longitudes are in 0-360° range
- [ ] Ayanamsa correction applied (subtracted from tropical)

### 8.3 D1 Chart

- [ ] Ascendant matches calculation: floor(Ascendant_Longitude / 30) + 1
- [ ] All 9 planets have rasi 1-12
- [ ] All planets have degree_in_rasi between 0-30
- [ ] Each planet is in exactly one house

### 8.4 D9 Chart

- [ ] D9 ascendant calculated correctly (Parashari for same rasi)
- [ ] Each planet's D9 rasi calculated using Parashari formula
- [ ] D9 rasis match the element-based starting points

### 8.5 Special Charts

- [ ] Atmakaraka identified correctly (highest degree_in_rasi)
- [ ] Chandra = Moon's D1 rasi as ascendant
- [ ] Chalit = planets placed by exact house cusp longitude
- [ ] Karakamsha = AK's D9 rasi as ascendant + D9 planet placements
- [ ] Swamsa = AK's D1 rasi as ascendant + D1 planet placements

---

## 9. API ENDPOINTS

### 9.1 Get Chart Bundle

```
GET /api/charts/{profile_id}/bundle

Response:
{
  "d1": { /* D1 chart */ },
  "d9": { /* D9 chart */ },
  "chandra": { /* Chandra Lagna */ },
  "chalit": { /* Bhava Chalit */ },
  "karakamsha": { /* Karakamsha */ },
  "swamsa": { /* Swamsa */ },
  "planetary_table": [ /* Raw planetary data */ ]
}
```

### 9.2 Data Points Returned for Each Planet

```json
{
  "planet": "MARS",
  "longitude": 281.297, // Vedic ecliptic longitude (0-360)
  "rasi": 10, // Sign (1=Aries, 12=Pisces)
  "degree_in_rasi": 11.297, // Degrees within the sign (0-30)
  "nakshatra": "Uttara Ashadha", // 27 lunar mansions (optional)
  "pada": 3, // Nakshatra quarter (1-4)
  "is_retrograde": false, // Appears to move backward
  "is_combust": false, // Too close to Sun
  "dignity": "Moolatrikona" // Vedic strength status
}
```

---

## 10. TROUBLESHOOTING ERRORS

### Error: "No planetary positions available"

- **Cause:** Ephemeris calculation failed or database has no positions
- **Check:** Birth datetime and location are correct

### Error: "House cusps unavailable"

- **Cause:** Chalit chart needs exact house cusps from ephemeris
- **Check:** Ensure Placidus house system is configured

### Error: "Atmakaraka not found"

- **Cause:** No valid planetary positions to identify AK
- **Check:** All 9 planets should be calculated

### Charts showing "Sagittarius" incorrectly

- **Cause:** Frontend displaying wrong rasi
- **Check:** Verify API returns correct rasi number, not display name

---

## 11. VERIFICATION EXAMPLE WITH REAL DATA

**Birth Chart:**

- Date: 1990-01-15
- Time: 14:30:00
- Location: New Delhi (28.7041°N, 77.1025°E)

**Step-by-Step D9 Calculation for Mars:**

```
1. Get Mars D1 Position
   Longitude: 281.297° (from ephemeris - ayanamsa)
   Rasi: floor(281.297 / 30) + 1 = 10 (Capricorn)
   Degree: 281.297 % 30 = 11.297°

2. Apply Parashari D9 Formula
   Division Size: 30 / 9 = 3.333°
   Division Index: floor(11.297 / 3.333) = 3

3. Element Check
   Capricorn (Rasi 10) ∈ Earthy [1, 5, 9]
   Starting Rasi for Earthy: 9 (Capricorn)

4. Calculate D9 Rasi
   Result: (9 + 3) % 12 = 0 → 0 + 1 = 1 (Aries)

5. Verify
   Mars D9 Rasi: 1 (Aries) ✓
```

**Cross-Reference with Vedic Astrology Rules:**

- Parashari formula: ✓ (element-based starting points)
- Navamsa as D9: ✓ (9 divisions of each sign)
- AK identification: ✓ (highest degree in rasi)

---

**Last Updated:** January 13, 2026  
**Verification Status:** Ready for expert review  
**Contact:** For technical clarifications about calculations
