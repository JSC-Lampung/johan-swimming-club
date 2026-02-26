
-- Create Member Leave Requests Table
CREATE TABLE IF NOT EXISTS member_leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    leave_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'read')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE member_leave_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own leave requests" ON member_leave_requests
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Users can insert their own leave requests" ON member_leave_requests
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Coaches and Admins can view all leave requests" ON member_leave_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.role = 'coach' OR profiles.role = 'admin')
        )
    );

CREATE POLICY "Coaches and Admins can delete leave requests" ON member_leave_requests
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.role = 'coach' OR profiles.role = 'admin')
        )
    );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_member_leave_requests_date ON member_leave_requests(leave_date);
