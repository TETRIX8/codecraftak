import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';
import type { Game } from './useGames';

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
  const fetchPendingInvites = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('game_invites')
      .select(`
        *,
        sender:profiles!game_invites_sender_id_fkey(nickname, avatar_url),
        game:games!game_invites_game_id_fkey(game_type, bet_amount, status)
      `)
      .eq('recipient_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invites:', error);
      return;
    }

    // Filter out invites for games that are no longer waiting
    const validInvites = (data || []).filter(invite => 
      invite.game && (invite.game as { status?: string }).status === 'waiting'
    );

    setPendingInvites(validInvites.map(invite => ({
      ...invite,
      status: invite.status as 'pending' | 'accepted' | 'declined',
      sender: invite.sender || undefined,
      game: invite.game ? {
        game_type: (invite.game as { game_type: string }).game_type,
        bet_amount: (invite.game as { bet_amount: number }).bet_amount
      } : undefined
    })));
  }, [user?.id]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user?.id) return;

    fetchPendingInvites();

    const channel = supabase
      .channel('game-invites-' + user.id)
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
      .subscribe((status) => {
        console.log('Game invites channel status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchPendingInvites]);

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
      const { data: existingInvites } = await supabase
        .from('game_invites')
        .select('id')
        .eq('game_id', gameId)
        .eq('recipient_id', recipientId);

      if (existingInvites && existingInvites.length > 0) {
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

      await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          sender_id: user.id,
          title: 'Приглашение в игру',
          message: `${senderProfile?.nickname || 'Игрок'} приглашает вас сыграть в ${gameTypeName}. Ставка: 1 балл.`,
          type: 'game_invite',
          is_global: false
        });

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

  // Accept invite - returns the full game object on success
  async function acceptInvite(inviteId: string, gameId: string, currentBalance: number): Promise<{
    success: boolean;
    game?: Game;
  }> {
    if (!user?.id) {
      toast.error('Необходимо войти в аккаунт');
      return { success: false };
    }

    if (currentBalance < 1) {
      toast.error('Недостаточно баллов для игры');
      return { success: false };
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
        await cleanupInvite(inviteId);
        return { success: false };
      }

      if (game.status !== 'waiting') {
        toast.error('Игра уже началась с другим игроком');
        await cleanupInvite(inviteId);
        return { success: false };
      }

      if (game.opponent_id) {
        toast.error('В этой игре уже есть соперник');
        await cleanupInvite(inviteId);
        return { success: false };
      }

      // Update invite status first
      await supabase
        .from('game_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

      // Deduct bet from joiner
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

      // Join the game
      const { data: updatedGame, error: gameUpdateError } = await supabase
        .from('games')
        .update({
          opponent_id: user.id,
          status: 'playing',
          game_state: updatedState as Json
        })
        .eq('id', gameId)
        .eq('status', 'waiting') // Extra safety check
        .select(`
          *,
          creator:profiles!games_creator_id_fkey(nickname, avatar_url),
          opponent:profiles!games_opponent_id_fkey(nickname, avatar_url)
        `)
        .single();

      if (gameUpdateError) {
        console.error('Error updating game:', gameUpdateError);
        toast.error('Не удалось присоединиться к игре');
        return { success: false };
      }

      // Delete all pending invites for this game
      await supabase
        .from('game_invites')
        .delete()
        .eq('game_id', gameId)
        .eq('status', 'pending');

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Вы присоединились к игре!');
      
      console.log('Accept invite - updated game:', updatedGame);
      
      // Parse and return the game
      const parsedGame: Game = {
        id: updatedGame.id,
        game_type: updatedGame.game_type as Game['game_type'],
        status: updatedGame.status as Game['status'],
        creator_id: updatedGame.creator_id,
        opponent_id: updatedGame.opponent_id,
        winner_id: updatedGame.winner_id,
        game_state: updatedGame.game_state as Record<string, unknown>,
        current_turn: updatedGame.current_turn,
        bet_amount: updatedGame.bet_amount,
        created_at: updatedGame.created_at,
        updated_at: updatedGame.updated_at,
        creator: updatedGame.creator || undefined,
        opponent: updatedGame.opponent || undefined
      };
      
      return { success: true, game: parsedGame };
    } catch (error) {
      console.error('Error accepting invite:', error);
      toast.error('Ошибка при принятии приглашения');
      return { success: false };
    } finally {
      setIsLoading(false);
      fetchPendingInvites();
    }
  }

  async function cleanupInvite(inviteId: string) {
    await supabase
      .from('game_invites')
      .update({ status: 'declined' })
      .eq('id', inviteId);
    fetchPendingInvites();
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

// Quiz questions generator
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
