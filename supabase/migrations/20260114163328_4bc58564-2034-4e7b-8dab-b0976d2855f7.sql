-- Create game_invites table for tracking game invitations
CREATE TABLE public.game_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, declined
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_game_invite UNIQUE(game_id, recipient_id)
);

-- Enable RLS
ALTER TABLE public.game_invites ENABLE ROW LEVEL SECURITY;

-- Users can view invites they sent or received
CREATE POLICY "Users can view their invites"
ON public.game_invites
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can create invites (they must be the sender)
CREATE POLICY "Users can send game invites"
ON public.game_invites
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can update invites they received (accept/decline)
CREATE POLICY "Recipients can update invites"
ON public.game_invites
FOR UPDATE
USING (auth.uid() = recipient_id);

-- Users can delete invites they sent
CREATE POLICY "Senders can delete their invites"
ON public.game_invites
FOR DELETE
USING (auth.uid() = sender_id);

-- Enable realtime for game_invites
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_invites;

-- Update notifications RLS to allow users to send game invitations
CREATE POLICY "Users can send game invite notifications"
ON public.notifications
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id 
  AND type = 'game_invite'
);