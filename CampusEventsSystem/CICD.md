# Campus Events System - CI/CD Infrastructure

This directory contains all CI/CD pipeline configurations for the Campus Events System.

## Files Overview

### Workflows (`.github/workflows/`)

1. **ci.yml** - Continuous Integration Pipeline
   - Runs on: push, pull_request
   - Tests on Node 16.x, 18.x
   - ESLint, Jest tests, Security scans
   
2. **cd.yml** - Continuous Deployment Pipeline
   - Runs on: push to main branch
   - Creates deployment artifacts
   - Health checks
   
3. **code-quality.yml** - Code Quality Checks
   - Dead code analysis
   - SonarQube integration (optional)
   - File permissions check

### Configuration Files

- **.eslintrc.json** - ESLint configuration
- **.prettierrc** - Prettier code formatter
- **jest.config.js** - Jest test configuration
- **Dockerfile** (backend) - Backend container image
- **Dockerfile** (frontend) - Frontend container image
- **docker-compose.yml** - Multi-container orchestration
- **.dockerignore** - Docker build excludes

### Scripts

- **setup-cicd.sh** - Setup script for Linux/macOS
- **setup-cicd.bat** - Setup script for Windows

### Tests

- **backend/__tests__/** - Jest test suites

### Documentation

- **docs/CI-CD-SETUP.md** - Complete pipeline documentation
- **docs/DEPLOYMENT.md** - Deployment guide

## Quick Start

```bash
# Windows
setup-cicd.bat

# Linux/macOS
bash setup-cicd.sh

# Manual setup
cd backend
npm install
npm run lint
npm test
```

## Features

✓ Automated testing on multiple Node versions
✓ Code quality checks with ESLint
✓ Security vulnerability scanning
✓ Docker containerization
✓ Multi-stage Docker builds
✓ Health checks for all services
✓ Gzip compression configured
✓ Security headers configured
✓ Database persistence
✓ Automatic deployment artifacts

## Pipeline Status

Check GitHub Actions tab for:
- Workflow runs
- Test results
- Build status
- Deployment logs

For detailed information, see `docs/CI-CD-SETUP.md`.
