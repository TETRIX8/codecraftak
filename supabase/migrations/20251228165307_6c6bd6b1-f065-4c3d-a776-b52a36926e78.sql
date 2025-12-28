-- Удаляем старую политику
DROP POLICY IF EXISTS "Users can create private chats" ON public.chats;

-- Создаём новую политику - авторизованные пользователи могут создавать приватные чаты
CREATE POLICY "Authenticated users can create private chats" ON public.chats
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND type = 'private');