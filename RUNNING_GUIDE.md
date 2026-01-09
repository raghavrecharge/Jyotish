# AstroOS - Running Guide

## Quick Start (30 Seconds)

The fastest way to get AstroOS running with all services:

```bash
make demo
```

This single command will:
1. Build all Docker images
2. Start MySQL, Redis, Backend (FastAPI), and Frontend (React)
3. Run database migrations
4. Seed demo data
5. Display access credentials

**Access Points:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs
- Demo Account: demo@astroos.com / demo123

---

## Prerequisites

### Required
- Docker (v20+)
- Docker Compose (v1.29+)
- Make (GNU Make)

### Optional
- Git
- A terminal/command line

### System Requirements
- RAM: 4GB minimum (8GB recommended)
- Disk Space: 2GB for images and volumes
- CPU: 2 cores minimum

### Verify Installation

```bash
# Check Docker
docker --version    # Should show v20+
docker-compose --version  # Should show v1.29+

# Check Make
make --version      # Should show GNU Make
```

---

## Running the Application

### Method 1: One-Command Demo Setup (Recommended)

```bash
make demo
```

What it does:
1. Starts all services with Docker Compose
2. Waits for service health checks
3. Runs database migrations automatically
4. Seeds demo data (3 sample users, 5 birth profiles)
5. Shows ready message with access URLs

**Time:** ~30-45 seconds

### Method 2: Manual Setup (Step-by-Step)

#### Step 1: Start Services
```bash
make up
```

Waits 15 seconds for services to initialize.

#### Step 2: Run Database Migrations
```bash
make migrate
```

Applies all pending Alembic migrations to create/update schema.

#### Step 3: Seed Demo Data (Optional)
```bash
make seed
```

Populates database with sample data for testing.

#### Step 4: Verify Everything
```bash
make verify
```

Runs full verification suite:
- Database health check
- Backend unit tests
- Frontend build
- API smoke tests

---

## Accessing the Application

### Frontend (React UI)
```
URL: http://localhost:3000
Browser: Open in Chrome, Firefox, or Safari
```

**Features:**
- User registration and login
- Birth chart creation
- Multiple profile management
- Dasha timeline visualization
- Yoga detection dashboard
- Align27 daily scoring
- Knowledge base chat

### Backend API
```
URL: http://localhost:8001
Format: REST API (JSON)
Documentation: http://localhost:8001/docs
```

**Key Endpoints:**
- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/profiles` - Create birth profile
- `GET /api/profiles/{id}/chart` - Get birth chart
- `GET /api/profiles/{id}/dasha` - Get Dasha timeline

### Database Access

```bash
# Access MySQL directly
docker-compose exec mysql mysql -u astro -p astroos

# When prompted for password: astropass

# View logs from specific service
docker-compose logs -f backend   # Backend logs
docker-compose logs -f frontend  # Frontend logs
docker-compose logs -f mysql     # Database logs
```

---

## Common Tasks

### View Live Logs
```bash
make logs

# Or for specific service:
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Run Tests

```bash
# Backend unit tests
make test-backend

# Frontend build test
make test-frontend

# API smoke tests
make smoke
```

### Restart Services

```bash
# Soft restart (keep data)
make down
make up

# Hard reset (clear all data)
make clean
make demo
```

### Stop Application

```bash
make down
```

Keeps volumes (data persists).

### Full Cleanup

```bash
make clean
```

Removes containers, volumes, and cache. Data is deleted.

---

## Demo Credentials

### Test Accounts

| Email | Password | Purpose |
|-------|----------|----------|
| demo@astroos.com | demo123 | Full feature demo |
| test@astroos.com | test123 | Testing |
| user@astroos.com | user123 | Profile testing |

### Sample Profiles

Each test account has 1-2 birth profiles pre-created:
- Birth date: 1990-01-15
- Birth time: 10:30:00
- Birth location: Mumbai, India
- Timezone: IST (UTC+5:30)

---

## Troubleshooting

### Services Won't Start

```bash
# Check port conflicts
netstat -tulpn | grep -E ':(3000|3306|6379|8001)'

# Force clean restart
make down
make clean
make demo

# Check Docker daemon
docker ps  # Should show running containers
```

### Database Connection Error

```bash
# Check MySQL health
docker-compose ps mysql

# Verify database exists
docker-compose exec mysql mysql -u astro -p astroos -e "SELECT DATABASE();"

# Rebuild from scratch
make clean
make demo
```

### Migration Failures

```bash
# Downgrade to base state
docker-compose exec backend alembic downgrade base

# Re-apply all migrations
docker-compose exec backend alembic upgrade head

# Verify schema
docker-compose exec backend alembic current
```

### Frontend Not Loading

```bash
# Check frontend service
docker-compose ps frontend

# View frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose exec frontend yarn build

# Clear node_modules
rm -rf frontend/node_modules
make down
make up
```

### Memory/CPU Issues

```bash
# Check resource usage
docker stats

# Increase Docker memory in settings
# Docker Desktop -> Preferences -> Resources
```

---

## Performance Notes

### First Run
- Image build: ~2-3 minutes
- Container startup: ~15-20 seconds
- Total time: ~3-4 minutes

### Subsequent Runs
- Container startup: ~10-15 seconds
- Database ready: ~5 seconds
- Application ready: ~5 seconds
- Total time: ~20-30 seconds

### Optimization Tips

1. **Volume Mounts:** Hot reload enabled for backend and frontend
2. **Caching:** Docker layers cached for faster rebuilds
3. **Health Checks:** MySQL and Redis have automatic health verification
4. **Lazy Loading:** Frontend code-splits for optimal performance

---

## Production Deployment

For production deployments:

1. Update environment variables in `docker-compose.yml`
   - Change `OPENAI_API_KEY` to production key
   - Set `SECRET_KEY` to strong random value
   - Update `REACT_APP_BACKEND_URL`
   - Configure CORS origins

2. Use production database
   - Replace local MySQL with managed database
   - Enable backups and replication
   - Use connection pooling

3. Set up SSL/TLS
   - Use nginx reverse proxy
   - Enable HTTPS
   - Configure certificates

4. Monitoring
   - Set up logging aggregation
   - Configure alerts
   - Monitor resource usage

See `SETUP_AND_DEPLOYMENT.md` for detailed production setup.

---

## Architecture Overview

### Services
```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│  Port 3000 | http://localhost:3000      │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│   Backend (FastAPI) | Celery Workers    │
│  Port 8001 | http://localhost:8001      │
└──────────────────┬──────────────────────┘
        ↙          │          ↘
       ↙           │           ↘
┌──────────┐  ┌──────────┐  ┌───────────┐
│  MySQL   │  │  Redis   │  │ Ephemeris │
│ Port 3306│  │ 6379     │  │   Data    │
└──────────┘  └──────────┘  └───────────┘
```

### Technology Stack

**Backend:**
- FastAPI (Web framework)
- SQLAlchemy (ORM)
- Alembic (Migrations)
- PySwissEph (Ephemeris calculations)
- LightGBM (ML predictions)
- FAISS (Vector search)

**Frontend:**
- React 18 (UI framework)
- TypeScript (Type safety)
- Redux (State management)
- Chart.js (Visualizations)
- Tailwind CSS (Styling)

**Infrastructure:**
- Docker Compose (Orchestration)
- MySQL 8.0 (Database)
- Redis 7 (Cache/Celery broker)
- Nginx (Reverse proxy)

---

## Support & Documentation

- **API Docs:** http://localhost:8001/docs
- **Implementation Guide:** See `IMPLEMENTATION_GUIDE.md`
- **Setup Guide:** See `SETUP_AND_DEPLOYMENT.md`
- **Quick Start:** See `QUICK_START_GUIDE.md`

---

## License

Propretary - All rights reserved
