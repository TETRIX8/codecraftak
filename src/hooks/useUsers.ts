import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  trust_rating: number | null;
  reviews_completed: number | null;
  level: 'beginner' | 'reviewer' | 'expert' | null;
  likes_received: number | null;
  created_at: string | null;
}

export function useSearchUsers(query: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['users-search', query],
    queryFn: async () => {
      let queryBuilder = supabase
        .from('profiles')
        .select('id, nickname, avatar_url, trust_rating, reviews_completed, level, likes_received, created_at')
        .order('likes_received', { ascending: false, nullsFirst: false });

      if (query.trim()) {
        queryBuilder = queryBuilder.ilike('nickname', `%${query}%`);
      }

      if (user) {
        queryBuilder = queryBuilder.neq('id', user.id);
      }

      const { data, error } = await queryBuilder.limit(50);

      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: true,
  });
}

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!userId,
  });
}

export function useUserSolutionsPublic(userId: string) {
  return useQuery({
    queryKey: ['user-solutions-public', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select(`
          *,
          tasks:task_id(id, title, difficulty, language)
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, trust_rating, reviews_completed, level, likes_received, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as UserProfile[];
    },
  });
}
