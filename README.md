# Astro Jyotish - Vedic Astrology Platform

A comprehensive Vedic astrology platform with complete API integration.

## 🐳 Docker Deployment

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+

### Quick Start (Development)

1. **Clone and navigate to the project:**
   ```bash
   cd /path/to/project
   ```

2. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - API Health: http://localhost:8001/api/health

4. **Setup demo data (first time only):**
   ```bash
   curl -X POST http://localhost:8001/api/demo/setup
   ```

5. **Login with demo credentials:**
   - Email: `demo@astroos.com`
   - Password: `demo123`

### Production Deployment

1. **Create `.env` file:**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

2. **Build and start with production config:**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

### Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild specific service
docker-compose up --build backend

# Shell into container
docker exec -it astroos-backend /bin/bash
docker exec -it astroos-frontend /bin/sh
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | JWT secret key | `astrojyotish-secret-key-docker-2025` |
| `BACKEND_URL` | Backend API URL (for frontend build) | `http://localhost:8001` |
| `CORS_ORIGINS` | Allowed CORS origins | `*` |

### Architecture

```
┌─────────────────┐     ┌─────────────────┐
│    Frontend     │     │    Backend      │
│   (React/Nginx) │────▶│   (FastAPI)     │
│    Port 3000    │     │    Port 8001    │
└─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │     SQLite      │
                        │   (Volume)      │
                        └─────────────────┘
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/auth/me` | GET | Current user info |
| `/api/profiles` | GET/POST | User profiles |
| `/api/charts/{id}/bundle` | GET | Natal chart data |
| `/api/dashas/{id}` | GET | Dasha periods |
| `/api/panchaang/{id}` | GET | Panchang data |
| `/api/align27/today` | GET | Today's alignment |
| `/api/demo/setup` | POST | Setup demo data |

### Troubleshooting

**Container won't start:**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild from scratch
docker-compose down -v
docker-compose up --build
```

**Database issues:**
```bash
# Reset database
docker-compose down -v
docker-compose up --build
# Then run demo setup again
curl -X POST http://localhost:8001/api/demo/setup
```

**Frontend can't reach backend:**
- Ensure backend container is healthy: `docker-compose ps`
- Check backend health: `curl http://localhost:8001/api/health`

## 📁 Project Structure

```
/app
├── backend/           # FastAPI backend
│   ├── app/          # Application code
│   │   ├── api/      # API routes
│   │   ├── core/     # Core utilities
│   │   ├── models/   # Database models
│   │   └── modules/  # Business logic
│   ├── ephe/         # Ephemeris data
│   ├── Dockerfile    # Backend container
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── src/         # Source code
│   │   ├── components/
│   │   └── services/
│   ├── Dockerfile   # Frontend container
│   └── nginx.conf   # Nginx config
├── docker-compose.yml      # Development compose
├── docker-compose.prod.yml # Production compose
└── README.md
```

## 🔐 Security Notes

- Change `SECRET_KEY` in production
- Use HTTPS in production (add reverse proxy)
- Configure `CORS_ORIGINS` appropriately
- Consider using Docker secrets for sensitive data

## 📜 License

MIT License
