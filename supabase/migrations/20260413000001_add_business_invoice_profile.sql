ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS name_ar TEXT,
ADD COLUMN IF NOT EXISTS address_ar TEXT,
ADD COLUMN IF NOT EXISTS vat_number TEXT,
ADD COLUMN IF NOT EXISTS cr_number TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'businesses_vat_number_format_check'
  ) THEN
    ALTER TABLE public.businesses
    ADD CONSTRAINT businesses_vat_number_format_check
    CHECK (vat_number IS NULL OR vat_number ~ '^\d{15}$');
  END IF;
END $$;

UPDATE public.businesses
SET
  name_ar = COALESCE(name_ar, NULLIF(settings->>'nameAr', ''), NULLIF(settings->>'name_ar', '')),
  address_ar = COALESCE(address_ar, NULLIF(settings->>'addressAr', ''), NULLIF(settings->>'address_ar', '')),
  vat_number = COALESCE(vat_number, NULLIF(settings->>'vatNumber', ''), NULLIF(settings->>'vat_number', '')),
  cr_number = COALESCE(cr_number, NULLIF(settings->>'crNumber', ''), NULLIF(settings->>'cr_number', ''));