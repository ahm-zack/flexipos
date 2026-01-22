#!/bin/bash

# FlexiPOS Supabase Development Helper
# This script helps manage your Supabase development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Set correct Docker socket
export DOCKER_HOST=unix:///var/run/docker.sock

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

# Function to check if Supabase is running
check_supabase_status() {
    if docker ps --format "{{.Names}}" | grep -q "supabase.*flexipos"; then
        return 0
    else
        return 1
    fi
}

# Function to start Supabase
start_supabase() {
    print_status "Starting FlexiPOS Supabase development environment..."
    
    if check_supabase_status; then
        print_warning "Supabase is already running!"
        show_status
        return 0
    fi
    
    cd supabase
    export DOCKER_HOST=unix:///var/run/docker.sock
    supabase start
    print_success "FlexiPOS Supabase started successfully!"
    show_connection_info
}

# Function to stop Supabase
stop_supabase() {
    print_status "Stopping Supabase development environment..."
    
    if ! check_supabase_status; then
        print_warning "Supabase is not running!"
        return 0
    fi
    
    cd supabase
    supabase stop
    print_success "Supabase stopped successfully!"
}

# Function to restart Supabase
restart_supabase() {
    print_status "Restarting Supabase development environment..."
    stop_supabase
    sleep 2
    start_supabase
}

# Function to show status
show_status() {
    print_status "Supabase Development Environment Status:"
    echo
    
    if check_supabase_status; then
        print_success "✅ Supabase is running"
        echo
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(NAMES|supabase.*flexipos)"
    else
        print_error "❌ Supabase is not running"
        echo "Run '$0 start' to start the development environment"
    fi
}

# Function to show connection info
show_connection_info() {
    print_status "🔗 Connection Information:"
    echo
    echo "  📊 Supabase Studio:  http://localhost:54323"
    echo "  🌐 API Gateway:      http://localhost:54321"
    echo "  🗄️  Database:         postgresql://postgres:postgres@localhost:54322/postgres"
    echo "  📧 Email Testing:    http://localhost:54324"
    echo
    echo "  🔑 Development Keys:"
    echo "     ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
    echo
    echo "  📝 Environment Variables for .env.local:"
    echo "     NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321"
    echo "     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
    echo "     DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres"
}

# Function to open Studio
open_studio() {
    if ! check_supabase_status; then
        print_error "Supabase is not running. Start it first with '$0 start'"
        return 1
    fi
    
    print_status "Opening Supabase Studio..."
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:54323
    elif command -v open > /dev/null; then
        open http://localhost:54323
    else
        print_status "Please open http://localhost:54323 in your browser"
    fi
}

# Function to reset database
reset_database() {
    print_warning "This will reset the database and remove all data!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Resetting database..."
        cd supabase
        supabase db reset
        print_success "Database reset successfully!"
    else
        print_status "Reset cancelled."
    fi
}

# Function to run migrations
run_migrations() {
    if ! check_supabase_status; then
        print_error "Supabase is not running. Start it first with '$0 start'"
        return 1
    fi
    
    print_status "Running database migrations..."
    cd supabase
    supabase db reset
    print_success "Migrations completed successfully!"
}

# Function to generate types
generate_types() {
    if ! check_supabase_status; then
        print_error "Supabase is not running. Start it first with '$0 start'"
        return 1
    fi
    
    print_status "Generating TypeScript types..."
    cd supabase
    export DOCKER_HOST=unix:///var/run/docker.sock
    supabase gen types typescript --local > ../database.types.ts
    print_success "Types generated at database.types.ts"
}

# Function to show logs
show_logs() {
    if ! check_supabase_status; then
        print_error "Supabase is not running."
        return 1
    fi
    
    if [ -n "$1" ]; then
        print_status "Showing logs for $1..."
        docker logs -f "supabase_${1}_flexipos" 2>/dev/null || {
            print_error "Service '$1' not found. Available services:"
            docker ps --format "{{.Names}}" | grep "supabase.*flexipos" | sed 's/supabase_\(.*\)_flexipos/  - \1/'
        }
    else
        print_status "Available services for logs:"
        docker ps --format "{{.Names}}" | grep "supabase.*flexipos" | sed 's/supabase_\(.*\)_flexipos/  - \1/'
        echo
        echo "Usage: $0 logs <service_name>"
        echo "Example: $0 logs db"
    fi
}

# Main script logic
case "${1:-status}" in
    start)
        start_supabase
        ;;
    stop)
        stop_supabase
        ;;
    restart)
        restart_supabase
        ;;
    status)
        show_status
        ;;
    info)
        show_connection_info
        ;;
    studio)
        open_studio
        ;;
    reset)
        reset_database
        ;;
    migrate)
        run_migrations
        ;;
    types)
        generate_types
        ;;
    logs)
        show_logs "$2"
        ;;
    *)
        echo "FlexiPOS Supabase Development Helper"
        echo
        echo "Usage: $0 {start|stop|restart|status|info|studio|reset|migrate|types|logs}"
        echo
        echo "Commands:"
        echo "  start    - Start Supabase development environment"
        echo "  stop     - Stop Supabase development environment"
        echo "  restart  - Restart Supabase development environment"
        echo "  status   - Show current status"
        echo "  info     - Show connection information"
        echo "  studio   - Open Supabase Studio in browser"
        echo "  reset    - Reset database (removes all data)"
        echo "  migrate  - Run database migrations"
        echo "  types    - Generate TypeScript types"
        echo "  logs     - Show logs for a service (e.g., logs db)"
        echo
        exit 1
        ;;
esac