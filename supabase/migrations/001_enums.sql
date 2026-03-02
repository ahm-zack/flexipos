-- ============================================================
-- 001_enums.sql
-- Custom enum types
-- Run this FIRST before any table creation
-- ============================================================

DO $$ BEGIN
  CREATE TYPE public.role AS ENUM (
    'superadmin',
    'admin',
    'manager',
    'staff'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM (
    'completed',
    'canceled',
    'modified'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM (
    'cash',
    'card',
    'mixed',
    'delivery'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.delivery_platform AS ENUM (
    'keeta',
    'hunger_station',
    'jahez'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.modification_type AS ENUM (
    'item_added',
    'item_removed',
    'quantity_changed',
    'item_replaced',
    'multiple_changes'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.report_type AS ENUM (
    'eod',
    'sales',
    'weekly',
    'monthly'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;
