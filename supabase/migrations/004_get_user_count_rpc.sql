-- Migration: 004_get_user_count_rpc.sql
-- Description: Create a secure RPC function to get the total count of users without exposing profile data.

CREATE OR REPLACE FUNCTION public.get_user_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count integer;
BEGIN
  SELECT count(*) INTO total_count FROM public.profiles;
  RETURN total_count;
END;
$$;
