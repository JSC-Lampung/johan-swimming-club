-- SQL Migration for Admin Instructions Feature

-- 1. Create admin_instructions table
CREATE TABLE IF NOT EXISTS admin_instructions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    target_program TEXT, -- Competition, Pre-Competition, Masters, etc. (NULL if all)
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create instruction_reads table to track who has read what
CREATE TABLE IF NOT EXISTS instruction_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instruction_id UUID REFERENCES admin_instructions(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(instruction_id, coach_id)
);

-- 3. Enable RLS
ALTER TABLE admin_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE instruction_reads ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "Allow authenticated users to read admin_instructions" ON admin_instructions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to insert/update/delete instructions" ON admin_instructions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Allow authenticated users to manage read status" ON instruction_reads FOR ALL USING (auth.role() = 'authenticated');
