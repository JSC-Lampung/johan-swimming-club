
-- Add view_count column if it doesn't exist
ALTER TABLE landing_contents 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Ensure created_at exists (standard Supabase column, but just in case)
-- ALTER TABLE landing_contents ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
