-- Drop the problematic policy
DROP POLICY IF EXISTS "Participants can add users to private chats" ON public.chat_participants;

-- The "Users can join chats" policy already allows users to add themselves (auth.uid() = user_id)
-- We need a separate policy for adding OTHER users to a chat where the current user is already a participant

-- Create a policy that allows chat creators/participants to add OTHER users
CREATE POLICY "Chat participants can add other users"
ON public.chat_participants
FOR INSERT
TO authenticated
WITH CHECK (
  -- Adding another user (not self)
  auth.uid() <> user_id 
  AND is_chat_participant(auth.uid(), chat_id)
  AND EXISTS (
    SELECT 1 FROM chats c 
    WHERE c.id = chat_id AND c.type = 'private'
  )
);