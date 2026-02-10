
-- Step 1: Only add enum values
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'anticheat';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'starosta';
