import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badges: Badge;
}

export function useBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*');

      if (error) throw error;
      return data as Badge[];
    },
  });
}

export function useUserBadges(userId?: string) {
  const { user } = useAuth();
  const id = userId || user?.id;

  return useQuery({
    queryKey: ['user-badges', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', id);

      if (error) throw error;
      return data as UserBadge[];
    },
    enabled: !!id,
  });
}
