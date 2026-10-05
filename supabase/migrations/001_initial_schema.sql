-- 001_initial_schema.sql
-- Description: Initial schema for Lost & Found Portal

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'user'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Admin role assignment should be done manually by an admin or via a secure backend function.
-- RLS prevents users from changing their own role.

-- 2. Items Table
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    item_type TEXT NOT NULL CHECK (item_type IN ('lost', 'found')),
    found_location TEXT,
    lost_location TEXT,
    collection_location TEXT,
    reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reporter_name TEXT,
    reporter_contact TEXT,
    image_path TEXT,
    status TEXT DEFAULT 'available'::text CHECK (status IN ('available', 'collected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger for auto-updating `updated_at` on items
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_items_modtime
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- 3. Collection Requests Table
CREATE TABLE collection_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_name TEXT NOT NULL,
    receiver_contact TEXT NOT NULL,
    receiver_student_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX items_reported_by_idx ON items(reported_by);
CREATE INDEX collection_requests_item_id_idx ON collection_requests(item_id);
CREATE INDEX collection_requests_requester_id_idx ON collection_requests(requester_id);

-------------------------------------------------------------------------------
-- Row Level Security (RLS) Configuration
-------------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_requests ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
-- Users can read their own profile
CREATE POLICY "Users can view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);

-- Users can update their own profile (except role)
-- Security Limitation Note: PostgreSQL RLS doesn't restrict specific columns easily. 
-- To strictly prevent users from updating their `role` via standard UPDATE queries,
-- we use a policy WITH CHECK that ensures the role remains unchanged for ordinary users.
CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND 
        (
            -- Either the user is not changing their role
            role = (SELECT role FROM profiles WHERE id = auth.uid())
        )
    );

-- Items RLS
-- Authenticated users can view available items
CREATE POLICY "Authenticated users can view available items" 
    ON items FOR SELECT 
    TO authenticated
    USING (status = 'available');

-- Authenticated users can insert their own items
CREATE POLICY "Users can insert own items" 
    ON items FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = reported_by);

-- Users can update their own items (but cannot change ownership or arbitrarily mark as collected)
-- Security Limitation: To safely manage the 'collected' status transition, a separate database function 
-- with SECURITY DEFINER should be used, or an admin-only policy. The frontend shouldn't be able to just 
-- UPDATE status = 'collected' indiscriminately. Here we enforce that the user stays the reporter.
CREATE POLICY "Users can update own items" 
    ON items FOR UPDATE 
    TO authenticated
    USING (auth.uid() = reported_by)
    WITH CHECK (
        auth.uid() = reported_by 
        AND status = 'available' -- Only allow edits if still available
    );

-- Users can delete their own items
CREATE POLICY "Users can delete own items" 
    ON items FOR DELETE 
    TO authenticated
    USING (auth.uid() = reported_by);

-- Collection Requests RLS
-- Users can only view their own requests
CREATE POLICY "Users can view own requests" 
    ON collection_requests FOR SELECT 
    TO authenticated
    USING (auth.uid() = requester_id);

-- Users can create a collection request for themselves
CREATE POLICY "Users can insert own requests" 
    ON collection_requests FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = requester_id);

-------------------------------------------------------------------------------
-- Storage Bucket Instructions
-------------------------------------------------------------------------------
-- Run the following via the dashboard or a secure API call to setup the bucket:
-- 1. Create a new bucket named 'item-images'.
-- 2. Set it to 'Private'.
-- 3. Add Storage RLS policies for 'item-images':
--    - INSERT: Allow authenticated users to upload files to 'item-images'.
--    - SELECT: Allow authenticated users to read files from 'item-images'.
--    - DELETE: Allow users to delete files ONLY if they own the related item (requires an advanced RLS join or a secure function).
