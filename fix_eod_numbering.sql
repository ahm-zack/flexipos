-- Fix the EOD report numbering migration
-- This corrects the ambiguous column reference issue

-- Update existing EOD reports to have report numbers (fixed version)
DO $$
DECLARE
    report_record RECORD;
    new_report_number TEXT;
    counter INTEGER := 1;
BEGIN
    -- Loop through existing reports ordered by creation date
    FOR report_record IN 
        SELECT id 
        FROM eod_reports 
        WHERE eod_reports.report_number IS NULL 
        ORDER BY eod_reports.created_at ASC
    LOOP
        -- Generate report number
        new_report_number := 'EOD-' || LPAD(counter::TEXT, 4, '0');
        
        -- Update the report
        UPDATE eod_reports 
        SET report_number = new_report_number 
        WHERE id = report_record.id;
        
        -- Increment counter
        counter := counter + 1;
    END LOOP;
    
    -- Update the sequence to continue from the correct number
    IF counter > 1 THEN
        PERFORM setval('eod_report_number_seq', counter - 1);
    END IF;
END $$;

-- Create index on report_number for faster lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_eod_reports_report_number ON eod_reports(report_number);

-- Add comments
COMMENT ON COLUMN eod_reports.report_number IS 'Sequential EOD report number in format EOD-0001, EOD-0002, etc.';
COMMENT ON SEQUENCE eod_report_number_seq IS 'Sequence for generating EOD report numbers';
COMMENT ON FUNCTION generate_eod_report_number() IS 'Generates next EOD report number in format EOD-0001';
COMMENT ON FUNCTION get_next_eod_report_number() IS 'Gets next EOD report number without incrementing sequence';
