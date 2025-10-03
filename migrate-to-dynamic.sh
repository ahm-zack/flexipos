#!/bin/bash

# Dynamic Product Migration Script
# Purpose: Setup dynamic product schema and migrate existing data
# Usage: ./migrate-to-dynamic.sh

set -e  # Exit on any error

echo "🚀 Starting FlexiPOS Dynamic Product Migration..."
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}❌ Error: Must be run from the FlexiPOS project root directory${NC}"
    exit 1
fi

# Check if migration files exist
if [[ ! -f "migrations/create_dynamic_product_schema.sql" ]]; then
    echo -e "${RED}❌ Error: Schema migration file not found${NC}"
    exit 1
fi

if [[ ! -f "migrations/migrate_static_to_dynamic_data.sql" ]]; then
    echo -e "${RED}❌ Error: Data migration file not found${NC}"
    exit 1
fi

# Load environment variables
if [[ -f ".env.local" ]]; then
    echo -e "${BLUE}📄 Loading environment variables...${NC}"
    source .env.local
else
    echo -e "${YELLOW}⚠️  Warning: .env.local not found, using default database connection${NC}"
fi

# Set default database URL if not provided
DB_URL=${DATABASE_URL:-"postgresql://postgres:your-super-secret-and-long-postgres-password@localhost:54421/postgres"}

echo -e "${BLUE}🔗 Database URL: ${DB_URL}${NC}"

# Function to run SQL file
run_sql_file() {
    local file=$1
    local description=$2
    
    echo -e "${YELLOW}📝 Running ${description}...${NC}"
    
    if psql "$DB_URL" -f "$file"; then
        echo -e "${GREEN}✅ ${description} completed successfully${NC}"
    else
        echo -e "${RED}❌ ${description} failed${NC}"
        exit 1
    fi
}

# Test database connection
echo -e "${BLUE}🔍 Testing database connection...${NC}"
if psql "$DB_URL" -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo -e "${YELLOW}💡 Make sure your database is running and connection details are correct${NC}"
    exit 1
fi

# Backup existing data (optional)
echo -e "${BLUE}💾 Creating backup of existing data...${NC}"
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
if psql "$DB_URL" -c "\dt" | grep -E "(pizzas|burgers|appetizers)" > /dev/null 2>&1; then
    echo -e "${YELLOW}📦 Found existing product tables, creating backup...${NC}"
    pg_dump "$DB_URL" --data-only --table=pizzas --table=burgers --table=appetizers --table=beverages --table=sandwiches --table=shawermas --table=pies --table=mini_pies --table=side_orders > "$BACKUP_FILE" 2>/dev/null || true
    if [[ -f "$BACKUP_FILE" && -s "$BACKUP_FILE" ]]; then
        echo -e "${GREEN}✅ Backup created: ${BACKUP_FILE}${NC}"
    else
        echo -e "${YELLOW}⚠️  No data to backup or backup failed${NC}"
        rm -f "$BACKUP_FILE"
    fi
else
    echo -e "${YELLOW}ℹ️  No existing product tables found, skipping backup${NC}"
fi

# Run migrations
echo -e "${BLUE}🏗️  Running database migrations...${NC}"

# Step 1: Create dynamic schema
run_sql_file "migrations/create_dynamic_product_schema.sql" "Dynamic Product Schema Creation"

# Step 2: Migrate existing data
run_sql_file "migrations/migrate_static_to_dynamic_data.sql" "Data Migration from Static to Dynamic"

# Verify migration
echo -e "${BLUE}🔍 Verifying migration results...${NC}"

# Check if tables were created
TABLES_CREATED=$(psql "$DB_URL" -t -c "
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_name IN ('businesses', 'categories', 'menu_items', 'modifiers', 'modifier_options')
    AND table_schema = 'public'
")

if [[ $TABLES_CREATED -eq 5 ]]; then
    echo -e "${GREEN}✅ All required tables created successfully${NC}"
else
    echo -e "${RED}❌ Some tables are missing (found ${TABLES_CREATED}/5)${NC}"
    exit 1
fi

# Check data migration
MENU_ITEMS_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM menu_items")
CATEGORIES_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM categories")

echo -e "${GREEN}📊 Migration Summary:${NC}"
echo -e "${GREEN}   • Categories: ${CATEGORIES_COUNT}${NC}"
echo -e "${GREEN}   • Menu Items: ${MENU_ITEMS_COUNT}${NC}"

# Show sample data
echo -e "${BLUE}📋 Sample migrated data:${NC}"
psql "$DB_URL" -c "
    SELECT 
        c.name as category,
        COUNT(mi.id) as item_count,
        ROUND(AVG(mi.price), 2) as avg_price
    FROM categories c
    LEFT JOIN menu_items mi ON c.id = mi.category_id
    GROUP BY c.name, c.display_order
    ORDER BY c.display_order;
"

echo -e "${GREEN}🎉 Migration completed successfully!${NC}"
echo -e "${BLUE}📝 Next steps:${NC}"
echo -e "${BLUE}   1. Update your API endpoints to use the new menu_items table${NC}"
echo -e "${BLUE}   2. Test the new DynamicMenuPage component${NC}"
echo -e "${BLUE}   3. Update navigation to use dynamic categories${NC}"
echo -e "${BLUE}   4. Consider removing old static product tables after testing${NC}"
echo ""
echo -e "${YELLOW}⚠️  Remember to update your TypeScript types and API calls!${NC}"