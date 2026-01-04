import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const DAILY_LIMIT = 3;
const GAME_COST = 1;
const WIN_REWARD = 2;

interface GameState {
  question: string;
  isLoading: boolean;
  isAnswering: boolean;
  result: 'win' | 'lose' | null;
  gamesPlayedToday: number;
}

export function useAIGame() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [gameState, setGameState] = useState<GameState>({
    question: '',
    isLoading: false,
    isAnswering: false,
    result: null,
    gamesPlayedToday: getGamesPlayedToday(user?.id),
  });

  function getGamesPlayedToday(userId: string | undefined): number {
    if (!userId) return 0;
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`ai_games_${userId}`);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today) {
        return data.count;
      }
    }
    return 0;
  }

  function incrementGamesPlayed() {
    if (!user?.id) return;
    const today = new Date().toDateString();
    const newCount = gameState.gamesPlayedToday + 1;
    localStorage.setItem(`ai_games_${user.id}`, JSON.stringify({ date: today, count: newCount }));
    setGameState(prev => ({ ...prev, gamesPlayedToday: newCount }));
  }

  async function startGame(currentBalance: number) {
    if (!user?.id) {
      toast.error('Необходимо войти в аккаунт');
      return false;
    }

    if (gameState.gamesPlayedToday >= DAILY_LIMIT) {
      toast.error('Вы использовали все 3 игры на сегодня');
      return false;
    }

    if (currentBalance < GAME_COST) {
      toast.error('Недостаточно баллов для игры');
      return false;
    }

    setGameState(prev => ({ ...prev, isLoading: true, result: null, question: '' }));

    try {
      // Deduct 1 point for playing
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ review_balance: currentBalance - GAME_COST })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Fetch a programming question with a joke
      const prompt = encodeURIComponent(
        "Задай один короткий вопрос по программированию (JavaScript, Python, HTML, CSS или алгоритмы) с юмором или шуткой. Только вопрос, без ответа. Максимум 2 предложения."
      );
      
      const response = await fetch(`https://text.pollinations.ai/${prompt}?model=mistral`);
      const question = await response.text();

      setGameState(prev => ({ 
        ...prev, 
        isLoading: false, 
        question: question.trim() 
      }));

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      return true;
    } catch (error) {
      console.error('Error starting game:', error);
      setGameState(prev => ({ ...prev, isLoading: false }));
      toast.error('Ошибка при запуске игры');
      return false;
    }
  }

  async function submitAnswer(answer: string, currentBalance: number) {
    if (!user?.id || !gameState.question) return;

    setGameState(prev => ({ ...prev, isAnswering: true }));

    try {
      // Check if the answer is correct
      const checkPrompt = encodeURIComponent(
        `Вопрос: "${gameState.question}"\nОтвет пользователя: "${answer}"\n\nЕсли ответ правильный или по смыслу верный, ответь только: true\nЕсли ответ неправильный, ответь только: false\nНичего больше не пиши, только true или false.`
      );

      const response = await fetch(`https://text.pollinations.ai/${checkPrompt}?model=openai`);
      const result = await response.text();
      
      const isCorrect = result.trim().toLowerCase().includes('true');

      if (isCorrect) {
        // Award 2 points for winning
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ review_balance: currentBalance + WIN_REWARD })
          .eq('id', user.id);

        if (updateError) throw updateError;
        
        setGameState(prev => ({ ...prev, isAnswering: false, result: 'win' }));
      } else {
        setGameState(prev => ({ ...prev, isAnswering: false, result: 'lose' }));
      }

      incrementGamesPlayed();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (error) {
      console.error('Error checking answer:', error);
      setGameState(prev => ({ ...prev, isAnswering: false }));
      toast.error('Ошибка при проверке ответа');
    }
  }

  function resetGame() {
    setGameState(prev => ({ 
      ...prev, 
      question: '', 
      result: null 
    }));
  }

  return {
    ...gameState,
    canPlay: gameState.gamesPlayedToday < DAILY_LIMIT,
    gamesRemaining: DAILY_LIMIT - gameState.gamesPlayedToday,
    startGame,
    submitAnswer,
    resetGame,
    GAME_COST,
    WIN_REWARD,
  };
}
