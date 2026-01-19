#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Testing Demo Login Flow ===${NC}\n"

# Test 1: Check if backend is running
echo -e "${BLUE}1. Checking backend health...${NC}"
HEALTH=$(curl -s http://localhost:8001/api/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
if [ "$HEALTH" = "ok" ]; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    exit 1
fi

# Test 2: Call demo/setup endpoint
echo -e "\n${BLUE}2. Setting up demo account...${NC}"
DEMO_RESPONSE=$(curl -s -X POST http://localhost:8001/api/demo/setup \
  -H "Content-Type: application/json")
echo "Demo response: $DEMO_RESPONSE"

# Extract credentials from response
DEMO_EMAIL=$(echo "$DEMO_RESPONSE" | grep -o '"email":"[^"]*"' | head -1 | cut -d'"' -f4)
DEMO_PASSWORD=$(echo "$DEMO_RESPONSE" | grep -o '"password":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$DEMO_EMAIL" ] || [ -z "$DEMO_PASSWORD" ]; then
    echo -e "${RED}✗ Failed to extract demo credentials${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Demo setup successful${NC}"
echo "Demo Email: $DEMO_EMAIL"
echo "Demo Password: $DEMO_PASSWORD"

# Test 3: Login with demo credentials
echo -e "\n${BLUE}3. Logging in with demo credentials...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$DEMO_EMAIL\",\"password\":\"$DEMO_PASSWORD\"}")
echo "Login response: $LOGIN_RESPONSE"

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Login failed - no token${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo "Token: ${TOKEN:0:20}..."

# Test 4: Get profiles with token
echo -e "\n${BLUE}4. Fetching profiles...${NC}"
PROFILES=$(curl -s http://localhost:8001/api/profiles \
  -H "Authorization: Bearer $TOKEN")
echo "Profiles response: $PROFILES"

PROFILE_COUNT=$(echo "$PROFILES" | grep -o '"id"' | wc -l)
if [ "$PROFILE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Profiles loaded successfully (found $PROFILE_COUNT profile(s))${NC}"
    
    # Extract first profile ID
    FIRST_PROFILE_ID=$(echo "$PROFILES" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "First Profile ID: $FIRST_PROFILE_ID"
else
    echo -e "${RED}✗ No profiles found${NC}"
    exit 1
fi

echo -e "\n${GREEN}=== Demo Login Flow Test PASSED ===${NC}"
echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Open http://localhost:3000 in browser"
echo "2. Click 'Try Demo Account'"
echo "3. Should see dashboard without form"
echo "4. Open DevTools (F12) Console to see logs"
