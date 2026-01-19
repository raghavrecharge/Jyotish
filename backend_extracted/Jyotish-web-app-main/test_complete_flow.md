# Complete Demo Login Flow Test

## Step 1: Verify Backend APIs

### 1a. Health Check

```bash
curl http://localhost:8001/api/health
# Expected: {"status":"healthy",...}
```

### 1b. Demo Setup

```bash
curl -X POST http://localhost:8001/api/demo/setup
# Expected: {"status":"success","credentials":{"email":"demo@astroos.com","password":"demo123"}}
```

### 1c. Login

```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=demo@astroos.com&password=demo123"
# Expected: {"access_token":"...","user":{"id":1,"email":"demo@astroos.com",...}}
```

### 1d. Get Profiles

```bash
# Get token from step 1c response
TOKEN="<access_token>"
curl http://localhost:8001/api/profiles \
  -H "Authorization: Bearer $TOKEN"
# Expected: [{"id":1,"name":"Demo Profile","birth_date":"..."}]
```

## Step 2: Test Frontend Flow

### 2a. Open Frontend

- Go to http://localhost:3000
- You should see login page

### 2b. Click "Try Demo Account"

- Should show loading...
- Should automatically log in
- After ~2-3 seconds, should show Dashboard
- NO "Initialize Your Matrix" form should appear
- NO "Enter Birth Details" form should appear

### 2c. Check Browser Console (F12 → Console)

You should see logs like:

```
Starting demo login...
Demo setup response: {status: "success", credentials: {...}}
Logging in with credentials: demo@astroos.com
Demo login successful!
Loading profiles...
Profiles loaded: Array(2)
Setting first profile as default: {id: 1, name: "Demo Profile", ...}
useEffect triggered - authProfile: {id: 1, name: "Demo Profile", ...}
Loading profile for authProfile ID: 1
loadProfileFromBackend called for profileId: 1
Setting profile: {id: "1", birthData: {...}, preferences: {...}}
```

### 2d. Verify Dashboard

- You should see dashboard with:
  - Sidebar with sections (CORE, ASTROLOGY, ANALYSIS, INTELLIGENCE)
  - Top header with profile dropdown
  - Main content area showing "Overview" tab active
  - Loading spinner while data loads

## Expected Result

✅ Complete login-to-dashboard flow WITHOUT any form filling
✅ All APIs called successfully
✅ Profile auto-selected from backend
✅ Dashboard displays with chart data
