#!/bin/bash
# Dynamic FlexiPOS Database Management Script

# Database connection settings
DB_HOST="127.0.0.1"
DB_PORT="54422" 
DB_NAME="postgres"
DB_USER="postgres"
DB_PASS="postgres"

echo "🚀 FlexiPOS Dynamic Database Manager"
echo "===================================="
echo ""

# Function to run SQL query
run_query() {
    local query="$1"
    PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$query"
}

# Function to show database status
show_status() {
    echo "📊 Database Status:"
    echo "-------------------"
    echo "🌐 Database URL: postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"
    echo "🎨 Studio URL: http://127.0.0.1:54425"
    echo "🔌 API URL: http://127.0.0.1:54421"
    echo ""
    
    echo "📋 Business Infrastructure Tables:"
    echo "-----------------------------------"
    run_query "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('businesses', 'categories', 'menu_items', 'modifiers', 'modifier_options', 'business_users', 'menu_item_modifiers') ORDER BY table_name;"
    echo ""
    
    echo "🏢 Current Businesses:"
    echo "---------------------"
    run_query "SELECT name, type, description FROM businesses;"
    echo ""
    
    echo "📂 Categories Count by Business:"
    echo "-------------------------------"
    run_query "SELECT b.name as business_name, COUNT(c.id) as category_count FROM businesses b LEFT JOIN categories c ON b.id = c.business_id GROUP BY b.id, b.name;"
    echo ""
    
    echo "🍽️ Menu Items Count by Business:"
    echo "--------------------------------"
    run_query "SELECT b.name as business_name, COUNT(m.id) as menu_items_count FROM businesses b LEFT JOIN menu_items m ON b.id = m.business_id GROUP BY b.id, b.name;"
}

# Function to show help
show_help() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status    - Show database status and current data"
    echo "  connect   - Show connection information"
    echo "  studio    - Open Supabase Studio in browser"
    echo "  help      - Show this help message"
    echo ""
    echo "No command will default to showing status."
}

# Function to show connection info
show_connect() {
    echo "🔗 Connection Information:"
    echo "-------------------------"
    echo "Database URL: postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"
    echo "API URL: http://127.0.0.1:54421"
    echo "Studio URL: http://127.0.0.1:54425"
    echo "GraphQL URL: http://127.0.0.1:54421/graphql/v1"
    echo "Storage URL: http://127.0.0.1:54421/storage/v1/s3"
    echo ""
    echo "Keys:"
    echo "Publishable key: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
    echo "Secret key: REDACTED_ROTATE_THIS_KEY"
}

# Function to open studio
open_studio() {
    echo "🎨 Opening Supabase Studio..."
    if command -v xdg-open > /dev/null; then
        xdg-open "http://127.0.0.1:54425"
    elif command -v open > /dev/null; then
        open "http://127.0.0.1:54425"
    else
        echo "Please open http://127.0.0.1:54425 in your browser"
    fi
}

# Main script logic
case "${1:-status}" in
    "status")
        show_status
        ;;
    "connect")
        show_connect
        ;;
    "studio")
        open_studio
        ;;
    "help")
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        show_help
        exit 1
        ;;
esac