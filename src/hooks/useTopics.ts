import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Topic {
  id: string;
  title: string;
  description: string | null;
  content: string;
  category: string;
  author_id: string | null;
  is_published: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    nickname: string;
    avatar_url: string | null;
  };
}

export function useTopics(category?: string) {
  return useQuery({
    queryKey: ['topics', category],
    queryFn: async () => {
      let query = supabase
        .from('topics')
        .select(`
          *,
          author:profiles!topics_author_id_fkey(nickname, avatar_url)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Topic[];
    },
  });
}

export function useTopic(id: string) {
  return useQuery({
    queryKey: ['topic', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topics')
        .select(`
          *,
          author:profiles!topics_author_id_fkey(nickname, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Increment views count
      await supabase
        .from('topics')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', id);

      return data as Topic;
    },
    enabled: !!id,
  });
}

export function useAdminTopics() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const topicsQuery = useQuery({
    queryKey: ['admin-topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Topic[];
    },
  });

  const createTopic = useMutation({
    mutationFn: async (topic: {
      title: string;
      description?: string;
      content: string;
      category: string;
      is_published: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('topics')
        .insert({
          ...topic,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-topics'] });
      toast({ title: 'Тема создана успешно!' });
    },
    onError: (error) => {
      toast({ title: 'Ошибка создания темы', description: error.message, variant: 'destructive' });
    },
  });

  const updateTopic = useMutation({
    mutationFn: async ({ id, ...topic }: {
      id: string;
      title?: string;
      description?: string;
      content?: string;
      category?: string;
      is_published?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('topics')
        .update({ ...topic, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-topics'] });
      toast({ title: 'Тема обновлена!' });
    },
    onError: (error) => {
      toast({ title: 'Ошибка обновления', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTopic = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-topics'] });
      toast({ title: 'Тема удалена!' });
    },
    onError: (error) => {
      toast({ title: 'Ошибка удаления', description: error.message, variant: 'destructive' });
    },
  });

  return {
    topics: topicsQuery.data || [],
    isLoading: topicsQuery.isLoading,
    createTopic,
    updateTopic,
    deleteTopic,
  };
}
