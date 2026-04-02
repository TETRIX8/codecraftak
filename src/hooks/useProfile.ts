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

export interface LeaderboardProfile extends Profile {
  acceptedSolutions: number;
  badgePoints: number;
  score: number;
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
      const [profilesRes, solutionsRes, userBadgesRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .limit(1000),
        supabase
          .from('solutions')
          .select('user_id')
          .eq('status', 'accepted')
          .limit(1000),
        supabase
          .from('user_badges')
          .select('user_id, badges(reward_points)')
          .limit(1000),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (solutionsRes.error) throw solutionsRes.error;
      if (userBadgesRes.error) throw userBadgesRes.error;

      const acceptedSolutionsByUser = (solutionsRes.data || []).reduce<Record<string, number>>((acc, solution) => {
        acc[solution.user_id] = (acc[solution.user_id] || 0) + 1;
        return acc;
      }, {});

      const badgePointsByUser = (userBadgesRes.data || []).reduce<Record<string, number>>((acc, userBadge: any) => {
        const rewardPoints = userBadge.badges?.reward_points || 0;
        acc[userBadge.user_id] = (acc[userBadge.user_id] || 0) + rewardPoints;
        return acc;
      }, {});

      return (profilesRes.data as Profile[])
        .map((profile) => {
          const acceptedSolutions = acceptedSolutionsByUser[profile.id] || 0;
          const badgePoints = badgePointsByUser[profile.id] || 0;
          const score = (profile.reviews_completed || 0) * 10 + acceptedSolutions * 5 + badgePoints;

          return {
            ...profile,
            acceptedSolutions,
            badgePoints,
            score,
          };
        })
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if ((b.reviews_completed || 0) !== (a.reviews_completed || 0)) {
            return (b.reviews_completed || 0) - (a.reviews_completed || 0);
          }
          return (b.trust_rating || 0) - (a.trust_rating || 0);
        })
        .slice(0, 20) as LeaderboardProfile[];
    },
  });
}
