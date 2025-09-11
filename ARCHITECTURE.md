# 🏗️ POS Dashboard - Complete Architecture Reference

## 📊 Project Overview

**POS Dashboard** is a comprehensive Point-of-Sale system built with modern web technologies, providing a complete restaurant management solution with multi-language support, role-based access control, and real-time operations.

### 📈 **Project Statistics**

- **Total Lines of Code**: 40,898 lines
- **TypeScript Files**: 406 files
- **Main Components**: 68 UI components
- **Feature Modules**: 18 business modules
- **Database Tables**: 15+ entities

---

## 🛠️ **Technology Stack**

### **Frontend**

- **Framework**: Next.js 15.3.4 (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: React 19.0.0
- **Styling**: Tailwind CSS 4.x
- **Component Library**: Radix UI
- **State Management**: Zustand 5.0.6
- **Data Fetching**: TanStack Query 5.81.2
- **Forms**: Zod 3.25.67 (Validation)
- **Icons**: Lucide React 0.523.0

### **Backend**

- **Runtime**: Node.js
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM 0.44.2
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes
- **PDF Generation**: jsPDF, html2canvas

### **Infrastructure**

- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT + RBAC)
- **File Storage**: Supabase Storage
- **Environment**: Production, Development, Local

---

## 🏛️ **System Architecture**

### **Overall Architecture Pattern**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (PostgreSQL)  │
│   - React UI    │    │   - Server      │    │   - Supabase    │
│   - TanStack    │    │   Actions       │    │   - Drizzle ORM │
│   - Zustand     │    │   - Middleware  │    │   - Migrations  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Authentication & Authorization Flow**

```
User Login → Supabase Auth → JWT with Custom Claims → Role-Based Access → Protected Resources
     ↓              ↓                    ↓                      ↓               ↓
  Email/Pass    Session Management    User Roles        Route Guards     Database RLS
```

---

## 📁 **Project Structure**

### **Root Directory**

```
pos-dashboard/
├── 📱 app/                     # Next.js App Router
├── 🧩 components/             # Reusable UI Components
├── 📚 modules/                # Feature Modules
├── 🗃️ lib/                   # Core Libraries & Services
├── 🪝 hooks/                 # Custom React Hooks
├── 🎨 public/                # Static Assets
├── 📄 docs/                  # Documentation
├── 🛠️ utils/                 # Utility Functions
├── 🗄️ supabase/             # Database & Migrations
└── ⚙️ Configuration Files
```

### **App Structure (Next.js App Router)**

```
app/
├── 🏠 page.tsx                # Landing page
├── 🎨 layout.tsx              # Root layout
├── 🌐 globals.css             # Global styles
├── 👨‍💼 admin/                  # Admin panel routes
│   ├── 🍕 menu/               # Menu management
│   ├── 👥 users/              # User management
│   ├── 📊 reports/            # Reports & analytics
│   └── ⚙️ settings/           # System settings
├── 🔐 login/                  # Authentication
├── 📡 api/                    # API endpoints
│   ├── 🔑 auth/               # Authentication APIs
│   ├── 👥 users/              # User management APIs
│   ├── 📋 orders/             # Order management APIs
│   ├── 🍕 menu/               # Menu APIs
│   └── 👤 customers/          # Customer APIs
└── 🚫 unauthorized/           # Access denied page
```

---

## 🏗️ **Core Architecture Patterns**

### **1. Modular Feature Architecture**

Each business feature is organized as a self-contained module:

```
modules/
├── 🛒 cart/                   # Shopping cart functionality
├── 📋 orders-feature/         # Order management
├── 👤 customer-feature/       # Customer management
├── 🍕 pizza-feature/          # Pizza menu items
├── 🥧 pie-feature/            # Pie menu items
├── 🥪 sandwich-feature/       # Sandwich menu items
├── 🍔 burgers-feature/        # Burger menu items
├── 🌯 shawerma-feature/       # Shawarma menu items
├── 🥤 beverages-feature/      # Beverages menu
├── 🍟 sides-feature/          # Side orders
├── 🧀 appetizers-feature/     # Appetizers menu
├── 👥 user-management/        # User administration
├── 📊 eod-report/             # End-of-day reporting
├── 🔧 items-management/       # Menu item management
├── 📖 menu/                   # Menu display
├── 📝 menu-items-pages/       # Menu item pages
├── 🥮 mini-pie-feature/       # Mini pie items
└── 🎛️ providers/             # Context providers
```

### **2. Layer-Based Architecture**

#### **Presentation Layer (Components)**

```
components/
├── 🎛️ ui/                    # Base UI components (buttons, inputs, etc.)
├── 📱 layout/                 # Layout components
├── 🛒 cart/                   # Cart-related components
├── 📋 forms/                  # Form components
├── 📊 reports/                # Report components
└── 🧩 feature-specific/       # Feature components
```

#### **Business Logic Layer (Modules)**

- Feature-specific hooks (`use-*.ts`)
- Service functions
- Data transformation logic
- Business rules implementation

#### **Data Layer (Lib)**

```
lib/
├── 🗄️ db/                    # Database configuration
│   ├── schema.ts             # Drizzle schema definitions
│   ├── migrations/           # Database migrations
│   └── index.ts              # Database client
├── 🔐 auth.ts                # Authentication logic
├── 📋 orders/                # Order-related services
├── 👤 customers/             # Customer services
├── 👥 user-service-drizzle.ts # User management
├── 🧮 utils.ts               # Utility functions
└── 📄 schemas.ts             # Validation schemas
```

---

## 🗄️ **Database Architecture**

### **Database Schema Overview**

```sql
-- Core Business Tables
├── 👥 users                  # System users & roles
├── 📋 orders                 # Order transactions
├── 👤 customers              # Customer information
├── 🔗 customer_orders        # Customer-order relationships

-- Menu Item Tables
├── 🍕 pizzas                 # Pizza menu items
├── 🥧 pies                   # Pie menu items
├── 🥪 sandwiches             # Sandwich menu items
├── 🍔 burgers                # Burger menu items
├── 🌯 shawarmas              # Shawarma menu items
├── 🥤 beverages              # Beverage menu items
├── 🍟 side_orders            # Side order menu items
├── 🧀 appetizers             # Appetizer menu items

-- System Tables
├── 📊 eod_reports            # End-of-day reports
├── 🚫 canceled_orders        # Canceled order history
├── ✏️ modified_orders        # Order modification history
└── 🔧 menu_item_modifiers    # Item modifiers/extras
```

### **Key Database Relationships**

```
users 1:N orders (created_by)
users 1:N customers (created_by)
customers 1:N customer_orders
orders 1:N canceled_orders
orders 1:N modified_orders
```

### **Data Types & Enums**

```typescript
// User roles
type UserRole = "superadmin" | "admin" | "manager" | "cashier" | "kitchen";

// Payment methods
type PaymentMethod = "cash" | "card" | "mixed";

// Order status
type OrderStatus = "completed" | "canceled" | "modified";

// Item types
type ItemType =
  | "pizza"
  | "pie"
  | "sandwich"
  | "mini_pie"
  | "beverage"
  | "appetizer"
  | "burger"
  | "shawerma"
  | "side-order";
```

---

## 🔐 **Authentication & Authorization**

### **Authentication Architecture**

```
Supabase Auth (JWT) → Custom Claims (Role) → Route Guards → API Protection
```

### **Role-Based Access Control (RBAC)**

```
SuperAdmin (Level 4) → Full system access
    ↓
Admin (Level 3) → Administrative functions
    ↓
Manager (Level 2) → Management operations
    ↓
Cashier/Kitchen (Level 1) → Basic operations
```

### **Security Implementation**

```typescript
// Key Security Functions
getCurrentUser(); // Get authenticated user with role
requireRole(role); // Verify user has required role
requireSuperAdmin(); // Super admin only access
requireAdmin(); // Admin or higher access
```

### **Protected Routes**

- **Public**: `/login`, `/unauthorized`
- **Authenticated**: All other routes require login
- **Role-Based**: Admin routes require specific roles
- **API Protection**: All API endpoints validate authentication

---

## 🛒 **Core Business Features**

### **1. Order Management System**

```
Order Lifecycle:
Cart → Checkout → Payment → Order Creation → Receipt Generation
  ↓        ↓         ↓           ↓              ↓
Items   Customer   Method   Database      PDF/Print
```

**Key Components:**

- Cart management with item modifiers
- Customer selection and creation
- Multiple payment methods (cash/card/mixed)
- Real-time order processing
- Receipt generation and printing

### **2. Menu Management System**

```
Menu Structure:
Categories → Items → Modifiers → Pricing → Display
    ↓        ↓        ↓          ↓        ↓
  Types   Details  Extras    VAT inc.  Multi-lang
```

**Supported Menu Categories:**

- 🍕 Pizzas (with crusts, sizes, extras)
- 🥧 Pies (various types and sizes)
- 🥪 Sandwiches (with customizations)
- 🍔 Burgers (with toppings)
- 🌯 Shawarma (with variations)
- 🥤 Beverages (various sizes)
- 🍟 Sides & Appetizers

### **3. Customer Management System**

```
Customer Flow:
Search → Create/Select → Order Association → Purchase Tracking
   ↓         ↓              ↓                    ↓
 Phone   New/Existing   Link to Order      Analytics
```

**Features:**

- Phone-based customer lookup
- Purchase history tracking
- Order count and total spent
- Customer analytics and reporting

### **4. User Management System**

```
User Administration:
Creation → Role Assignment → JWT Claims → Access Control
    ↓           ↓              ↓             ↓
 Auth User   Database      Custom Claims  Route Guards
```

### **5. Reporting System**

```
End-of-Day Reports:
Orders → Aggregation → Calculations → PDF Generation
  ↓         ↓            ↓             ↓
 Data    Totals by    Tax/VAT      Formatted Report
       Payment Type   Calculations
```

---

## 🎛️ **State Management Architecture**

### **Client State (Zustand)**

```typescript
// Cart State
interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  actions: {
    addItem;
    updateQuantity;
    removeItem;
    clearCart;
  };
}

// Created Order State
interface CreatedOrderState {
  createdOrder: Order | null;
  setCreatedOrder: (order: Order) => void;
  clearCreatedOrder: () => void;
}
```

### **Server State (TanStack Query)**

```typescript
// Query Keys Structure
const queryKeys = {
  orders: ["orders"],
  customers: ["customers"],
  users: ["users"],
  menu: ["menu"],
  // ... per feature
};

// Mutations for CRUD operations
useMutation({ mutationFn: createOrder });
useMutation({ mutationFn: updateCustomer });
```

---

## 🌐 **API Architecture**

### **RESTful API Design**

```
/api/
├── 🔑 auth/
│   ├── GET    /me              # Current user info
│   └── POST   /login           # User authentication
├── 👥 users/
│   ├── GET    /               # List users (admin)
│   ├── POST   /               # Create user (admin)
│   ├── PATCH  /:id            # Update user (admin)
│   └── DELETE /:id            # Delete user (admin)
├── 📋 orders/
│   ├── GET    /               # List orders
│   ├── POST   /               # Create order
│   ├── PATCH  /:id            # Update order
│   └── DELETE /:id            # Cancel order
├── 👤 customers/
│   ├── GET    /               # List customers
│   ├── POST   /               # Create customer
│   ├── GET    /search         # Search customers
│   └── PATCH  /:id            # Update customer
└── 🍕 menu/
    ├── GET    /pizzas         # Get pizzas
    ├── GET    /pies           # Get pies
    └── GET    /[category]     # Get menu category
```

### **API Response Format**

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

---

## 🧩 **Component Architecture**

### **Component Hierarchy**

```
App Layout
├── 🎛️ Dashboard Layout
│   ├── 📱 Sidebar Navigation
│   ├── 🍞 Breadcrumb Navigation
│   └── 📄 Page Content
├── 🛒 Cart Panel (Floating)
├── 🔔 Toast Notifications
└── 📱 Modal Dialogs
```

### **Reusable Component Library**

```
components/ui/
├── 🔲 button.tsx              # Button variants
├── 📝 input.tsx               # Form inputs
├── 🎛️ select.tsx             # Select dropdowns
├── 📋 dialog.tsx              # Modal dialogs
├── 🎯 badge.tsx               # Status badges
├── 📊 card.tsx                # Content cards
└── 🧭 navigation-menu.tsx     # Navigation components
```

### **Feature Components**

```
components/
├── 🛒 cart-panel-with-customer.tsx    # Main cart component
├── 💰 cash-calculator-dialog.tsx      # Cash payment dialog
├── 🔀 mixed-payment-dialog.tsx        # Mixed payment dialog
├── 🏪 restaurant-receipt.tsx          # Receipt generation
├── 👤 customer-section.tsx            # Customer selection
├── 🧮 modifier-manager.tsx            # Item modifiers
└── 📊 dashboard-layout.tsx            # Admin layout
```

---

## 🔄 **Data Flow Architecture**

### **Order Creation Flow**

```
1. User adds items to cart (Zustand)
2. Cart updates in real-time
3. User selects customer (optional)
4. User chooses payment method
5. Payment dialog opens (cash/mixed)
6. Order submitted via API
7. Database insertion (Drizzle)
8. Success response & receipt
9. Cart cleared & state reset
```

### **Authentication Flow**

```
1. User submits login credentials
2. Supabase Auth validates credentials
3. JWT token generated with custom claims
4. Client stores session
5. Protected route access validated
6. API calls include auth headers
7. Server validates JWT & role
8. Database operations authorized
```

---

## 🛠️ **Development Workflow**

### **Code Organization Principles**

1. **Feature-First**: Group by business functionality
2. **Separation of Concerns**: Clear layer boundaries
3. **Type Safety**: TypeScript throughout
4. **Validation**: Zod schemas for data validation
5. **Error Handling**: Consistent error boundaries

### **File Naming Conventions**

```
├── 📄 component-name.tsx      # React components
├── 🪝 use-feature-name.ts     # Custom hooks
├── 🏪 feature-service.ts      # Business logic
├── 📋 feature-schema.ts       # Validation schemas
├── 🗄️ db-schema.ts           # Database schemas
└── 📝 feature.types.ts       # Type definitions
```

### **Development Tools & Workflow**

- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode
- **Database**: Drizzle Kit for migrations
- **API Testing**: Built-in API testing
- **Deployment**: Vercel with automatic deploys

---

## 📊 **Performance & Optimization**

### **Frontend Optimization**

- **Code Splitting**: Next.js automatic splitting
- **Image Optimization**: Next.js Image component
- **Caching**: TanStack Query with stale-while-revalidate
- **Bundle Analysis**: Webpack Bundle Analyzer
- **Lazy Loading**: Dynamic imports for heavy components

### **Database Optimization**

- **Indexing**: Strategic database indexes
- **Query Optimization**: Drizzle ORM efficient queries
- **Connection Pooling**: Supabase connection management
- **Pagination**: Large dataset pagination
- **Caching**: Query result caching

### **API Optimization**

- **Response Compression**: Automatic gzip compression
- **Rate Limiting**: Built-in protection
- **Error Handling**: Comprehensive error responses
- **Validation**: Input validation at API level

---

## 🔧 **Configuration & Environment**

### **Environment Variables**

```bash
# Database
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Application
NEXT_PUBLIC_APP_URL=https://...
NODE_ENV=production|development
```

### **Configuration Files**

```
├── ⚙️ next.config.ts         # Next.js configuration
├── 📘 tsconfig.json          # TypeScript configuration
├── 🎨 tailwind.config.js     # Tailwind CSS configuration
├── 📋 eslint.config.mjs      # ESLint configuration
├── 🗄️ drizzle.config.ts     # Database configuration
├── 📦 package.json           # Dependencies & scripts
└── 🔧 components.json        # UI components configuration
```

---

## 🚀 **Deployment Architecture**

### **Production Stack**

```
Vercel (Frontend & API) → Supabase (Database & Auth) → CDN (Static Assets)
```

### **Build Process**

```
1. TypeScript compilation
2. Next.js optimization
3. Static asset processing
4. Bundle generation
5. Deployment to Vercel
6. Database migrations (if needed)
```

### **Monitoring & Analytics**

- **Error Tracking**: Built-in error boundaries
- **Performance Monitoring**: Vercel Analytics
- **Database Monitoring**: Supabase Dashboard
- **User Analytics**: Custom event tracking

---

## 📈 **Scalability Considerations**

### **Current Scale Support**

- **Users**: Hundreds of concurrent users
- **Orders**: Thousands of orders per day
- **Menu Items**: Hundreds of items with variations
- **Data**: Multi-gigabyte database support

### **Scaling Strategies**

1. **Database**: Read replicas, query optimization
2. **API**: Horizontal scaling with Vercel
3. **Caching**: Redis for session/query caching
4. **CDN**: Global asset distribution
5. **Monitoring**: Performance metrics and alerts

---

## 🔮 **Future Architecture Roadmap**

### **Planned Enhancements**

1. **Real-time Features**: WebSocket integration
2. **Mobile App**: React Native implementation
3. **Advanced Analytics**: Business intelligence
4. **Multi-tenant**: Restaurant chain support
5. **Inventory Management**: Stock tracking
6. **Kitchen Display**: Order management screens
7. **Loyalty Program**: Customer rewards system

---

## 📚 **Development Guidelines**

### **Best Practices**

1. **Component Design**: Single responsibility principle
2. **State Management**: Minimal global state
3. **Error Handling**: Graceful error boundaries
4. **Performance**: Lazy loading and memoization
5. **Security**: Input validation and sanitization
6. **Testing**: Unit and integration tests
7. **Documentation**: Comprehensive inline docs

### **Code Quality Standards**

- **TypeScript**: Strict mode enabled
- **ESLint**: Enforced code standards
- **Prettier**: Consistent code formatting
- **Git Flow**: Feature branch workflow
- **Code Reviews**: Mandatory review process

---

## 🎯 **Key Success Metrics**

### **Technical Metrics**

- **Performance**: < 2s page load times
- **Availability**: 99.9% uptime
- **Error Rate**: < 0.1% error rate
- **Type Coverage**: 95%+ TypeScript coverage

### **Business Metrics**

- **Order Processing**: Real-time order processing
- **User Experience**: Intuitive interface
- **Multi-language**: Arabic/English support
- **Compliance**: VAT calculation accuracy

---

This architecture document serves as the definitive reference for the POS Dashboard system. It should be updated as the system evolves and new features are added.

**Last Updated**: September 11, 2025
**Version**: 2.0
**Maintainers**: Development Team
