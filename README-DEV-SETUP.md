# FlexiPOS - Local Development Setup

This is a copy of your FlexiPOS application configured for local development with Docker Supabase.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ and npm
- A local Supabase instance running in Docker

### 1. Setup Local Supabase (Docker)

Make sure your local Supabase Docker container is running with the correct port mappings:

```bash
# If using docker-compose or similar, ensure these ports are mapped:
# - 54321:8000 (API Gateway)
# - 54322:5432 (PostgreSQL)
# - 54323:3000 (Studio - optional)
```

Or if you have Supabase CLI installed:

```bash
supabase start
```

### 2. Environment Configuration

The `.env.local` file is already configured for local development:

```bash
# These are already set in .env.local for local development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

### 3. Install and Start Development

```bash
# Install dependencies (already done)
npm install

# Generate TypeScript types from local Supabase
npm run gen:types

# Start development server
npm run dev
```

Or use the setup script:

```bash
./setup-dev.sh
```

### 4. Access Your Application

- **Application**: http://localhost:3000
- **Local Supabase Studio**: http://localhost:54323 (if available)
- **Local Supabase API**: http://localhost:54321

## 🔧 Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run gen:types    # Generate TypeScript types from Supabase
npm run lint         # Run ESLint
```

## 📁 Project Structure

This FlexiPOS app uses:

- **Next.js 15** - React framework
- **Supabase** - Authentication and some database operations
- **Drizzle ORM** - Main database ORM with PostgreSQL
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## 🔄 Database Management

### Drizzle Operations

```bash
# Generate migrations (if you modify schema)
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Open Drizzle Studio
npx drizzle-kit studio
```

### Supabase Operations

```bash
# Generate TypeScript types
npm run gen:types

# Reset local database (if needed)
supabase db reset --local
```

## ⚠️ Important Notes

1. **Copied App**: This is a copy from another app, so be careful about:

   - Environment variables that might reference the original app
   - Database schemas that might need adjustment
   - API endpoints that might need updating

2. **Local vs Production**:

   - Local uses Docker Supabase (localhost:54321, localhost:54322)
   - Make sure to use different environment variables for production

3. **Port Conflicts**:
   - Ensure no other services are using ports 54321, 54322
   - Check if your original app is also running locally

## 🐛 Troubleshooting

### Common Issues

1. **Connection refused to localhost:54321**

   - Check if Docker Supabase is running
   - Verify port mappings are correct

2. **Database connection errors**

   - Ensure DATABASE_URL points to localhost:54322
   - Check PostgreSQL is accessible in Docker

3. **Type errors**

   - Run `npm run gen:types` to regenerate types
   - Ensure TypeScript dependencies are installed

4. **Port already in use**
   - Stop your original app if it's running
   - Change ports in next.config.ts if needed

### Debug Commands

```bash
# Check if Supabase is running
curl http://localhost:54321/health

# Check database connection
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT version();"

# Check what's running on ports
netstat -tlnp | grep -E "(3000|54321|54322)"
```

## 📝 Next Steps

1. **Database Schema**: Review and migrate your database schema if needed
2. **Environment Variables**: Copy any additional env vars from your original app
3. **Custom Configuration**: Update any app-specific settings
4. **Testing**: Test all features to ensure they work with local Supabase

Happy coding! 🎉
