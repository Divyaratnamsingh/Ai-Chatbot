# ==============================================================================
# 🧠 MindWell AI Chatbot - Makefile
# ==============================================================================

.DEFAULT_GOAL := help

.PHONY: help
help:
	@echo ======================================================================
	@echo 🧠 MindWell AI Chatbot - Makefile
	@echo ======================================================================
	@echo Available commands:
	@echo   make install         Install dependencies for both backend and frontend
	@echo   make dev             Run both backend and frontend in development mode
	@echo   make dev-backend     Run backend in development mode
	@echo   make dev-frontend    Run frontend in development mode
	@echo   make build           Build the frontend production bundle
	@echo   make start           Run both backend and frontend in production/preview mode
	@echo   make start-backend   Start the backend server
	@echo   make start-frontend  Preview the built frontend app
	@echo   make clean           Remove node_modules and build artifacts
	@echo ======================================================================

.PHONY: install
install:
	@echo 📦 Installing backend dependencies...
	cd backend && npm install
	@echo 📦 Installing frontend dependencies...
	cd frontend && npm install

.PHONY: dev-backend
dev-backend:
	cd backend && npm run dev

.PHONY: dev-frontend
dev-frontend:
	cd frontend && npm run dev

.PHONY: dev
dev:
	@echo 🚀 Starting backend and frontend in development mode...
	$(MAKE) -j 2 dev-backend dev-frontend

.PHONY: build
build:
	@echo 🛠️ Building the frontend production bundle...
	cd frontend && npm run build

.PHONY: start-backend
start-backend:
	cd backend && npm start

.PHONY: start-frontend
start-frontend:
	cd frontend && npm run preview

.PHONY: start
start:
	@echo 🚀 Starting backend and frontend in production/preview mode...
	$(MAKE) -j 2 start-backend start-frontend

.PHONY: clean
clean:
	@echo 🧹 Cleaning node_modules and build artifacts...
	rm -rf backend/node_modules
	rm -rf frontend/node_modules
	rm -rf frontend/dist
