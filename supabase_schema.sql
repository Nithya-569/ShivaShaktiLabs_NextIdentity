-- ============================================================
-- NextIdentity — Profile System Migration
-- Safe to re-run
-- ============================================================

-- Extend profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name       text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url         text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio                text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pronouns           text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender_identity    text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city               text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills             text[]  DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests          text[]  DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS goals              text[]  DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS anonymous_default  boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nickname_mode      boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_city_public   boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_pronouns_public boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_complete   boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at         timestamptz DEFAULT now();

-- Posts: ensure all columns exist (from previous migration)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS community_id uuid;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes_count  integer DEFAULT 0;

-- Fix RLS on posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read for all on posts" ON posts;
DROP POLICY IF EXISTS "Allow insert for authenticated on posts" ON posts;
DROP POLICY IF EXISTS "posts_update_own" ON posts;
DROP POLICY IF EXISTS "posts_delete_own" ON posts;
CREATE POLICY "posts_select"     ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert"     ON posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "posts_update_own" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete_own" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Communities
CREATE TABLE IF NOT EXISTS communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "communities_select" ON communities;
DROP POLICY IF EXISTS "communities_insert" ON communities;
CREATE POLICY "communities_select" ON communities FOR SELECT USING (true);
CREATE POLICY "communities_insert" ON communities FOR INSERT TO authenticated WITH CHECK (true);

-- Community members
CREATE TABLE IF NOT EXISTS community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(community_id, user_id)
);
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "members_select" ON community_members;
DROP POLICY IF EXISTS "members_insert" ON community_members;
CREATE POLICY "members_select" ON community_members FOR SELECT USING (true);
CREATE POLICY "members_insert" ON community_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL DEFAULT 'reply',
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif_select_own" ON notifications;
DROP POLICY IF EXISTS "notif_insert" ON notifications;
CREATE POLICY "notif_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_insert"     ON notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Saved jobs
CREATE TABLE IF NOT EXISTS saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_title text NOT NULL,
  company text,
  saved_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, job_title)
);
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "saved_jobs_own" ON saved_jobs;
CREATE POLICY "saved_jobs_own" ON saved_jobs FOR ALL USING (auth.uid() = user_id);

-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "avatars_upload" ON storage.objects;
DROP POLICY IF EXISTS "avatars_public" ON storage.objects;
CREATE POLICY "avatars_upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_public" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Auto-create profile row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();