#!/bin/bash
echo "🔄 Applying database migrations..."

# Set the database URL
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# Apply migrations using drizzle-kit
npx drizzle-kit push --verbose

echo "✅ Migrations applied successfully!"
echo ""
echo "Now you can try signing up again."
