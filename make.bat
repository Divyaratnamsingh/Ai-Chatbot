@echo off
rem ==============================================================================
rem 🧠 MindWell AI Chatbot - Windows Make Simulator (Repo Root)
rem ==============================================================================

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="install" goto install
if "%1"=="dev" goto dev
if "%1"=="dev-backend" goto dev-backend
if "%1"=="dev-frontend" goto dev-frontend
if "%1"=="build" goto build
if "%1"=="start" goto start
if "%1"=="start-backend" goto start-backend
if "%1"=="start-frontend" goto start-frontend
if "%1"=="test" goto test
if "%1"=="clean" goto clean

echo Unknown command: %1
goto help

:help
echo ======================================================================
echo 🧠 MindWell AI Chatbot - Windows Make Simulator (make.bat)
echo ======================================================================
echo Available commands:
echo   make install         Install dependencies for both backend and frontend
echo   make dev             Run both backend and frontend in development mode
echo   make dev-backend     Run backend in development mode
echo   make dev-frontend    Run frontend in development mode
echo   make build           Build the frontend production bundle
echo   make start           Run both backend and frontend in production/preview mode
echo   make start-backend   Start the backend server
echo   make start-frontend  Preview the built frontend app
echo   make test            Run backend test suite
echo   make clean           Remove node_modules and build artifacts
echo ======================================================================
goto end

:install
echo 📦 Installing backend dependencies...
cd backend && npm install
cd ..
echo 📦 Installing frontend dependencies...
cd frontend && npm install
cd ..
goto end

:dev-backend
cd backend && npm run dev
cd ..
goto end

:dev-frontend
cd frontend && npm run dev
cd ..
goto end

:dev
echo 🚀 Starting backend and frontend in development mode...
start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm run dev"
goto end

:build
echo 🛠️ Building the frontend production bundle...
cd frontend && npm run build
cd ..
goto end

:start-backend
cd backend && npm start
cd ..
goto end

:start-frontend
cd frontend && npm run preview
cd ..
goto end

:start
echo 🚀 Starting backend and frontend in production/preview mode...
start cmd /k "cd backend && npm start"
start cmd /k "cd frontend && npm run preview"
goto end

:test
cd backend && npm run test
cd ..
goto end

:clean
echo 🧹 Cleaning node_modules and build artifacts...
if exist backend\node_modules rmdir /s /q backend\node_modules
if exist frontend\node_modules rmdir /s /q frontend\node_modules
if exist frontend\dist rmdir /s /q frontend\dist
goto end

:end
