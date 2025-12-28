import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up realtime notifications for user:', user.id);

    // Listen for new reviews on user's solutions
    const channel = supabase
      .channel('user-reviews-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reviews',
        },
        async (payload) => {
          console.log('New review received:', payload);
          
          const newReview = payload.new as {
            id: string;
            solution_id: string;
            reviewer_id: string;
            verdict: 'accepted' | 'rejected';
            comment: string;
          };

          // Check if this review is for user's solution
          const { data: solution } = await supabase
            .from('solutions')
            .select('user_id, task_id, tasks(title)')
            .eq('id', newReview.solution_id)
            .maybeSingle();

          if (solution?.user_id === user.id) {
            // Get reviewer info
            const { data: reviewer } = await supabase
              .from('profiles')
              .select('nickname')
              .eq('id', newReview.reviewer_id)
              .maybeSingle();

            const taskTitle = (solution as any).tasks?.title || 'Задание';
            const reviewerName = reviewer?.nickname || 'Проверяющий';
            const isAccepted = newReview.verdict === 'accepted';

            toast(isAccepted ? '✅ Решение принято!' : '❌ Решение отклонено', {
              description: `${reviewerName} проверил ваше решение "${taskTitle}"`,
              duration: 5000,
              action: {
                label: 'Посмотреть',
                onClick: () => {
                  window.location.href = '/profile';
                },
              },
            });

            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['user-solutions'] });
            queryClient.invalidateQueries({ queryKey: ['solution-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'solutions',
        },
        async (payload) => {
          console.log('Solution updated:', payload);
          
          const updatedSolution = payload.new as {
            id: string;
            user_id: string;
            status: 'pending' | 'accepted' | 'rejected';
            task_id: string;
          };

          const oldSolution = payload.old as {
            status: 'pending' | 'accepted' | 'rejected';
          };

          // Only notify if status changed and it's user's solution
          if (
            updatedSolution.user_id === user.id &&
            updatedSolution.status !== oldSolution.status &&
            updatedSolution.status !== 'pending'
          ) {
            const { data: task } = await supabase
              .from('tasks')
              .select('title')
              .eq('id', updatedSolution.task_id)
              .maybeSingle();

            const taskTitle = task?.title || 'Задание';
            const isFinalAccepted = updatedSolution.status === 'accepted';

            toast(
              isFinalAccepted ? '🎉 Решение окончательно принято!' : '📝 Решение требует доработки',
              {
                description: `Ваше решение "${taskTitle}" ${isFinalAccepted ? 'прошло проверку' : 'было отклонено. Вы можете исправить и пересдать.'}`,
                duration: 6000,
                action: {
                  label: 'Посмотреть',
                  onClick: () => {
                    window.location.href = '/profile';
                  },
                },
              }
            );

            queryClient.invalidateQueries({ queryKey: ['user-solutions'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);
}
