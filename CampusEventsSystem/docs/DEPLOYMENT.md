# Deployment Guide

## Quick Start

### Local Deployment with Docker

```bash
# Build and run all services
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:3001
# Database: backend/events.db
```

### Manual Deployment

1. **Install dependencies**
   ```bash
   cd backend
   npm ci --production
   ```

2. **Start server**
   ```bash
   npm start
   ```

3. **Access services**
   - API: `http://localhost:3001`
   - Frontend: Serve from any web server

## Production Deployment

### Using Docker Compose

```bash
# Pull latest code
git pull origin main

# Build and deploy
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Environment Variables

Create `.env` file in backend directory (if needed):

```env
NODE_ENV=production
PORT=3001
DATABASE_PATH=./events.db
```

### Database Management

- **Location**: `backend/events.db`
- **Backup**: Included in Docker volume for persistence
- **Initialize**: Automatically created on first run

## Monitoring

### Health Checks

All containers have health checks configured:

```bash
# Check backend health
curl http://localhost:3001/health

# Check frontend health
curl http://localhost
```

### Logs

```bash
# View all logs
docker-compose logs

# Follow backend logs
docker-compose logs -f backend

# View specific time range
docker-compose logs --since 30m
```

## Scaling

### Horizontal Scaling

For multiple backend instances, modify `docker-compose.yml`:

```yaml
services:
  backend-1:
    # ...
  backend-2:
    # ...
  load-balancer:
    # nginx or similar
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend

# Rebuild container
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Database locked

```bash
# Restart database container
docker-compose restart backend

# Or delete and recreate
docker-compose down -v
docker-compose up -d
```

### Port conflicts

Modify ports in `docker-compose.yml` if ports 80 or 3001 are in use.

## Rollback

```bash
# View available commits
git log --oneline | head -20

# Checkout previous version
git checkout <commit-hash>

# Rebuild and restart
docker-compose up -d --build
```

## Performance Tuning

### Memory Limits

In `docker-compose.yml`:

```yaml
backend:
  deploy:
    resources:
      limits:
        memory: 512M
```

### Database Optimization

- Regular `npm run health-check`
- Monitor `events.db` size
- Archive old events if needed

## Backup & Recovery

### Backup Database

```bash
cp backend/events.db backend/events.db.backup
```

### Restore Database

```bash
cp backend/events.db.backup backend/events.db
docker-compose restart backend
```

## Security Hardening

✓ CORS properly configured
✓ JWT authentication ready
✓ Security headers set
✓ Gzip compression enabled
✓ No secrets in code

## Support

Refer to CI-CD-SETUP.md for detailed pipeline information.
