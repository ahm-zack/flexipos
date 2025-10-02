#!/bin/bash

# FlexiPOS Dynamic Supabase Management Script
# Uses official Supabase CLI in Docker for better reliability

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

# Supabase CLI command
run_supabase() {
    ~/.local/bin/supabase "$@"
}

# Function to start Supabase development environment
start_supabase() {
    print_status "Starting FlexiPOS Dynamic Supabase..."
    
    # Check if config exists
    if [ ! -f "supabase-dynamic/config.toml" ]; then
        print_error "Supabase config not found. Please run 'init' first."
        exit 1
    fi
    
    cd supabase-dynamic
    print_status "Starting Supabase services..."
    run_supabase start
    print_success "Supabase started successfully!"
    print_status "Access points:"
    echo "  - API URL: http://localhost:54321"
    echo "  - Studio: http://localhost:54323"
    echo "  - Database: postgresql://postgres:postgres@localhost:54322/postgres"
}

# Function to stop Supabase
stop_supabase() {
    print_status "Stopping FlexiPOS Dynamic Supabase..."
    cd supabase-dynamic
    run_supabase stop
    print_success "Supabase stopped successfully!"
}

# Function to reset Supabase
reset_supabase() {
    print_warning "This will destroy all data in the dynamic database!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Resetting FlexiPOS Dynamic Supabase..."
        cd supabase-dynamic
        run_supabase stop
        run_supabase db reset
        print_success "Supabase reset successfully!"
    else
        print_status "Reset cancelled."
    fi
}

# Function to show status
status_supabase() {
    print_status "FlexiPOS Dynamic Supabase Status:"
    cd supabase-dynamic
    run_supabase supabase status
}

# Function to show logs
logs_supabase() {
    print_status "FlexiPOS Dynamic Supabase Logs:"
    cd supabase-dynamic
    run_supabase logs
}

# Function to run migrations
migrate_supabase() {
    print_status "Running migrations on dynamic Supabase..."
    cd supabase-dynamic
    run_supabase supabase db reset
    print_success "Migrations completed successfully!"
}

# Function to generate types
generate_types() {
    print_status "Generating TypeScript types..."
    cd supabase-dynamic
    run_supabase supabase gen types typescript --local > ../lib/database-dynamic.types.ts
    print_success "Types generated successfully at lib/database-dynamic.types.ts"
}

# Function to open Studio
studio() {
    print_status "Opening Supabase Studio..."
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:54323
    elif command -v open > /dev/null; then
        open http://localhost:54323
    else
        print_status "Please open http://localhost:54323 in your browser"
    fi
}

# Function to show connection info
info_supabase() {
    print_status "FlexiPOS Dynamic Supabase Connection Info:"
    echo
    echo "🔗 Connection Details:"
    echo "  API URL: http://localhost:54321"
    echo "  Studio URL: http://localhost:54323"
    echo "  Database URL: postgresql://postgres:postgres@localhost:54322/postgres"
    echo
    echo "🔑 Authentication Keys:"
    cd supabase-dynamic
    run_supabase supabase status | grep -E "(anon key|service_role key)"
    echo
    echo "📝 Environment Variables for your app:"
    echo "  NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321"
    echo "  DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres"
}

# Function to run SQL command
sql() {
    if [ -z "$1" ]; then
        print_error "Please provide SQL command. Usage: $0 sql \"SELECT * FROM businesses;\""
        exit 1
    fi
    
    print_status "Executing SQL: $1"
    cd supabase-dynamic
    run_supabase supabase db shell --command "$1"
}

# Main script logic
case "$1" in
    start)
        start_supabase
        ;;
    stop)
        stop_supabase
        ;;
    restart)
        stop_supabase
        start_supabase
        ;;
    reset)
        reset_supabase
        ;;
    status)
        status_supabase
        ;;
    logs)
        logs_supabase
        ;;
    migrate)
        migrate_supabase
        ;;
    types)
        generate_types
        ;;
    studio)
        studio
        ;;
    info)
        info_supabase
        ;;
    sql)
        sql "$2"
        ;;
    *)
        echo "FlexiPOS Dynamic Supabase Management"
        echo
        echo "Usage: $0 {start|stop|restart|reset|status|logs|migrate|types|studio|info|sql}"
        echo
        echo "Commands:"
        echo "  start    - Start Supabase development environment"
        echo "  stop     - Stop Supabase development environment"
        echo "  restart  - Restart Supabase development environment"
        echo "  reset    - Reset the database (destroys all data)"
        echo "  status   - Show Supabase services status"
        echo "  logs     - Show Supabase logs"
        echo "  migrate  - Run database migrations"
        echo "  types    - Generate TypeScript types"
        echo "  studio   - Open Supabase Studio in browser"
        echo "  info     - Show connection information"
        echo "  sql      - Run SQL command (e.g., sql \"SELECT * FROM users;\")"
        echo
        exit 1
        ;;
esac