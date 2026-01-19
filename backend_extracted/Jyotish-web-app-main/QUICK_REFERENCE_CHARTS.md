# Quick Reference: Chart Calculation Summary

## For Non-Astrologer Verification

**Save this file to share with an Vedic astrology expert to verify our calculations are correct.**

---

## What Data We Use From User

```
Input: Birth Date (YYYY-MM-DD), Birth Time (HH:MM:SS), Birth Location (Lat/Long), Ayanamsa (Lahiri)

Example:
  Birth: January 15, 1990, 14:30:00
  Location: New Delhi (28.70°N, 77.10°E)
  System: Lahiri Ayanamsa (-23.203°)
```

---

## What Calculations We Do

### 1. D1 Chart (Birth Chart)

**Input:** Birth datetime, location  
**Process:**

1. Swiss Ephemeris calculates planet positions (tropical)
2. Subtract Lahiri ayanamsa to get vedic positions
3. Divide by 30 to get sign (rasi)
4. Modulo 30 to get degree within sign
5. Place in houses based on ascendant

**Output:** 9 planets with sign, degree, house position

**Formula:** `Vedic_Longitude = Tropical_Longitude - 23.203°`

---

### 2. D9 Chart (Navamsa)

**Input:** D1 planetary longitudes  
**Process:** Parashari formula (element-based starting points)

**Fiery Signs (Aries, Leo, Sagittarius):**

```
9-divisions start from: Same sign
Formula: Result_Rasi = (Sign + Division_Index) % 12
```

**Earthy Signs (Taurus, Virgo, Capricorn):**

```
9-divisions start from: Capricorn
Formula: Result_Rasi = (9 + Division_Index) % 12
```

**Airy Signs (Gemini, Libra, Aquarius):**

```
9-divisions start from: Libra
Formula: Result_Rasi = (6 + Division_Index) % 12
```

**Watery Signs (Cancer, Scorpio, Pisces):**

```
9-divisions start from: Cancer
Formula: Result_Rasi = (3 + Division_Index) % 12
```

**Division Index:** `floor(Degree_in_Rasi / 3.333)`

---

### 3. Chandra Lagna Chart

**Input:** Moon's sign from D1  
**Process:**

1. Find Moon's sign (rasi) in D1
2. Use Moon's sign as new ascendant (House 1)
3. Keep all planets in their D1 signs
4. Recalculate which house each planet falls in

**Output:** Moon-centered chart with D1 planet positions

---

### 4. Chalit Chart (Bhava Chalit)

**Input:** Exact house cusps from ephemeris  
**Process:**

1. Get 12 house cusp degrees (Placidus system)
2. For each planet, find which house's cusp range it falls between
3. Keep planet's exact longitude and degree_in_rasi

**Output:** House-based chart (houses might not align with sign boundaries)

---

### 5. Karakamsha Chart

**Input:** All D1 planetary positions  
**Process:**

1. Find Atmakaraka: planet with highest degree_in_rasi
2. Calculate AK's D9 sign (using Parashari formula)
3. Use AK's D9 sign as ascendant
4. Place all 9 planets in their D9 signs

**Output:** AK-centered D9 chart

---

### 6. Swamsa Chart

**Input:** All D1 planetary positions  
**Process:**

1. Find Atmakaraka: planet with highest degree_in_rasi
2. Use AK's D1 sign as ascendant
3. Place all 9 planets in their D1 signs
4. Recalculate house positions

**Output:** AK-centered D1 chart

---

## Key Formulas

| Calculation                | Formula                                         |
| -------------------------- | ----------------------------------------------- |
| **Rasi (Sign)**            | `floor(Longitude / 30) + 1`                     |
| **Degree in Rasi**         | `Longitude % 30`                                |
| **Navamsa Division Index** | `floor((Longitude % 30) / 3.333)`               |
| **House Number**           | `((Ascendant_Rasi - 1) + (House - 1)) % 12 + 1` |
| **Ayanamsa Correction**    | `Vedic = Tropical - 23.203`                     |

---

## 9 Planets Used

1. **Sun** - Self, ego, father, will
2. **Moon** - Mind, emotions, mother, public image
3. **Mars** - Energy, courage, aggression
4. **Mercury** - Intelligence, communication
5. **Jupiter** - Wisdom, prosperity, luck
6. **Venus** - Love, beauty, relationships
7. **Saturn** - Discipline, delays, karmic lessons
8. **Rahu** - Obsession, worldly desires (North Node)
9. **Ketu** - Detachment, spirituality (South Node)

---

## 12 Signs (Rasi)

| Number | Sign                | Element |
| ------ | ------------------- | ------- |
| 1      | Aries (Mesh)        | Fiery   |
| 2      | Taurus (Vrishabh)   | Earthy  |
| 3      | Gemini (Mithun)     | Airy    |
| 4      | Cancer (Kark)       | Watery  |
| 5      | Leo (Simha)         | Fiery   |
| 6      | Virgo (Kanya)       | Earthy  |
| 7      | Libra (Tula)        | Airy    |
| 8      | Scorpio (Vrishchik) | Watery  |
| 9      | Sagittarius (Dhanu) | Fiery   |
| 10     | Capricorn (Makara)  | Earthy  |
| 11     | Aquarius (Kumbh)    | Airy    |
| 12     | Pisces (Meen)       | Watery  |

---

## Verification Checklist for Astrology Expert

### D1 Chart

- [ ] All 9 planets present
- [ ] Planets have signs 1-12
- [ ] Planets have degrees 0-30 within sign
- [ ] Ascendant correctly calculated
- [ ] House placements make sense

### D9 Chart

- [ ] Each planet's D9 sign follows Parashari rules
- [ ] Fiery/Earthy/Airy/Watery elements respected
- [ ] D9 ascendant in correct sign
- [ ] All planets have valid D9 placements

### Special Charts

- [ ] Atmakaraka correctly identified (highest degree)
- [ ] Chandra = Moon's sign as lagna
- [ ] Chalit based on house cusps, not just signs
- [ ] Karakamsha = AK's D9 sign as lagna
- [ ] Swamsa = AK's D1 sign as lagna

---

## Example Calculation Breakdown

**Mars Position: 281.297° (Vedic)**

### Step 1: Get Rasi & Degree

```
Rasi = floor(281.297 / 30) + 1 = 10 (Capricorn)
Degree = 281.297 % 30 = 11.297°
```

### Step 2: D9 Navamsa

```
Division Size = 30 / 9 = 3.333°
Division Index = floor(11.297 / 3.333) = 3
Element = Capricorn is Earthy
Starting Rasi = 9 (Capricorn)
D9 Rasi = (9 + 3) % 12 = 0 → +1 = 1 (Aries)
```

### Step 3: House Placement (if Ascendant = Virgo/6)

```
House 1 = Virgo (6)
House 2 = Libra (7)
House 3 = Scorpio (8)
House 4 = Sagittarius (9)
House 5 = Capricorn (10) ← Mars D1 goes here
...
```

---

## Data Sources

- **Ephemeris:** Swiss Ephemeris Library (high-precision astronomical calculations)
- **Ayanamsa:** Lahiri (standard for Vedic astrology, -23.203° as of 2000 CE)
- **House System:** Placidus (standard for Vedic astrology)
- **Formulas:** Parashari tradition (classical Vedic astrology texts)

---

## Questions to Ask an Astrology Expert

1. Is the Lahiri ayanamsa correct for your system?
2. Are the Parashari D9 formulas correct?
3. Do the house placements follow your understanding?
4. Is the Atmakaraka identification (highest degree) correct?
5. Are the special charts (Chandra, Chalit, Karakamsha, Swamsa) calculated as per Jaimini astrology?

---

**If calculations are correct:** ✅ Your system follows standard Vedic astrology principles  
**If calculations are wrong:** ❌ Share the expert's feedback so we can fix the formulas

**Document Created:** January 13, 2026  
**For:** Technical verification of Ops360-Jyotish platform
