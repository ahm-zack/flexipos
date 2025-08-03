-- Create customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    address TEXT,
    total_purchases DECIMAL(12, 2) NOT NULL DEFAULT 0,
    order_count DECIMAL(10, 0) NOT NULL DEFAULT 0,
    last_order_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

-- Create customer_orders junction table
CREATE TABLE customer_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    order_total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_created_by ON customers(created_by);
CREATE INDEX idx_customers_created_at ON customers(created_at);
CREATE INDEX idx_customer_orders_customer_id ON customer_orders(customer_id);
CREATE INDEX idx_customer_orders_order_number ON customer_orders(order_number);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customers_updated_at();

-- Add RLS policies for customers table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to read all customers
CREATE POLICY "Users can read all customers" ON customers
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to create customers
CREATE POLICY "Users can create customers" ON customers
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Policy: Allow users to update customers they created or managers to update any
CREATE POLICY "Users can update their customers or managers can update any" ON customers
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('manager', 'admin')
        )
    );

-- Policy: Allow managers and admins to delete customers
CREATE POLICY "Managers and admins can delete customers" ON customers
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('manager', 'admin')
        )
    );

-- Customer orders policies
CREATE POLICY "Users can read all customer orders" ON customer_orders
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "System can create customer orders" ON customer_orders
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON customers TO authenticated;
GRANT ALL ON customer_orders TO authenticated;
