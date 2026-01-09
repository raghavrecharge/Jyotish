# AstroOS - Production Implementation Guide

## Project Overview
AstroOS is a complete Vedic Astrology Platform combining:
- **Backend**: FastAPI + Python with complete astrology calculations
- **Frontend**: React 19 + TypeScript with modern UI
- **Database**: MySQL for persistent storage
- **Caching**: Redis for performance optimization

## Current Status

✅ **Backend**: Fully structured with all API endpoints
✅ **Frontend**: React app with complete UI components
⚠️ **Integration**: Frontend needs API client connection
⚠️ **Database**: Needs migration setup

## Quick Start (Development)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt

# Create .env file in backend/
echo 'MYSQL_HOST=localhost' > .env
echo 'MYSQL_USER=root' >> .env
echo 'MYSQL_PASSWORD=root' >> .env
echo 'MYSQL_DB=astroos_db' >> .env
echo 'REDIS_URL=redis://localhost:6379' >> .env
echo 'OPENAI_API_KEY=sk-your-key' >> .env
echo 'SECRET_KEY=your-secret-key' >> .env

python -m uvicorn app.main:app --reload --port 8001
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Create .env.local
echo 'VITE_API_URL=http://localhost:8001' > .env.local
echo 'VITE_GEMINI_API_KEY=your-key' >> .env.local

npm run dev
```

### 3. Database Setup (Docker)
```bash
# MySQL
docker run -d --name astroos-mysql \\
  -e MYSQL_ROOT_PASSWORD=root \\
  -e MYSQL_DATABASE=astroos_db \\
  -p 3306:3306 \\
  mysql:8.0

# Redis
docker run -d --name astroos-redis \\
  -p 6379:6379 \\
  redis:latest
```

## Production Deployment

### Using Docker Compose
```bash
# At project root
docker-compose up -d
```

### Environment Variables (Production)
Create `.env.production` in backend/:
```
MYSQL_HOST=mysql-service
MYSQL_USER=astroos_user
MYSQL_PASSWORD=strong_password_here
MYSQL_DB=astroos_prod
REDIS_URL=redis://redis-service:6379
OPENAI_API_KEY=sk-prod-key
SECRET_KEY=generate-with-secrets-tool
CORS_ORIGINS=https://yourdomain.com
ENVIRONMENT=production
```

## API Documentation

Once backend is running:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc
- **Health Check**: http://localhost:8001/api/health

## Key Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user

### Profiles
- `GET /api/profiles` - List all user profiles
- `POST /api/profiles` - Create new birth profile
- `GET /api/profiles/{id}` - Get profile details

### Astrology Calculations
- `POST /api/charts/natal` - Calculate natal chart
- `POST /api/charts/varga` - Calculate divisional chart
- `POST /api/dashas/vimshottari` - Calculate Vimshottari Dashas
- `POST /api/yogas` - Detect astrological yogas
- `POST /api/ashtakavarga` - Calculate Ashtakavarga
- `POST /api/compatibility` - Calculate relationship compatibility

## Frontend API Integration

The frontend uses the API client located in `frontend/services/apiClient.ts`:

```typescript
import { apiClient } from './services/apiClient';

// Usage in components
const { data: chart } = await apiClient.post('/charts/natal', birthData);
```

## Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## Troubleshooting

### Backend won't start
```bash
# Check Python version (3.9+)
python --version

# Clear cache and reinstall
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### CORS errors in frontend
- Check backend CORS_ORIGINS in .env
- Ensure frontend API URL matches backend host
- Clear browser cache

### Database connection issues
- Verify MySQL is running
- Check credentials in .env
- Run migrations: `alembic upgrade head`

## Support
For issues, check:
1. Backend logs: `docker logs jyotish-backend`
2. Frontend console: DevTools -> Console
3. Database status: `docker ps`
