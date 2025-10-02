#!/bin/bash

# FlexiPOS Dynamic Database Management Script
# This script helps manage the dynamic POS development database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
}

# Function to start dynamic database
start_dynamic() {
    print_status "Starting FlexiPOS Dynamic Database..."
    check_docker
    
    if [ ! -f .env.dynamic.local ]; then
        print_warning ".env.dynamic.local not found. Creating from template..."
        cp .env.dynamic.example .env.dynamic.local
    fi
    
    docker compose --env-file .env.dynamic.local -f docker-compose.dynamic.yml up -d
    
    print_success "Dynamic database started successfully!"
    print_status "Access points:"
    echo "  - API: http://localhost:54423"
    echo "  - Studio: http://localhost:54425"
    echo "  - Database: postgresql://postgres:postgres@localhost:54424/postgres"
}

# Function to stop dynamic database
stop_dynamic() {
    print_status "Stopping FlexiPOS Dynamic Database..."
    docker compose -f docker-compose.dynamic.yml down
    print_success "Dynamic database stopped successfully!"
}

# Function to reset dynamic database
reset_dynamic() {
    print_warning "This will destroy all data in the dynamic database!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Resetting FlexiPOS Dynamic Database..."
        docker compose -f docker-compose.dynamic.yml down -v
        docker volume rm flexipos_dynamic_db_data flexipos_dynamic_storage_data 2>/dev/null || true
        print_success "Dynamic database reset successfully!"
        print_status "You can now run 'start' to create a fresh database."
    else
        print_status "Reset cancelled."
    fi
}

# Function to show logs
logs_dynamic() {
    docker compose -f docker-compose.dynamic.yml logs -f
}

# Function to show status
status_dynamic() {
    print_status "FlexiPOS Dynamic Database Status:"
    docker compose -f docker-compose.dynamic.yml ps
}

# Function to run migrations
migrate_dynamic() {
    print_status "Running migrations on dynamic database..."
    
    # Wait for database to be ready
    echo "Waiting for database to be ready..."
    until docker exec flexipos_dynamic_db pg_isready -U postgres > /dev/null 2>&1; do
        sleep 1
    done
    
    # Run the migration file
    if [ -f "supabase/migrations/20251002000001_create_business_infrastructure.sql" ]; then
        print_status "Running business infrastructure migration..."
        docker exec -i flexipos_dynamic_db psql -U postgres -d postgres < supabase/migrations/20251002000001_create_business_infrastructure.sql
        print_success "Migration completed successfully!"
    else
        print_error "Migration file not found!"
        exit 1
    fi
}

# Function to show connection info
info_dynamic() {
    print_status "FlexiPOS Dynamic Database Connection Info:"
    echo
    echo "🔗 Connection Details:"
    echo "  Database URL: postgresql://postgres:postgres@localhost:54424/postgres"
    echo "  API URL: http://localhost:54423"
    echo "  Studio URL: http://localhost:54425"
    echo
    echo "🔑 Authentication:"
    echo "  Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
    echo
    echo "📝 Environment Variables for your app:"
    echo "  NEXT_PUBLIC_SUPABASE_URL=http://localhost:54423"
    echo "  DATABASE_URL=postgresql://postgres:postgres@localhost:54424/postgres"
}

# Main script logic
case "$1" in
    start)
        start_dynamic
        ;;
    stop)
        stop_dynamic
        ;;
    restart)
        stop_dynamic
        start_dynamic
        ;;
    reset)
        reset_dynamic
        ;;
    logs)
        logs_dynamic
        ;;
    status)
        status_dynamic
        ;;
    migrate)
        migrate_dynamic
        ;;
    info)
        info_dynamic
        ;;
    *)
        echo "FlexiPOS Dynamic Database Management"
        echo
        echo "Usage: $0 {start|stop|restart|reset|logs|status|migrate|info}"
        echo
        echo "Commands:"
        echo "  start    - Start the dynamic database"
        echo "  stop     - Stop the dynamic database"
        echo "  restart  - Restart the dynamic database"
        echo "  reset    - Reset the dynamic database (destroys all data)"
        echo "  logs     - Show database logs"
        echo "  status   - Show database status"
        echo "  migrate  - Run database migrations"
        echo "  info     - Show connection information"
        echo
        exit 1
        ;;
esac