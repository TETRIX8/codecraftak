import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useProfileLikes(userId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile-likes', userId],
    queryFn: async () => {
      if (!userId) return { count: 0, isLiked: false };

      const { count, error } = await supabase
        .from('profile_likes')
        .select('*', { count: 'exact', head: true })
        .eq('liked_id', userId);

      if (error) throw error;

      let isLiked = false;
      if (user) {
        const { data } = await supabase
          .from('profile_likes')
          .select('id')
          .eq('liker_id', user.id)
          .eq('liked_id', userId)
          .maybeSingle();
        isLiked = !!data;
      }

      return { count: count || 0, isLiked };
    },
    enabled: !!userId,
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, isLiked }: { userId: string; isLiked: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      if (isLiked) {
        const { error } = await supabase
          .from('profile_likes')
          .delete()
          .eq('liker_id', user.id)
          .eq('liked_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profile_likes')
          .insert({ liker_id: user.id, liked_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['profile-likes', userId] });
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
}
