-- Add EOD report numbering system
-- This creates a sequence and function for generating EOD report numbers in EOD-0001 format

-- Add reportNumber column to eod_reports table
ALTER TABLE eod_reports ADD COLUMN IF NOT EXISTS report_number VARCHAR(20) UNIQUE;

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
    -- Get the next sequence value
    SELECT nextval('eod_report_number_seq') INTO next_number;
    
    -- Format as EOD-0001
    report_number := 'EOD-' || LPAD(next_number::TEXT, 4, '0');
    
    RETURN report_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to get next EOD report number without incrementing
CREATE OR REPLACE FUNCTION get_next_eod_report_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    report_number TEXT;
BEGIN
    -- Get the next sequence value without incrementing
    SELECT COALESCE(last_value, 0) + 1 FROM eod_report_number_seq INTO next_number;
    
    -- Format as EOD-0001
    report_number := 'EOD-' || LPAD(next_number::TEXT, 4, '0');
    
    RETURN report_number;
END;
$$ LANGUAGE plpgsql;

-- Update existing EOD reports to have report numbers
DO $$
DECLARE
    report_record RECORD;
    report_number TEXT;
    counter INTEGER := 1;
BEGIN
    -- Loop through existing reports ordered by creation date
    FOR report_record IN 
        SELECT id 
        FROM eod_reports 
        WHERE report_number IS NULL 
        ORDER BY created_at ASC
    LOOP
        -- Generate report number
        report_number := 'EOD-' || LPAD(counter::TEXT, 4, '0');
        
        -- Update the report
        UPDATE eod_reports 
        SET report_number = report_number 
        WHERE id = report_record.id;
        
        -- Increment counter
        counter := counter + 1;
    END LOOP;
    
    -- Update the sequence to continue from the correct number
    IF counter > 1 THEN
        PERFORM setval('eod_report_number_seq', counter - 1);
    END IF;
END $$;

-- Create index on report_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_eod_reports_report_number ON eod_reports(report_number);

-- Add comment to explain the numbering system
COMMENT ON COLUMN eod_reports.report_number IS 'Sequential EOD report number in format EOD-0001, EOD-0002, etc.';
COMMENT ON SEQUENCE eod_report_number_seq IS 'Sequence for generating EOD report numbers';
COMMENT ON FUNCTION generate_eod_report_number() IS 'Generates next EOD report number in format EOD-0001';
COMMENT ON FUNCTION get_next_eod_report_number() IS 'Gets next EOD report number without incrementing sequence';
