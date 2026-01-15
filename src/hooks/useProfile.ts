import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  trust_rating: number;
  review_balance: number;
  reviews_completed: number;
  level: 'beginner' | 'reviewer' | 'expert';
  streak: number;
  last_activity_date: string | null;
  created_at: string;
  likes_received: number;
  correct_reviews: number;
  total_reviews: number;
}

export function useProfile(userId?: string) {
  const { user } = useAuth();
  const id = userId || user?.id;

  return useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!id,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('reviews_completed', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as Profile[];
    },
  });
}
