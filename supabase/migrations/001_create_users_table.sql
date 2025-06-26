-- Simple POS Dashboard Users Table
-- Clean migration that creates only what we need

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a simple users table with built-in role
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'manager', 'cashier', 'kitchen')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read all users (for now, we can restrict later)
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

-- Allow users to insert/update/delete (for now, we can restrict later)
CREATE POLICY "Users can insert users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update users" ON users
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete users" ON users
  FOR DELETE USING (true);

-- Insert sample data
INSERT INTO users (email, name, role) VALUES
  ('superadmin@example.com', 'Super Admin User', 'superadmin'),
  ('admin@example.com', 'Admin User', 'admin'),
  ('manager@example.com', 'Manager User', 'manager'),
  ('cashier@example.com', 'Cashier User', 'cashier'),
  ('kitchen@example.com', 'Kitchen User', 'kitchen');
