
-- Create Hero Slides Table
CREATE TABLE IF NOT EXISTS hero_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public to view active slides" ON hero_slides
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Allow admins to manage all slides" ON hero_slides
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create storage bucket for slides if it doesn't exist (can be done in SQL for some setups, or manually)
-- Note: Assuming site_assets bucket is used or standard public accessibility persists.
