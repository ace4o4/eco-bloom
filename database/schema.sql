-- =====================================================
-- ECO-BLOOM DATABASE SCHEMA
-- Supabase SQL Setup for Circular Economy Platform
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For location features

-- =====================================================
-- USER PROFILES & AUTHENTICATION
-- =====================================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    location_coords GEOGRAPHY(POINT, 4326), -- For geo-based matching
    organization_name TEXT,
    organization_type TEXT CHECK (organization_type IN ('individual', 'business', 'nonprofit', 'government')),
    
    -- Gamification
    level TEXT DEFAULT 'Seedling',
    level_number INTEGER DEFAULT 1,
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- LISTINGS (Plant Match System)  
-- =====================================================

CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color_gradient TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert default categories
INSERT INTO public.categories (name, slug, description, icon, color_gradient) VALUES
('Organic Waste', 'organic', 'Food scraps, coffee grounds, plant matter', 'Wheat', 'from-primary to-secondary'),
('Textiles', 'textiles', 'Fabric, clothing, thread, leather scraps', 'Shirt', 'from-violet to-magenta'),
('Plastics', 'plastics', 'Clean plastics, packaging, containers', 'Recycle', 'from-info to-sky'),
('Metals', 'metals', 'Scrap metal, cans, electronics', 'Factory', 'from-accent to-golden'),
('Paper & Cardboard', 'paper', 'Cardboard, office paper, packaging', 'Package', 'from-golden to-sunlight'),
('Liquids & Oils', 'liquids', 'Cooking oil, industrial fluids', 'Droplets', 'from-ocean to-info');

CREATE TABLE public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Listing details
    type TEXT NOT NULL CHECK (type IN ('offering', 'seeking')),
    category_id UUID REFERENCES public.categories(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Quantity  
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL CHECK (unit IN ('kg', 'tons', 'liters', 'units')),
    frequency TEXT NOT NULL CHECK (frequency IN ('one-time', 'weekly', 'monthly', 'ongoing')),
    
    -- Location
    location TEXT NOT NULL,
    location_coords GEOGRAPHY(POINT, 4326),
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'matched', 'completed', 'cancelled')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- MATCHES
-- =====================================================

CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Listing references
    offering_listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    seeking_listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    
    -- User references
    offering_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    seeking_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Match details
    matched_quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in-progress', 'completed', 'cancelled')),
    
    -- Impact metrics
    co2_saved_kg NUMERIC DEFAULT 0,
    materials_diverted_kg NUMERIC DEFAULT 0,
    water_conserved_liters NUMERIC DEFAULT 0,
    
    -- Completion
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- SUSTAINABILITY SCORECARD
-- =====================================================

CREATE TABLE public.impact_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Cumulative impact
    total_co2_saved_kg NUMERIC DEFAULT 0,
    total_materials_diverted_kg NUMERIC DEFAULT 0,
    total_water_conserved_liters NUMERIC DEFAULT 0,
    total_matches INTEGER DEFAULT 0,
    trees_equivalent NUMERIC GENERATED ALWAYS AS (total_co2_saved_kg / 21.772) STORED, -- 1 tree absorbs ~21.772kg CO2/year
    
    -- Time-based metrics
    week_co2_saved_kg NUMERIC DEFAULT 0,
    week_materials_kg NUMERIC DEFAULT 0,
    week_water_liters NUMERIC DEFAULT 0,
    month_co2_saved_kg NUMERIC DEFAULT 0,
    month_materials_kg NUMERIC DEFAULT 0,
    month_water_liters NUMERIC DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    UNIQUE(user_id)
);

-- Track impact history for charts
CREATE TABLE public.impact_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    date DATE NOT NULL,
    co2_saved_kg NUMERIC DEFAULT 0,
    materials_diverted_kg NUMERIC DEFAULT 0,
    water_conserved_liters NUMERIC DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    UNIQUE(user_id, date)
);

-- =====================================================
-- BADGES & ACHIEVEMENTS
-- =====================================================

CREATE TABLE public.badge_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    category TEXT CHECK (category IN ('milestone', 'streak', 'impact', 'community', 'special')),
    
    -- Unlock criteria
    criteria_type TEXT CHECK (criteria_type IN ('matches_count', 'co2_saved', 'streak_days', 'materials_kg', 'water_liters', 'special')),
    criteria_value NUMERIC,
    
    points_reward INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert default badges
INSERT INTO public.badge_definitions (name, slug, description, icon, category, criteria_type, criteria_value, points_reward) VALUES
('First Seed', 'first-seed', 'Made your first match', '🌱', 'milestone', 'matches_count', 1, 50),
('Week Warrior', 'week-warrior', '7-day streak', '⚡', 'streak', 'streak_days', 7, 100),
('Carbon Crusher', 'carbon-crusher', 'Saved 1 ton CO₂', '☁️', 'impact', 'co2_saved', 1000, 200),
('Community Builder', 'community-builder', '10+ matches', '🤝', 'community', 'matches_count', 10, 150),
('Forest Guardian', 'forest-guardian', 'Saved 100 trees equivalent', '🌳', 'impact', 'co2_saved', 2177.2, 500),
('Ocean Protector', 'ocean-protector', 'Conserved 10,000L water', '🌊', 'impact', 'water_liters', 10000, 300);

CREATE TABLE public.user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    badge_id UUID REFERENCES public.badge_definitions(id) ON DELETE CASCADE NOT NULL,
    
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    progress NUMERIC DEFAULT 0, -- For tracking progress toward unearned badges
    
    UNIQUE(user_id, badge_id)
);

-- =====================================================
-- LEADERBOARD
-- =====================================================

-- Cached leaderboard rankings (updated via triggers/cron)
CREATE TABLE public.leaderboard_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Time periods
    period TEXT NOT NULL CHECK (period IN ('week', 'month', 'all-time')),
    
    -- Rankings
    rank INTEGER NOT NULL,
    points INTEGER DEFAULT 0,
    matches_count INTEGER DEFAULT 0,
    co2_saved_kg NUMERIC DEFAULT 0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    UNIQUE(user_id, period)
);

-- =====================================================
-- CHALLENGES
-- =====================================================

CREATE TABLE public.challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color_gradient TEXT,
    
    -- Challenge criteria
    challenge_type TEXT CHECK (challenge_type IN ('materials', 'matches', 'co2', 'water', 'category-specific')),
    target_value NUMERIC NOT NULL,
    current_value NUMERIC DEFAULT 0,
    unit TEXT,
    
    -- Category specific (optional)
    category_id UUID REFERENCES public.categories(id),
    
    -- Rewards
    points_reward INTEGER DEFAULT 0,
    badge_reward_id UUID REFERENCES public.badge_definitions(id),
    
    -- Timing
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Metadata
    participant_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('upcoming', 'active', 'completed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE public.challenge_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    contribution_value NUMERIC DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    UNIQUE(challenge_id, user_id)
);

-- =====================================================
-- COMMUNITY FEED / STORIES
-- =====================================================

CREATE TABLE public.community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE, -- Optional, if post is about a match
    
    -- Content
    content TEXT,
    impact_highlight TEXT, -- e.g., "5.2kg CO₂ saved!"
    
    -- Engagement
    reactions_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE public.post_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    reaction_type TEXT DEFAULT 'heart' CHECK (reaction_type IN ('heart', 'celebrate', 'leaf')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    UNIQUE(post_id, user_id)
);

CREATE TABLE public.post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    content TEXT NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- COMMUNITY GOALS
-- =====================================================

CREATE TABLE public.community_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color_gradient TEXT,
    
    -- Goal metrics
    goal_type TEXT CHECK (goal_type IN ('materials', 'co2', 'businesses', 'matches')),
    current_value NUMERIC DEFAULT 0,
    target_value NUMERIC NOT NULL,
    unit TEXT,
    
    -- Milestones
    milestone_description TEXT,
    
    -- Timing
    deadline DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- ECO MAP LOCATIONS
-- =====================================================

CREATE TABLE public.eco_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    location_coords GEOGRAPHY(POINT, 4326) NOT NULL,
    location_address TEXT NOT NULL,
    
    -- Type (business, community hub, etc.)
    location_type TEXT CHECK (location_type IN ('business', 'hub', 'collection-point', 'user')),
    
    -- Activity metrics
    total_matches INTEGER DEFAULT 0,
    co2_saved_kg NUMERIC DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_locations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Listings policies
CREATE POLICY "Listings are viewable by everyone" ON public.listings
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own listings" ON public.listings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" ON public.listings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" ON public.listings
    FOR DELETE USING (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view their own matches" ON public.matches
    FOR SELECT USING (auth.uid() = offering_user_id OR auth.uid() = seeking_user_id);

CREATE POLICY "Users can create matches" ON public.matches
    FOR INSERT WITH CHECK (auth.uid() = offering_user_id OR auth.uid() = seeking_user_id);

CREATE POLICY "Users can update their own matches" ON public.matches
    FOR UPDATE USING (auth.uid() = offering_user_id OR auth.uid() = seeking_user_id);

-- Impact metrics policies
CREATE POLICY "Users can view their own impact metrics" ON public.impact_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own impact metrics" ON public.impact_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own impact metrics" ON public.impact_metrics
    FOR UPDATE USING (auth.uid() = user_id);

-- Community posts policies
CREATE POLICY "Posts are viewable by everyone" ON public.community_posts
    FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON public.community_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON public.community_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON public.community_posts
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_impact_metrics_updated_at BEFORE UPDATE ON public.impact_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name'
    );
    
    -- Initialize impact metrics
    INSERT INTO public.impact_metrics (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    days_since_last_activity INTEGER;
BEGIN
    -- Calculate days since last activity
    days_since_last_activity := CURRENT_DATE - NEW.last_activity_date;
    
    IF days_since_last_activity = 1 THEN
        -- Continue streak
        NEW.current_streak := NEW.current_streak + 1;
        IF NEW.current_streak > NEW.longest_streak THEN
            NEW.longest_streak := NEW.current_streak;
        END IF;
    ELSIF days_since_last_activity > 1 THEN
        -- Reset streak
        NEW.current_streak := 1;
    END IF;
    
    NEW.last_activity_date := CURRENT_DATE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User lookup indexes
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_location_coords ON public.profiles USING GIST(location_coords);

-- Listing indexes
CREATE INDEX idx_listings_user_id ON public.listings(user_id);
CREATE INDEX idx_listings_category_id ON public.listings(category_id);
CREATE INDEX idx_listings_type ON public.listings(type);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_location_coords ON public.listings USING GIST(location_coords);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);

-- Match indexes
CREATE INDEX idx_matches_offering_user ON public.matches(offering_user_id);
CREATE INDEX idx_matches_seeking_user ON public.matches(seeking_user_id);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_matches_created_at ON public.matches(created_at DESC);

-- Impact indexes
CREATE INDEX idx_impact_metrics_user_id ON public.impact_metrics(user_id);
CREATE INDEX idx_impact_history_user_date ON public.impact_history(user_id, date DESC);

-- Leaderboard indexes
CREATE INDEX idx_leaderboard_period_rank ON public.leaderboard_rankings(period, rank);

-- Community feed indexes
CREATE INDEX idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at DESC);

-- Challenge indexes
CREATE INDEX idx_challenges_status_ends_at ON public.challenges(status, ends_at);
CREATE INDEX idx_challenge_participants_user ON public.challenge_participants(user_id);

-- =====================================================
-- COMPLETED!
-- Run this script in Supabase SQL Editor
-- =====================================================
