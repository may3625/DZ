-- Fix security warning: Move vector extension from public to extensions schema
-- This addresses the "extension in public" security warning

-- First, check if extensions schema exists, create if not
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move the vector extension from public to extensions schema
DROP EXTENSION IF EXISTS vector CASCADE;
CREATE EXTENSION vector SCHEMA extensions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA extensions TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA extensions TO anon, authenticated, service_role;