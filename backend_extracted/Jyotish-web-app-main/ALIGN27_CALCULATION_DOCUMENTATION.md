# Align27 Calculation Documentation

## Cosmic Traffic Light & Daily Planning System

**Purpose:** Complete technical specification of Align27's astrology-based daily scoring, time optimization, and ritual recommendation algorithms.

---

## 1. SYSTEM OVERVIEW

### 1.1 What is Align27?

Align27 is a **daily astrological timing system** that provides:

- **Day Score (0-100)** - Overall favorability rating for any day
- **Traffic Light Color** - Visual indicator (GREEN/AMBER/RED)
- **Moments** - Optimal time windows (GOLDEN/PRODUCTIVE/SILENCE)
- **Rituals** - Personalized spiritual practices based on planetary positions

### 1.2 Input Data Required

```
User Profile:
  - Natal Moon Rasi (1-12)
  - Natal Ascendant Rasi (1-12)
  - Birth Chart Data (from D1 chart)

Target Date:
  - Any date (YYYY-MM-DD format)

Transit Data:
  - Current planetary positions for target date
  - Calculated using Swiss Ephemeris

Dasha Period:
  - Current Vimshottari Dasha running
  - Maha Dasha lord (e.g., "JUPITER")
```

---

## 2. DAY SCORE CALCULATION (0-100)

### 2.1 Base Formula

```
Day_Score = 50 (base)
  + Weekday_Lord_Score (±10)
  + Transit_Effects_Score (±25)
  + Dasha_Influence_Score (±15)
  + Moon_Phase_Score (±5)

Final = max(0, min(100, Day_Score))
```

### 2.2 Traffic Light Color Mapping

```
Score >= 65  → GREEN  (Highly favorable)
Score 40-64  → AMBER  (Mixed/moderate)
Score < 40   → RED    (Challenging/caution)
```

---

## 3. WEEKDAY LORD CALCULATION

### 3.1 Weekday to Planet Mapping

```python
Monday (0)    → MOON
Tuesday (1)   → MARS
Wednesday (2) → MERCURY
Thursday (3)  → JUPITER
Friday (4)    → VENUS
Saturday (5)  → SATURN
Sunday (6)    → SUN
```

### 3.2 Weekday Lord Score Formula

```
Base Score = 0

IF (Day_Lord == Natal_Moon_Rasi_Lord):
    Score += 5

IF (Day_Lord == Natal_Ascendant_Rasi_Lord):
    Score += 5

IF (Day_Lord in [JUPITER, VENUS, MERCURY, MOON]):  # Benefics
    Score += 2
ELIF (Day_Lord in [SUN, MARS, SATURN]):  # Malefics
    Score -= 2

Final_Weekday_Score = min(10, max(-10, Score))
```

### 3.3 Rasi Lord Mapping

```
Rasi 1  (Aries)       → MARS
Rasi 2  (Taurus)      → VENUS
Rasi 3  (Gemini)      → MERCURY
Rasi 4  (Cancer)      → MOON
Rasi 5  (Leo)         → SUN
Rasi 6  (Virgo)       → MERCURY
Rasi 7  (Libra)       → VENUS
Rasi 8  (Scorpio)     → MARS
Rasi 9  (Sagittarius) → JUPITER
Rasi 10 (Capricorn)   → SATURN
Rasi 11 (Aquarius)    → SATURN
Rasi 12 (Pisces)      → JUPITER
```

### 3.4 Example Calculation

```
Target Date: January 15, 2026 (Wednesday)
Weekday Lord: MERCURY

Natal Chart:
  Moon Rasi: 7 (Libra)    → Lord = VENUS
  Asc Rasi:  6 (Virgo)    → Lord = MERCURY

Step 1: Check if Day Lord matches chart lords
  MERCURY == VENUS? NO
  MERCURY == MERCURY? YES → +5

Step 2: Check if Day Lord is benefic
  MERCURY is in [JUPITER, VENUS, MERCURY, MOON]? YES → +2

Weekday_Lord_Score = 5 + 2 = +7
```

---

## 4. TRANSIT EFFECTS CALCULATION

### 4.1 Planetary Transit Weights

```
Planet      Weight    Importance
JUPITER     3.0       Highest (Guru - wisdom)
SATURN      2.5       Very High (slow mover)
MARS        1.5       Medium-High (energy)
VENUS       1.0       Medium (relationships)
MERCURY     0.8       Medium-Low (intellect)
SUN         0.7       Low (fast mover)
MOON        0.5       Lowest (fastest mover)
```

### 4.2 House from Moon Calculation

```
Transit_Rasi = Planet's current sign (from ephemeris)
Natal_Moon_Rasi = User's Moon sign from birth

House_From_Moon = ((Transit_Rasi - Natal_Moon_Rasi) % 12) + 1

Examples:
  Transit in Capricorn (10), Moon in Libra (7):
    House = ((10 - 7) % 12) + 1 = 3 + 1 = 4

  Transit in Aries (1), Moon in Libra (7):
    House = ((1 - 7) % 12) + 1 = (-6 % 12) + 1 = 6 + 1 = 7
```

### 4.3 Transit Effect Formula (Per Planet)

```
Benefic_Houses = [1, 2, 4, 5, 7, 9, 10, 11]
Challenging_Houses = [3, 6, 8, 12]
Neutral_House = 3

Base_Effect = 0

IF (House_From_Moon in Benefic_Houses):
    IF (Planet in [JUPITER, VENUS, MERCURY, MOON]):  # Natural benefics
        Base_Effect += 3.0
    ELSE:  # Malefics in good houses
        Base_Effect += 1.5

ELIF (House_From_Moon in Challenging_Houses):
    IF (Planet in [SUN, MARS, SATURN, RAHU, KETU]):  # Natural malefics
        Base_Effect -= 3.0
    ELSE:  # Benefics in bad houses
        Base_Effect -= 1.5

# Special cases
IF (Planet == "JUPITER" AND House_From_Moon in [2, 5, 7, 9, 11]):
    Base_Effect += 2.0  # Jupiter's special benefic houses

IF (Planet == "SATURN" AND House_From_Moon in [3, 6, 11]):
    Base_Effect += 1.5  # Saturn favorable in Upachaya houses

Weighted_Effect = Base_Effect × Planet_Weight
Total_Transit_Score = Sum of all weighted effects (max ±25)
```

### 4.4 Example Transit Calculation

```
Date: January 15, 2026
Natal Moon: Libra (7)

Current Transits (from ephemeris):
  Jupiter: Taurus (2)
  Saturn:  Aquarius (11)
  Mars:    Capricorn (10)

JUPITER TRANSIT:
  Transit Rasi: Taurus (2)
  House from Moon: ((2 - 7) % 12) + 1 = (-5 % 12) + 1 = 7 + 1 = 8
  House 8 is in Challenging_Houses [3, 6, 8, 12]
  Jupiter is benefic, so: Base_Effect = -1.5
  BUT Jupiter in House 8 is NOT in special houses [2,5,7,9,11]
  Weighted: -1.5 × 3.0 = -4.5

SATURN TRANSIT:
  Transit Rasi: Aquarius (11)
  House from Moon: ((11 - 7) % 12) + 1 = 4 + 1 = 5
  House 5 is in Benefic_Houses [1,2,4,5,7,9,10,11]
  Saturn is malefic, so: Base_Effect = +1.5
  Saturn NOT in special houses [3,6,11]
  Weighted: +1.5 × 2.5 = +3.75

MARS TRANSIT:
  Transit Rasi: Capricorn (10)
  House from Moon: ((10 - 7) % 12) + 1 = 3 + 1 = 4
  House 4 is in Benefic_Houses
  Mars is malefic, so: Base_Effect = +1.5
  Weighted: +1.5 × 1.5 = +2.25

Total_Transit_Score = -4.5 + 3.75 + 2.25 = +1.5
```

---

## 5. DASHA INFLUENCE CALCULATION

### 5.1 Dasha Lord Scoring Table

```
Dasha Lord     Score    Reason
JUPITER        +10      Strongest benefic
VENUS          +10      Strong benefic
MERCURY        +5       Mild benefic
MOON           +5       Mild benefic
SUN            +2       Neutral (ego/authority)
MARS           -5       Mild malefic (aggression)
SATURN         -5       Mild malefic (delays)
RAHU           -8       Strong malefic (obsession)
KETU           -8       Strong malefic (detachment)
```

### 5.2 Example Dasha Calculation

```
Current Dasha: Jupiter Maha Dasha
  Running from: 2020-05-10
  Ending on:    2036-05-10

Dasha_Influence_Score = +10 (Jupiter is strongest benefic)
```

---

## 6. MOON PHASE (TITHI) CALCULATION

### 6.1 Simplified Tithi Approximation

```
# Note: Simplified version, not exact astronomical tithi
Day_Of_Month = target_date.day
Approximate_Tithi = (Day_Of_Month % 30) + 1

Tithi Range:
  1-15:  Shukla Paksha (Waxing Moon)
  16-30: Krishna Paksha (Waning Moon)
```

### 6.2 Favorable vs Unfavorable Tithis

```
Favorable_Tithis = [2, 3, 5, 7, 10, 11, 13]
  - Dvitiya (2), Tritiya (3), Panchami (5)
  - Saptami (7), Dashami (10), Ekadashi (11)
  - Trayodashi (13)

Unfavorable_Tithis = [4, 8, 9, 14, 30]
  - Chaturthi (4), Ashtami (8), Navami (9)
  - Chaturdashi (14), Amavasya (30 - New Moon)

IF (Tithi in Favorable OR (Tithi + 15) % 30 in Favorable):
    Moon_Phase_Score = +3
ELIF (Tithi in Unfavorable OR (Tithi + 15) % 30 in Unfavorable):
    Moon_Phase_Score = -3
ELSE:
    Moon_Phase_Score = 0
```

### 6.3 Example Tithi Calculation

```
Date: January 15, 2026
Day_Of_Month: 15
Tithi = (15 % 30) + 1 = 16 (Krishna Paksha Pratipad)

Check Krishna Paksha equivalent: (16 - 15) = 1 (Pratipad)
Pratipad (1) not in Favorable [2,3,5,7,10,11,13]
Pratipad (1) not in Unfavorable [4,8,9,14,30]

Moon_Phase_Score = 0 (Neutral)
```

---

## 7. COMPLETE DAY SCORE EXAMPLE

### 7.1 Full Calculation for January 15, 2026

**Input Data:**

```
Date: Wednesday, January 15, 2026
Natal Moon: Libra (7)
Natal Ascendant: Virgo (6)
Current Dasha: Jupiter Maha Dasha

Transit Positions:
  Jupiter: Taurus (2)
  Saturn: Aquarius (11)
  Mars: Capricorn (10)
  Venus: Sagittarius (9)
  Mercury: Capricorn (10)
  Sun: Capricorn (10)
  Moon: Cancer (4)
```

**Step-by-Step Calculation:**

```
1. BASE SCORE
   Base = 50

2. WEEKDAY LORD SCORE
   Wednesday → MERCURY
   Moon Lord (Libra/7) = VENUS
   Asc Lord (Virgo/6) = MERCURY
   MERCURY == MERCURY? YES → +5
   MERCURY is benefic → +2
   Weekday_Score = +7

3. TRANSIT EFFECTS
   Jupiter (Taurus/2):
     House from Moon = ((2-7)%12)+1 = 8
     House 8 = Challenging, Jupiter benefic → -1.5
     Weighted: -1.5 × 3.0 = -4.5

   Saturn (Aquarius/11):
     House from Moon = ((11-7)%12)+1 = 5
     House 5 = Benefic, Saturn malefic → +1.5
     Weighted: +1.5 × 2.5 = +3.75

   Mars (Capricorn/10):
     House from Moon = ((10-7)%12)+1 = 4
     House 4 = Benefic, Mars malefic → +1.5
     Weighted: +1.5 × 1.5 = +2.25

   Venus (Sagittarius/9):
     House from Moon = ((9-7)%12)+1 = 3
     House 3 = Challenging, Venus benefic → -1.5
     Weighted: -1.5 × 1.0 = -1.5

   Mercury (Capricorn/10):
     House from Moon = 4 (same as Mars)
     House 4 = Benefic, Mercury benefic → +3.0
     Weighted: +3.0 × 0.8 = +2.4

   Sun (Capricorn/10):
     House from Moon = 4
     House 4 = Benefic, Sun malefic → +1.5
     Weighted: +1.5 × 0.7 = +1.05

   Moon (Cancer/4):
     House from Moon = ((4-7)%12)+1 = 10
     House 10 = Benefic, Moon benefic → +3.0
     Weighted: +3.0 × 0.5 = +1.5

   Total_Transit = -4.5 + 3.75 + 2.25 - 1.5 + 2.4 + 1.05 + 1.5
                 = +4.95

4. DASHA INFLUENCE
   Jupiter Dasha → +10

5. MOON PHASE
   Day 15 → Tithi 16 (Krishna Pratipad)
   Neutral → 0

6. FINAL CALCULATION
   Score = 50 + 7 + 4.95 + 10 + 0
         = 71.95
         = 72.0 (rounded)

7. TRAFFIC LIGHT COLOR
   72.0 >= 65 → GREEN (Highly favorable day)
```

**Result:**

```json
{
  "score": 72.0,
  "color": "GREEN",
  "reasons": [
    "MERCURY day favorable for your chart",
    "Saturn transit supporting your chart",
    "Jupiter dasha period favorable"
  ]
}
```

---

## 8. HORA CALCULATION (MOMENTS)

### 8.1 What are Horas?

- **Hora** = Planetary hour (1/12 of daytime, ~1 hour each)
- Each day divided into 12 horas from sunrise to sunset
- Each hora ruled by a planet in fixed sequence
- Used to identify optimal time windows

### 8.2 Hora Sequence (Weekday-Based Start)

```
Base Sequence: [SUN, MOON, MARS, MERCURY, JUPITER, VENUS, SATURN]

Starting Hora by Weekday:
  Sunday (6)    → Start with SUN (index 0)
  Monday (0)    → Start with MOON (index 1)
  Tuesday (1)   → Start with MARS (index 2)
  Wednesday (2) → Start with MERCURY (index 3)
  Thursday (3)  → Start with JUPITER (index 4)
  Friday (4)    → Start with VENUS (index 5)
  Saturday (5)  → Start with SATURN (index 6)
```

### 8.3 Hora Duration Calculation

```
Sunrise: 06:00 AM
Sunset:  18:00 PM

Day_Duration = Sunset - Sunrise = 12 hours = 43200 seconds
Hora_Duration = Day_Duration / 12 = 3600 seconds = 1 hour each

Hora_Windows:
  Hora 1:  06:00 - 07:00
  Hora 2:  07:00 - 08:00
  Hora 3:  08:00 - 09:00
  Hora 4:  09:00 - 10:00
  Hora 5:  10:00 - 11:00
  Hora 6:  11:00 - 12:00
  Hora 7:  12:00 - 13:00
  Hora 8:  13:00 - 14:00
  Hora 9:  14:00 - 15:00
  Hora 10: 15:00 - 16:00
  Hora 11: 16:00 - 17:00
  Hora 12: 17:00 - 18:00
```

### 8.4 Hora Lord Assignment

```
Wednesday Starting Index: 3 (MERCURY)

Hora_Lord[i] = HORA_SEQUENCE[(Starting_Index + i) % 7]

Hora 1:  (3 + 0) % 7 = 3 → MERCURY
Hora 2:  (3 + 1) % 7 = 4 → JUPITER
Hora 3:  (3 + 2) % 7 = 5 → VENUS
Hora 4:  (3 + 3) % 7 = 6 → SATURN
Hora 5:  (3 + 4) % 7 = 0 → SUN
Hora 6:  (3 + 5) % 7 = 1 → MOON
Hora 7:  (3 + 6) % 7 = 2 → MARS
Hora 8:  (3 + 7) % 7 = 3 → MERCURY
Hora 9:  (3 + 8) % 7 = 4 → JUPITER
Hora 10: (3 + 9) % 7 = 5 → VENUS
Hora 11: (3 + 10) % 7 = 6 → SATURN
Hora 12: (3 + 11) % 7 = 0 → SUN
```

### 8.5 Hora Scoring Formula

```
Hora_Score = 0

IF (Hora_Lord == Natal_Moon_Rasi_Lord):
    Hora_Score += 8

IF (Hora_Lord == Natal_Ascendant_Rasi_Lord):
    Hora_Score += 8

Natural Benefic/Malefic:
  IF (Hora_Lord in [JUPITER, VENUS]):
      Hora_Score += 5
  ELIF (Hora_Lord in [MERCURY, MOON]):
      Hora_Score += 3
  ELIF (Hora_Lord == SUN):
      Hora_Score += 1
  ELIF (Hora_Lord in [MARS, SATURN]):
      Hora_Score -= 2
```

### 8.6 Example Hora Calculation (Wednesday, Jan 15, 2026)

```
Natal Moon: Libra (7) → VENUS
Natal Asc: Virgo (6) → MERCURY

Hora 1 (06:00-07:00): MERCURY
  MERCURY == VENUS? NO
  MERCURY == MERCURY? YES → +8
  MERCURY is benefic → +3
  Score = 8 + 3 = 11

Hora 2 (07:00-08:00): JUPITER
  JUPITER == VENUS? NO
  JUPITER == MERCURY? NO
  JUPITER is strong benefic → +5
  Score = 5

Hora 3 (08:00-09:00): VENUS
  VENUS == VENUS? YES → +8
  VENUS == MERCURY? NO
  VENUS is strong benefic → +5
  Score = 8 + 5 = 13 ← HIGHEST (GOLDEN MOMENT)

Hora 4 (09:00-10:00): SATURN
  SATURN == VENUS? NO
  SATURN == MERCURY? NO
  SATURN is malefic → -2
  Score = -2

... continue for all 12 horas
```

### 8.7 Moment Type Assignment

```
Sort all horas by score (descending)

GOLDEN Moment:
  - Highest scored hora
  - Best time for critical activities
  - Confidence: 0.5 + (Score / 20)

PRODUCTIVE Moments:
  - 2nd and 3rd highest horas (if score > 0)
  - Good for focused work
  - Confidence: 0.4 + (Score / 25)

SILENCE Moments:
  - Lowest scored horas
  - Best for rest, meditation, introspection
  - Confidence: 0.7
```

### 8.8 Example Moment Output

```json
{
  "moments": [
    {
      "type": "GOLDEN",
      "start": "2026-01-15T08:00:00",
      "end": "2026-01-15T09:00:00",
      "reason": "VENUS hora - most auspicious for important activities",
      "confidence": 1.0,
      "planetary_basis": { "hora_lord": "VENUS" }
    },
    {
      "type": "PRODUCTIVE",
      "start": "2026-01-15T06:00:00",
      "end": "2026-01-15T07:00:00",
      "reason": "MERCURY hora - good for focused work",
      "confidence": 0.95,
      "planetary_basis": { "hora_lord": "MERCURY" }
    },
    {
      "type": "SILENCE",
      "start": "2026-01-15T09:00:00",
      "end": "2026-01-15T10:00:00",
      "reason": "SATURN hora - best for rest, meditation, introspection",
      "confidence": 0.7,
      "planetary_basis": { "hora_lord": "SATURN" }
    }
  ]
}
```

---

## 9. RITUAL RECOMMENDATIONS

### 9.1 Ritual Selection Logic

```
Rituals are selected based on:
  1. Day Lord (weekday planet)
  2. Current Dasha Lord
  3. Day Score Color (RED/AMBER/GREEN)

Priority Levels:
  Priority 1: Critical/Most important
  Priority 2: Recommended
  Priority 3: Optional
```

### 9.2 Day Lord Rituals

```
SUN (Sunday):
  - Surya Namaskar (12 rounds of Sun Salutation)
  - Duration: 20 minutes
  - Materials: Yoga mat
  - Tags: yoga, health, sun

MOON (Monday):
  - Chandra Mantra: "Om Som Somaya Namah" (108 times)
  - Duration: 15 minutes
  - Materials: Mala (prayer beads)
  - Tags: mantra, moon, peace

MARS (Tuesday):
  - Hanuman Chalisa recitation
  - Duration: 20 minutes
  - Materials: None
  - Tags: mantra, mars, strength

MERCURY (Wednesday):
  - Vishnu Sahasranama (1000 names of Vishnu)
  - Duration: 30 minutes
  - Materials: None
  - Tags: mantra, mercury, wisdom

JUPITER (Thursday):
  - Guru Vandana (honor teachers)
  - Duration: 15 minutes
  - Materials: Yellow flowers
  - Tags: guru, jupiter, wisdom

VENUS (Friday):
  - Lakshmi Puja (goddess of prosperity)
  - Duration: 20 minutes
  - Materials: Flowers, incense, lamp
  - Tags: puja, venus, prosperity

SATURN (Saturday):
  - Shani Mantra: "Om Sham Shanaishcharaya Namah" (108 times)
  - Duration: 20 minutes
  - Materials: Mala, sesame oil
  - Tags: mantra, saturn, karma
```

### 9.3 Dasha-Based Rituals

```
JUPITER/VENUS Dasha:
  - No special remedial rituals needed (benefic periods)

RAHU/KETU Dasha:
  - Durga Mantra: "Om Dum Durgayei Namah"
  - Duration: 15 minutes
  - Purpose: Shadow planet pacification

SATURN Dasha:
  - Service to Elders
  - Duration: 30 minutes
  - Purpose: Karmic debt payment

MARS Dasha:
  - Hanuman Worship (temple visit or home puja)
  - Duration: 20 minutes
```

### 9.4 Score-Based Rituals

```
RED Day (Score < 40):
  1. Hanuman Chalisa (protection)
     - 15 minutes
     - Purpose: Obstacle removal

  2. Shanti Meditation (peace meditation)
     - 15 minutes
     - Purpose: Calm planetary influences

AMBER Day (Score 40-64):
  - Standard day lord ritual only

GREEN Day (Score >= 65):
  - Gratitude Practice
    - 10 minutes
    - Materials: Journal
    - Purpose: Amplify positive energies
```

### 9.5 Example Ritual Output

```json
{
  "rituals": [
    {
      "ritual_name": "Vishnu Sahasranama",
      "description": "Recite or listen to Vishnu Sahasranama",
      "tags": ["mantra", "mercury", "wisdom"],
      "duration_minutes": 30,
      "materials_needed": [],
      "priority": 2,
      "why": "Recommended on MERCURY day for planetary harmony"
    },
    {
      "ritual_name": "Gratitude Practice",
      "description": "Express gratitude and set intentions for the auspicious day",
      "tags": ["gratitude", "intention"],
      "duration_minutes": 10,
      "materials_needed": ["journal"],
      "priority": 2,
      "why": "Amplify positive energies on favorable day"
    }
  ]
}
```

---

## 10. VALIDATION CHECKLIST

### For Astrologer Verification:

#### Day Score Components

- [ ] Weekday lords correctly assigned (Monday=Moon, etc.)
- [ ] Rasi lords correctly mapped (Aries=Mars, Taurus=Venus, etc.)
- [ ] Natural benefic/malefic classification correct
- [ ] Transit house calculation from Moon is accurate
- [ ] Benefic houses [1,2,4,5,7,9,10,11] are standard
- [ ] Challenging houses [6,8,12] are standard
- [ ] Jupiter's special houses [2,5,7,9,11] are correct
- [ ] Saturn's Upachaya houses [3,6,11] are correct
- [ ] Transit weights reflect planetary importance
- [ ] Dasha lord effects align with Vedic principles

#### Hora Calculation

- [ ] Hora sequence [SUN, MOON, MARS, MERCURY, JUPITER, VENUS, SATURN] is correct
- [ ] Weekday starting hora is correct
- [ ] 12 horas divide day from sunrise to sunset
- [ ] Hora lords cycle correctly (modulo 7)
- [ ] Hora scoring prioritizes benefics

#### Tithi/Moon Phase

- [ ] Favorable tithis [2,3,5,7,10,11,13] are standard
- [ ] Unfavorable tithis [4,8,9,14,30] are standard
- [ ] Both Shukla and Krishna paksha considered

#### Rituals

- [ ] Day lord rituals align with traditional practices
- [ ] Dasha remedies follow Vedic astrology principles
- [ ] Mantra counts (108, etc.) are correct
- [ ] Materials needed are appropriate

---

## 11. API ENDPOINTS

### 11.1 Get Day Score

```
GET /api/align27/day?profile_id={id}&date=YYYY-MM-DD

Response:
{
  "date": "2026-01-15",
  "weekday": "Wednesday",
  "score": 72.0,
  "color": "GREEN",
  "reasons": [
    "MERCURY day favorable for your chart",
    "Saturn transit supporting your chart",
    "Jupiter dasha period favorable"
  ],
  "key_transits": [
    {
      "planet": "SATURN",
      "rasi": 11,
      "effect": "benefic",
      "impact": 3.8
    }
  ],
  "dasha_overlay": {
    "lord": "JUPITER",
    "start_date": "2020-05-10",
    "end_date": "2036-05-10"
  }
}
```

### 11.2 Get Moments

```
GET /api/align27/moments?profile_id={id}&date=YYYY-MM-DD

Response:
{
  "date": "2026-01-15",
  "moments": [
    {
      "type": "GOLDEN",
      "start": "2026-01-15T08:00:00",
      "end": "2026-01-15T09:00:00",
      "reason": "VENUS hora - most auspicious",
      "confidence": 1.0
    },
    // ... more moments
  ]
}
```

### 11.3 Get Rituals

```
GET /api/align27/rituals?profile_id={id}&date=YYYY-MM-DD

Response:
{
  "date": "2026-01-15",
  "rituals": [
    {
      "ritual_name": "Vishnu Sahasranama",
      "duration_minutes": 30,
      "priority": 2,
      "why": "Recommended on MERCURY day"
    },
    // ... more rituals
  ]
}
```

---

## 12. KEY DIFFERENCES FROM WESTERN ASTROLOGY

| Aspect              | Vedic (Align27)              | Western            |
| ------------------- | ---------------------------- | ------------------ |
| **Zodiac**          | Sidereal (fixed stars)       | Tropical (seasons) |
| **Ayanamsa**        | -23.203° correction          | None               |
| **House System**    | Whole Sign from Moon         | Placidus/Equal     |
| **Timing**          | Dasha + Transit              | Transit only       |
| **Hora**            | Planetary hours from sunrise | Clock hours        |
| **Benefic/Malefic** | Fixed classification         | Aspect-based       |

---

## 13. ALGORITHM SUMMARY

```
Algorithm: Align27 Day Score

Input:
  - target_date (YYYY-MM-DD)
  - natal_moon_rasi (1-12)
  - natal_asc_rasi (1-12)
  - transiting_planets (dict of current positions)
  - current_dasha (dict with lord and dates)

Process:
  1. Initialize score = 50
  2. Calculate weekday_lord from date.weekday()
  3. Score weekday_lord compatibility with natal chart (±10)
  4. For each transiting planet:
       a. Calculate house from natal moon
       b. Determine benefic/malefic effect
       c. Apply planetary weight
       d. Add to score (±25 total)
  5. Score current dasha lord (±15)
  6. Calculate moon phase/tithi effect (±5)
  7. Clamp score to [0, 100]
  8. Map score to traffic light color:
       score >= 65: GREEN
       score >= 40: AMBER
       score < 40: RED

Output:
  - score (float, 0-100)
  - color (string: GREEN/AMBER/RED)
  - reasons (list of explanations)
  - key_transits (list of significant planetary positions)
  - dasha_overlay (current dasha period info)
```

---

**Last Updated:** January 14, 2026  
**Verification Status:** Ready for astrologer review  
**Contact:** For questions about Align27 calculations
