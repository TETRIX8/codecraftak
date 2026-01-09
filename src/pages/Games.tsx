import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useGames, GameType, Game } from '@/hooks/useGames';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  FileText,
  Loader2,
  ArrowLeft,
  Crown
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function Games() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { 
    games, 
    currentGame, 
    isLoading, 
    createGame, 
    joinGame, 
    makeMove, 
    cancelGame,
    leaveGame,
    GAME_NAMES, 
    BET_AMOUNT, 
    WIN_REWARD 
  } = useGames();

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
          </CardContent>
        </Card>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Создать игру</TabsTrigger>
            <TabsTrigger value="join">
              Присоединиться
              {games.filter(g => g.status === 'waiting' && g.creator_id !== user.id).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {games.filter(g => g.status === 'waiting' && g.creator_id !== user.id).length}
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
                onCreate={createGame}
              />
              <GameTypeCard
                type="rock-paper-scissors"
                title="Камень-ножницы-бумага"
                description="Кто победит в этот раз?"
                icon={<div className="flex gap-1"><Hand className="h-5 w-5" /><Scissors className="h-5 w-5" /></div>}
                balance={balance}
                betAmount={BET_AMOUNT}
                isLoading={isLoading}
                onCreate={createGame}
              />
              <GameTypeCard
                type="quiz"
                title="Викторина"
                description="Проверьте знания JavaScript"
                icon={<FileText className="h-5 w-5" />}
                balance={balance}
                betAmount={BET_AMOUNT}
                isLoading={isLoading}
                onCreate={createGame}
              />
            </div>
          </TabsContent>

          <TabsContent value="join" className="mt-4">
            <div className="space-y-4">
              {games.filter(g => g.status === 'waiting' && g.creator_id !== user.id).length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Нет доступных игр</p>
                    <p className="text-sm">Создайте свою игру или подождите</p>
                  </CardContent>
                </Card>
              ) : (
                games
                  .filter(g => g.status === 'waiting' && g.creator_id !== user.id)
                  .map(game => (
                    <Card key={game.id} className="hover:border-primary/50 transition-colors">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {game.game_type === 'tic-tac-toe' && <X className="h-5 w-5 text-primary" />}
                            {game.game_type === 'rock-paper-scissors' && <Hand className="h-5 w-5 text-primary" />}
                            {game.game_type === 'quiz' && <FileText className="h-5 w-5 text-primary" />}
                          </div>
                          <div>
                            <p className="font-medium">{GAME_NAMES[game.game_type]}</p>
                            <p className="text-sm text-muted-foreground">
                              Создал: {game.creator?.nickname || 'Игрок'}
                            </p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => joinGame(game.id, balance)}
                          disabled={isLoading || balance < BET_AMOUNT}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>Присоединиться ({BET_AMOUNT} балл)</>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
              )}

              {/* My waiting games */}
              {games.filter(g => g.status === 'waiting' && g.creator_id === user.id).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Ваши ожидающие игры</h3>
                  {games
                    .filter(g => g.status === 'waiting' && g.creator_id === user.id)
                    .map(game => (
                      <Card key={game.id} className="border-primary/30">
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            <div>
                              <p className="font-medium">{GAME_NAMES[game.game_type]}</p>
                              <p className="text-sm text-muted-foreground">
                                Ожидание соперника...
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => cancelGame(game.id)}
                          >
                            Отменить
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
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
  onCreate: (type: GameType, balance: number) => Promise<string | null>;
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
          onClick={() => onCreate(type, balance)}
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
              <p className="text-muted-foreground">Отправьте ссылку другу</p>
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

            {game.game_type === 'quiz' && (
              <QuizBoard 
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

function QuizBoard({ 
  game, 
  userId, 
  onMove 
}: { 
  game: Game; 
  userId: string;
  onMove: (gameId: string, move: Record<string, unknown>) => Promise<boolean>;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const gameState = game.game_state as { 
    scores: Record<string, number>; 
    currentQuestion: number;
    questions: Array<{ q: string; options: string[]; answer: number }>;
    answered: Record<string, boolean>;
  };
  
  const currentQ = gameState.currentQuestion || 0;
  const questions = gameState.questions || [];
  const question = questions[currentQ];
  const hasAnswered = gameState.answered?.[userId];
  const myScore = gameState.scores?.[userId] || 0;

  if (!question) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p>Загрузка вопросов...</p>
        </CardContent>
      </Card>
    );
  }

  const handleAnswer = async (optionIndex: number) => {
    setSelectedAnswer(optionIndex);
    await onMove(game.id, { correct: optionIndex === question.answer });
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Вопрос {currentQ + 1} из {questions.length}</span>
          <span>Ваш счёт: {myScore}</span>
        </div>
        
        {hasAnswered ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
            <p>Ожидание ответа соперника...</p>
          </div>
        ) : (
          <>
            <p className="text-lg font-medium">{question.q}</p>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedAnswer === index 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted hover:bg-primary/20'
                  }`}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
