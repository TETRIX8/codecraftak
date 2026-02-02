import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export type GameType = 'tic-tac-toe' | 'rock-paper-scissors' | 'battleship' | 'russian-roulette';
export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface Game {
  id: string;
  game_type: GameType;
  status: GameStatus;
  creator_id: string;
  opponent_id: string | null;
  winner_id: string | null;
  game_state: Record<string, unknown>;
  current_turn: string | null;
  bet_amount: number;
  created_at: string;
  updated_at: string;
  creator?: { nickname: string; avatar_url: string | null };
  opponent?: { nickname: string; avatar_url: string | null };
}

interface GameRow {
  id: string;
  game_type: string;
  status: string;
  creator_id: string;
  opponent_id: string | null;
  winner_id: string | null;
  game_state: Json;
  current_turn: string | null;
  bet_amount: number;
  created_at: string;
  updated_at: string;
  creator?: { nickname: string; avatar_url: string | null } | null;
  opponent?: { nickname: string; avatar_url: string | null } | null;
}

const GAME_NAMES: Record<GameType, string> = {
  'tic-tac-toe': 'Крестики-нолики',
  'rock-paper-scissors': 'Камень-ножницы-бумага',
  'battleship': 'Морской бой',
  'russian-roulette': 'Русская рулетка'
};

const BET_AMOUNT = 1;
const WIN_REWARD = 2;

function parseGameRow(row: GameRow): Game {
  return {
    ...row,
    game_type: row.game_type as GameType,
    status: row.status as GameStatus,
    game_state: (row.game_state as Record<string, unknown>) || {},
    creator: row.creator || undefined,
    opponent: row.opponent || undefined,
  };
}

export function useGames() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [games, setGames] = useState<Game[]>([]);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use ref to track current game ID without causing re-subscriptions
  const currentGameIdRef = useRef<string | null>(null);
  
  // Keep ref in sync with state
  useEffect(() => {
    currentGameIdRef.current = currentGame?.id || null;
  }, [currentGame?.id]);

  // Fetch available games
  const fetchGames = useCallback(async () => {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        creator:profiles!games_creator_id_fkey(nickname, avatar_url),
        opponent:profiles!games_opponent_id_fkey(nickname, avatar_url)
      `)
      .in('status', ['waiting', 'playing'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching games:', error);
      return;
    }

    setGames((data as GameRow[]).map(parseGameRow));
  }, []);

  // Fetch a specific game by ID
  const fetchCurrentGame = useCallback(async (gameId: string): Promise<Game | null> => {
    console.log('fetchCurrentGame called with id:', gameId);
    
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        creator:profiles!games_creator_id_fkey(nickname, avatar_url),
        opponent:profiles!games_opponent_id_fkey(nickname, avatar_url)
      `)
      .eq('id', gameId)
      .single();

    if (error) {
      console.error('Error fetching game:', error);
      return null;
    }

    const game = parseGameRow(data as GameRow);
    console.log('Fetched game:', game);
    setCurrentGame(game);
    return game;
  }, []);
  
  // Allow setting currentGame directly
  const setGame = useCallback((game: Game | null) => {
    console.log('setGame called:', game);
    setCurrentGame(game);
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user?.id) return;
    
    fetchGames();

    const channel = supabase
      .channel('games-realtime-' + user.id)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games'
        },
        async (payload) => {
          console.log('Games realtime update:', payload);
          
          // Always refresh games list
          fetchGames();
          
          // If we're in a game, refetch it to get latest state
          const currentId = currentGameIdRef.current;
          if (currentId) {
            await fetchCurrentGame(currentId);
          }
          
          // If we're the creator and someone joined our game
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedGame = payload.new as { 
              id: string; 
              status: string; 
              opponent_id: string | null; 
              creator_id: string;
            };
            
            if (
              updatedGame.status === 'playing' && 
              updatedGame.creator_id === user.id && 
              updatedGame.opponent_id
            ) {
              console.log('Opponent joined my game, loading game view');
              await fetchCurrentGame(updatedGame.id);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Games channel subscription status:', status);
      });

    return () => {
      console.log('Cleaning up games channel');
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchGames, fetchCurrentGame]);

  async function createGame(gameType: GameType, currentBalance: number): Promise<string | null> {
    if (!user?.id) {
      toast.error('Необходимо войти в аккаунт');
      return null;
    }

    if (currentBalance < BET_AMOUNT) {
      toast.error('Недостаточно баллов для игры');
      return null;
    }

    setIsLoading(true);

    try {
      // Deduct bet
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ review_balance: currentBalance - BET_AMOUNT })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Create game with initial state
      let initialState: Json = {};
      
      if (gameType === 'tic-tac-toe') {
        initialState = { board: Array(9).fill(null), symbols: { [user.id]: 'X' } };
      } else if (gameType === 'rock-paper-scissors') {
        initialState = { choices: {}, round: 1 };
      } else if (gameType === 'battleship') {
        // 10x10 boards for each player, ships placement phase first
        initialState = { 
          boards: { [user.id]: Array(100).fill(null) },
          shots: { [user.id]: [] },
          ships: { [user.id]: [] },
          phase: 'placement',
          ready: { [user.id]: false }
        };
      } else if (gameType === 'russian-roulette') {
        // 6 chambers, 1 bullet, random position
        const bulletPosition = Math.floor(Math.random() * 6);
        initialState = { 
          chamber: 0, 
          bulletPosition, 
          pulls: [],
          currentPlayer: user.id
        };
      }

      const { data, error } = await supabase
        .from('games')
        .insert({
          game_type: gameType,
          creator_id: user.id,
          current_turn: user.id,
          bet_amount: BET_AMOUNT,
          game_state: initialState
        })
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success(`Игра "${GAME_NAMES[gameType]}" создана!`);
      
      // Don't set currentGame here - we want user to invite someone first
      return data.id;
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Ошибка при создании игры');
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function joinGame(gameId: string, currentBalance: number): Promise<Game | null> {
    if (!user?.id) {
      toast.error('Необходимо войти в аккаунт');
      return null;
    }

    if (currentBalance < BET_AMOUNT) {
      toast.error('Недостаточно баллов для игры');
      return null;
    }

    setIsLoading(true);

    try {
      // Get game first
      const { data: game, error: fetchError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (fetchError || !game) {
        toast.error('Игра не найдена');
        return null;
      }

      if (game.creator_id === user.id) {
        toast.error('Вы не можете присоединиться к своей игре');
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

      // Deduct bet
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ review_balance: currentBalance - BET_AMOUNT })
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
      } else if (game.game_type === 'battleship') {
        const boards = (gameState.boards as Record<string, Json>) || {};
        const shots = (gameState.shots as Record<string, Json>) || {};
        const ships = (gameState.ships as Record<string, Json>) || {};
        const ready = (gameState.ready as Record<string, boolean>) || {};
        updatedState = { 
          ...gameState, 
          boards: { ...boards, [user.id]: Array(100).fill(null) } as Record<string, Json>,
          shots: { ...shots, [user.id]: [] } as Record<string, Json>,
          ships: { ...ships, [user.id]: [] } as Record<string, Json>,
          ready: { ...ready, [user.id]: false }
        };
      } else if (game.game_type === 'russian-roulette') {
        // Keep existing state, just add opponent
        updatedState = gameState;
      }

      const { data: updatedGame, error } = await supabase
        .from('games')
        .update({
          opponent_id: user.id,
          status: 'playing',
          game_state: updatedState
        })
        .eq('id', gameId)
        .select(`
          *,
          creator:profiles!games_creator_id_fkey(nickname, avatar_url),
          opponent:profiles!games_opponent_id_fkey(nickname, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Set the game directly to ensure UI updates
      if (updatedGame) {
        const parsedGame = parseGameRow(updatedGame as GameRow);
        setCurrentGame(parsedGame);
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        toast.success('Вы присоединились к игре!');
        return parsedGame;
      }

      return null;
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Ошибка при присоединении к игре');
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function makeMove(gameId: string, move: Record<string, unknown>): Promise<boolean> {
    if (!user?.id || !currentGame) {
      console.error('makeMove: no user or currentGame');
      return false;
    }

    try {
      const { data: game, error: fetchError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (fetchError || !game) {
        console.error('makeMove: game not found', fetchError);
        return false;
      }

      const gameState = (game.game_state as Record<string, unknown>) || {};
      let newState: Json = JSON.parse(JSON.stringify(gameState));
      let nextTurn = game.current_turn;
      let status = game.status;
      let winnerId: string | null = null;

      if (game.game_type === 'tic-tac-toe') {
        const board = [...((gameState.board as (string | null)[]) || Array(9).fill(null))];
        const position = move.position as number;
        const symbols = (gameState.symbols as Record<string, string>) || {};
        
        if (board[position] !== null) {
          toast.error('Эта клетка уже занята');
          return false;
        }

        board[position] = symbols[user.id];
        newState = { ...gameState, board } as Json;
        
        // Check for winner
        const winner = checkTicTacToeWinner(board);
        if (winner) {
          winnerId = Object.entries(symbols).find(([, s]) => s === winner)?.[0] || null;
          status = 'finished';
        } else if (board.every(cell => cell !== null)) {
          // Draw
          status = 'finished';
        } else {
          nextTurn = game.creator_id === user.id ? game.opponent_id : game.creator_id;
        }
      } else if (game.game_type === 'rock-paper-scissors') {
        const choices = { ...((gameState.choices as Record<string, string>) || {}) };
        choices[user.id] = move.choice as string;
        newState = { ...gameState, choices } as Json;

        // Check if both players made a choice
        if (Object.keys(choices).length === 2 && game.opponent_id) {
          const creatorChoice = choices[game.creator_id];
          const opponentChoice = choices[game.opponent_id];
          
          winnerId = determineRPSWinner(creatorChoice, opponentChoice, game.creator_id, game.opponent_id);
          status = 'finished';
        }
      } else if (game.game_type === 'battleship' && game.opponent_id) {
        const phase = gameState.phase as string;
        
        if (phase === 'placement') {
          // Player placing ships
          const ships = { ...((gameState.ships as Record<string, number[][]>) || {}) };
          const ready = { ...((gameState.ready as Record<string, boolean>) || {}) };
          
          ships[user.id] = move.ships as number[][];
          ready[user.id] = true;
          
          // Check if both players placed ships
          if (ready[game.creator_id] && ready[game.opponent_id]) {
            newState = { 
              ...gameState, 
              ships, 
              ready, 
              phase: 'battle',
              currentTurn: game.creator_id 
            } as Json;
            nextTurn = game.creator_id;
          } else {
            newState = { ...gameState, ships, ready } as Json;
          }
        } else {
          // Battle phase - shooting
          const shots = { ...((gameState.shots as Record<string, number[]>) || {}) };
          const opponentShips = ((gameState.ships as Record<string, number[][]>) || {})[
            user.id === game.creator_id ? game.opponent_id : game.creator_id
          ] || [];
          
          const shotPosition = move.position as number;
          if (!shots[user.id]) shots[user.id] = [];
          shots[user.id].push(shotPosition);
          
          // Check if hit any ship
          const allOpponentCells = opponentShips.flat();
          const isHit = allOpponentCells.includes(shotPosition);
          
          // Check if all opponent ships sunk
          const allHits = shots[user.id].filter(s => allOpponentCells.includes(s));
          if (allHits.length === allOpponentCells.length && allOpponentCells.length > 0) {
            winnerId = user.id;
            status = 'finished';
          }
          
          newState = { ...gameState, shots, lastShot: { player: user.id, position: shotPosition, hit: isHit } } as Json;
          nextTurn = user.id === game.creator_id ? game.opponent_id : game.creator_id;
        }
      } else if (game.game_type === 'russian-roulette' && game.opponent_id) {
        const chamber = (gameState.chamber as number) || 0;
        const bulletPosition = gameState.bulletPosition as number;
        const pulls = [...((gameState.pulls as string[]) || [])];
        
        pulls.push(user.id);
        
        // Check if bullet fires
        if (chamber === bulletPosition) {
          // Current player loses
          winnerId = user.id === game.creator_id ? game.opponent_id : game.creator_id;
          status = 'finished';
          newState = { ...gameState, chamber, pulls, fired: true, loser: user.id } as Json;
        } else {
          // Survived - next chamber, next player
          const newChamber = chamber + 1;
          nextTurn = user.id === game.creator_id ? game.opponent_id : game.creator_id;
          newState = { ...gameState, chamber: newChamber, pulls, currentPlayer: nextTurn } as Json;
        }
      }

      const { error } = await supabase
        .from('games')
        .update({
          game_state: newState,
          current_turn: nextTurn,
          status,
          winner_id: winnerId
        })
        .eq('id', gameId);

      if (error) throw error;

      // If game finished, award winner
      if (status === 'finished' && winnerId) {
        await awardWinner(winnerId);
      } else if (status === 'finished' && !winnerId && game.opponent_id) {
        // Draw - return bets
        await returnBets(game.creator_id, game.opponent_id, game.bet_amount);
      }

      await fetchCurrentGame(gameId);
      return true;
    } catch (error) {
      console.error('Error making move:', error);
      toast.error('Ошибка при ходе');
      return false;
    }
  }

  async function awardWinner(winnerId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('review_balance')
      .eq('id', winnerId)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ review_balance: (profile.review_balance || 0) + WIN_REWARD })
        .eq('id', winnerId);
    }

    queryClient.invalidateQueries({ queryKey: ['profile'] });
  }

  async function returnBets(creatorId: string, opponentId: string, betAmount: number) {
    // Return bets to both players
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, review_balance')
      .in('id', [creatorId, opponentId]);

    if (profiles) {
      for (const profile of profiles) {
        await supabase
          .from('profiles')
          .update({ review_balance: (profile.review_balance || 0) + betAmount })
          .eq('id', profile.id);
      }
    }

    queryClient.invalidateQueries({ queryKey: ['profile'] });
  }

  async function cancelGame(gameId: string) {
    if (!user?.id) return;

    try {
      const { data: game } = await supabase
        .from('games')
        .select('creator_id, bet_amount')
        .eq('id', gameId)
        .single();

      if (game && game.creator_id === user.id) {
        // Return bet to creator
        const { data: profile } = await supabase
          .from('profiles')
          .select('review_balance')
          .eq('id', user.id)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ review_balance: (profile.review_balance || 0) + game.bet_amount })
            .eq('id', user.id);
        }

        await supabase.from('games').delete().eq('id', gameId);
        
        // Clear current game if it was this one
        if (currentGame?.id === gameId) {
          setCurrentGame(null);
        }
        
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        toast.success('Игра отменена, балл возвращён');
      }
    } catch (error) {
      console.error('Error canceling game:', error);
      toast.error('Ошибка при отмене игры');
    }
  }

  function leaveGame() {
    setCurrentGame(null);
  }

  return {
    games,
    currentGame,
    isLoading,
    createGame,
    joinGame,
    makeMove,
    cancelGame,
    leaveGame,
    fetchCurrentGame,
    setGame,
    GAME_NAMES,
    BET_AMOUNT,
    WIN_REWARD
  };
}

function checkTicTacToeWinner(board: (string | null)[]): string | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function determineRPSWinner(
  creatorChoice: string, 
  opponentChoice: string, 
  creatorId: string, 
  opponentId: string
): string | null {
  if (creatorChoice === opponentChoice) return null;
  
  const wins: Record<string, string> = {
    rock: 'scissors',
    scissors: 'paper',
    paper: 'rock'
  };
  
  return wins[creatorChoice] === opponentChoice ? creatorId : opponentId;
}


