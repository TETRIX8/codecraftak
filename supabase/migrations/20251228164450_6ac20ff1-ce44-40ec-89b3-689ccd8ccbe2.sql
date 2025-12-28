-- Удаляем проблемные политики
DROP POLICY IF EXISTS "Users can view chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view their chats" ON public.chats;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

-- Создаём функцию для проверки участия в чате (избегаем рекурсии)
CREATE OR REPLACE FUNCTION public.is_chat_participant(_user_id uuid, _chat_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_participants
    WHERE user_id = _user_id
      AND chat_id = _chat_id
  )
$$;

-- Создаём функцию для проверки глобального чата
CREATE OR REPLACE FUNCTION public.is_global_chat(_chat_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chats
    WHERE id = _chat_id
      AND type = 'global'
  )
$$;

-- Новые политики для chat_participants (без рекурсии)
CREATE POLICY "Users can view own participations" ON public.chat_participants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view global chat participants" ON public.chat_participants
  FOR SELECT USING (is_global_chat(chat_id));

-- Новые политики для chats
CREATE POLICY "Users can view their chats" ON public.chats
  FOR SELECT USING (
    type = 'global' OR is_chat_participant(auth.uid(), id)
  );

-- Новые политики для messages
CREATE POLICY "Users can view messages in their chats" ON public.messages
  FOR SELECT USING (
    is_global_chat(chat_id) OR is_chat_participant(auth.uid(), chat_id)
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND (
      is_global_chat(chat_id) OR is_chat_participant(auth.uid(), chat_id)
    )
  );