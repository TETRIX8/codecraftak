import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Sparkles, Trophy, Frown, Loader2, Send, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useAIGame } from '@/hooks/useAIGame';
import { Link } from 'react-router-dom';

export default function Games() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [answer, setAnswer] = useState('');
  
  const {
    question,
    isLoading,
    isAnswering,
    result,
    gamesRemaining,
    canPlay,
    startGame,
    submitAnswer,
    resetGame,
    GAME_COST,
    WIN_REWARD,
  } = useAIGame();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Войдите, чтобы играть</h2>
            <p className="text-muted-foreground mb-4">
              Для доступа к играм необходимо авторизоваться
            </p>
            <Link to="/auth">
              <Button variant="gradient">Войти</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleStartGame = async () => {
    if (profile) {
      await startGame(profile.review_balance);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() && profile) {
      await submitAnswer(answer.trim(), profile.review_balance);
      setAnswer('');
    }
  };

  const handlePlayAgain = () => {
    resetGame();
    setAnswer('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
          >
            <Gamepad2 className="w-10 h-10 text-background" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Игры с ИИ</h1>
          <p className="text-muted-foreground">
            Отвечай на вопросы по программированию и выигрывай баллы!
          </p>
        </div>

        {/* Info Card */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Правила игры:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Стоимость игры: <span className="text-primary font-medium">{GAME_COST} балл</span></li>
                  <li>• Выигрыш: <span className="text-green-500 font-medium">+{WIN_REWARD} балла</span></li>
                  <li>• Лимит: <span className="text-amber-500 font-medium">3 игры в день</span></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 text-center">
              <Zap className="w-6 h-6 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{profile?.review_balance ?? 0}</p>
              <p className="text-xs text-muted-foreground">Баллов</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Gamepad2 className="w-6 h-6 mx-auto mb-1 text-amber-500" />
              <p className="text-2xl font-bold">{gamesRemaining}</p>
              <p className="text-xs text-muted-foreground">Игр осталось</p>
            </CardContent>
          </Card>
        </div>

        {/* Game Area */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Викторина
            </CardTitle>
            <CardDescription>
              ИИ задаёт вопросы по программированию с юмором
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {/* Initial State - Start Game */}
              {!question && !result && (
                <motion.div
                  key="start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <p className="text-muted-foreground mb-6">
                    {canPlay 
                      ? 'Готовы проверить свои знания?' 
                      : 'Вы использовали все игры на сегодня. Возвращайтесь завтра!'}
                  </p>
                  <Button
                    variant="gradient"
                    size="lg"
                    onClick={handleStartGame}
                    disabled={isLoading || !canPlay || (profile?.review_balance ?? 0) < GAME_COST}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <Gamepad2 className="w-4 h-4 mr-2" />
                        Начать игру (-{GAME_COST} балл)
                      </>
                    )}
                  </Button>
                  {(profile?.review_balance ?? 0) < GAME_COST && canPlay && (
                    <p className="text-sm text-destructive mt-2">
                      Недостаточно баллов для игры
                    </p>
                  )}
                </motion.div>
              )}

              {/* Question State */}
              {question && !result && (
                <motion.div
                  key="question"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                    <p className="text-lg">{question}</p>
                  </div>
                  <form onSubmit={handleSubmitAnswer} className="flex gap-2">
                    <Input
                      placeholder="Ваш ответ..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      disabled={isAnswering}
                      autoFocus
                    />
                    <Button type="submit" disabled={isAnswering || !answer.trim()}>
                      {isAnswering ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Win Result */}
              {result === 'win' && (
                <motion.div
                  key="win"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.6 }}
                    className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center"
                  >
                    <Trophy className="w-12 h-12 text-white" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold mb-2 gradient-text"
                  >
                    🎉 Вы выиграли!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-green-500 font-medium mb-6"
                  >
                    +{WIN_REWARD} балла добавлено!
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button variant="outline" onClick={handlePlayAgain} disabled={!canPlay}>
                      {canPlay ? 'Играть ещё' : 'Лимит игр на сегодня исчерпан'}
                    </Button>
                  </motion.div>
                  {/* Confetti effect */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ 
                          opacity: 1, 
                          y: -20, 
                          x: Math.random() * 100 - 50 + '%',
                          scale: Math.random() * 0.5 + 0.5
                        }}
                        animate={{ 
                          y: '100vh', 
                          rotate: Math.random() * 720 - 360,
                          opacity: 0
                        }}
                        transition={{ 
                          duration: 2 + Math.random() * 2,
                          delay: Math.random() * 0.5
                        }}
                        className="absolute top-0 w-3 h-3 rounded-sm"
                        style={{
                          backgroundColor: ['#FFD700', '#FF6B6B', '#4CAF50', '#2196F3', '#9C27B0'][Math.floor(Math.random() * 5)]
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Lose Result */}
              {result === 'lose' && (
                <motion.div
                  key="lose"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center"
                  >
                    <Frown className="w-12 h-12 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2 text-muted-foreground">
                    Неправильно 😔
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Балл не возвращается, но не сдавайтесь!
                  </p>
                  <Button variant="outline" onClick={handlePlayAgain} disabled={!canPlay}>
                    {canPlay ? 'Попробовать ещё' : 'Лимит игр на сегодня исчерпан'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
