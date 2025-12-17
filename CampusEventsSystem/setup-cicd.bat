@echo off
REM CI/CD Setup Script for Campus Events System (Windows)

echo.
echo Setting up CI/CD for Campus Events System...
echo.

REM Check prerequisites
echo Checking prerequisites...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION%

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not installed
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION%

where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: git is not installed
    exit /b 1
)
echo [OK] git installed

REM Install backend dependencies
echo.
echo Installing backend dependencies...
cd backend
call npm install
call npm install --save-dev eslint jest prettier @types/jest
echo [OK] Dependencies installed
cd ..

REM Create .gitignore entries
echo.
echo Updating .gitignore...
(
echo.
echo # CI/CD
echo node_modules/
echo .env.local
echo .env.*.local
echo coverage/
echo dist/
echo build/
echo.
echo # Docker
echo docker-compose.override.yml
echo .dockerignore
echo.
echo # IDE
echo .vscode/
echo .idea/
echo *.swp
echo *.swo
echo *~
echo.
echo # Testing
echo .nyc_output/
echo *.lcov
echo.
echo # Logs
echo logs/
echo *.log
echo npm-debug.log*
) >> .gitignore
echo [OK] .gitignore updated

echo.
echo ===================================================
echo CI/CD Setup Complete!
echo ===================================================
echo.
echo Next Steps:
echo.
echo 1. Review the CI/CD configuration:
echo    - .github/workflows/ci.yml
echo    - .github/workflows/cd.yml
echo    - .github/workflows/code-quality.yml
echo.
echo 2. Test locally:
echo    cd backend ^&^& npm test
echo    npm run lint
echo.
echo 3. Commit and push to GitHub:
echo    git add .
echo    git commit -m "Setup CI/CD pipeline"
echo    git push
echo.
echo 4. Monitor workflows at GitHub Actions
echo.
echo 5. Deploy with Docker:
echo    docker-compose up -d
echo.
