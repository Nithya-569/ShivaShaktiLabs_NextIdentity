-- NextIdentity Communities Feature SQL
-- Run this in Supabase SQL Editor
-- Production-ready version with auto member count and duplicate prevention

-- ============================================
-- COMMUNITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  city TEXT,
  category TEXT DEFAULT 'Social',
  is_verified BOOLEAN DEFAULT false,
  join_link TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  member_count INTEGER DEFAULT 0 CHECK (member_count >= 0)
);

-- Add member_count column if not exists (safe for re-run)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'communities' AND column_name = 'member_count'
  ) THEN
    ALTER TABLE communities ADD COLUMN member_count INTEGER DEFAULT 0 CHECK (member_count >= 0);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communities (drop if exists for safe re-run)
DROP POLICY IF EXISTS "Anyone can view communities" ON communities;
CREATE POLICY "Anyone can view communities" ON communities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create communities" ON communities;
CREATE POLICY "Authenticated users can create communities" ON communities FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creator can update community" ON communities;
CREATE POLICY "Creator can update community" ON communities FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creator can delete community" ON communities;
CREATE POLICY "Creator can delete community" ON communities FOR DELETE USING (auth.uid() = created_by);

-- ============================================
-- COMMUNITY MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Enable RLS
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_members (drop if exists for safe re-run)
DROP POLICY IF EXISTS "Members can view their memberships" ON community_members;
CREATE POLICY "Members can view their memberships" ON community_members FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own membership" ON community_members;
CREATE POLICY "Users can insert their own membership" ON community_members FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave community" ON community_members;
CREATE POLICY "Users can leave community" ON community_members FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- AUTO MEMBER COUNT TRIGGERS
-- ============================================

-- Function to increment member count
CREATE OR REPLACE FUNCTION increment_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE communities
  SET member_count = COALESCE(member_count, 0) + 1
  WHERE id = NEW.community_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement member count
CREATE OR REPLACE FUNCTION decrement_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE communities
  SET member_count = GREATEST(COALESCE(member_count, 0) - 1, 0)
  WHERE id = OLD.community_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for member join (increment)
DROP TRIGGER IF EXISTS trigger_increment_member ON community_members;
CREATE TRIGGER trigger_increment_member
AFTER INSERT ON community_members
FOR EACH ROW
EXECUTE FUNCTION increment_member_count();

-- Trigger for member leave (decrement)
DROP TRIGGER IF EXISTS trigger_decrement_member ON community_members;
CREATE TRIGGER trigger_decrement_member
AFTER DELETE ON community_members
FOR EACH ROW
EXECUTE FUNCTION decrement_member_count();

-- ============================================
-- SAMPLE DATA - 15 Realistic India Communities
-- Safe insert with ON CONFLICT DO NOTHING
-- ============================================
INSERT INTO communities (name, description, city, category, is_verified, join_link) VALUES
('Bangalore Trans Support Circle', 'A safe space for trans individuals in Bangalore to connect, share experiences, and support each other through transition journeys.', 'Bangalore', 'Support', true, 'https://discord.gg/bangalore-trans'),
('Mumbai Pride Wellness Network', 'Mental health and wellness support group for LGBTQ+ individuals in Mumbai. Professional counseling and peer support available.', 'Mumbai', 'Support', true, 'https://meetup.com/mumbai-pride-wellness'),
('Chennai LGBTQ Career Hub', 'Professional networking group for LGBTQ+ professionals in Chennai. Job opportunities, career guidance, and mentorship programs.', 'Chennai', 'Career', true, 'https://linkedin.com/groups/chennai-lgbtq-careers'),
('Hyderabad Safe Housing Group', 'Finding safe and affordable housing for LGBTQ+ individuals in Hyderabad. Roommate matching and landlord connections.', 'Hyderabad', 'Housing', true, 'https://housing.hydpride.org'),
('Pune Trans Tech Circle', 'Tech-focused community for trans professionals in Pune. Coding bootcamps, job placements, and skill development.', 'Pune', 'Career', true, 'https://pune-trans-tech.dev'),
('Delhi Legal Aid Community', 'Free legal assistance for LGBTQ+ individuals in Delhi. Know your rights, legal counseling, and court case support.', 'Delhi', 'Legal', true, 'https://delhilgbtqlegal.org'),
('Kolkata Rainbow Social', 'Social and cultural hub for LGBTQ+ community in Kolkata. Events, meetups, and cultural activities.', 'Kolkata', 'Social', true, 'https://kolkatarainbow.in'),
('Ahmedabad Queer Youth Alliance', 'Youth-focused group for LGBTQ+ individuals in Ahmedabad. Education, awareness, and peer support.', 'Ahmedabad', 'Support', false, 'https://aqya.org'),
('Goa Pride Collective', 'Beach-friendly LGBTQ+ community in Goa. Tourism, hospitality jobs, and social events.', 'Goa', 'Social', true, 'https://goapride.org'),
('Jaipur LGBTQ Sports Club', 'Sports and fitness community for LGBTQ+ individuals in Jaipur. Cricket, football, and fitness events.', 'Jaipur', 'Social', false, 'https://jaipurpride.sports'),
('Gurgaon Corporate Allies', 'Corporate diversity and inclusion network in Gurgaon. Ally training, mentorship, and workplace resources.', 'Gurgaon', 'Career', true, 'https://gurgaonallies.com'),
('Kochi Queer Artists Network', 'Creative platform for LGBTQ+ artists in Kochi. Art exhibitions, music, theater, and cultural events.', 'Kochi', 'Social', true, 'https://kochiqueer.art'),
('Chandigarh Family Support Group', 'Family support network for parents and families of LGBTQ+ individuals in Chandigarh.', 'Chandigarh', 'Support', true, 'https://chandigarhfamilysupport.org'),
('Visakhapatnam Coastal Pride', 'Coastal community for LGBTQ+ individuals in Visakhapatnam. Marine jobs, fishing community support.', 'Visakhapatnam', 'Social', false, 'https://vizagpride.org'),
('Lucknow Heritage & Pride', 'Preserving LGBTQ+ heritage and history in Lucknow. Cultural events, historical awareness, and community building.', 'Lucknow', 'Social', false, 'https://lucknowheritagepride.org')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_communities_city ON communities(city);
CREATE INDEX IF NOT EXISTS idx_communities_category ON communities(category);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);