# Frontend-Backend Integration Guide

## Overview

This guide covers the complete integration of the JyotishAI frontend (React + TypeScript) with the Jyotish backend (FastAPI + Python). Both repositories have been analyzed and are ready for seamless integration.

## Repository Status

### Backend Repository: Jyotish
- **Location**: `/backend`
- **Type**: FastAPI Python application
- **Port**: 8001
- **Database**: MySQL with Alembic migrations
- **Cache**: Redis 7
- **API**: RESTful with Swagger/OpenAPI docs

### Frontend Repositories
1. **Jyotish/frontend (jyotish/frontend branch)**
   - React 19.2.3 with TypeScript
   - 670 lines of code
   - Includes components, services, and configuration

2. **JyotishAI (main branch)**
   - React 19.2.3 with TypeScript
   - Identical structure to Jyotish/frontend
   - Ready for integration

## Architecture

```
Jyotish-Ai Frontend (React)
          ↓
    API Client Service (TypeScript)
          ↓
    HTTP Requests (Axios/Fetch)
          ↓
    FastAPI Backend (Python)
          ↓
    MySQL Database + Redis Cache
```

## Integration Points

### 1. API Endpoints

The backend provides these main endpoints:

```
Authentication:
  POST /api/auth/login
  POST /api/auth/register
  POST /api/auth/logout
  POST /api/auth/refresh

Profiles:
  GET /api/profiles
  POST /api/profiles
  GET /api/profiles/{id}
  PUT /api/profiles/{id}
  DELETE /api/profiles/{id}

Chart Data:
  GET /api/profiles/{id}/chart
  GET /api/profiles/{id}/dasha
  GET /api/profiles/{id}/ashtakavarga
  GET /api/profiles/{id}/yogas

Align27:
  GET /api/align27/daily-score?date=YYYY-MM-DD
  GET /api/align27/moments?date=YYYY-MM-DD

Health & Status:
  GET /api/health
  GET /api/status
```

### 2. Frontend API Client Configuration

Create `frontend/src/services/apiConfig.ts`:

```typescript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  REFRESH: `${API_BASE_URL}/api/auth/refresh`,
  
  // Profiles
  PROFILES: `${API_BASE_URL}/api/profiles`,
  PROFILE: (id: string) => `${API_BASE_URL}/api/profiles/${id}`,
  
  // Chart Data
  CHART: (id: string) => `${API_BASE_URL}/api/profiles/${id}/chart`,
  DASHA: (id: string) => `${API_BASE_URL}/api/profiles/${id}/dasha`,
  ASHTAKAVARGA: (id: string) => `${API_BASE_URL}/api/profiles/${id}/ashtakavarga`,
  YOGAS: (id: string) => `${API_BASE_URL}/api/profiles/${id}/yogas`,
  
  // Align27
  DAILY_SCORE: (date: string) => `${API_BASE_URL}/api/align27/daily-score?date=${date}`,
  MOMENTS: (date: string) => `${API_BASE_URL}/api/align27/moments?date=${date}`,
  
  // Health
  HEALTH: `${API_BASE_URL}/api/health`,
};
```

### 3. Environment Variables

**Frontend (.env)**:
```
REACT_APP_API_URL=http://localhost:8001
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENV=development
```

**Backend (.env)**:
```
DATABASE_URL=mysql+pymysql://astro:astropass@localhost:3306/astroos
REDIS_URL=redis://localhost:6379/0
OPENAI_API_KEY=your_key_here
SECRET_KEY=dev-secret-key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8001
```

### 4. CORS Configuration

The backend should have CORS enabled for the frontend:

**Backend (main.py)**:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Data Models & Types

### User Model
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}
```

### Profile Model
```typescript
interface Profile {
  id: string;
  user_id: string;
  name: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  latitude: number;
  longitude: number;
  timezone: string;
  created_at: string;
  updated_at: string;
}
```

### Chart Data Model
```typescript
interface ChartData {
  profile_id: string;
  planets: PlanetData[];
  houses: HouseData[];
  ascendant: number;
  mid_heaven: number;
}

interface PlanetData {
  name: string;
  degree: number;
  sign: string;
  house: number;
  speed: number;
}
```

## Running the Integration

### Quick Start

```bash
# Terminal 1: Start Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python server.py

# Terminal 2: Start Frontend
cd frontend
npm install
npm start

# Application will be available at http://localhost:3000
```

### Docker Setup

```bash
# Start all services
make demo

# Or manually
docker-compose up -d

# Run migrations
make migrate

# Seed demo data
make seed
```

## Testing Integration

### 1. Health Check
```bash
curl http://localhost:8001/api/health

# Expected response:
# {"status": "healthy", "timestamp": "2026-01-12T11:00:00Z"}
```

### 2. Login Test
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@astroos.com", "password": "demo123"}'

# Save the token for subsequent requests
```

### 3. Create Profile
```bash
curl -X POST http://localhost:8001/api/profiles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "birth_date": "1990-01-15",
    "birth_time": "10:30:00",
    "birth_location": "Mumbai, India",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "timezone": "IST"
  }'
```

### 4. Get Chart Data
```bash
curl http://localhost:8001/api/profiles/{profile_id}/chart \
  -H "Authorization: Bearer <token>"
```

## Frontend Components Integration

### Login Component
```typescript
import { useState } from 'react';
import { apiClient } from '../services/apiClient';

export function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async () => {
    try {
      const response = await apiClient.login(email, password);
      localStorage.setItem('token', response.token);
      // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Profile Creation Component
```typescript
export function CreateProfileComponent() {
  const handleCreateProfile = async (profileData: ProfileInput) => {
    try {
      const token = localStorage.getItem('token');
      const newProfile = await apiClient.createProfile(profileData, token);
      // Show success message or redirect
    } catch (error) {
      console.error('Profile creation failed:', error);
    }
  };
  
  return (
    // Form components here
  );
}
```

### Chart Display Component
```typescript
export function ChartComponent({ profileId }: { profileId: string }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchChart = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await apiClient.getChart(profileId, token);
        setChartData(data);
      } catch (error) {
        console.error('Failed to load chart:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChart();
  }, [profileId]);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="chart-container">
      {/* Render chart using chartData */}
    </div>
  );
}
```

## Troubleshooting

### CORS Errors
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**:
- Ensure backend CORS middleware is configured
- Check ALLOWED_ORIGINS in backend .env
- Frontend should use correct API URL

### Authentication Errors
```
401 Unauthorized
```

**Solution**:
- Verify token is stored in localStorage
- Include Authorization header in requests
- Check token expiration and refresh logic

### Database Connection Errors
```
Cannot connect to database
```

**Solution**:
- Ensure MySQL is running
- Check DATABASE_URL in .env
- Verify database exists: `astroos`
- Run migrations: `make migrate`

### API Timeout
```
Request timeout
```

**Solution**:
- Increase REACT_APP_API_TIMEOUT
- Check backend is running
- Monitor server logs
- Optimize database queries

## Performance Optimization

### Frontend
- Enable code splitting
- Implement lazy loading for routes
- Cache API responses
- Optimize bundle size

### Backend
- Add database indexes
- Implement caching with Redis
- Use connection pooling
- Optimize complex queries

## Security Checklist

- [ ] Change SECRET_KEY in production
- [ ] Use HTTPS in production
- [ ] Set secure CORS origins
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Use secure password hashing
- [ ] Implement token refresh
- [ ] Add request logging
- [ ] Enable security headers
- [ ] Regular security audits

## Deployment

See SETUP_AND_DEPLOYMENT.md for production deployment instructions.

## Support

For issues or questions:
1. Check RUNNING_GUIDE.md
2. Review IMPLEMENTATION_GUIDE.md
3. Check backend logs: `make logs`
4. Check browser console for frontend errors
