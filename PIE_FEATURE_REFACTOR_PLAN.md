# 🥧 PIE FEATURE REFACTOR PLAN - CLIENT-SIDE QUERIES

## 📋 **REFACTOR OVERVIEW**

Refactor the pie feature from API routes to direct client-side queries using the same successful architecture implemented for the pizza feature.

---

## 🎯 **PHASE 1: Setup Query Keys & Client Service** (15 minutes)

### **1.1 Create Query Keys**

- **Create**: `/modules/pie-feature/queries/pie-keys.ts`
- **Purpose**: Server & client compatible query keys
- **Pattern**: Follow pizza feature structure

### **1.2 Add Pie Service to Client DB**

- **Update**: `/lib/supabase/client-db.ts`
- **Add**: Complete CRUD operations for pies
- **Functions**: `getPies`, `createPie`, `updatePie`, `deletePie`, `getPieById`

---

## 🎯 **PHASE 2: Refactor Hooks** (25 minutes)

### **2.1 Update use-pies.ts**

- **Remove**: API route calls
- **Add**: Direct client-side database operations
- **Implement**: Context-aware caching strategies
- **Features**: Manual refresh capabilities, enhanced error handling

### **2.2 Cache Strategies**

| User Type    | Stale Time | GC Time    | Window Focus | Use Case         |
| ------------ | ---------- | ---------- | ------------ | ---------------- |
| **Admin**    | 2 minutes  | 10 minutes | ✅ Yes       | Frequent changes |
| **Cashier**  | 10 minutes | 30 minutes | ❌ No        | Stable menu      |
| **Customer** | 15 minutes | 60 minutes | ❌ No        | Very stable      |

---

## 🎯 **PHASE 3: Update Components** (30 minutes)

### **3.1 Management View Updates**

- **File**: `pie-management-view.tsx`
- **Remove**: Any server dependencies
- **Add**: Context-aware queries (`usePies('admin')`)
- **Features**: Manual refresh controls, optimized for admin usage

### **3.2 Cashier View Updates**

- **File**: `pie-cashier-view.tsx`
- **Update**: Use context-aware queries (`usePies('cashier')`)
- **Optimize**: For stable menu display

### **3.3 Form Updates**

- **Files**: `create-pie-form.tsx`, `edit-pie-form.tsx`
- **Update**: Use direct client mutations
- **Enhance**: Better error handling and user feedback

---

## 🎯 **PHASE 4: SSR Implementation** (20 minutes)

### **4.1 Admin Pages**

- **File**: `app/admin/items/pies/page.tsx`
- **Add**: TanStack Query hydration with 2-minute admin cache
- **Feature**: Instant page loads with pre-fetched data

### **4.2 Cashier Pages**

- **File**: `app/admin/menu/pie/page.tsx`
- **Add**: TanStack Query hydration with 10-minute cashier cache
- **Feature**: Stable menu with less frequent updates

---

## 🎯 **PHASE 5: Cleanup** (10 minutes)

### **5.1 Delete Server Files**

- **Remove**: `app/api/pies/route.ts`
- **Remove**: `app/api/pies/[id]/route.ts`
- **Remove**: `lib/pie-service.ts`

### **5.2 Update Exports**

- **File**: `modules/pie-feature/index.ts`
- **Export**: Query keys from new location
- **Clean**: Remove server-side dependencies

---

## 🎯 **PHASE 6: Testing & Validation** (15 minutes)

### **6.1 Build Verification**

- **Test**: `npm run build`
- **Verify**: No TypeScript errors
- **Check**: All imports resolved

### **6.2 Functionality Tests**

- **CRUD**: Create, read, update, delete operations
- **Caching**: Verify context-aware cache strategies
- **SSR**: Test hydration on page loads

---

## 📊 **EXPECTED BENEFITS**

### **Performance**

- ✅ Faster bundle (no API middleware)
- ✅ Instant page loads (SSR hydration)
- ✅ Better caching (context-aware strategies)
- ✅ Reduced memory usage (no persistent connections)

### **Developer Experience**

- ✅ Simpler debugging (direct data flow)
- ✅ Better TypeScript support
- ✅ Easier testing (no API mocking needed)
- ✅ Consistent with pizza feature

### **User Experience**

- ✅ Manual control over data freshness
- ✅ Predictable performance
- ✅ Better mobile experience
- ✅ Reliable offline-ready caching

---

## 🔧 **KEY FILES TO CHANGE**

```
📁 modules/pie-feature/
├── queries/pie-keys.ts (NEW)
├── hooks/use-pies.ts (REFACTOR)
└── components/ (UPDATE ALL)

📁 lib/supabase/
└── client-db.ts (ADD PIE OPERATIONS)

📁 app/
├── admin/items/pies/page.tsx (SSR HYDRATION)
└── admin/menu/pie/page.tsx (SSR HYDRATION)

🗑️ DELETE:
├── app/api/pies/route.ts
├── app/api/pies/[id]/route.ts
└── lib/pie-service.ts
```

---

## 🎯 **SUCCESS CRITERIA**

- ✅ All pie operations work without API routes
- ✅ Context-aware caching implemented
- ✅ SSR hydration working on both pages
- ✅ Build passes without errors
- ✅ Bundle size reduced
- ✅ Consistent with pizza feature architecture

**Ready to start implementation!** 🥧
