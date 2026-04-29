-- ============================================================
-- NextIdentity — Jobs Table
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS jobs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  company_name     text NOT NULL,
  description      text,
  city             text,
  salary           text,
  contact_email    text,
  contact_whatsapp text,
  source           text DEFAULT 'community',   -- 'community' | 'api'
  is_verified      boolean DEFAULT false,
  is_remote        boolean DEFAULT false,
  is_inclusive     boolean DEFAULT true,
  posted_by        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Anyone can view
DROP POLICY IF EXISTS "jobs_select" ON jobs;
CREATE POLICY "jobs_select" ON jobs FOR SELECT USING (true);

-- Authenticated users can post
DROP POLICY IF EXISTS "jobs_insert" ON jobs;
CREATE POLICY "jobs_insert" ON jobs FOR INSERT TO authenticated WITH CHECK (true);

-- Only owner can update
DROP POLICY IF EXISTS "jobs_update_own" ON jobs;
CREATE POLICY "jobs_update_own" ON jobs FOR UPDATE USING (auth.uid() = posted_by);

-- Only owner can delete
DROP POLICY IF EXISTS "jobs_delete_own" ON jobs;
CREATE POLICY "jobs_delete_own" ON jobs FOR DELETE USING (auth.uid() = posted_by);

-- Enable realtime for jobs table
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;