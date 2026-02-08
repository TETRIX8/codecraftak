
-- Add custom avatar permission flag to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS can_upload_avatar boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.can_upload_avatar IS 'Admin-granted permission to upload custom avatar';
