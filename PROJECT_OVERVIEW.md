# POS Dashboard – Project Overview | نظرة عامة على نظام نقاط البيع

---

## 1. Project Summary | ملخص المشروع

A modern, modular POS dashboard for restaurants and retail, built with Next.js 15, TypeScript, Drizzle ORM, Supabase, and shadcn/ui. The system is designed for fast order management, user roles, receipt printing, and a beautiful, responsive UI.

نظام نقاط بيع حديث ومرن للمطاعم والتجزئة، مبني باستخدام Next.js 15 وTypeScript وDrizzle ORM وSupabase وshadcn/ui. يهدف النظام إلى إدارة الطلبات بسرعة، ودعم صلاحيات المستخدمين، وطباعة الفواتير، وواجهة استخدام عصرية ومتجاوبة.

---

## 2. Tech Stack | التقنيات المستخدمة

- **Next.js 15** (App Router, SSR, API routes)
- **TypeScript** (type safety)
- **Drizzle ORM** (database, migrations)
- **Supabase** (authentication, RBAC, JWT)
- **TanStack Query** (data fetching)
- **shadcn/ui + Tailwind CSS** (UI components)
- **ZATCA-compliant receipt printing**

---

## 3. Folder Structure | هيكلية المجلدات

```
/ (root)
├── app/              # Next.js pages, layouts, API
├── components/       # Shared UI components
├── modules/          # Feature modules (cart, orders, menu, users...)
├── lib/              # Business logic, DB, config
├── docs/             # Documentation
├── public/           # Static assets
├── supabase/         # DB config, migrations
└── ...               # Config, scripts, etc.
```

---

## 4. Main Features | الميزات الرئيسية

### 🛒 Cart System | نظام السلة

- Add/remove items, quantity control, modifiers
- Persistent (localStorage), real-time UI
- Modern, responsive cart panel

إضافة/حذف المنتجات، التحكم بالكمية، الإضافات
سلة دائمة (localStorage)، تحديث فوري للواجهة
لوحة سلة عصرية ومتجاوبة

### 🍔 Menu & Orders | إدارة القائمة والطلبات

- Modular menu (pizza, burger, shawerma, sides, ...)
- Cashier & management views
- Order creation, status, and history
- **Order Management:** View, edit, print, and track orders
- **End of Day (EOD) Reports:** Automated daily sales, VAT, and summary reports for managers

قائمة طعام مرنة (بيتزا، برجر، شاورما، ...)
شاشات للكاشير والإدارة
إنشاء الطلبات وتتبع حالتها
**إدارة الطلبات:** عرض وتعديل وطباعة وتتبع الطلبات
**تقارير نهاية اليوم:** تقارير يومية تلقائية للمبيعات والضريبة والملخص للإدارة

---

## 5. Orders & EOD Reports | الطلبات وتقارير نهاية اليوم

### Orders | الطلبات

- Create, edit, and print orders
- Track order status (pending, completed, canceled)
- View order history and details
- Print ZATCA-compliant receipts for each order

إنشاء وتعديل وطباعة الطلبات
تتبع حالة الطلب (معلق، مكتمل، ملغي)
عرض سجل وتفاصيل الطلبات
طباعة فاتورة متوافقة مع هيئة الزكاة لكل طلب

### End of Day (EOD) Reports | تقارير نهاية اليوم

- Automated daily report generation for managers
- Includes total sales, VAT, payment breakdown, and summary
- Accessible via management dashboard

توليد تقارير يومية تلقائية للإدارة
تشمل إجمالي المبيعات، الضريبة، توزيع طرق الدفع، والملخص
متاحة عبر لوحة الإدارة

### 👤 User Management | إدارة المستخدمين

- Roles: superadmin, admin, manager, cashier, kitchen
- JWT role sync, RBAC, user CRUD

صلاحيات: مدير عام، مدير، كاشير، مطبخ
مزامنة الصلاحيات مع JWT، تحكم كامل بالمستخدمين

### 🧾 Receipt Printing | طباعة الفواتير

- ZATCA-compliant, QR code, VAT, bilingual
- 58mm thermal printer support

فواتير متوافقة مع هيئة الزكاة (ZATCA)
رمز QR، ضريبة القيمة المضافة، دعم الطابعات الحرارية

### 🧩 Modifiers | الإضافات

- Admin UI for menu item modifiers
- Modifiers saved per order item

واجهة إدارة الإضافات
تخزين الإضافات مع كل منتج في الطلب

---

## 5. Data Flow & API | تدفق البيانات وواجهة البرمجة

- API routes in `/app/api/`
- TanStack Query for fetching/mutating data
- Drizzle ORM for DB access
- Supabase for authentication & RBAC

---

## 6. How to Add a New Feature | كيفية إضافة ميزة جديدة

1. Define DB schema in `/lib/db/schema.ts`
2. Create service in `/lib/`
3. Add API routes in `/app/api/`
4. Build UI in `/modules/feature/components/`
5. Add hooks for data fetching/mutation
6. Update RBAC if needed

١. تعريف الجدول في قاعدة البيانات
٢. إنشاء خدمة في lib/
٣. إضافة API في app/api/
٤. بناء الواجهة في modules/feature/components/
٥. إضافة هوكس لجلب وتعديل البيانات
٦. تحديث الصلاحيات إذا لزم الأمر

---

## 7. Compliance & Configuration | التوافق والإعدادات

- All receipts are ZATCA-compliant (Saudi Arabia)
- Restaurant info in `/lib/restaurant-config.ts`
- VAT, CR, business hours, logo, etc.

جميع الفواتير متوافقة مع هيئة الزكاة
معلومات المطعم في lib/restaurant-config.ts
ضريبة القيمة المضافة، السجل التجاري، أوقات العمل، الشعار

---

## 8. UI/UX Highlights | مميزات الواجهة

- Modern, mobile-first design
- Sidebar navigation, always-visible cart
- Elegant payment method selection
- Bilingual (Arabic/English) support in receipts

تصميم عصري ومتجاوب
شريط جانبي، سلة دائمة الظهور
اختيار طريقة الدفع بشكل أنيق
دعم الفواتير باللغتين العربية والإنجليزية

---

## 9. For More Details | لمزيد من التفاصيل

- See `/docs/` for architecture, features, and guides
- Contact the development team for walkthroughs

راجع مجلد docs/ لمزيد من الشروحات
تواصل مع فريق التطوير لأي استفسار
