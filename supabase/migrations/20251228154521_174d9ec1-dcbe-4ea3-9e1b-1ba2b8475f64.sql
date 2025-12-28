-- Таблица лайков профилей
CREATE TABLE public.profile_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  liker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  liked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(liker_id, liked_id),
  CHECK (liker_id != liked_id)
);

-- Таблица чатов (личные и общий)
CREATE TABLE public.chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'private' CHECK (type IN ('private', 'global')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Участники чата (для приватных чатов)
CREATE TABLE public.chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(chat_id, user_id)
);

-- Сообщения
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'voice')),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Добавляем поле likes_received в profiles
ALTER TABLE public.profiles ADD COLUMN likes_received INTEGER DEFAULT 0;

-- RLS для лайков
ALTER TABLE public.profile_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view likes" ON public.profile_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like others" ON public.profile_likes
  FOR INSERT WITH CHECK (auth.uid() = liker_id);

CREATE POLICY "Users can unlike" ON public.profile_likes
  FOR DELETE USING (auth.uid() = liker_id);

-- RLS для чатов
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their chats" ON public.chats
  FOR SELECT USING (
    type = 'global' OR 
    EXISTS (SELECT 1 FROM public.chat_participants WHERE chat_id = id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create private chats" ON public.chats
  FOR INSERT WITH CHECK (type = 'private');

-- RLS для участников чата
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chat participants" ON public.chat_participants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chat_participants cp WHERE cp.chat_id = chat_id AND cp.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.chats WHERE id = chat_id AND type = 'global')
  );

CREATE POLICY "Users can join chats" ON public.chat_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS для сообщений
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their chats" ON public.messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chat_participants WHERE chat_id = messages.chat_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.chats WHERE id = chat_id AND type = 'global')
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND (
      EXISTS (SELECT 1 FROM public.chat_participants WHERE chat_id = messages.chat_id AND user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.chats WHERE id = chat_id AND type = 'global')
    )
  );

-- Триггер для обновления likes_received и trust_rating при лайке
CREATE OR REPLACE FUNCTION public.handle_profile_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET likes_received = COALESCE(likes_received, 0) + 1,
        trust_rating = COALESCE(trust_rating, 50) + 1
    WHERE id = NEW.liked_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET likes_received = GREATEST(COALESCE(likes_received, 0) - 1, 0),
        trust_rating = GREATEST(COALESCE(trust_rating, 50) - 1, 0)
    WHERE id = OLD.liked_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_profile_like
  AFTER INSERT OR DELETE ON public.profile_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_like();

-- Создаём глобальный чат
INSERT INTO public.chats (id, type) VALUES ('00000000-0000-0000-0000-000000000001', 'global');

-- Включаем realtime для сообщений
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;