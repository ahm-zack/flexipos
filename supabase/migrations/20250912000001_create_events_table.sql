-- Create events table for managing promotional events
-- Migration: Create events table and update orders table
-- Created: 2025-09-12

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  discount_percentage DECIMAL(5,2) NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  is_active BOOLEAN DEFAULT FALSE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  activated_by UUID REFERENCES users(id),
  activated_at TIMESTAMP WITH TIME ZONE,
  deactivated_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);

-- Add RLS (Row Level Security)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events table
CREATE POLICY "Everyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'superadmin')
  )
);

-- Update orders table to reference events
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id),
ADD COLUMN IF NOT EXISTS event_discount_amount DECIMAL(10,2) DEFAULT 0;

-- Add index for orders event reference
CREATE INDEX IF NOT EXISTS idx_orders_event_id ON orders(event_id);

-- Add comments for documentation
COMMENT ON TABLE events IS 'Promotional events with discount information';
COMMENT ON COLUMN events.name IS 'Event name in English';
COMMENT ON COLUMN events.name_ar IS 'Event name in Arabic (optional)';
COMMENT ON COLUMN events.discount_percentage IS 'Discount percentage for this event (0-100)';
COMMENT ON COLUMN events.is_active IS 'Whether this event is currently active';
COMMENT ON COLUMN events.start_date IS 'Optional start date for the event';
COMMENT ON COLUMN events.end_date IS 'Optional end date for the event';
COMMENT ON COLUMN events.activated_by IS 'User who activated this event';
COMMENT ON COLUMN events.activated_at IS 'When this event was activated';

COMMENT ON COLUMN orders.event_id IS 'Reference to the event applied to this order';
COMMENT ON COLUMN orders.event_discount_amount IS 'Amount of event discount applied to this order';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
