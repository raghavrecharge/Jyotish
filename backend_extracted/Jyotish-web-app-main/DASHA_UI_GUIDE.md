# Dasha UI Implementation Guide - 3 Level Hierarchical Display

## Overview

The Dasha system now supports **3 levels of hierarchy** for Vimshottari dashas:

1. **Maha Dasha** (Major periods - 7 to 20 years)
2. **Antar Dasha** (Sub-periods within Maha)
3. **Pratyantar Dasha** (Sub-sub-periods within Antar)

## Frontend Component: `DashaTree.tsx`

The `DashaTree` component already supports hierarchical drill-down navigation:

### Features:

✅ **Timeline Visualization** - Visual bar chart showing relative durations
✅ **Interactive Drill-Down** - Click any period to see its sub-periods
✅ **Breadcrumb Navigation** - Track your navigation path
✅ **Active Period Highlighting** - Current running period is highlighted
✅ **Responsive Design** - Works on mobile and desktop

### How It Works:

```tsx
import DashaTree from "./components/DashaTree";

// Fetch dashas with depth=3 to get all levels
const dashas = await astrologyApi.getDashas(profileId, "vimshottari", 3);

// Render the tree
<DashaTree nodes={dashas} />;
```

## Data Flow:

### 1. Backend API Response

```json
{
  "system": "vimshottari",
  "depth": 3,
  "dashas": [
    {
      "id": 1,
      "lord": "MOON",
      "level": "maha",
      "start_date": "1983-07-19T00:00:00",
      "end_date": "1993-07-19T00:00:00",
      "parent_id": null
    },
    {
      "id": 91,
      "lord": "MOON",
      "level": "antar",
      "start_date": "1983-07-19T00:00:00",
      "end_date": "1984-05-19T00:00:00",
      "parent_id": 1
    },
    {
      "id": 811,
      "lord": "MOON",
      "level": "pratyantar",
      "start_date": "1983-07-19T00:00:00",
      "end_date": "1983-09-18T00:00:00",
      "parent_id": 91
    }
  ]
}
```

### 2. Frontend Transformation

The `transformDashas()` function in `astrologyApi.ts` converts the flat list into a tree:

```typescript
[
  {
    id: "1",
    planet: "Moon",
    start: "1983-07-19T00:00:00",
    end: "1993-07-19T00:00:00",
    level: 1,
    children: [
      {
        id: "91",
        planet: "Moon",
        start: "1983-07-19T00:00:00",
        end: "1984-05-19T00:00:00",
        level: 2,
        children: [
          {
            id: "811",
            planet: "Moon",
            start: "1983-07-19T00:00:00",
            end: "1983-09-18T00:00:00",
            level: 3,
            children: [],
          },
        ],
      },
    ],
  },
];
```

## Usage Example:

### In a React Component:

```tsx
import React, { useState, useEffect } from "react";
import DashaTree from "./components/DashaTree";
import { astrologyApi } from "./services/astrologyApi";

function VimshottariDashaView({ profileId }: { profileId: number }) {
  const [dashas, setDashas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashas() {
      try {
        // Request all 3 levels: Maha → Antar → Pratyantar
        const data = await astrologyApi.getDashas(profileId, "vimshottari", 3);
        setDashas(data);
      } catch (error) {
        console.error("Error loading dashas:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashas();
  }, [profileId]);

  if (loading) return <div>Loading dashas...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Vimshottari Maha Dasha</h2>
      <DashaTree nodes={dashas} />
    </div>
  );
}
```

## User Interaction Flow:

1. **Initial View**: Shows all Maha Dashas (Level 1)

   - Timeline shows major periods (Venus 20 years, Sun 6 years, Moon 10 years, etc.)
   - Current active Maha Dasha is highlighted

2. **Click a Maha Dasha**: Drills down to Antar Dashas (Level 2)

   - Shows 9 sub-periods within that Maha Dasha
   - Each Antar follows Vimshottari sequence starting from the Maha lord
   - Breadcrumb shows: Main → Moon

3. **Click an Antar Dasha**: Drills down to Pratyantar Dashas (Level 3)

   - Shows 9 sub-sub-periods within that Antar Dasha
   - Breadcrumb shows: Main → Moon → Mars

4. **Navigate Back**: Click any breadcrumb to go back to that level

## Styling & Colors:

Each planet has a distinct color scheme:

- **Sun**: Orange (bg-orange-500)
- **Moon**: Blue (bg-blue-400)
- **Mars**: Red (bg-red-500)
- **Mercury**: Emerald (bg-emerald-500)
- **Jupiter**: Yellow (bg-yellow-500)
- **Venus**: Rose (bg-rose-400)
- **Saturn**: Indigo (bg-indigo-700)
- **Rahu**: Slate (bg-slate-700)
- **Ketu**: Amber (bg-amber-700)

## API Endpoints:

### Get Single System

```
GET /api/dashas/{profile_id}?system=vimshottari&depth=3
```

### Get All Systems

```
GET /api/dashas/{profile_id}/all
```

Returns all 5 dasha systems at once:

- Vimshottari (Maha → Antar → Pratyantar)
- Chara (Maha → Antar)
- Yogini (Maha → Antar)
- Ashtottari (Maha → Antar)
- Kalachakra (Multi-level)

### Get Systems Info

```
GET /api/dashas/systems
```

Returns metadata about each system including available levels.

## Tips for Best UX:

1. **Default to depth=3** for Vimshottari to show all levels
2. **Load data once** and let the component handle navigation
3. **Show loading states** while fetching data
4. **Highlight current period** to help users orient themselves
5. **Add tooltips** showing exact dates on hover
6. **Responsive design** - component adapts to mobile screens

## Performance:

- Data is fetched once and cached
- Component efficiently navigates through the tree structure
- No additional API calls needed for drill-down
- Smooth animations for better UX

## Future Enhancements:

- [ ] Export dasha data as PDF/CSV
- [ ] Filter by date range
- [ ] Compare multiple dasha systems side-by-side
- [ ] Add transit overlay on timeline
- [ ] Predict future events based on dasha periods
