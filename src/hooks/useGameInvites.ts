import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface GameInvite {
  id: string;
  game_id: string;
  sender_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  sender?: { nickname: string; avatar_url: string | null };
  game?: { game_type: string; bet_amount: number };
}

export function useGameInvites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [pendingInvites, setPendingInvites] = useState<GameInvite[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch pending invites for current user
  async function fetchPendingInvites() {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('game_invites')
      .select(`
        *,
        sender:profiles!game_invites_sender_id_fkey(nickname, avatar_url),
        game:games!game_invites_game_id_fkey(game_type, bet_amount)
      `)
      .eq('recipient_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invites:', error);
      return;
    }

    setPendingInvites((data || []).map(invite => ({
      ...invite,
      status: invite.status as 'pending' | 'accepted' | 'declined',
      sender: invite.sender || undefined,
      game: invite.game || undefined
    })));
  }

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user?.id) return;

    fetchPendingInvites();

    const channel = supabase
      .channel('game-invites-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_invites',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Game invite update:', payload);
          fetchPendingInvites();
          
          // Show notification for new invites
          if (payload.eventType === 'INSERT') {
            toast.info('Вам пришло приглашение в игру!');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Send game invite
  async function sendInvite(gameId: string, recipientId: string): Promise<boolean> {
    if (!user?.id) {
      toast.error('Необходимо войти в аккаунт');
      return false;
    }

    if (recipientId === user.id) {
      toast.error('Нельзя пригласить себя');
      return false;
    }

    setIsLoading(true);

    try {
      // Check if invite already exists
      const { data: existingInvite } = await supabase
        .from('game_invites')
        .select('id')
        .eq('game_id', gameId)
        .eq('recipient_id', recipientId)
        .single();

      if (existingInvite) {
        toast.error('Приглашение уже отправлено этому пользователю');
        return false;
      }

      // Get recipient profile for notification
      const { data: recipient } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', recipientId)
        .single();

      // Create invite
      const { error: inviteError } = await supabase
        .from('game_invites')
        .insert({
          game_id: gameId,
          sender_id: user.id,
          recipient_id: recipientId
        });

      if (inviteError) throw inviteError;

      // Get game type for notification
      const { data: game } = await supabase
        .from('games')
        .select('game_type')
        .eq('id', gameId)
        .single();

      const gameTypeName = game?.game_type === 'tic-tac-toe' 
        ? 'Крестики-нолики'
        : game?.game_type === 'quiz'
          ? 'Викторина'
          : 'Камень-ножницы-бумага';

      // Send notification to recipient
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .single();

      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          sender_id: user.id,
          title: 'Приглашение в игру',
          message: `${senderProfile?.nickname || 'Игрок'} приглашает вас сыграть в ${gameTypeName}. Ставка: 1 балл.`,
          type: 'game_invite',
          is_global: false
        });

      if (notifError) {
        console.error('Error sending notification:', notifError);
      }

      toast.success(`Приглашение отправлено ${recipient?.nickname || 'пользователю'}`);
      return true;
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Ошибка при отправке приглашения');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  // Accept invite - returns the gameId on success for navigation
  async function acceptInvite(inviteId: string, gameId: string, currentBalance: number): Promise<string | null> {
    if (!user?.id) {
      toast.error('Необходимо войти в аккаунт');
      return null;
    }

    if (currentBalance < 1) {
      toast.error('Недостаточно баллов для игры');
      return null;
    }

    setIsLoading(true);

    try {
      // First check if game is still available
      const { data: game, error: fetchError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (fetchError || !game) {
        toast.error('Игра не найдена или уже началась');
        return null;
      }

      if (game.status !== 'waiting') {
        toast.error('Игра уже началась с другим игроком');
        return null;
      }

      if (game.opponent_id) {
        toast.error('В этой игре уже есть соперник');
        return null;
      }

      // Update invite status
      const { error: inviteError } = await supabase
        .from('game_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

      if (inviteError) throw inviteError;

      // Deduct bet
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ review_balance: currentBalance - 1 })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update game state with opponent
      const gameState = (game.game_state as Record<string, Json>) || {};
      let updatedState: Record<string, Json> = { ...gameState };
      
      if (game.game_type === 'tic-tac-toe') {
        const symbols = (gameState.symbols as Record<string, string>) || {};
        updatedState = { 
          ...gameState, 
          symbols: { ...symbols, [user.id]: 'O' } 
        };
      } else if (game.game_type === 'quiz') {
        updatedState = { 
          ...gameState, 
          scores: { [game.creator_id]: 0, [user.id]: 0 },
          questions: generateQuizQuestions() as unknown as Json
        };
      }

      const { error: gameUpdateError } = await supabase
        .from('games')
        .update({
          opponent_id: user.id,
          status: 'playing',
          game_state: updatedState as Json
        })
        .eq('id', gameId);

      if (gameUpdateError) throw gameUpdateError;

      // Delete other pending invites for this game
      await supabase
        .from('game_invites')
        .delete()
        .eq('game_id', gameId)
        .neq('id', inviteId);

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Вы присоединились к игре!');
      
      return gameId;
    } catch (error) {
      console.error('Error accepting invite:', error);
      toast.error('Ошибка при принятии приглашения');
      return null;
    } finally {
      setIsLoading(false);
      fetchPendingInvites();
    }
  }

  // Decline invite
  async function declineInvite(inviteId: string): Promise<boolean> {
    if (!user?.id) return false;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('game_invites')
        .update({ status: 'declined' })
        .eq('id', inviteId);

      if (error) throw error;

      toast.success('Приглашение отклонено');
      return true;
    } catch (error) {
      console.error('Error declining invite:', error);
      toast.error('Ошибка при отклонении приглашения');
      return false;
    } finally {
      setIsLoading(false);
      fetchPendingInvites();
    }
  }

  return {
    pendingInvites,
    isLoading,
    sendInvite,
    acceptInvite,
    declineInvite,
    refetchInvites: fetchPendingInvites
  };
}

// Quiz questions generator (moved from useGames)
function generateQuizQuestions() {
  const allQuestions = [
    { q: "Что выведет typeof null?", options: ["null", "undefined", "object", "number"], answer: 2 },
    { q: "Какой метод добавляет элемент в конец массива?", options: ["unshift()", "push()", "pop()", "shift()"], answer: 1 },
    { q: "Что такое замыкание?", options: ["Тип данных", "Функция с доступом к внешней области", "Массив", "Объект"], answer: 1 },
    { q: "Как проверить, является ли значение массивом?", options: ["typeof x", "Array.isArray(x)", "x.isArray()", "x instanceof Object"], answer: 1 },
    { q: "Что делает === в JavaScript?", options: ["Присваивание", "Сравнение без приведения типов", "Сравнение с приведением типов", "Логическое И"], answer: 1 },
    { q: "Какой результат '2' + 2?", options: ["4", "22", "NaN", "undefined"], answer: 1 },
    { q: "Что такое hoisting?", options: ["Подъём объявлений", "Цикл", "Условие", "Функция"], answer: 0 },
    { q: "Какой метод удаляет последний элемент массива?", options: ["pop()", "push()", "shift()", "splice()"], answer: 0 },
    { q: "Что возвращает typeof []?", options: ["array", "object", "undefined", "null"], answer: 1 },
    { q: "Как создать промис?", options: ["new Promise()", "Promise.new()", "create Promise()", "Promise()"], answer: 0 }
  ];
  
  return allQuestions.sort(() => Math.random() - 0.5).slice(0, 5);
}
