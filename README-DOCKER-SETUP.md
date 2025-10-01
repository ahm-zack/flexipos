# FlexiPOS - Docker Supabase Setup

This guide helps you set up FlexiPOS with a complete Supabase instance running in Docker containers.

## 🐳 What's Included

This Docker setup provides:

- **PostgreSQL 17** - Main database
- **Supabase Auth** - Authentication service
- **PostgREST** - Auto-generated REST API
- **Realtime** - Real-time subscriptions
- **Storage** - File storage with image transformations
- **Kong** - API Gateway
- **Supabase Studio** - Database management UI

## 🚀 Quick Start

### 1. Start Everything

```bash
# Quick start with auto-setup
./start-dev.sh

# Or manually start services
./supabase-docker.sh start
```

### 2. Access Your Services

- **FlexiPOS App**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323
- **API Gateway**: http://localhost:54321
- **Direct PostgreSQL**: localhost:54322

### 3. Stop Services

```bash
./supabase-docker.sh stop
```

## 📋 Available Commands

```bash
# Service Management
./supabase-docker.sh start      # Start all services
./supabase-docker.sh stop       # Stop all services
./supabase-docker.sh restart    # Restart all services
./supabase-docker.sh status     # Check service status

# Logs & Debugging
./supabase-docker.sh logs       # Show all logs
./supabase-docker.sh logs db    # Show database logs only
./supabase-docker.sh logs auth  # Show auth service logs

# Database Management
./supabase-docker.sh reset-db   # Reset database only
./supabase-docker.sh clean      # Remove everything (including data!)
./supabase-docker.sh types      # Generate TypeScript types

# Development
./start-dev.sh                  # Quick development startup
```

## 🔧 Configuration

### Environment Variables

The setup uses `.env.docker` for container configuration:

```bash
# Database
POSTGRES_PASSWORD=postgres

# API URLs
API_EXTERNAL_URL=http://localhost:54321
SITE_URL=http://localhost:3000

# JWT (using development keys)
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Your App Environment

Your `.env.local` is configured to connect to the Docker services:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

## 🗂️ File Structure

```
📁 FlexiPOS/
├── docker-compose.yml          # Main Docker configuration
├── .env.docker                 # Docker environment variables
├── supabase-docker.sh          # Management script
├── start-dev.sh                # Quick development startup
├── 📁 docker/
│   ├── 📁 kong/
│   │   └── kong.yml            # API Gateway configuration
│   └── 📁 postgres/
│       └── 📁 init/
│           ├── 01-init-supabase.sql    # Supabase setup
│           └── 02-app-schema.sql       # Your app schema
└── 📁 [rest of your app]
```

## 🔄 Database Management

### Using Drizzle (Recommended)

```bash
# Generate migration
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Open Drizzle Studio
npx drizzle-kit studio
```

### Using Supabase Studio

1. Open http://localhost:54323
2. Use the visual interface to manage your database
3. Run SQL queries, manage tables, etc.

### Direct PostgreSQL Access

```bash
# Connect with psql
psql postgresql://postgres:postgres@localhost:54322/postgres

# Or connect from another container
docker exec -it flexipos_supabase_db psql -U postgres -d postgres
```

## 🛠️ Development Workflow

### Daily Development

```bash
# Start your day
./start-dev.sh

# Your app runs on http://localhost:3000
# Studio available at http://localhost:54323

# When done
./supabase-docker.sh stop
```

### Database Changes

```bash
# 1. Update your Drizzle schema
# 2. Generate migration
npx drizzle-kit generate

# 3. Apply migration
npx drizzle-kit migrate

# 4. Update types
./supabase-docker.sh types
```

### Fresh Start

```bash
# Reset just the database
./supabase-docker.sh reset-db

# Or clean everything (removes all data!)
./supabase-docker.sh clean
./supabase-docker.sh start
```

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check what's using the ports
netstat -tlnp | grep -E "(54321|54322|54323)"

# View detailed logs
./supabase-docker.sh logs

# Check service status
./supabase-docker.sh status
```

### Database Connection Issues

```bash
# Test database connection
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT version();"

# Check database logs
./supabase-docker.sh logs db
```

### API Not Responding

```bash
# Test API health
curl http://localhost:54321/health

# Check Kong logs
./supabase-docker.sh logs kong

# Check auth service
./supabase-docker.sh logs auth
```

### Clean Slate

```bash
# Nuclear option - removes everything
./supabase-docker.sh clean
docker system prune -f
./supabase-docker.sh start
```

## 🔐 Security Notes

### Development Keys

The setup uses standard Supabase development JWT keys. These are:

- **Safe for local development**
- **NOT for production use**
- **Widely known in the community**

### Production Setup

For production:

1. Generate new JWT keys
2. Update `.env.docker` with your keys
3. Use proper secrets management
4. Configure SSL/TLS termination

## 📊 Service Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │ Supabase Studio │
│  localhost:3000 │    │ localhost:54323 │
└─────────┬───────┘    └─────────────────┘
          │                       │
          └───────────┬───────────┘
                      │
              ┌───────▼────────┐
              │  Kong Gateway  │
              │ localhost:54321│
              └───────┬────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────▼───┐  ┌─────▼──┐  ┌───────▼────┐
   │  Auth  │  │  REST  │  │  Realtime  │
   │ :9999  │  │ :3000  │  │   :4000    │
   └────────┘  └────────┘  └────────────┘
                      │
              ┌───────▼────────┐
              │  PostgreSQL    │
              │ localhost:54322│
              └────────────────┘
```

## 🎯 Next Steps

1. **Start the services**: `./start-dev.sh`
2. **Set up your schema**: Use Drizzle migrations or Supabase Studio
3. **Generate types**: `./supabase-docker.sh types`
4. **Build your app**: Everything is ready!

Happy coding! 🎉
