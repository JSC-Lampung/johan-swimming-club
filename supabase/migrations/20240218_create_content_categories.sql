-- Migration: Create content_categories table and seed initial data

-- 1. Create content_categories table
CREATE TABLE IF NOT EXISTS public.content_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add category_id to landing_contents if not exists (optional, keeping current 'category' string for now for compatibility, but we can transition)
-- For now, we will simply use the 'slug' from content_categories to match the 'category' in landing_contents.

-- 3. Seed initial categories
INSERT INTO public.content_categories (name, slug, icon, description, order_index)
VALUES 
    ('Intro Landing', 'hero_intro', 'Layout', 'Konten utama di bagian atas halaman (Hero section).', 0),
    ('Program', 'program', 'Waves', 'Daftar program renang yang ditawarkan.', 1),
    ('Prestasi Anggota', 'achievement', 'Trophy', 'Pengumuman prestasi atlet dan anggota club.', 2),
    ('Team Pelatih', 'team', 'Users', 'Informasi profil pelatih dan staff.', 3),
    ('Berita / Info', 'news', 'Newspaper', 'Berita terbaru, update jadwal, dan informasi umum.', 4)
ON CONFLICT (slug) DO UPDATE 
SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    order_index = EXCLUDED.order_index;

-- 4. Enable RLS
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies
CREATE POLICY "Allow public read access" ON public.content_categories
    FOR SELECT USING (true);

CREATE POLICY "Allow service role full access" ON public.content_categories
    FOR ALL USING (true);
