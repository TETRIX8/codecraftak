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

export function useUserSolutions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-solutions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Solution[];
    },
    enabled: !!user?.id,
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

      // First, check review balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('review_balance')
        .eq('id', user.id)
        .single();

      if (!profile || profile.review_balance < 1) {
        throw new Error('Недостаточно баллов проверки');
      }

      // Create solution
      const { data: solution, error: solutionError } = await supabase
        .from('solutions')
        .insert({
          task_id: taskId,
          user_id: user.id,
          code,
        })
        .select()
        .single();

      if (solutionError) throw solutionError;

      // Deduct review balance
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ review_balance: profile.review_balance - 1 })
        .eq('id', user.id);

      if (profileError) throw profileError;

      return solution;
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

      // Get current profile for weight calculation
      const { data: profile } = await supabase
        .from('profiles')
        .select('trust_rating, reviews_completed, review_balance')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Calculate weight based on trust rating
      const weight = profile.trust_rating / 100;

      // Create review
      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          solution_id: solutionId,
          reviewer_id: user.id,
          verdict,
          comment,
          weight,
        })
        .select()
        .single();

      if (reviewError) throw reviewError;

      // Update profile: increment review balance and reviews completed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          review_balance: profile.review_balance + 1,
          reviews_completed: profile.reviews_completed + 1,
          last_activity_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      return review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions'] });
      queryClient.invalidateQueries({ queryKey: ['pending-solution-for-review'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
