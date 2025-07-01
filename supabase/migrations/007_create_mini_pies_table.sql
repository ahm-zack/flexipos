-- Create enum types for mini pies FIRST
DO $$
BEGIN
  -- Create mini pie type enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mini_pie_type') THEN
    CREATE TYPE mini_pie_type AS ENUM (
      'Mini Spinach Pie',
      'Mini Meat Pie (Ba''lakiya style)',
      'Mini Halloumi Cheese Pie', 
      'Mini Hot Dog Pie',
      'Mini Pizza Pie'
    );
  END IF;

  -- Create mini pie size enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mini_pie_size') THEN
    CREATE TYPE mini_pie_size AS ENUM (
      'small',
      'medium',
      'large'
    );
  END IF;
END $$;

-- Create mini_pies table
CREATE TABLE IF NOT EXISTS mini_pies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type mini_pie_type NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  size mini_pie_size NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  price_with_vat TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for mini_pies table
ALTER TABLE mini_pies ENABLE ROW LEVEL SECURITY;

-- Allow read access for all authenticated users
CREATE POLICY "Allow authenticated users to read mini pies" ON mini_pies
  FOR SELECT TO authenticated USING (true);

-- Allow insert access for admin/manager/superadmin roles
CREATE POLICY "Allow admin users to insert mini pies" ON mini_pies
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('superadmin', 'admin', 'manager')
  );

-- Allow update access for admin/manager/superadmin roles
CREATE POLICY "Allow admin users to update mini pies" ON mini_pies
  FOR UPDATE TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('superadmin', 'admin', 'manager')
  );

-- Allow delete access for admin/manager/superadmin roles  
CREATE POLICY "Allow admin users to delete mini pies" ON mini_pies
  FOR DELETE TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('superadmin', 'admin', 'manager')
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_mini_pies_type ON mini_pies(type);
CREATE INDEX IF NOT EXISTS idx_mini_pies_created_at ON mini_pies(created_at DESC);
