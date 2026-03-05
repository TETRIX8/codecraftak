import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useCheckAndAwardBadges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('check_and_award_badges', {
        _user_id: user.id,
      });

      if (error) throw error;
      return data as { badge_name: string; badge_icon: string; newly_awarded: boolean; points_awarded: number }[];
    },
    onSuccess: (data) => {
      const newBadges = data?.filter(b => b.newly_awarded) || [];
      if (newBadges.length > 0) {
        newBadges.forEach(b => {
          toast.success(`${b.badge_icon} Новое достижение: ${b.badge_name}!`);
        });
      }
      queryClient.invalidateQueries({ queryKey: ['user-badges'] });
    },
  });
}

export function useAchievementProgress(userId?: string) {
  const { user } = useAuth();
  const id = userId || user?.id;

  return useQuery({
    queryKey: ['achievement-progress', id],
    queryFn: async () => {
      if (!id) return null;

      const [profileRes, solutionsRes, reviewsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('solutions').select('id, task_id, status').eq('user_id', id).eq('status', 'accepted'),
        supabase.from('reviews').select('id, solution_id').eq('reviewer_id', id),
      ]);

      // Get language-specific review counts
      const reviewIds = reviewsRes.data?.map(r => r.solution_id) || [];
      let langCounts: Record<string, number> = {};
      
      if (reviewIds.length > 0) {
        // Get tasks languages for reviewed solutions
        const { data: reviewedSolutions } = await supabase
          .from('solutions')
          .select('id, task_id, tasks(language)')
          .in('id', reviewIds.slice(0, 500));

        if (reviewedSolutions) {
          reviewedSolutions.forEach((s: any) => {
            const lang = s.tasks?.language;
            if (lang) {
              langCounts[lang] = (langCounts[lang] || 0) + 1;
            }
          });
        }
      }

      return {
        profile: profileRes.data,
        acceptedSolutions: solutionsRes.data?.length || 0,
        totalReviews: reviewsRes.data?.length || 0,
        langCounts,
      };
    },
    enabled: !!id,
  });
}
