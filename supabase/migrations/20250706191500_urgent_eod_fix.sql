-- URGENT: Add missing report_number column for EOD reports
-- This fixes the production error where report_number column is missing

DO $$
BEGIN
    -- Add the missing column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'eod_reports' AND column_name = 'report_number'
    ) THEN
        ALTER TABLE eod_reports ADD COLUMN report_number VARCHAR(20) UNIQUE;
        RAISE NOTICE 'Added report_number column to eod_reports table';
    END IF;
END $$;

-- Create sequence for EOD report numbers
CREATE SEQUENCE IF NOT EXISTS eod_report_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Create function to generate EOD report numbers
CREATE OR REPLACE FUNCTION generate_eod_report_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    report_number TEXT;
BEGIN
    SELECT nextval('eod_report_number_seq') INTO next_number;
    report_number := 'EOD-' || LPAD(next_number::TEXT, 4, '0');
    RETURN report_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to preview next EOD report number
CREATE OR REPLACE FUNCTION get_next_eod_report_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    report_number TEXT;
BEGIN
    SELECT COALESCE(last_value, 0) + 1 FROM eod_report_number_seq INTO next_number;
    report_number := 'EOD-' || LPAD(next_number::TEXT, 4, '0');
    RETURN report_number;
END;
$$ LANGUAGE plpgsql;

-- Update existing reports with numbers if any exist
UPDATE eod_reports 
SET report_number = 'EOD-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 4, '0')
WHERE report_number IS NULL;

-- Update sequence to continue correctly
SELECT setval('eod_report_number_seq', COALESCE((SELECT COUNT(*) FROM eod_reports), 0));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_eod_reports_report_number ON eod_reports(report_number);

-- Grant permissions
GRANT USAGE ON SEQUENCE eod_report_number_seq TO authenticated;
GRANT EXECUTE ON FUNCTION generate_eod_report_number() TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_eod_report_number() TO authenticated;
