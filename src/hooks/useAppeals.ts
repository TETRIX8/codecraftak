import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Appeal {
  id: string;
  solution_id: string;
  user_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  resolved_by: string | null;
  resolution_comment: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface AppealWithDetails extends Appeal {
  solutions: {
    id: string;
    code: string;
    status: string;
    task_id: string;
    user_id: string;
    tasks: {
      title: string;
      difficulty: string;
      language: string;
    };
  };
  profiles: {
    nickname: string;
    avatar_url: string;
  };
  reviews: {
    id: string;
    verdict: string;
    comment: string;
    reviewer_id: string;
    reviewer: {
      nickname: string;
      avatar_url: string;
    };
  }[];
}

// Check if user has already appealed a solution
export function useHasAppeal(solutionId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['has-appeal', solutionId, user?.id],
    queryFn: async () => {
      if (!user?.id || !solutionId) return false;
      
      const { data, error } = await supabase
        .from('appeals')
        .select('id')
        .eq('solution_id', solutionId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user?.id && !!solutionId,
  });
}

// Create an appeal
export function useCreateAppeal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ solutionId, reason }: { solutionId: string; reason: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('appeals')
        .insert({
          solution_id: solutionId,
          user_id: user.id,
          reason,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['has-appeal', variables.solutionId] });
      queryClient.invalidateQueries({ queryKey: ['user-appeals'] });
    },
  });
}

// Get user's appeals
export function useUserAppeals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-appeals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('appeals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Appeal[];
    },
    enabled: !!user?.id,
  });
}

// Admin: get all pending appeals
export function usePendingAppeals() {
  return useQuery({
    queryKey: ['pending-appeals'],
    queryFn: async () => {
      // First, get all pending appeals with their solutions
      const { data: appeals, error: appealsError } = await supabase
        .from('appeals')
        .select(`
          *,
          profiles!appeals_user_id_fkey(nickname, avatar_url),
          solutions!inner(
            id,
            code,
            status,
            task_id,
            user_id,
            tasks(title, difficulty, language)
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (appealsError) throw appealsError;

      // For each appeal, get the reviews for the solution
      const appealsWithReviews = await Promise.all(
        (appeals || []).map(async (appeal) => {
          const { data: reviews } = await supabase
            .from('reviews')
            .select(`
              id,
              verdict,
              comment,
              reviewer_id,
              reviewer:profiles!reviews_reviewer_id_fkey(nickname, avatar_url)
            `)
            .eq('solution_id', appeal.solution_id);

          return {
            ...appeal,
            reviews: reviews || [],
          };
        })
      );

      return appealsWithReviews as AppealWithDetails[];
    },
  });
}

// Admin: resolve an appeal
export function useResolveAppeal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      appealId,
      decision,
      comment,
      solutionId,
      incorrectReviewerIds,
    }: {
      appealId: string;
      decision: 'approved' | 'rejected';
      comment: string;
      solutionId: string;
      incorrectReviewerIds: string[];
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Update appeal status
      const { error: appealError } = await supabase
        .from('appeals')
        .update({
          status: decision,
          resolved_by: user.id,
          resolution_comment: comment,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', appealId);

      if (appealError) throw appealError;

      if (decision === 'approved') {
        // If appeal accepted, update solution status to 'accepted'
        const { error: solutionError } = await supabase
          .from('solutions')
          .update({
            status: 'accepted',
            updated_at: new Date().toISOString(),
          })
          .eq('id', solutionId);

        if (solutionError) throw solutionError;

        // Get solution author to give them +5 balance
        const { data: solution } = await supabase
          .from('solutions')
          .select('user_id')
          .eq('id', solutionId)
          .single();

        if (solution) {
          // Give author +5 review balance
          const { data: authorProfile } = await supabase
            .from('profiles')
            .select('review_balance')
            .eq('id', solution.user_id)
            .single();

          if (authorProfile) {
            await supabase
              .from('profiles')
              .update({
                review_balance: (authorProfile.review_balance || 0) + 5,
              })
              .eq('id', solution.user_id);
          }
        }

        // Penalize incorrect reviewers (-1 balance each)
        for (const reviewerId of incorrectReviewerIds) {
          const { data: reviewerProfile } = await supabase
            .from('profiles')
            .select('review_balance')
            .eq('id', reviewerId)
            .single();

          if (reviewerProfile) {
            await supabase
              .from('profiles')
              .update({
                review_balance: Math.max(0, (reviewerProfile.review_balance || 0) - 1),
              })
              .eq('id', reviewerId);
          }
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-appeals'] });
      queryClient.invalidateQueries({ queryKey: ['solutions'] });
      queryClient.invalidateQueries({ queryKey: ['user-solutions'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}
