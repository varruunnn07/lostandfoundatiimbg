-- 003_storage_setup.sql
-- Description: Creates the item-images storage bucket and configures the necessary RLS policies.

-- 1. Create the bucket (Safe to run if it already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies on storage.objects for this bucket to ensure a clean slate
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own images" ON storage.objects;

-- 3. Create the INSERT policy
-- Allows any authenticated user to upload an image to the 'item-images' bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'item-images');

-- 4. Create the SELECT policy
-- Allows anyone (public) to view the images
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'item-images');

-- 5. Create the UPDATE policy (optional but good practice)
-- Allows users to update/overwrite only images they own
CREATE POLICY "Allow authenticated users to update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'item-images' AND auth.uid() = owner);

-- 6. Create the DELETE policy (optional but good practice)
-- Allows users to delete only images they own
CREATE POLICY "Allow authenticated users to delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'item-images' AND auth.uid() = owner);
