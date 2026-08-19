import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Solution {
  id: string;
  task_id: string;
  user_id: string;
  code: string;
  status: 'pending' | 'accepted' | 'rejected';
  reviews_count: number;
  accepted_votes: number;
  rejected_votes: number;
  created_at: string;
}

export interface Review {
  id: string;
  solution_id: string;
  reviewer_id: string;
  verdict: 'accepted' | 'rejected';
  comment: string;
  weight: number;
  created_at: string;
}

export function useSolutions(taskId?: string) {
  return useQuery({
    queryKey: ['solutions', taskId],
    queryFn: async () => {
      let query = supabase.from('solutions').select('*');
      
      if (taskId) {
        query = query.eq('task_id', taskId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as Solution[];
    },
  });
}

export interface SolutionWithTask extends Solution {
  tasks: {
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    language: string;
  };
}

export interface ReviewWithReviewer extends Review {
  profiles: {
    nickname: string;
    avatar_url: string;
    level: string;
  };
}

export function useUserSolutions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-solutions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('solutions')
        .select('*, tasks(id, title, description, difficulty, language)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SolutionWithTask[];
    },
    enabled: !!user?.id,
  });
}

export function useSolutionReviews(solutionId: string) {
  return useQuery({
    queryKey: ['solution-reviews', solutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(nickname, avatar_url, level)')
        .eq('solution_id', solutionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ReviewWithReviewer[];
    },
    enabled: !!solutionId,
  });
}

export function useResubmitSolution() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ solutionId, code }: { solutionId: string; code: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data: resubmittedSolutionId, error } = await supabase.rpc('resubmit_solution', {
        _solution_id: solutionId,
        _code: code,
      });

      if (error) throw error;
      return resubmittedSolutionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions'] });
      queryClient.invalidateQueries({ queryKey: ['user-solutions'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function usePendingSolutionForReview() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pending-solution-for-review', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Get a pending solution that:
      // 1. Is not created by the current user
      // 2. Has less than 3 reviews
      // 3. The current user hasn't reviewed yet
      const { data: reviewedSolutions } = await supabase
        .from('reviews')
        .select('solution_id')
        .eq('reviewer_id', user.id);

      const reviewedIds = reviewedSolutions?.map(r => r.solution_id) || [];

      let query = supabase
        .from('solutions')
        .select('*, tasks(title, description, difficulty, language)')
        .eq('status', 'pending')
        .neq('user_id', user.id)
        .lt('reviews_count', 3)
        .order('created_at', { ascending: true })
        .limit(1);

      if (reviewedIds.length > 0) {
        query = query.not('id', 'in', `(${reviewedIds.join(',')})`);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useSubmitSolution() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ taskId, code }: { taskId: string; code: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data: solutionId, error } = await supabase.rpc('submit_solution', {
        _task_id: taskId,
        _code: code,
      });

      if (error) throw error;
      return solutionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions'] });
      queryClient.invalidateQueries({ queryKey: ['user-solutions'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      solutionId, 
      verdict, 
      comment 
    }: { 
      solutionId: string; 
      verdict: 'accepted' | 'rejected'; 
      comment: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data: reviewId, error } = await supabase.rpc('submit_review', {
        _solution_id: solutionId,
        _verdict: verdict,
        _comment: comment,
      });

      if (error) throw error;
      return reviewId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions'] });
      queryClient.invalidateQueries({ queryKey: ['pending-solution-for-review'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Hook to check remaining daily reviews
export function useDailyReviewsRemaining() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['daily-reviews-remaining', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_reviews_count, last_review_date')
        .eq('id', user.id)
        .single();

      if (!profile) return 3;

      const today = new Date().toISOString().split('T')[0];
      const dailyCount = profile.last_review_date === today ? (profile.daily_reviews_count || 0) : 0;
      
      return Math.max(0, 3 - dailyCount);
    },
    enabled: !!user?.id,
  });
}
