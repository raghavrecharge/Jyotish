# Ashtakavarga Implementation Guide

## Data Flow, Issues & Fixes

---

## 1. WHAT IS ASHTAKAVARGA?

### Definition

**Ashtakavarga** = "Strength of 8" (Ashta = 8, Varga = Division)

A system that assigns **0-8 points** to each house based on:

- Planetary placements
- Benefic house positions
- Contribution from all 7 planets (excluding Rahu/Ketu)

### Two Types

1. **Bhinnashtakavarga (BAV)** - Individual planet strength in each house
2. **Sarvashtakavarga (SAV)** - Combined strength of all planets across 12 houses

---

## 2. DATA FLOW ARCHITECTURE

### Backend → Frontend Flow

```
User Creates Profile
    ↓
Backend: /api/ashtakavarga/{profile_id}/summary
    ├→ Calculate all planetary positions
    ├→ Apply BAV rules for each planet
    ├→ Sum BAV to get SAV (12 values, 0-56 max)
    ├→ Identify strong/weak houses
    └→ Return JSON
         {
           "summary": {
             "total_points": 337,
             "average": 28.08,
             "max_rasi": 5,
             "min_rasi": 12
           },
           "strong_houses": [1,2,3,4,5,7],
           "weak_houses": [6,8,9,10,11,12],
           "sav_by_house": {
             "1": 35,
             "2": 32,
             "3": 28,
             ...
           },
           "interpretation": {...}
         }

         ALSO /api/ashtakavarga/{profile_id}/bav
         {
           "bav": {
             "SUN": [2,3,1,4,2,1,0,2,3,4,2,1],
             "MOON": [3,2,2,3,1,0,2,3,4,3,2,1],
             ...
           },
           "planet_totals": {
             "SUN": 25,
             "MOON": 26,
             ...
           }
         }

Frontend: astrologyApi.getAshtakavarga(profileId)
    ├→ Calls /api/ashtakavarga/{profile_id}/summary
    ├→ Returns response data
    └→ Processes into UI format

App.tsx: loadProfileData()
    ├→ Call astrologyApi.getAshtakavarga(profileId)
    ├→ Set avData state
    └→ Display in AshtakavargaChart component
```

---

## 3. CURRENT ISSUES IN FRONTEND

### Issue #1: Hardcoded Values

**Location:** `App.tsx` lines 212-231

```tsx
setAvData({
  bav: av.bav || {},
  sav: av.sav || [],
  totalPoints: 337, // ❌ HARDCODED
  planetTotals: {}, // ❌ HARDCODED EMPTY
  summary: {
    strongestHouse: 1, // ❌ HARDCODED
    weakestHouse: 6, // ❌ HARDCODED
    averagePoints: 28, // ❌ HARDCODED
    houseInterpretations: [], // ❌ EMPTY
    houseSignifications: [], // ❌ EMPTY
  },
  isValid: true,
});
```

**Problem:** Even if API returns correct data, frontend ignores it and uses hardcoded values.

### Issue #2: Missing Data Calculation

The frontend doesn't calculate:

- Total SAV points from `sav` array
- Planet totals from `bav` data
- Average points per house
- House interpretations based on SAV values

### Issue #3: API Response Mismatch

Frontend expects:

```ts
{ bav: ..., sav: ... }
```

Backend returns (from `/api/ashtakavarga/{profile_id}/summary`):

```ts
{
  summary: { total_points, average, max_rasi, min_rasi },
  strong_houses: [...],
  weak_houses: [...],
  sav_by_house: { "1": 35, "2": 32, ... },
  interpretation: { ... }
}
```

Also need to fetch `/api/ashtakavarga/{profile_id}/bav` separately to get BAV data.

---

## 4. HOW TO FIX

### Step 1: Update Frontend API Service

**File:** `frontend/src/services/astrologyApi.ts`

Replace the current `getAshtakavarga` function:

```typescript
// OLD (line 466-469)
async getAshtakavarga(
  profileId: number
): Promise<{ bav: Record<string, number[]>; sav: number[] }> {
  const response = await api.get(`/api/ashtakavarga/${profileId}/summary`);
  return response.data;
},

// NEW - Fetch both BAV and Summary
async getAshtakavarga(profileId: number): Promise<{
  bav: Record<string, number[]>;
  sav: number[];
  summary: any;
  strongHouses: number[];
  weakHouses: number[];
  interpretation: any;
}> {
  try {
    // Fetch BAV data
    const bavResponse = await api.get(`/api/ashtakavarga/${profileId}/bav`);
    const bavData = bavResponse.data;

    // Fetch Summary data
    const summaryResponse = await api.get(`/api/ashtakavarga/${profileId}/summary`);
    const summaryData = summaryResponse.data;

    return {
      bav: bavData.bav || {},
      sav: summaryData.sav_by_house ?
           Object.values(summaryData.sav_by_house).map(v => v as number) : [],
      summary: summaryData.summary || {},
      strongHouses: summaryData.strong_houses || [],
      weakHouses: summaryData.weak_houses || [],
      interpretation: summaryData.interpretation || {}
    };
  } catch (error) {
    console.error("Failed to fetch Ashtakavarga:", error);
    throw error;
  }
},
```

### Step 2: Update App.tsx Data Processing

**File:** `frontend/src/App.tsx` lines 212-231

Replace with:

```tsx
// Load ashtakavarga
try {
  const av = await astrologyApi.getAshtakavarga(profileId);

  // Calculate planet totals from BAV
  const planetTotals: Record<string, number> = {};
  Object.entries(av.bav).forEach(([planet, values]) => {
    planetTotals[planet] = (values as number[]).reduce((sum, v) => sum + v, 0);
  });

  // Calculate total SAV points
  const totalPoints = av.sav.reduce((sum: number, v: number) => sum + v, 0);

  // Generate house interpretations
  const houseInterpretations = av.sav.map(
    (points: number, houseIndex: number) => {
      const house = houseIndex + 1;
      const avgPoints = Math.round(totalPoints / 12);
      if (points >= avgPoints + 8)
        return `House ${house}: Very Strong (${points} pts)`;
      if (points >= avgPoints) return `House ${house}: Strong (${points} pts)`;
      if (points >= avgPoints - 8)
        return `House ${house}: Moderate (${points} pts)`;
      return `House ${house}: Weak (${points} pts)`;
    }
  );

  setAvData({
    bav: av.bav || {},
    sav: av.sav || [],
    totalPoints: totalPoints,
    planetTotals: planetTotals,
    summary: {
      strongestHouse: av.summary.max_rasi || 1,
      weakestHouse: av.summary.min_rasi || 6,
      averagePoints: Math.round(totalPoints / 12),
      houseInterpretations: houseInterpretations,
      houseSignifications: av.strongHouses.map((h) => `House ${h}: Strong`),
    },
    isValid: true,
  });
} catch (e) {
  console.error("Ashtakavarga data error:", e);
  setAvData(null);
}
```

### Step 3: Verify Backend API Endpoints

**File:** `backend/app/api/ashtakavarga.py`

Ensure these endpoints exist and return correct data:

✅ GET `/api/ashtakavarga/{profile_id}/bav`

```json
{
  "bav": {
    "SUN": [2,3,1,4,2,1,0,2,3,4,2,1],
    "MOON": [3,2,2,3,1,0,2,3,4,3,2,1],
    ...
  },
  "planet_totals": { "SUN": 25, "MOON": 26, ... }
}
```

✅ GET `/api/ashtakavarga/{profile_id}/summary`

```json
{
  "summary": {
    "total_points": 337,
    "average": 28.08,
    "max_rasi": 5,
    "min_rasi": 12
  },
  "strong_houses": [1,2,3,4,5,7],
  "weak_houses": [6,8,9,10,11,12],
  "sav_by_house": { "1": 35, "2": 32, ... },
  "interpretation": { ... }
}
```

---

## 5. ASHTAKAVARGA CALCULATION RULES

### BAV Contribution Rules by Planet

**For SUN's BAV Chart:**

- SUN contributes to houses: 1, 2, 4, 7, 8, 9, 10, 11 (from any planet position)
- MOON contributes to houses: 3, 6, 10, 11
- MARS contributes to houses: 1, 2, 4, 7, 8, 9, 10, 11
- ... and so on for each planet

### SAV Calculation

```
For each House (1-12):
  SAV_House = SUM of BAV values for that house from all planets

Example House 1:
  SAV_1 = BAV_SUN[1] + BAV_MOON[1] + BAV_MARS[1] + ... + BAV_SATURN[1]
        = 2 + 3 + 2 + 1 + 4 + 3 + 2
        = 17 points (out of 56 max)
```

### Strength Interpretation

```
Total SAV Points Range:
  300+: Excellent strength
  250-299: Good strength
  200-249: Moderate strength
  Below 200: Weak strength

Per House Range:
  40+: Very Strong house
  30-39: Strong house
  20-29: Moderate house
  Below 20: Weak house
```

---

## 6. DEBUGGING CHECKLIST

### Check Backend:

```bash
# Test API directly
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:8001/api/ashtakavarga/PROFILE_ID/summary"

# Response should show:
- summary.total_points (should be 200-400)
- sav_by_house (12 entries)
- strong_houses (array of house numbers)
- weak_houses (array of house numbers)
```

### Check Frontend:

```typescript
// In App.tsx, add logging
console.log("Raw Ashtakavarga Response:", av);
console.log("Calculated Total Points:", totalPoints);
console.log("Planet Totals:", planetTotals);
console.log("Final avData:", avData);
```

### Check Rendering:

```tsx
// In AshtakavargaChart component
if (!avData) {
  return <div>No Ashtakavarga data</div>;
}
if (!avData.sav || avData.sav.length === 0) {
  return <div>SAV data is empty</div>;
}
console.log("Rendering with SAV:", avData.sav);
```

---

## 7. EXPECTED DATA FLOW EXAMPLE

### Real Calculation Example

```
Birth Chart: January 15, 1990, 14:30, New Delhi

Planets positions:
  SUN: Capricorn 10 (Rasi 10)
  MOON: Libra 7 (Rasi 7)
  MARS: Capricorn 10
  ... etc

Calculate SUN's BAV:
  - SUN's position: Rasi 10
  - Check which other planets contribute to each house from Rasi 10
  - SUN contributes to houses [1,2,4,7,8,9,10,11] from its position
  - Result: [2, 3, 1, 4, 2, 1, 0, 2, 3, 4, 2, 1] (12 values)

Calculate MOON's BAV:
  - MOON's position: Rasi 7
  - MOON contributes to houses [3,6,10,11] from its position
  - Result: [3, 2, 2, 3, 1, 0, 2, 3, 4, 3, 2, 1]

... repeat for all 7 planets

Calculate SAV:
  House 1 SAV = SUM of all planets' BAV[1]
               = 2 + 3 + 2 + 1 + 4 + 3 + 2 = 17
  House 2 SAV = 3 + 2 + 2 + 3 + 1 + 0 + 2 = 13
  ... repeat for all 12 houses

Final SAV: [17, 13, 8, 16, 9, 5, 14, 18, 22, 25, 19, 14]
Total Points: 170 (need to check actual calculation)
Average Per House: 170 / 12 = 14.17

Strongest House: Index 9 (House 10) with 25 points
Weakest House: Index 5 (House 6) with 5 points
```

---

## 8. WHY NOT SHOWING IN FRONTEND

**Three Possible Reasons:**

1. **Hardcoded Values Override**

   - Frontend uses hardcoded values instead of API data
   - Fix: Use actual API response data

2. **API Call Fails Silently**

   - Error caught but not logged properly
   - Fix: Check console warnings/errors
   - Fix: Ensure profile ID is valid

3. **Component Not Rendering**
   - activeTab !== "ashtakavarga"
   - avData is null (default state)
   - Component crashes on render
   - Fix: Check browser console for errors
   - Fix: Click "Ashtakavarga" tab in sidebar

---

## 9. VERIFICATION STEPS

### Step 1: Verify Backend Calculation

```bash
curl http://localhost:8001/api/ashtakavarga/1/summary \
  -H "Authorization: Bearer your_token"
```

Should return:

```json
{
  "summary": { "total_points": 250, ... },
  "sav_by_house": { "1": 20, "2": 25, ... },
  ...
}
```

### Step 2: Verify Frontend Data Loading

```typescript
// Add to App.tsx
const loadProfileData = async (profileId: number) => {
  // ... existing code ...

  // Add this logging:
  const av = await astrologyApi.getAshtakavarga(profileId);
  console.log("Ashtakavarga Response:", av);
  console.log("SAV Array:", av.sav);
  console.log("BAV Keys:", Object.keys(av.bav));
};
```

### Step 3: Verify Component Rendering

```bash
# Check browser DevTools console for errors
# Check if "Ashtakavarga" tab is clickable
# Verify avData state has values
```

---

## 10. COMPLETE FIXED CODE

### File: `frontend/src/App.tsx` (Lines 212-231)

```tsx
// Load ashtakavarga
try {
  const av = await astrologyApi.getAshtakavarga(profileId);

  // Calculate totals from API data
  const planetTotals: Record<string, number> = {};
  Object.entries(av.bav).forEach(([planet, values]) => {
    planetTotals[planet] = (values as number[]).reduce((sum, v) => sum + v, 0);
  });

  const totalSavPoints = av.sav.reduce((sum: number, v: number) => sum + v, 0);
  const avgPointsPerHouse = Math.round(totalSavPoints / 12);

  // Generate interpretations
  const houseInterpretations = av.sav.map((points: number, idx: number) => {
    const strength =
      points >= avgPointsPerHouse + 10
        ? "Very Strong"
        : points >= avgPointsPerHouse
        ? "Strong"
        : points >= avgPointsPerHouse - 10
        ? "Moderate"
        : "Weak";
    return `House ${idx + 1}: ${strength} (${points} pts)`;
  });

  const houseSignifications = av.strongHouses.map(
    (h) => `House ${h}: Strong Energy`
  );

  setAvData({
    bav: av.bav || {},
    sav: av.sav || [],
    totalPoints: totalSavPoints,
    planetTotals: planetTotals,
    summary: {
      strongestHouse: av.summary.max_rasi || 1,
      weakestHouse: av.summary.min_rasi || 6,
      averagePoints: avgPointsPerHouse,
      houseInterpretations: houseInterpretations,
      houseSignifications: houseSignifications,
    },
    isValid: totalSavPoints > 0,
  });

  console.log("✓ Ashtakavarga loaded:", {
    totalPoints: totalSavPoints,
    planets: Object.keys(av.bav).length,
    avgPerHouse: avgPointsPerHouse,
    strongHouses: av.strongHouses,
  });
} catch (e) {
  console.error("Ashtakavarga loading failed:", e);
  setAvData(null);
}
```

---

## 11. VERIFICATION CHECKLIST FOR ASTROLOGER

- [ ] BAV rules match your texts (8 benefic houses per planet)
- [ ] SAV calculation is sum of all BAV values
- [ ] Total points should be between 200-400 (max 56×7=392)
- [ ] Average points per house calculation is correct
- [ ] Strong/weak house identification matches SAV values
- [ ] Planet totals sum correctly
- [ ] Interpretations make sense based on values

---

**Last Updated:** January 14, 2026

Use this guide to:

1. ✅ Understand current issues
2. ✅ Fix hardcoded values
3. ✅ Connect frontend to backend properly
4. ✅ Verify all data is showing correctly
