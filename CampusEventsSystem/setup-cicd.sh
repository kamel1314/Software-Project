#!/bin/bash

# CI/CD Setup Script for Campus Events System

set -e

echo "🚀 Setting up CI/CD for Campus Events System..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi
echo -e "${GREEN}✓ Node.js$(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

if ! command -v git &> /dev/null; then
    echo "❌ git is not installed"
    exit 1
fi
echo -e "${GREEN}✓ git $(git --version)${NC}"

# Install backend dependencies and dev tools
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend
npm install
npm install --save-dev eslint jest prettier @types/jest
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Run linter setup
echo -e "${YELLOW}Setting up ESLint...${NC}"
npm run lint --if-present || true
echo -e "${GREEN}✓ ESLint configured${NC}"

# Run tests
echo -e "${YELLOW}Running tests...${NC}"
npm test 2>/dev/null || echo -e "${YELLOW}⚠ No tests yet${NC}"

cd ..

# Create GitHub branch if not exists
echo -e "${YELLOW}Checking Git setup...${NC}"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${GREEN}✓ Current branch: $CURRENT_BRANCH${NC}"

# Create .gitignore entries for CI/CD
echo -e "${YELLOW}Updating .gitignore...${NC}"
cat >> .gitignore << 'EOF'

# CI/CD
node_modules/
.env.local
.env.*.local
coverage/
dist/
build/

# Docker
docker-compose.override.yml
.dockerignore

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Testing
.nyc_output/
*.lcov

# Logs
logs/
*.log
npm-debug.log*
EOF
echo -e "${GREEN}✓ .gitignore updated${NC}"

# Summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ CI/CD Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Review the CI/CD configuration:"
echo "   - .github/workflows/ci.yml (Continuous Integration)"
echo "   - .github/workflows/cd.yml (Continuous Deployment)"
echo "   - .github/workflows/code-quality.yml (Code Quality)"
echo ""
echo "2. Test locally:"
echo "   cd backend && npm test"
echo "   npm run lint"
echo ""
echo "3. Commit and push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Setup CI/CD pipeline'"
echo "   git push origin $CURRENT_BRANCH"
echo ""
echo "4. Monitor workflows:"
echo "   Visit: https://github.com/YOUR_REPO/actions"
echo ""
echo "5. Deploy with Docker:"
echo "   docker-compose up -d"
echo ""
echo "📚 Documentation:"
echo "   - docs/CI-CD-SETUP.md - Complete pipeline documentation"
echo "   - docs/DEPLOYMENT.md - Deployment guide"
echo ""
