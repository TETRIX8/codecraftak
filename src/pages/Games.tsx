import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useGames, GameType, Game } from '@/hooks/useGames';
import { useGameInvites } from '@/hooks/useGameInvites';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserSelector } from '@/components/games/UserSelector';
import { GameInviteCard } from '@/components/games/GameInviteCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Plus,
  X,
  Circle,
  Hand,
  Scissors,
  Loader2,
  ArrowLeft,
  Crown,
  Mail,
  UserPlus,
  Ship,
  Target,
  Skull,
  FileText
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function Games() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile();
  const { 
    games, 
    currentGame, 
    isLoading, 
    createGame, 
    makeMove, 
    cancelGame,
    leaveGame,
    fetchCurrentGame,
    setGame,
    GAME_NAMES, 
    BET_AMOUNT, 
    WIN_REWARD 
  } = useGames();
  
  const { 
    pendingInvites, 
    isLoading: invitesLoading, 
    sendInvite, 
    acceptInvite, 
    declineInvite 
  } = useGameInvites();
  
  const [createdGameId, setCreatedGameId] = useState<string | null>(null);
  const [sentInvites, setSentInvites] = useState<string[]>([]);
  
  // When currentGame becomes active (status === 'playing'), reset createdGameId
  useEffect(() => {
    if (currentGame && currentGame.status === 'playing') {
      setCreatedGameId(null);
      setSentInvites([]);
    }
  }, [currentGame]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const balance = profile?.review_balance || 0;
  
  // My waiting games
  const myWaitingGames = games.filter(g => 
    g.status === 'waiting' && g.creator_id === user.id
  );

  // Handle creating game
  const handleCreateGame = async (type: GameType) => {
    const gameId = await createGame(type, balance);
    if (gameId) {
      setCreatedGameId(gameId);
      setSentInvites([]);
    }
  };

  // Handle sending invite
  const handleSendInvite = async (recipientId: string) => {
    if (!createdGameId) return;
    
    const success = await sendInvite(createdGameId, recipientId);
    if (success) {
      setSentInvites(prev => [...prev, recipientId]);
    }
  };

  // Handle accepting invite
  const handleAcceptInvite = async (inviteId: string, gameId: string) => {
    console.log('handleAcceptInvite called:', inviteId, gameId);
    const result = await acceptInvite(inviteId, gameId, balance);
    console.log('acceptInvite result:', result);
    
    if (result.success && result.game) {
      // Immediately set the game to show game view
      console.log('Setting game directly:', result.game);
      setGame(result.game);
      refetchProfile();
    }
  };

  // If in a game, show game view
  if (currentGame) {
    return (
      <GameView 
        game={currentGame} 
        userId={user.id}
        onMove={makeMove}
        onLeave={leaveGame}
        onCancel={cancelGame}
      />
    );
  }

  // If created a game and waiting for invites
  if (createdGameId && myWaitingGames.find(g => g.id === createdGameId)) {
    const game = myWaitingGames.find(g => g.id === createdGameId);
    
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => {
                setCreatedGameId(null);
                setSentInvites([]);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                cancelGame(createdGameId);
                setCreatedGameId(null);
                setSentInvites([]);
              }}
            >
              Отменить игру
            </Button>
          </div>

          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Пригласите соперника
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  {game?.game_type === 'tic-tac-toe' && <X className="h-5 w-5 text-primary" />}
                                  {game?.game_type === 'rock-paper-scissors' && <Hand className="h-5 w-5 text-primary" />}
                                  {game?.game_type === 'battleship' && <Ship className="h-5 w-5 text-primary" />}
                                  {game?.game_type === 'russian-roulette' && <Target className="h-5 w-5 text-primary" />}
                                </div>
                <div>
                  <p className="font-medium">{GAME_NAMES[game?.game_type || 'tic-tac-toe']}</p>
                  <p className="text-sm text-muted-foreground">Ставка: {BET_AMOUNT} балл</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Выберите пользователя для приглашения:
                </p>
                <UserSelector 
                  onSelectUser={handleSendInvite}
                  isLoading={invitesLoading}
                  sentInvites={sentInvites}
                />
              </div>

              {sentInvites.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ожидание ответа... (отправлено приглашений: {sentInvites.length})
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Gamepad2 className="h-8 w-8 text-primary" />
              Игры
            </h1>
            <p className="text-muted-foreground mt-1">
              Играйте с другими участниками за баллы
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{balance}</div>
            <div className="text-sm text-muted-foreground">баллов</div>
          </div>
        </div>

        {/* Rules */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Правила
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Ставка за игру: <span className="font-bold text-foreground">{BET_AMOUNT} балл</span></p>
            <p>• Победитель получает: <span className="font-bold text-green-500">{WIN_REWARD} балла</span></p>
            <p>• При ничьей баллы возвращаются обоим игрокам</p>
            <p>• Приглашайте друзей для игры через уведомления</p>
          </CardContent>
        </Card>

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Приглашения
              <Badge variant="secondary">{pendingInvites.length}</Badge>
            </h2>
            {pendingInvites.map(invite => (
              <GameInviteCard
                key={invite.id}
                invite={invite}
                userBalance={balance}
                onAccept={handleAcceptInvite}
                onDecline={declineInvite}
                isLoading={invitesLoading}
              />
            ))}
          </div>
        )}

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">
              <Plus className="h-4 w-4 mr-2" />
              Создать игру
            </TabsTrigger>
            <TabsTrigger value="my-games">
              Мои игры
              {myWaitingGames.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {myWaitingGames.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <GameTypeCard
                type="tic-tac-toe"
                title="Крестики-нолики"
                description="Классическая игра 3x3"
                icon={<div className="flex gap-1"><X className="h-5 w-5" /><Circle className="h-5 w-5" /></div>}
                balance={balance}
                betAmount={BET_AMOUNT}
                isLoading={isLoading}
                onCreate={handleCreateGame}
              />
              <GameTypeCard
                type="rock-paper-scissors"
                title="Камень-ножницы-бумага"
                description="Кто победит в этот раз?"
                icon={<div className="flex gap-1"><Hand className="h-5 w-5" /><Scissors className="h-5 w-5" /></div>}
                balance={balance}
                betAmount={BET_AMOUNT}
                isLoading={isLoading}
                onCreate={handleCreateGame}
              />
              <GameTypeCard
                type="battleship"
                title="Морской бой"
                description="Потопите корабли противника!"
                icon={<Ship className="h-5 w-5" />}
                balance={balance}
                betAmount={BET_AMOUNT}
                isLoading={isLoading}
                onCreate={handleCreateGame}
              />
              <GameTypeCard
                type="russian-roulette"
                title="Русская рулетка"
                description="Испытай удачу!"
                icon={<Target className="h-5 w-5" />}
                balance={balance}
                betAmount={BET_AMOUNT}
                isLoading={isLoading}
                onCreate={handleCreateGame}
              />
            </div>
          </TabsContent>

          <TabsContent value="my-games" className="mt-4">
            <div className="space-y-4">
              {myWaitingGames.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Gamepad2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>У вас нет активных игр</p>
                    <p className="text-sm">Создайте игру и пригласите друга</p>
                  </CardContent>
                </Card>
              ) : (
                myWaitingGames.map(game => (
                  <Card key={game.id} className="border-primary/30">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {game.game_type === 'tic-tac-toe' && <X className="h-5 w-5 text-primary" />}
                          {game.game_type === 'rock-paper-scissors' && <Hand className="h-5 w-5 text-primary" />}
                          {game.game_type === 'battleship' && <Ship className="h-5 w-5 text-primary" />}
                          {game.game_type === 'russian-roulette' && <Target className="h-5 w-5 text-primary" />}
                        </div>
                        <div>
                          <p className="font-medium">{GAME_NAMES[game.game_type]}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Ожидание соперника
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCreatedGameId(game.id);
                            setSentInvites([]);
                          }}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Пригласить
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => cancelGame(game.id)}
                        >
                          Отменить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function GameTypeCard({ 
  type, 
  title, 
  description, 
  icon, 
  balance, 
  betAmount, 
  isLoading,
  onCreate 
}: {
  type: GameType;
  title: string;
  description: string;
  icon: React.ReactNode;
  balance: number;
  betAmount: number;
  isLoading: boolean;
  onCreate: (type: GameType) => Promise<void>;
}) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button 
          onClick={() => onCreate(type)}
          disabled={isLoading || balance < betAmount}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Создать ({betAmount} балл)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function GameView({ 
  game, 
  userId, 
  onMove, 
  onLeave,
  onCancel
}: { 
  game: Game; 
  userId: string;
  onMove: (gameId: string, move: Record<string, unknown>) => Promise<boolean>;
  onLeave: () => void;
  onCancel: (gameId: string) => void;
}) {
  const isCreator = game.creator_id === userId;
  const isMyTurn = game.current_turn === userId;
  const isFinished = game.status === 'finished';
  const isWinner = game.winner_id === userId;
  const isDraw = isFinished && !game.winner_id;

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onLeave}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          {game.status === 'waiting' && isCreator && (
            <Button variant="destructive" size="sm" onClick={() => onCancel(game.id)}>
              Отменить
            </Button>
          )}
        </div>

        {/* Game Result */}
        <AnimatePresence>
          {isFinished && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-lg text-center ${
                isWinner 
                  ? 'bg-green-500/20 border border-green-500/50' 
                  : isDraw 
                    ? 'bg-yellow-500/20 border border-yellow-500/50'
                    : 'bg-red-500/20 border border-red-500/50'
              }`}
            >
              {isWinner ? (
                <>
                  <Crown className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold text-green-500">Вы победили!</p>
                  <p className="text-muted-foreground">+2 балла</p>
                </>
              ) : isDraw ? (
                <>
                  <Users className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold text-yellow-500">Ничья!</p>
                  <p className="text-muted-foreground">Баллы возвращены</p>
                </>
              ) : (
                <>
                  <Trophy className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold text-red-500">Вы проиграли</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Waiting for opponent */}
        {game.status === 'waiting' && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-xl font-medium">Ожидание соперника...</p>
              <p className="text-muted-foreground">Пригласите друга через раздел приглашений</p>
            </CardContent>
          </Card>
        )}

        {/* Game Board */}
        {game.status === 'playing' && (
          <>
            {/* Turn indicator */}
            <Card>
              <CardContent className="py-4 text-center">
                <p className={`text-lg font-medium ${isMyTurn ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {isMyTurn ? 'Ваш ход!' : 'Ход соперника...'}
                </p>
              </CardContent>
            </Card>

            {game.game_type === 'tic-tac-toe' && (
              <TicTacToeBoard 
                game={game} 
                userId={userId}
                isMyTurn={isMyTurn}
                onMove={onMove}
              />
            )}

            {game.game_type === 'rock-paper-scissors' && (
              <RPSBoard 
                game={game} 
                userId={userId}
                onMove={onMove}
              />
            )}

            {game.game_type === 'battleship' && (
              <BattleshipBoard 
                game={game} 
                userId={userId}
                onMove={onMove}
              />
            )}

            {game.game_type === 'russian-roulette' && (
              <RussianRouletteBoard 
                game={game} 
                userId={userId}
                onMove={onMove}
              />
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

function TicTacToeBoard({ 
  game, 
  userId, 
  isMyTurn,
  onMove 
}: { 
  game: Game; 
  userId: string;
  isMyTurn: boolean;
  onMove: (gameId: string, move: Record<string, unknown>) => Promise<boolean>;
}) {
  const gameState = game.game_state as { board: (string | null)[]; symbols: Record<string, string> };
  const board = gameState.board || Array(9).fill(null);
  const mySymbol = gameState.symbols?.[userId] || 'X';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-center mb-4">
          <Badge variant="outline" className="text-lg px-4 py-1">
            Вы играете за: <span className="font-bold ml-1">{mySymbol}</span>
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-2 max-w-[300px] mx-auto">
          {board.map((cell, index) => (
            <motion.button
              key={index}
              whileHover={cell === null && isMyTurn ? { scale: 1.05 } : {}}
              whileTap={cell === null && isMyTurn ? { scale: 0.95 } : {}}
              onClick={() => cell === null && isMyTurn && onMove(game.id, { position: index })}
              disabled={cell !== null || !isMyTurn}
              className={`
                aspect-square rounded-lg text-4xl font-bold
                flex items-center justify-center
                transition-colors
                ${cell === null && isMyTurn 
                  ? 'bg-muted hover:bg-primary/20 cursor-pointer' 
                  : 'bg-muted cursor-not-allowed'
                }
                ${cell === 'X' ? 'text-blue-500' : cell === 'O' ? 'text-red-500' : ''}
              `}
            >
              {cell === 'X' && <X className="h-12 w-12" />}
              {cell === 'O' && <Circle className="h-12 w-12" />}
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RPSBoard({ 
  game, 
  userId, 
  onMove 
}: { 
  game: Game; 
  userId: string;
  onMove: (gameId: string, move: Record<string, unknown>) => Promise<boolean>;
}) {
  const gameState = game.game_state as { choices: Record<string, string> };
  const myChoice = gameState.choices?.[userId];
  const hasChosen = !!myChoice;

  const choices = [
    { id: 'rock', label: 'Камень', icon: Hand },
    { id: 'scissors', label: 'Ножницы', icon: Scissors },
    { id: 'paper', label: 'Бумага', icon: FileText }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        {hasChosen ? (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-lg">Вы выбрали: <span className="font-bold">{choices.find(c => c.id === myChoice)?.label}</span></p>
            <p className="text-muted-foreground">Ожидание выбора соперника...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-lg font-medium">Сделайте свой выбор:</p>
            <div className="flex justify-center gap-4">
              {choices.map(choice => (
                <motion.button
                  key={choice.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onMove(game.id, { choice: choice.id })}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted hover:bg-primary/20 transition-colors"
                >
                  <choice.icon className="h-12 w-12" />
                  <span className="font-medium">{choice.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BattleshipBoard({ 
  game, 
  userId, 
  onMove 
}: { 
  game: Game; 
  userId: string;
  onMove: (gameId: string, move: Record<string, unknown>) => Promise<boolean>;
}) {
  const [placingShips, setPlacingShips] = useState<number[][]>([]);
  const [currentShip, setCurrentShip] = useState<number[]>([]);
  const [isHorizontal, setIsHorizontal] = useState(true);
  
  const gameState = game.game_state as { 
    boards: Record<string, unknown[]>;
    shots: Record<string, number[]>;
    ships: Record<string, number[][]>;
    phase: string;
    ready: Record<string, boolean>;
    lastShot?: { player: string; position: number; hit: boolean };
  };
  
  const phase = gameState.phase || 'placement';
  const isReady = gameState.ready?.[userId] || false;
  const myShips = gameState.ships?.[userId] || [];
  const opponentId = game.creator_id === userId ? game.opponent_id : game.creator_id;
  const myShots = gameState.shots?.[userId] || [];
  const opponentShips = opponentId ? gameState.ships?.[opponentId] || [] : [];
  const opponentAllCells = opponentShips.flat();
  const isMyTurn = game.current_turn === userId;

  // Ship sizes to place
  const shipSizes = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
  const currentShipSize = shipSizes[placingShips.length] || 0;

  const handleCellClick = (index: number) => {
    if (phase === 'placement' && !isReady) {
      if (currentShipSize === 0) return;
      
      // Calculate ship cells
      const cells: number[] = [];
      const row = Math.floor(index / 10);
      const col = index % 10;
      
      for (let i = 0; i < currentShipSize; i++) {
        if (isHorizontal) {
          if (col + i >= 10) return; // Out of bounds
          cells.push(row * 10 + col + i);
        } else {
          if (row + i >= 10) return; // Out of bounds
          cells.push((row + i) * 10 + col);
        }
      }
      
      // Check if cells are free
      const allPlaced = placingShips.flat();
      if (cells.some(c => allPlaced.includes(c))) return;
      
      const newShips = [...placingShips, cells];
      setPlacingShips(newShips);
      
      // If all ships placed, submit
      if (newShips.length === shipSizes.length) {
        onMove(game.id, { ships: newShips });
      }
    } else if (phase === 'battle' && isMyTurn) {
      // Shooting phase
      if (myShots.includes(index)) return; // Already shot here
      onMove(game.id, { position: index });
    }
  };

  const renderBoard = (isOpponentBoard: boolean) => {
    const allPlacedCells = placingShips.flat();
    const finalShipCells = myShips.flat();
    
    return (
      <div className="grid grid-cols-10 gap-0.5 max-w-[280px] mx-auto">
        {Array(100).fill(null).map((_, index) => {
          let cellClass = 'aspect-square bg-muted/50 hover:bg-primary/20 transition-colors cursor-pointer text-xs flex items-center justify-center';
          
          if (isOpponentBoard) {
            // Opponent board - show our shots
            if (myShots.includes(index)) {
              if (opponentAllCells.includes(index)) {
                cellClass = 'aspect-square bg-red-500 text-white';
              } else {
                cellClass = 'aspect-square bg-blue-500/50';
              }
            }
          } else {
            // Our board - show our ships
            if (phase === 'placement') {
              if (allPlacedCells.includes(index)) {
                cellClass = 'aspect-square bg-primary';
              }
            } else {
              if (finalShipCells.includes(index)) {
                cellClass = 'aspect-square bg-primary';
              }
            }
          }
          
          return (
            <motion.button
              key={index}
              whileTap={{ scale: 0.9 }}
              onClick={() => isOpponentBoard && handleCellClick(index)}
              className={cellClass}
              disabled={!isOpponentBoard || !isMyTurn}
            >
              {isOpponentBoard && myShots.includes(index) && (
                opponentAllCells.includes(index) ? <X className="h-3 w-3" /> : <Circle className="h-2 w-2" />
              )}
            </motion.button>
          );
        })}
      </div>
    );
  };

  if (phase === 'placement') {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          {isReady ? (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-lg">Ожидание соперника...</p>
              <p className="text-muted-foreground">Противник расставляет корабли</p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="font-medium">Расставьте корабли</p>
                <p className="text-sm text-muted-foreground">
                  Текущий корабль: {currentShipSize} клеток ({placingShips.length + 1}/{shipSizes.length})
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setIsHorizontal(!isHorizontal)}
                >
                  {isHorizontal ? 'Горизонтально' : 'Вертикально'}
                </Button>
              </div>
              <div 
                className="grid grid-cols-10 gap-0.5 max-w-[280px] mx-auto"
              >
                {Array(100).fill(null).map((_, index) => {
                  const allPlacedCells = placingShips.flat();
                  let cellClass = 'aspect-square bg-muted/50 hover:bg-primary/20 transition-colors cursor-pointer';
                  
                  if (allPlacedCells.includes(index)) {
                    cellClass = 'aspect-square bg-primary cursor-not-allowed';
                  }
                  
                  return (
                    <motion.button
                      key={index}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleCellClick(index)}
                      className={cellClass}
                    />
                  );
                })}
              </div>
              {placingShips.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPlacingShips(placingShips.slice(0, -1))}
                >
                  Отменить последний корабль
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="text-center">
          <p className={`font-medium ${isMyTurn ? 'text-green-500' : 'text-muted-foreground'}`}>
            {isMyTurn ? 'Ваш ход! Стреляйте!' : 'Ход противника...'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-center mb-2 text-muted-foreground">Ваше поле</p>
            {renderBoard(false)}
          </div>
          <div>
            <p className="text-sm text-center mb-2 text-muted-foreground">Поле противника</p>
            {renderBoard(true)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RussianRouletteBoard({ 
  game, 
  userId, 
  onMove 
}: { 
  game: Game; 
  userId: string;
  onMove: (gameId: string, move: Record<string, unknown>) => Promise<boolean>;
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  
  const gameState = game.game_state as { 
    chamber: number;
    bulletPosition: number;
    pulls: string[];
    currentPlayer: string;
    fired?: boolean;
    loser?: string;
  };
  
  const chamber = gameState.chamber || 0;
  const pulls = gameState.pulls || [];
  const isMyTurn = game.current_turn === userId;
  const remainingChambers = 6 - chamber;

  const handlePull = async () => {
    setIsSpinning(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Dramatic pause
    await onMove(game.id, { pull: true });
    setIsSpinning(false);
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <motion.div
              animate={isSpinning ? { rotate: 360 } : {}}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full h-full"
            >
              <div className="w-full h-full rounded-full border-4 border-muted-foreground flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                <div className="grid grid-cols-3 gap-1">
                  {Array(6).fill(null).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-6 h-6 rounded-full ${
                        i < chamber 
                          ? 'bg-muted-foreground/30' 
                          : 'bg-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
            <Target className="absolute -top-2 -right-2 h-8 w-8 text-red-500" />
          </div>
          
          <p className="text-2xl font-bold">
            Осталось камер: {remainingChambers}/6
          </p>
          <p className="text-muted-foreground">
            Шанс выстрела: {Math.round((1 / remainingChambers) * 100)}%
          </p>
        </div>

        <div className="flex justify-center gap-2">
          {pulls.map((pullerId, i) => (
            <div 
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                pullerId === userId 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div className="text-center">
          {isMyTurn ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="space-y-4"
            >
              <p className="text-lg font-medium text-yellow-500">Ваш ход!</p>
              <Button 
                size="lg" 
                variant="destructive"
                onClick={handlePull}
                disabled={isSpinning}
                className="gap-2"
              >
                {isSpinning ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Skull className="h-5 w-5" />
                )}
                {isSpinning ? 'Щёлк...' : 'Нажать на курок'}
              </Button>
            </motion.div>
          ) : (
            <div className="py-4">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
              <p className="text-muted-foreground">Ход противника...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
