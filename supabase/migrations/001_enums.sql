-- ============================================================
-- 001_enums.sql
-- Custom enum types
-- Run this FIRST before any table creation
-- ============================================================

CREATE TYPE IF NOT EXISTS public.role AS ENUM (
  'superadmin',
  'admin',
  'manager',
  'staff'
);

CREATE TYPE IF NOT EXISTS public.order_status AS ENUM (
  'completed',
  'canceled',
  'modified'
);

CREATE TYPE IF NOT EXISTS public.payment_method AS ENUM (
  'cash',
  'card',
  'mixed',
  'delivery'
);

CREATE TYPE IF NOT EXISTS public.delivery_platform AS ENUM (
  'keeta',
  'hunger_station',
  'jahez'
);

CREATE TYPE IF NOT EXISTS public.modification_type AS ENUM (
  'item_added',
  'item_removed',
  'quantity_changed',
  'item_replaced',
  'multiple_changes'
);

CREATE TYPE IF NOT EXISTS public.report_type AS ENUM (
  'eod',
  'sales',
  'weekly',
  'monthly'
);
