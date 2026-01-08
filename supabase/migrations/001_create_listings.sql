-- Eco-Bloom Listings Table Schema
-- Run this in Supabase SQL Editor

-- Enable PostGIS extension for location queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('offering', 'seeking')),
  
  -- Material Info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity TEXT NOT NULL,
  unit TEXT NOT NULL,
  
  -- Location (using PostGIS for geo queries)
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_address TEXT,
  
  -- Images
  image_url TEXT,
  
  -- Metadata
  frequency TEXT DEFAULT 'one-time',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- User contact (denormalized for performance)
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(type);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);

-- Spatial index for location queries
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings USING GIST(
  ST_MakePoint(location_lng, location_lat)::geography
);

-- Enable Row Level Security
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view active listings
CREATE POLICY "Anyone can view active listings"
  ON listings FOR SELECT
  USING (status = 'active');

-- Users can insert their own listings
CREATE POLICY "Users can create listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE
  USING (auth.uid() = user_id);

-- Create function for distance-based search
CREATE OR REPLACE FUNCTION listings_within_radius(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_km INTEGER
)
RETURNS SETOF listings
LANGUAGE sql
AS $$
  SELECT *
  FROM listings
  WHERE ST_DWithin(
    ST_MakePoint(location_lng, location_lat)::geography,
    ST_MakePoint(lng, lat)::geography,
    radius_km * 1000  -- Convert km to meters
  )
  AND status = 'active'
  AND type = 'offering';
$$;

-- Storage bucket setup (run separately in Storage section)
-- Go to Storage > Create Bucket
-- Bucket name: listing-images
-- Public: Yes
-- Then run these SQL policies:

-- Storage policies for listing images
CREATE POLICY "Anyone can view listing images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own images"
  ON storage.objects FOR UPDATE
  USING (auth.uid() = owner);

CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (auth.uid() = owner);
