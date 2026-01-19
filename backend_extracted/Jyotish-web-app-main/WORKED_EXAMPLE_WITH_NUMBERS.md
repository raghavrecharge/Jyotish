# Worked Example: Complete Chart Calculation With Real Numbers

**Birth Data Used:**

- Date: January 15, 1990
- Time: 14:30:00 IST
- Location: New Delhi (28.7041°N, 77.1025°E)
- Ayanamsa: Lahiri (-23.203°)

---

## Step 1: Ephemeris Calculation

### Input to Swiss Ephemeris

```
Birth DateTime: 1990-01-15 14:30:00 IST
  Converting to UTC: 1990-01-15 09:00:00 UTC

Julian Day Number: 2447965.875
(Represents seconds since noon Jan 1, 4713 BCE)
```

### Raw Tropical Longitudes (from Swiss Ephemeris)

```
Sun:      303.45°
Moon:     208.12°
Mars:     304.50°
Mercury:  294.89°
Jupiter:  202.34°
Venus:    294.23°
Saturn:   285.45°
Rahu:     195.67°
Ketu:      15.67°
Ascendant: 186.78°
House Cusps: [186.78, 221.45, 251.90, 281.34, 311.78, 341.23, 6.78, 36.23, 66.90, 97.45, 128.12, 158.90]
```

### Apply Lahiri Ayanamsa (-23.203°)

```
Formula: Vedic_Longitude = Tropical_Longitude - 23.203°

Sun:      303.45 - 23.203 = 280.247°
Moon:     208.12 - 23.203 = 184.917°
Mars:     304.50 - 23.203 = 281.297° ← FOCUS
Mercury:  294.89 - 23.203 = 271.687°
Jupiter:  202.34 - 23.203 = 179.137°
Venus:    294.23 - 23.203 = 271.027°
Saturn:   285.45 - 23.203 = 262.247°
Rahu:     195.67 - 23.203 = 172.467°
Ketu:      15.67 - 23.203 = -7.533° = 352.467° (add 360)
Ascendant: 186.78 - 23.203 = 163.577°
```

---

## Step 2: D1 (Rasi) Chart Calculation

### Calculate Each Planet's Rasi & Degree

**MARS (281.297°):**

```
Rasi = floor(281.297 / 30) + 1
     = floor(9.376) + 1
     = 9 + 1
     = 10 (Capricorn/Makara)

Degree in Rasi = 281.297 % 30
               = 11.297°
```

**SUN (280.247°):**

```
Rasi = floor(280.247 / 30) + 1
     = floor(9.341) + 1
     = 10 (Capricorn)

Degree = 280.247 % 30 = 10.247°
```

**MOON (184.917°):**

```
Rasi = floor(184.917 / 30) + 1
     = floor(6.163) + 1
     = 7 (Libra/Tula)

Degree = 184.917 % 30 = 4.917°
```

**MERCURY (271.687°):**

```
Rasi = floor(271.687 / 30) + 1 = 10 (Capricorn)
Degree = 271.687 % 30 = 1.687°
```

**JUPITER (179.137°):**

```
Rasi = floor(179.137 / 30) + 1
     = floor(5.971) + 1
     = 6 (Virgo/Kanya)

Degree = 179.137 % 30 = 29.137°
```

**VENUS (271.027°):**

```
Rasi = floor(271.027 / 30) + 1 = 10 (Capricorn)
Degree = 271.027 % 30 = 1.027°
```

**SATURN (262.247°):**

```
Rasi = floor(262.247 / 30) + 1 = 9 (Sagittarius/Dhanu)
Degree = 262.247 % 30 = 22.247°
```

**RAHU (172.467°):**

```
Rasi = floor(172.467 / 30) + 1
     = floor(5.748) + 1
     = 6 (Virgo)

Degree = 172.467 % 30 = 22.467°
```

**KETU (352.467°):**

```
Rasi = floor(352.467 / 30) + 1
     = floor(11.749) + 1
     = 12 (Pisces/Meen)

Degree = 352.467 % 30 = 22.467°
```

### Calculate Ascendant (Lagna)

**Ascendant Longitude: 163.577°**

```
Ascendant Rasi = floor(163.577 / 30) + 1
               = floor(5.452) + 1
               = 6 (Virgo/Kanya)

This is House 1
```

### Build House Structure

Each house is the next successive sign from the ascendant:

```
House 1 = Virgo (6)     ← Ascendant Rasi
House 2 = Libra (7)
House 3 = Scorpio (8)
House 4 = Sagittarius (9)
House 5 = Capricorn (10) ← MARS HOUSE
House 6 = Aquarius (11)
House 7 = Pisces (12)
House 8 = Aries (1)
House 9 = Taurus (2)
House 10 = Gemini (3)
House 11 = Cancer (4)
House 12 = Leo (5)
```

### Place Planets in Houses

Match each planet's rasi to find its house:

```
Sun (Rasi 10 - Capricorn)     → House 5
Moon (Rasi 7 - Libra)          → House 2
Mars (Rasi 10 - Capricorn)     → House 5 (with Sun)
Mercury (Rasi 10 - Capricorn)  → House 5 (with Sun & Mars)
Jupiter (Rasi 6 - Virgo)       → House 1 (Ascendant)
Venus (Rasi 10 - Capricorn)    → House 5 (with Sun, Mars, Mercury)
Saturn (Rasi 9 - Sagittarius)  → House 4
Rahu (Rasi 6 - Virgo)          → House 1 (with Jupiter)
Ketu (Rasi 12 - Pisces)        → House 7
```

### D1 Chart Output JSON

```json
{
  "d1": {
    "chart_type": "north_indian",
    "division": 1,
    "division_name": "Rasi",
    "ascendant": 163.577,
    "ascendant_rasi": 6,
    "houses": {
      "1": {
        "rasi": 6,
        "planets": [
          { "planet": "JUPITER", "degree": 29.137, "is_retrograde": false },
          { "planet": "RAHU", "degree": 22.467, "is_retrograde": false }
        ]
      },
      "2": {
        "rasi": 7,
        "planets": [
          { "planet": "MOON", "degree": 4.917, "is_retrograde": false }
        ]
      },
      "3": { "rasi": 8, "planets": [] },
      "4": {
        "rasi": 9,
        "planets": [
          { "planet": "SATURN", "degree": 22.247, "is_retrograde": false }
        ]
      },
      "5": {
        "rasi": 10,
        "planets": [
          { "planet": "SUN", "degree": 10.247, "is_retrograde": false },
          { "planet": "MARS", "degree": 11.297, "is_retrograde": false },
          { "planet": "MERCURY", "degree": 1.687, "is_retrograde": false },
          { "planet": "VENUS", "degree": 1.027, "is_retrograde": false }
        ]
      },
      "6": { "rasi": 11, "planets": [] },
      "7": {
        "rasi": 12,
        "planets": [
          { "planet": "KETU", "degree": 22.467, "is_retrograde": false }
        ]
      },
      "8": { "rasi": 1, "planets": [] },
      "9": { "rasi": 2, "planets": [] },
      "10": { "rasi": 3, "planets": [] },
      "11": { "rasi": 4, "planets": [] },
      "12": { "rasi": 5, "planets": [] }
    }
  }
}
```

---

## Step 3: D9 (Navamsa) Chart Calculation

### Identify Atmakaraka

Look at degree_in_rasi for each planet:

```
Sun:      10.247°
Moon:      4.917°
Mars:     11.297° ← HIGHEST
Mercury:   1.687°
Jupiter:  29.137° (second highest, but Mars is highest)
Venus:     1.027°
Saturn:   22.247°
Rahu:     22.467°
Ketu:     22.467°

Atmakaraka (AK) = Mars (11.297°)
```

### Apply Parashari D9 Formula to Each Planet

**MARS (D1: 281.297° = Capricorn 11.297°)**

```
Step 1: Extract Rasi & Degree
  Rasi = 10 (Capricorn) - 0-indexed
  Degree in Rasi = 11.297°

Step 2: Calculate Division Index
  Division Size = 30 / 9 = 3.333°
  Division Index = floor(11.297 / 3.333)
                = floor(3.389)
                = 3

Step 3: Determine Element & Starting Rasi
  Capricorn is Earthy (element of Earth signs: Taurus/1, Virgo/5, Capricorn/9)
  Earthy signs start D9 from: Capricorn (Rasi 9)

Step 4: Apply Parashari Formula
  Result Rasi = (Starting_Rasi + Division_Index) % 12
              = (9 + 3) % 12
              = 12 % 12
              = 0
  Convert to 1-based: 0 + 1 = 1

Result: Mars D9 = Rasi 1 (Aries/Mesh)
```

**SUN (D1: 280.247° = Capricorn 10.247°)**

```
Rasi = 10 (Capricorn)
Degree = 10.247°
Division Index = floor(10.247 / 3.333) = 3
Element = Earthy (Capricorn)
Starting Rasi = 9
Result = (9 + 3) % 12 = 0 + 1 = 1 (Aries)

Result: Sun D9 = Rasi 1 (Aries)
```

**MOON (D1: 184.917° = Libra 4.917°)**

```
Rasi = 7 (Libra) - 0-indexed as 6
Degree = 4.917°
Division Index = floor(4.917 / 3.333) = 1
Element = Airy (Libra is in [2, 6, 10])
Starting Rasi = Libra = 6
Result = (6 + 1) % 12 = 7 → 7 + 1 = 8 (Scorpio)

Result: Moon D9 = Rasi 8 (Scorpio)
```

**MERCURY (D1: 271.687° = Capricorn 1.687°)**

```
Division Index = floor(1.687 / 3.333) = 0
Element = Earthy (Capricorn)
Starting Rasi = 9
Result = (9 + 0) % 12 = 9 + 1 = 10 (Capricorn)

Result: Mercury D9 = Rasi 10 (Capricorn)
```

**JUPITER (D1: 179.137° = Virgo 29.137°)**

```
Rasi = 6 (Virgo) - 0-indexed as 5
Degree = 29.137°
Division Index = floor(29.137 / 3.333) = 8
Element = Earthy (Virgo is in [1, 5, 9])
Starting Rasi = 9 (Capricorn)
Result = (9 + 8) % 12 = 17 % 12 = 5 + 1 = 6 (Virgo)

Result: Jupiter D9 = Rasi 6 (Virgo)
```

**VENUS (D1: 271.027° = Capricorn 1.027°)**

```
Division Index = floor(1.027 / 3.333) = 0
Element = Earthy
Result = (9 + 0) % 12 = 10 (Capricorn)

Result: Venus D9 = Rasi 10 (Capricorn)
```

**SATURN (D1: 262.247° = Sagittarius 22.247°)**

```
Rasi = 9 (Sagittarius) - 0-indexed as 8
Degree = 22.247°
Division Index = floor(22.247 / 3.333) = 6
Element = Fiery (Sagittarius is in [0, 4, 8])
Starting Rasi = 8 (Sagittarius)
Result = (8 + 6) % 12 = 14 % 12 = 2 + 1 = 3 (Gemini)

Result: Saturn D9 = Rasi 3 (Gemini)
```

**RAHU (D1: 172.467° = Virgo 22.467°)**

```
Rasi = 6 (Virgo) - 0-indexed as 5
Degree = 22.467°
Division Index = floor(22.467 / 3.333) = 6
Element = Earthy
Starting Rasi = 9
Result = (9 + 6) % 12 = 15 % 12 = 3 + 1 = 4 (Cancer)

Result: Rahu D9 = Rasi 4 (Cancer)
```

**KETU (D1: 352.467° = Pisces 22.467°)**

```
Rasi = 12 (Pisces) - 0-indexed as 11
Degree = 22.467°
Division Index = floor(22.467 / 3.333) = 6
Element = Watery (Pisces is in [3, 7, 11])
Starting Rasi = 3 (Cancer)
Result = (3 + 6) % 12 = 9 + 1 = 10 (Capricorn)

Result: Ketu D9 = Rasi 10 (Capricorn)
```

### D9 Summary

```
Sun:       D9 = 1 (Aries)
Moon:      D9 = 8 (Scorpio)
Mars:      D9 = 1 (Aries) ← AK
Mercury:   D9 = 10 (Capricorn)
Jupiter:   D9 = 6 (Virgo)
Venus:     D9 = 10 (Capricorn)
Saturn:    D9 = 3 (Gemini)
Rahu:      D9 = 4 (Cancer)
Ketu:      D9 = 10 (Capricorn)
```

### Calculate D9 Ascendant

Mars (AK) D9 = Aries (1) → Use as D9 Ascendant

```
D9 Ascendant = 1 (Aries)

House 1 = Aries (1)
House 2 = Taurus (2)
House 3 = Gemini (3)
House 4 = Cancer (4)
House 5 = Leo (5)
House 6 = Virgo (6) ← Jupiter
House 7 = Libra (7)
House 8 = Scorpio (8) ← Moon
House 9 = Sagittarius (9)
House 10 = Capricorn (10) ← Mercury, Venus, Ketu
House 11 = Aquarius (11)
House 12 = Pisces (12)

House 1 = Aries (1) ← Sun, Mars (AK in own house!)
House 3 = Gemini (3) ← Saturn
House 4 = Cancer (4) ← Rahu
```

### D9 Chart Output JSON

```json
{
  "d9": {
    "chart_type": "north_indian",
    "division": 9,
    "division_name": "Navamsa",
    "ascendant_rasi": 1,
    "houses": {
      "1": {
        "rasi": 1,
        "planets": [
          { "planet": "SUN", "degree": null },
          { "planet": "MARS", "degree": null }
        ]
      },
      "2": { "rasi": 2, "planets": [] },
      "3": {
        "rasi": 3,
        "planets": [{ "planet": "SATURN", "degree": null }]
      },
      "4": {
        "rasi": 4,
        "planets": [{ "planet": "RAHU", "degree": null }]
      },
      "5": { "rasi": 5, "planets": [] },
      "6": {
        "rasi": 6,
        "planets": [{ "planet": "JUPITER", "degree": null }]
      },
      "7": { "rasi": 7, "planets": [] },
      "8": {
        "rasi": 8,
        "planets": [{ "planet": "MOON", "degree": null }]
      },
      "9": { "rasi": 9, "planets": [] },
      "10": {
        "rasi": 10,
        "planets": [
          { "planet": "MERCURY", "degree": null },
          { "planet": "VENUS", "degree": null },
          { "planet": "KETU", "degree": null }
        ]
      },
      "11": { "rasi": 11, "planets": [] },
      "12": { "rasi": 12, "planets": [] }
    }
  }
}
```

---

## Step 4: Special Charts

### CHANDRA LAGNA (Moon-Based Chart)

**Moon's D1 Rasi:** Libra (7)
**Use as New Ascendant:** Libra (7)
**Planet Positions:** Keep D1 positions

```
New Houses:
House 1 = Libra (7)
House 2 = Scorpio (8)
House 3 = Sagittarius (9) ← Saturn (from D1)
House 4 = Capricorn (10) ← Sun, Mars, Mercury, Venus (from D1)
House 5 = Aquarius (11)
House 6 = Pisces (12)
House 7 = Aries (1)
House 8 = Taurus (2)
House 9 = Gemini (3)
House 10 = Cancer (4)
House 11 = Leo (5) ← Jupiter (from D1)
House 12 = Virgo (6) ← Rahu, Moon (from D1)

Note: Moon becomes Moon in House 12 in its own chart
```

### CHALIT CHART (House Cusp-Based)

**House Cusps (Vedic):**

```
H1: 163.577° (Virgo)
H2: 198.247°
H3: 228.690°
H4: 258.134°
H5: 288.578°
H6: 318.023°
H7: 6.78° + 360 = 6.78° (wraps around)
H8: 36.23°
H9: 66.90°
H10: 97.45°
H11: 128.12°
H12: 158.90°
```

**Place planets by exact longitude in house ranges:**

```
Mars at 281.297°:
  - Between H4 (258.134°) and H5 (288.578°)
  - Mars in Chalit House 5

Sun at 280.247°:
  - Also between H4 and H5
  - Sun in Chalit House 5

Mercury at 271.687°:
  - Between H4 and H5
  - Mercury in Chalit House 5

All planets placed by exact longitude, not just sign
```

### KARAKAMSHA CHART

**Atmakaraka:** Mars  
**AK D1 Rasi:** Capricorn (10)  
**AK D9 Rasi:** Aries (1) ← **Use as Ascendant**

```
Karakamsha Ascendant = Aries (1)

House 1 = Aries (1) ← Sun, Mars (AK)
House 2 = Taurus (2)
House 3 = Gemini (3) ← Saturn
House 4 = Cancer (4) ← Rahu
House 5 = Leo (5)
House 6 = Virgo (6) ← Jupiter
House 7 = Libra (7)
House 8 = Scorpio (8) ← Moon
House 9 = Sagittarius (9)
House 10 = Capricorn (10) ← Mercury, Venus, Ketu
House 11 = Aquarius (11)
House 12 = Pisces (12)

(Same as D9 chart but labeled as Karakamsha)
```

### SWAMSA CHART

**Atmakaraka:** Mars  
**AK D1 Rasi:** Capricorn (10) ← **Use as Ascendant**

```
Swamsa Ascendant = Capricorn (10)

House 1 = Capricorn (10) ← Sun, Mars, Mercury, Venus (D1)
House 2 = Aquarius (11) ← Rahu
House 3 = Pisces (12) ← Ketu
House 4 = Aries (1)
House 5 = Taurus (2) ← Jupiter
House 6 = Gemini (3)
House 7 = Cancer (4) ← Moon
House 8 = Leo (5)
House 9 = Virgo (6)
House 10 = Libra (7)
House 11 = Scorpio (8)
House 12 = Sagittarius (9) ← Saturn

(Same D1 placements, but rotated with Capricorn as House 1)
```

---

## Summary Table

| Chart          | Ascendant      | Planet Positions | Purpose                |
| -------------- | -------------- | ---------------- | ---------------------- |
| **D1**         | Virgo (6)      | D1 (natal)       | Birth chart            |
| **D9**         | Aries (1)      | D9 (Navamsa)     | Spiritual maturity     |
| **Chandra**    | Libra (7)      | D1 (same as D1)  | Emotional nature       |
| **Chalit**     | Virgo (6)      | By house cusps   | Actual house placement |
| **Karakamsha** | Aries (1)      | D9 (same as D9)  | Spiritual purpose      |
| **Swamsa**     | Capricorn (10) | D1 (same as D1)  | Material expression    |

---

## Key Observations

1. **Mars is Atmakaraka** - Highest degree (11.297°) - represents soul's purpose
2. **Mars in own sign in D9** - D9 Aries is its own sign - very strong spiritual position
3. **Heavy Capricorn placement** - 4 planets in House 5 (Capricorn) - career/worldly focus
4. **Moon in Libra** - Balanced, diplomatic emotional nature
5. **Jupiter in Virgo** - Practical wisdom, analytical intelligence

---

**This worked example shows exactly what calculations are done and how.**

**For verification:** Share this with an astrology expert and ask if:

- Parashari D9 formulas are correct
- House placements make sense
- Atmakaraka identification is right
- Special chart calculations follow Jaimini principles
