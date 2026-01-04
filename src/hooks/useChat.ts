import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const GLOBAL_CHAT_ID = '00000000-0000-0000-0000-000000000001';

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string | null;
  message_type: 'text' | 'image' | 'voice';
  file_url: string | null;
  created_at: string;
  sender?: {
    id: string;
    nickname: string;
    avatar_url: string | null;
  };
}

export interface Chat {
  id: string;
  type: 'private' | 'global';
  created_at: string;
  participants?: {
    user_id: string;
    profiles: {
      id: string;
      nickname: string;
      avatar_url: string | null;
    };
  }[];
  lastMessage?: Message;
}

export function useGlobalChat() {
  return useQuery({
    queryKey: ['global-chat'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('id', GLOBAL_CHAT_ID)
        .single();

      if (error) throw error;
      return data;
    },
  });
}

export function usePrivateChats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['private-chats', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: participations, error: partError } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', user.id);

      if (partError) throw partError;
      if (!participations?.length) return [];

      const chatIds = participations.map(p => p.chat_id);

      const { data: chats, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .in('id', chatIds)
        .eq('type', 'private');

      if (chatsError) throw chatsError;

      // Get participants for each chat
      const chatsWithParticipants = await Promise.all(
        (chats || []).map(async (chat) => {
          const { data: participants } = await supabase
            .from('chat_participants')
            .select('user_id, profiles:user_id(id, nickname, avatar_url)')
            .eq('chat_id', chat.id)
            .neq('user_id', user.id);

          const { data: lastMsg } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...chat,
            participants: participants || [],
            lastMessage: lastMsg,
          } as Chat;
        })
      );

      return chatsWithParticipants;
    },
    enabled: !!user,
  });
}

export function useMessages(chatId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, nickname, avatar_url)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!chatId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`messages-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          // Fetch sender info for the new message
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, nickname, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();

          const newMessage = { ...payload.new, sender } as Message;

          queryClient.setQueryData(['messages', chatId], (old: Message[] = []) => {
            const exists = old.some(m => m.id === newMessage.id);
            if (exists) return old;
            return [...old, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, queryClient]);

  return query;
}

export function useSendMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      content,
      messageType = 'text',
      fileUrl,
    }: {
      chatId: string;
      content?: string;
      messageType?: 'text' | 'image' | 'voice';
      fileUrl?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content,
          message_type: messageType,
          file_url: fileUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['private-chats'] });
    },
  });
}

export function useCreatePrivateChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) throw new Error('Not authenticated');

      // Check if chat already exists
      const { data: existingParticipations } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', user.id);

      if (existingParticipations?.length) {
        for (const p of existingParticipations) {
          const { data: otherParticipant } = await supabase
            .from('chat_participants')
            .select('chat_id')
            .eq('chat_id', p.chat_id)
            .eq('user_id', otherUserId)
            .maybeSingle();

          if (otherParticipant) {
            // Chat already exists
            const { data: chat } = await supabase
              .from('chats')
              .select('*')
              .eq('id', p.chat_id)
              .eq('type', 'private')
              .single();
            
            if (chat) return chat;
          }
        }
      }

      // Create new chat
      // NOTE: We intentionally do NOT request `return=representation` here,
      // because the newly created chat isn't visible via SELECT until the creator
      // is added as a participant (RLS on `chats`).
      const chatId = crypto.randomUUID();

      const { error: chatError } = await supabase
        .from('chats')
        .insert({ id: chatId, type: 'private' });

      if (chatError) throw chatError;

      // Add creator first (so they become a participant)
      const { error: selfParticipantError } = await supabase
        .from('chat_participants')
        .insert({ chat_id: chatId, user_id: user.id });

      if (selfParticipantError) throw selfParticipantError;

      // Then add the other user
      const { error: otherParticipantError } = await supabase
        .from('chat_participants')
        .insert({ chat_id: chatId, user_id: otherUserId });

      if (otherParticipantError) throw otherParticipantError;

      return {
        id: chatId,
        type: 'private',
        created_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['private-chats'] });
    },
  });
}

export function useUploadMedia() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ file, type }: { file: Blob; type: 'image' | 'voice' }) => {
      if (!user) throw new Error('Not authenticated');

      const ext = type === 'image' ? 'jpg' : 'webm';
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('chat-media')
        .getPublicUrl(path);

      return data.publicUrl;
    },
  });
}
