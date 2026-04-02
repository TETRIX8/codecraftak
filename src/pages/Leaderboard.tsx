import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Loader2, Crown, Star } from 'lucide-react';
import { useLeaderboard, useProfile, type LeaderboardProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

// Sparkle star component
const SparkStar = ({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], rotate: [0, 180] }}
    transition={{ duration: 2, delay, repeat: Infinity, ease: "easeInOut" }}
    className="absolute pointer-events-none"
    style={{ left: x, top: y }}
  >
    <Star className="text-yellow-400 fill-yellow-400" style={{ width: size, height: size }} />
  </motion.div>
);

export default function Leaderboard() {
  const { user } = useAuth();
  const { data: leaderboard, isLoading } = useLeaderboard();
  const { data: currentProfile } = useProfile();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (!isLoading && leaderboard && leaderboard.length > 0) {
      const timer = setTimeout(() => setShowIntro(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, leaderboard]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-24 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Loader2 className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  const topThree = leaderboard?.slice(0, 3) || [];
  const rest = leaderboard?.slice(3) || [];
  const leader = topThree[0];

  const currentUserRank = leaderboard?.findIndex(p => p.id === user?.id);
  const isInTop = currentUserRank !== undefined && currentUserRank !== -1;

  const getAccuracy = (correct: number, total: number) => {
    if (total === 0) return 0;
    return (correct / total * 5).toFixed(1);
  };

  // Podium colors
  const podiumStyles = [
    { // 1st - Gold
      gradient: 'from-yellow-600 via-yellow-400 to-yellow-600',
      border: 'border-yellow-400',
      shadow: 'shadow-yellow-500/40',
      text: 'text-yellow-400',
      bg: 'bg-gradient-to-b from-yellow-500/30 to-yellow-700/40',
      numberBg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      numberText: 'text-yellow-900',
      ribbon: 'from-yellow-500 via-yellow-400 to-yellow-500',
    },
    { // 2nd - Silver
      gradient: 'from-slate-400 via-slate-300 to-slate-400',
      border: 'border-slate-300',
      shadow: 'shadow-slate-400/30',
      text: 'text-slate-300',
      bg: 'bg-gradient-to-b from-slate-400/20 to-slate-600/30',
      numberBg: 'bg-gradient-to-br from-slate-300 to-slate-500',
      numberText: 'text-slate-900',
      ribbon: 'from-slate-400 via-slate-300 to-slate-400',
    },
    { // 3rd - Bronze
      gradient: 'from-amber-700 via-amber-500 to-amber-700',
      border: 'border-amber-500',
      shadow: 'shadow-amber-600/30',
      text: 'text-amber-400',
      bg: 'bg-gradient-to-b from-amber-600/20 to-amber-800/30',
      numberBg: 'bg-gradient-to-br from-amber-500 to-amber-700',
      numberText: 'text-amber-100',
      ribbon: 'from-amber-600 via-amber-500 to-amber-600',
    },
  ];

  const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd
  const podiumHeights = ['h-40', 'h-52', 'h-32'];
  const avatarSizes = ['w-24 h-24', 'w-32 h-32', 'w-22 h-22'];

  return (
    <div className="min-h-screen py-24 overflow-hidden relative"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, hsl(222 47% 12%) 0%, hsl(222 47% 6%) 60%, hsl(225 50% 4%) 100%)',
      }}
    >
      {/* Background sparkles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <SparkStar
            key={i}
            delay={i * 0.4}
            x={`${5 + Math.random() * 90}%`}
            y={`${5 + Math.random() * 50}%`}
            size={6 + Math.random() * 10}
          />
        ))}
      </div>

      {/* Radial light behind podium */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 60%, rgba(234,179,8,0.12) 0%, transparent 60%)',
        }}
      />

      {/* Intro Animation */}
      <AnimatePresence>
        {showIntro && leader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'radial-gradient(ellipse at center, hsl(222 47% 10%), hsl(222 47% 4%))' }}
            onClick={() => setShowIntro(false)}
          >
            <div className="relative text-center">
              <motion.div
                initial={{ y: -60, opacity: 0, scale: 0 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <Crown className="w-20 h-20 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]" />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400 mx-auto mb-6 shadow-[0_0_60px_rgba(250,204,21,0.5)]"
              >
                <img src={leader.avatar_url} alt={leader.nickname} className="w-full h-full object-cover" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-yellow-400/80 text-sm font-bold tracking-[0.3em] mb-2"
              >
                ЛИДЕР РЕЙТИНГА
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-4xl font-black text-yellow-400 mb-4"
              >
                {leader.nickname}
              </motion.h2>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
              >
                <span className="text-5xl font-black text-yellow-400">{leader.score}</span>
                <span className="text-xl text-yellow-400/60 ml-2">очков</span>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.6, 0] }}
                transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
                className="mt-8 text-muted-foreground text-sm"
              >
                Нажмите, чтобы продолжить
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-yellow-500/30 text-yellow-400 text-sm font-bold mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(234,179,8,0.05))' }}
          >
            <Trophy className="w-4 h-4" />
            Таблица лидеров
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 bg-clip-text text-transparent">
            Топ ревьюеров
          </h1>
        </motion.div>

        {/* === PODIUM === */}
        {topThree.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <div className="flex items-end justify-center gap-3 sm:gap-6">
              {podiumOrder.map((idx, visualPos) => {
                const p = topThree[idx];
                const style = podiumStyles[idx];
                const rank = idx + 1;
                const height = podiumHeights[visualPos];
                const avatarSize = idx === 0 ? 'w-28 h-28 sm:w-32 sm:h-32' : 'w-20 h-20 sm:w-24 sm:h-24';

                return (
                  <motion.div
                    key={p.id}
                    className="flex flex-col items-center flex-1 max-w-[200px]"
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + visualPos * 0.15, type: "spring" }}
                  >
                    {/* Crown for #1 */}
                    {rank === 1 && (
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mb-1"
                      >
                        <Crown className="w-10 h-10 sm:w-14 sm:h-14 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.7)]" />
                      </motion.div>
                    )}

                    {/* Avatar */}
                    <motion.div
                      className={cn(
                        avatarSize,
                        "rounded-full overflow-hidden border-4 mb-3 relative",
                        style.border,
                        style.shadow,
                        "shadow-lg"
                      )}
                      whileHover={{ scale: 1.08 }}
                    >
                      <img src={p.avatar_url} alt={p.nickname} className="w-full h-full object-cover" />
                    </motion.div>

                    {/* Ribbon / Score badge */}
                    <div className="relative mb-2 w-full">
                      <div className={cn(
                        "relative mx-auto px-4 py-2 rounded-lg text-center",
                        "bg-gradient-to-r",
                        style.ribbon,
                        "shadow-lg"
                      )}
                        style={{ maxWidth: rank === 1 ? 180 : 150 }}
                      >
                        {/* Ribbon tails */}
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[12px] border-b-[12px] border-r-[8px] border-transparent border-r-current opacity-30" />
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[12px] border-b-[12px] border-l-[8px] border-transparent border-l-current opacity-30" />
                        
                        <div className={cn("font-black text-lg sm:text-2xl", style.numberText)}>
                          {p.score} <span className="text-xs sm:text-sm font-bold opacity-80">очков</span>
                        </div>
                        <div className={cn("text-xs font-semibold opacity-80", style.numberText)}>
                          Проверок: {p.reviews_completed}
                        </div>
                      </div>
                    </div>

                    {/* Nickname */}
                    <p className={cn("font-bold text-sm sm:text-base truncate max-w-full mb-2", style.text)}>
                      {p.nickname}
                    </p>

                    {/* Podium block */}
                    <div className={cn(
                      "w-full rounded-t-2xl relative overflow-hidden",
                      height,
                      style.bg,
                      "border-t-2 border-x-2",
                      style.border
                    )}>
                      {/* Number */}
                      <div className="flex items-center justify-center pt-4">
                        <span className={cn(
                          "text-4xl sm:text-6xl font-black opacity-60",
                          style.text
                        )}>
                          {rank}
                        </span>
                      </div>
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* === TABLE HEADER RIBBON === */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto mb-0"
        >
          <div className="relative flex items-center justify-center py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-t-xl">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[20px] border-b-[20px] border-r-[12px] border-transparent border-r-blue-700" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[20px] border-b-[20px] border-l-[12px] border-transparent border-l-blue-700" />
            <h2 className="text-white font-black text-xl tracking-wide">Таблица участников</h2>
          </div>
        </motion.div>

        {/* === TABLE === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-b-2xl overflow-hidden border border-border/50 border-t-0"
            style={{ background: 'linear-gradient(180deg, hsl(222 47% 10%), hsl(222 47% 7%))' }}
          >
            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs sm:text-sm font-bold text-muted-foreground border-b border-border/40 bg-muted/30">
              <div className="col-span-1 text-center">Место</div>
              <div className="col-span-5">Участник</div>
              <div className="col-span-2 text-center">Проверок</div>
              <div className="col-span-2 text-center">Рейтинг</div>
              <div className="col-span-2 text-center">Очки</div>
            </div>

            {/* Rows */}
            {rest.map((entry: LeaderboardProfile, index) => {
              const rank = index + 4;
              const isCurrentUser = entry.id === user?.id;
              const shieldColors = [
                'from-yellow-500 to-yellow-600', // 4
                'from-indigo-400 to-indigo-600', // 5
                'from-amber-600 to-amber-700',   // 6
                'from-rose-500 to-rose-600',      // 7
                'from-emerald-500 to-emerald-600',// 8
                'from-cyan-400 to-cyan-600',      // 9
                'from-purple-400 to-purple-600',  // 10
              ];
              const shieldColor = shieldColors[(rank - 4) % shieldColors.length];

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * Math.min(index, 10) + 0.6 }}
                  className={cn(
                    "grid grid-cols-12 gap-2 px-4 py-4 items-center transition-all duration-200 hover:bg-white/5 border-b border-border/20",
                    isCurrentUser && "bg-primary/10 border-l-4 border-l-primary"
                  )}
                >
                  {/* Rank shield */}
                  <div className="col-span-1 flex justify-center">
                    <div className={cn(
                      "w-8 h-9 sm:w-10 sm:h-11 rounded-md bg-gradient-to-b flex items-center justify-center text-white font-black text-sm sm:text-base shadow-md relative",
                      shieldColor
                    )}>
                      {rank}
                      {/* Shield bottom point */}
                      <div className={cn(
                        "absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] sm:border-l-[18px] border-r-[14px] sm:border-r-[18px] border-t-[6px] border-transparent",
                      )}
                        style={{ borderTopColor: 'inherit' }}
                      />
                    </div>
                  </div>

                  {/* User */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-border shrink-0">
                      <img src={entry.avatar_url} alt={entry.nickname} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm sm:text-base truncate text-foreground">
                        {entry.nickname}
                        {isCurrentUser && (
                          <span className="text-xs text-primary ml-2">(Вы)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Reviews */}
                  <div className="col-span-2 text-center font-bold text-base sm:text-lg text-foreground">
                    {entry.reviews_completed}
                  </div>

                  {/* Rating */}
                  <div className="col-span-2 text-center">
                    {entry.total_reviews > 0 ? (
                      <span className="font-bold text-base sm:text-lg text-yellow-400">
                        {getAccuracy(entry.correct_reviews, entry.total_reviews)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>

                  {/* Points */}
                  <div className="col-span-2 text-center">
                    <span className="font-black text-base sm:text-lg text-foreground">
                      {entry.score}
                      <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">очков</span>
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {/* Top 3 also in table but greyed */}
            {(!leaderboard || leaderboard.length === 0) && (
              <div className="p-12 text-center text-muted-foreground">
                Пока нет участников в рейтинге
              </div>
            )}
          </div>

          {/* Your Position */}
          {isInTop && currentProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6 p-5 rounded-2xl border border-primary/30 bg-primary/10 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="font-bold">Ваша позиция: </span>
                    <span className="text-2xl font-black text-primary">#{(currentUserRank ?? 0) + 1}</span>
                  </div>
                </div>
                {currentUserRank !== undefined && currentUserRank > 0 && (
                  <div className="text-sm text-muted-foreground bg-background/50 px-4 py-2 rounded-full">
                    До #{currentUserRank}: нужно ещё{' '}
                    <span className="font-bold text-primary">
                       {Math.max(0, ((leaderboard?.[currentUserRank - 1] as LeaderboardProfile | undefined)?.score || 0) - (((leaderboard?.[currentUserRank] as LeaderboardProfile | undefined)?.score) || 0))}
                    </span>{' '}
                    очков
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
