# Bookstore API Makefile

# Build containers
build:
	@echo "Building containers..."
	docker-compose build

# Start services
up:
	@echo "Starting services..."
	docker-compose up -d
	@echo "Services started!"
	@echo "GraphQL Playground: http://localhost:3000/graphql"
	@echo "Adminer: http://localhost:8080"
	@echo ""
	@echo "Waiting for sample data initialization..."
	@sleep 5
	@docker-compose logs data-initializer

# Stop services
down:
	@echo "Stopping services..."
	docker-compose down

# Restart services
restart: down up

# Show logs
logs:
	docker-compose logs -f app

# Clean containers and volumes
clean:
	@echo "Cleaning containers and volumes..."
	docker-compose down -v
	docker system prune -f

# Full reset
reset: clean build up

# Manually initialize sample data
init-data:
	@echo "Manually initializing sample data..."
	docker-compose exec postgres psql -U bookstore_user -d bookstore_db -c "SELECT insert_sample_data();"

# Connect to database shell
db-shell:
	@echo "Connecting to database..."
	docker-compose exec postgres psql -U bookstore_user -d bookstore_db

# Run tests (placeholder)
test:
	@echo "Running tests..."
	docker-compose exec app npm test

# Open GraphQL playground
playground:
	@echo "Opening GraphQL Playground..."
	@echo "URL: http://localhost:3000/graphql"
	@if command -v open >/dev/null 2>&1; then \
		open http://localhost:3000/graphql; \
	elif command -v xdg-open >/dev/null 2>&1; then \
		xdg-open http://localhost:3000/graphql; \
	else \
		echo "Please open http://localhost:3000/graphql in your browser"; \
	fi

# Development helpers
install:
	@echo "Installing dependencies..."
	npm install

dev:
	@echo "Starting development server..."
	npm run start:dev