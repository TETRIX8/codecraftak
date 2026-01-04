-- Allow a chat participant to add the second user to a *private* chat
-- (needed for creating 1:1 chats from profile / users list)

CREATE POLICY "Participants can add users to private chats"
ON public.chat_participants
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND auth.uid() <> user_id
  AND public.is_chat_participant(auth.uid(), chat_id)
  AND EXISTS (
    SELECT 1
    FROM public.chats c
    WHERE c.id = chat_id
      AND c.type = 'private'
  )
);