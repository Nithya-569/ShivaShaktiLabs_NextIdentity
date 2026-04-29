-- ============================================================
-- NextIdentity — Jobs Table + Local Job Upgrade
-- Safe to run multiple times (uses IF NOT EXISTS)
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS jobs (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text        NOT NULL,
  company_name      text        NOT NULL,
  description       text,
  city              text,
  area              text,
  salary            text,
  job_type          text        DEFAULT 'Full Time',
  contact_email     text,
  contact_whatsapp  text,
  contact_phone     text,
  source            text        DEFAULT 'community',
  is_verified       boolean     DEFAULT false,
  is_remote         boolean     DEFAULT false,
  is_inclusive      boolean     DEFAULT true,
  immediate_joining boolean     DEFAULT false,
  posted_by         uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        timestamptz DEFAULT now() NOT NULL
);

-- Safely add new columns if upgrading from old schema
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS area             text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_type         text DEFAULT 'Full Time';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS contact_phone    text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS immediate_joining boolean DEFAULT false;

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policies (drop first so re-running is safe)
DROP POLICY IF EXISTS "jobs_select"      ON jobs;
DROP POLICY IF EXISTS "jobs_insert"      ON jobs;
DROP POLICY IF EXISTS "jobs_update_own"  ON jobs;
DROP POLICY IF EXISTS "jobs_delete_own"  ON jobs;

CREATE POLICY "jobs_select"
  ON jobs FOR SELECT USING (true);

CREATE POLICY "jobs_insert"
  ON jobs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "jobs_update_own"
  ON jobs FOR UPDATE USING (auth.uid() = posted_by);

CREATE POLICY "jobs_delete_own"
  ON jobs FOR DELETE USING (auth.uid() = posted_by);

-- Enable realtime
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
  END;
END $$;