-- Создаём bucket для медиафайлов чата
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-media', 'chat-media', true);

-- Политики для загрузки и просмотра файлов
CREATE POLICY "Anyone can view chat media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'chat-media');

CREATE POLICY "Authenticated users can upload chat media" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'chat-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own media" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);