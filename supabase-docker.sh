#!/bin/bash
# FlexiPOS Supabase Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Check if Docker and Docker Compose are installed
check_dependencies() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
        exit 1
    fi
}

# Function to start Supabase
start_supabase() {
    echo -e "${BLUE}🚀 Starting FlexiPOS Supabase services...${NC}"
    
    # Use .env.docker for environment variables
    if [ -f ".env.docker" ]; then
        export $(cat .env.docker | grep -v '^#' | xargs)
    else
        echo -e "${YELLOW}⚠️  .env.docker file not found. Using default values.${NC}"
    fi
    
    # Start services
    if command -v docker-compose &> /dev/null; then
        docker-compose --env-file .env.docker up -d
    else
        docker compose --env-file .env.docker up -d
    fi
    
    echo -e "${GREEN}✅ Supabase services are starting up...${NC}"
    echo -e "${BLUE}📍 Service URLs:${NC}"
    echo -e "   API Gateway:  http://localhost:54321"
    echo -e "   PostgreSQL:   localhost:54322"
    echo -e "   Studio:       http://localhost:54323"
    echo -e "   Your App:     http://localhost:3000"
    
    # Wait for services to be ready
    echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
    wait_for_services
}

# Function to stop Supabase
stop_supabase() {
    echo -e "${YELLOW}🛑 Stopping FlexiPOS Supabase services...${NC}"
    
    if command -v docker-compose &> /dev/null; then
        docker-compose down
    else
        docker compose down
    fi
    
    echo -e "${GREEN}✅ Supabase services stopped.${NC}"
}

# Function to restart Supabase
restart_supabase() {
    echo -e "${BLUE}🔄 Restarting FlexiPOS Supabase services...${NC}"
    stop_supabase
    sleep 2
    start_supabase
}

# Function to check service status
status_supabase() {
    echo -e "${BLUE}📊 FlexiPOS Supabase Service Status:${NC}"
    
    if command -v docker-compose &> /dev/null; then
        docker-compose ps
    else
        docker compose ps
    fi
}

# Function to view logs
logs_supabase() {
    echo -e "${BLUE}📋 FlexiPOS Supabase Logs:${NC}"
    
    if [ -n "$1" ]; then
        # Show logs for specific service
        if command -v docker-compose &> /dev/null; then
            docker-compose logs -f "$1"
        else
            docker compose logs -f "$1"
        fi
    else
        # Show logs for all services
        if command -v docker-compose &> /dev/null; then
            docker-compose logs -f
        else
            docker compose logs -f
        fi
    fi
}

# Function to wait for services to be ready
wait_for_services() {
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:54321/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ API Gateway is ready!${NC}"
            break
        else
            echo -n "."
            sleep 2
            ((attempt++))
        fi
    done
    
    if [ $attempt -gt $max_attempts ]; then
        echo -e "${RED}❌ Services failed to start within expected time.${NC}"
        echo -e "${YELLOW}💡 Try checking the logs with: $0 logs${NC}"
    else
        echo -e "${GREEN}🎉 All services are ready!${NC}"
    fi
}

# Function to clean up (remove containers and volumes)
clean_supabase() {
    echo -e "${RED}🧹 Cleaning up FlexiPOS Supabase (this will remove all data!)${NC}"
    read -p "Are you sure? This will delete all database data. (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command -v docker-compose &> /dev/null; then
            docker-compose down -v --remove-orphans
        else
            docker compose down -v --remove-orphans
        fi
        
        # Remove named volumes
        docker volume rm flexipos_supabase_db_data 2>/dev/null || true
        docker volume rm flexipos_supabase_storage_data 2>/dev/null || true
        
        echo -e "${GREEN}✅ Cleanup completed.${NC}"
    else
        echo -e "${YELLOW}Cleanup cancelled.${NC}"
    fi
}

# Function to reset database
reset_db() {
    echo -e "${YELLOW}🔄 Resetting FlexiPOS database...${NC}"
    read -p "This will reset the database. Continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        stop_supabase
        docker volume rm flexipos_supabase_db_data 2>/dev/null || true
        start_supabase
        echo -e "${GREEN}✅ Database reset completed.${NC}"
    else
        echo -e "${YELLOW}Database reset cancelled.${NC}"
    fi
}

# Function to generate types
generate_types() {
    echo -e "${BLUE}🔧 Generating TypeScript types...${NC}"
    
    # Wait for API to be ready
    if ! curl -s http://localhost:54321/health > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  API not ready. Starting services first...${NC}"
        start_supabase
        wait_for_services
    fi
    
    # Generate types
    npm run gen:types
    echo -e "${GREEN}✅ Types generated successfully!${NC}"
}

# Function to show help
show_help() {
    echo -e "${BLUE}FlexiPOS Supabase Docker Management${NC}"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  start     Start Supabase services"
    echo "  stop      Stop Supabase services"
    echo "  restart   Restart Supabase services"
    echo "  status    Show service status"
    echo "  logs      Show service logs (add service name for specific logs)"
    echo "  clean     Clean up containers and volumes (removes all data!)"
    echo "  reset-db  Reset database only"
    echo "  types     Generate TypeScript types"
    echo "  help      Show this help message"
    echo
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs db"
    echo "  $0 types"
}

# Main script logic
check_dependencies

case "${1:-help}" in
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
        status_supabase
        ;;
    logs)
        logs_supabase "$2"
        ;;
    clean)
        clean_supabase
        ;;
    reset-db)
        reset_db
        ;;
    types)
        generate_types
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo
        show_help
        exit 1
        ;;
esac