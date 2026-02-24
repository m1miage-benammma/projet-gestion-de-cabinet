.PHONY: help \
        docker-up docker-down docker-rebuild \
        run-frontend run-backend \
        install-frontend install-backend \
        migrate test lint-backend analyse

# ─── Colors ──────────────────────────────────────────────────
CYAN  = \033[0;36m
RESET = \033[0m

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "$(CYAN)%-20s$(RESET) %s\n", $$1, $$2}'

# ─── Docker ──────────────────────────────────────────────────
docker-up: ## Start all containers (frontend + backend + db)
	docker compose up -d

docker-down: ## Stop all containers
	docker compose down

docker-rebuild: ## Rebuild and restart all containers
	docker compose up -d --build

docker-logs: ## Show backend container logs
	docker compose logs -f backend

# ─── Frontend ────────────────────────────────────────────────
install-frontend: ## Install frontend dependencies
	cd frontend && npm install

run-frontend: ## Start Angular dev server (port 4200)
	cd frontend && npm start

build-frontend: ## Build Angular for production
	cd frontend && npm run build

# ─── Backend ─────────────────────────────────────────────────
install-backend: ## Install backend PHP dependencies
	cd backend && composer install

run-backend: ## Start Laravel dev server (port 8000)
	cd backend && php artisan serve --port=8000

migrate: ## Run database migrations
	cd backend && php artisan migrate

migrate-fresh: ## Drop all tables and re-run migrations
	cd backend && php artisan migrate:fresh

# ─── Quality ─────────────────────────────────────────────────
test: ## Run all backend tests
	cd backend && ./vendor/bin/pest

lint-backend: ## Format PHP code with Pint
	cd backend && ./vendor/bin/pint

analyse: ## Run PHPStan static analysis
	cd backend && ./vendor/bin/phpstan analyse
