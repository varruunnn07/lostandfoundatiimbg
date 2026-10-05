-- 002_cleanup_and_simplify.sql
-- Description: Consolidates the database for a college MVP, safely removes collection requests, and secures permissions.

-------------------------------------------------------------------------------
-- 1. Pre-Migration Data Check & Safe Data Recovery
-------------------------------------------------------------------------------
DO $$
DECLARE
    requests_count INT;
BEGIN
    -- Check if there is any data in collection_requests before dropping it.
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'collection_requests') THEN
        SELECT COUNT(*) INTO requests_count FROM public.collection_requests;
        IF requests_count > 0 THEN
            RAISE EXCEPTION 'Migration halted: Found % obsolete records in collection_requests. Please manually delete them if you are sure they can be discarded, then re-run the migration.', requests_count;
        END IF;
    END IF;
END $$;

-- Recover contact data if item_contacts was partially applied in previous testing
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'item_contacts') THEN
        -- Ensure reporter_contact column exists on items
        ALTER TABLE public.items ADD COLUMN IF NOT EXISTS reporter_contact TEXT;
        
        -- Migrate any existing contact info back to the items table
        UPDATE public.items i
        SET reporter_contact = ic.reporter_contact
        FROM public.item_contacts ic
        WHERE i.id = ic.item_id AND i.reporter_contact IS NULL;
    END IF;
END $$;

-------------------------------------------------------------------------------
-- 2. Remove Obsolete Systems
-------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.collection_requests;
DROP FUNCTION IF EXISTS public.check_collection_request_validity();
DROP FUNCTION IF EXISTS public.approve_collection_request(UUID);
DROP TABLE IF EXISTS public.item_contacts;

-------------------------------------------------------------------------------
-- 3. Dynamic Policy Cleanup (True Clean Slate)
-------------------------------------------------------------------------------
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Drop all existing policies on profiles
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;

    -- Drop all existing policies on items
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'items'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.items', pol.policyname);
    END LOOP;
END $$;

-------------------------------------------------------------------------------
-- 4. Profiles Security & Policies
-------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recreate explicit, correct policies
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Explicitly configure grants to prevent role escalation.
GRANT SELECT ON public.profiles TO authenticated;
REVOKE INSERT, DELETE, UPDATE ON public.profiles FROM PUBLIC;
REVOKE INSERT, DELETE, UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name) ON public.profiles TO authenticated;

-- Secure profile auto-creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-------------------------------------------------------------------------------
-- 5. Items Security & Policies
-------------------------------------------------------------------------------
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS reporter_contact TEXT;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 1. Browsing: Authenticated users can see all items (available and collected)
CREATE POLICY "Users can view all items" 
    ON public.items FOR SELECT 
    TO authenticated
    USING (true);

-- 2. Creation: Users can only create their own items, which must start as 'available'
CREATE POLICY "Users can insert own items"
    ON public.items FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = reported_by AND
        status = 'available'
    );

-- 3. Updating: Users can update their own items (both USING and WITH CHECK)
CREATE POLICY "Users can update own items" 
    ON public.items FOR UPDATE 
    TO authenticated
    USING (auth.uid() = reported_by)
    WITH CHECK (auth.uid() = reported_by);

-- 4. Deleting: Users can delete their own items
CREATE POLICY "Users can delete own items"
    ON public.items FOR DELETE
    TO authenticated
    USING (auth.uid() = reported_by);

-- Protect internal fields via grants
GRANT SELECT, INSERT, DELETE ON public.items TO authenticated;
REVOKE UPDATE ON public.items FROM PUBLIC;
REVOKE UPDATE ON public.items FROM authenticated;
GRANT UPDATE (name, description, category, found_location, lost_location, collection_location, reporter_name, reporter_contact, image_path, status) ON public.items TO authenticated;

-------------------------------------------------------------------------------
-- 6. Status Transition & Integrity Enforcement
-------------------------------------------------------------------------------
-- Trigger to unconditionally enforce status flow and block ownership transfers
CREATE OR REPLACE FUNCTION public.enforce_item_status_transitions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Unconditionally prevent reverting a 'collected' item back to 'available'
    -- (If administrators need to revert items in the future, it should be done via a dedicated SECURITY DEFINER function that disables the trigger, rather than checking JWT claims here)
    IF OLD.status = 'collected' AND NEW.status = 'available' THEN
        RAISE EXCEPTION 'Cannot revert a collected item back to available.';
    END IF;

    -- Ownership is immutable
    IF NEW.reported_by IS DISTINCT FROM OLD.reported_by THEN
        RAISE EXCEPTION 'Cannot transfer item ownership.';
    END IF;

    -- Item type is immutable
    IF NEW.item_type IS DISTINCT FROM OLD.item_type THEN
        RAISE EXCEPTION 'Cannot change item type (lost/found) after creation.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_item_status_transitions_trigger ON public.items;
CREATE TRIGGER enforce_item_status_transitions_trigger
BEFORE UPDATE ON public.items
FOR EACH ROW EXECUTE PROCEDURE public.enforce_item_status_transitions();
