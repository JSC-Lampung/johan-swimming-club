
-- 1. Member Attendance Table
CREATE TABLE IF NOT EXISTS member_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    date DATE DEFAULT CURRENT_DATE,
    session_time TIME,
    status TEXT CHECK (status IN ('hadir', 'izin', 'sakit', 'alfa')) DEFAULT 'hadir',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Coach Attendance Table (Check-in/Out)
CREATE TABLE IF NOT EXISTS coach_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    check_in TIMESTAMPTZ DEFAULT NOW(),
    check_out TIMESTAMPTZ,
    date DATE DEFAULT CURRENT_DATE,
    location_lat DECIMAL(9,6),
    location_long DECIMAL(9,6),
    status TEXT DEFAULT 'present',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Member Assessments (Progress Tracking)
CREATE TABLE IF NOT EXISTS member_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    date DATE DEFAULT CURRENT_DATE,
    category TEXT, -- e.g., 'Teknik Dasar', 'Fisik', 'Mental'
    score INTEGER CHECK (score >= 0 AND score <= 100),
    evaluation JSONB, -- For detailed metrics: { "freestyle": 80, "butterfly": 75 }
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Coach Reports to Admin
CREATE TABLE IF NOT EXISTS coach_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    attachment_url TEXT,
    report_date DATE DEFAULT CURRENT_DATE,
    is_reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_member_attendance_date ON member_attendance(date);
CREATE INDEX IF NOT EXISTS idx_coach_attendance_date ON coach_attendance(date);
CREATE INDEX IF NOT EXISTS idx_member_assessments_member ON member_assessments(member_id);

-- Enable RLS
ALTER TABLE member_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_reports ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies will be added as needed, but for now allow authenticated users
CREATE POLICY "Allow authenticated access to attendance" ON member_attendance FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access to coach attendance" ON coach_attendance FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access to assessments" ON member_assessments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access to reports" ON coach_reports FOR ALL USING (auth.role() = 'authenticated');
