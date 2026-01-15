import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Flame, TrendingUp, Loader2 } from 'lucide-react';
import { LevelBadge } from '@/components/common/Badges';
import { useLeaderboard, useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function Leaderboard() {
  const { user } = useAuth();
  const { data: leaderboard, isLoading } = useLeaderboard();
  const { data: currentProfile } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const topThree = leaderboard?.slice(0, 3) || [];
  const restOfLeaderboard = leaderboard?.slice(3) || [];

  // Find current user's rank
  const currentUserRank = leaderboard?.findIndex(p => p.id === user?.id);
  const isInTop = currentUserRank !== undefined && currentUserRank !== -1;

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20 text-warning text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            Таблица лидеров
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Топ ревьюеров</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Лучшие участники платформы по количеству проверок и рейтингу доверия
          </p>
        </motion.div>

        {/* Top 3 Podium */}
        {topThree.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-12"
          >
            {/* 2nd Place */}
            <div className="order-1 pt-8">
              <div className="relative p-6 rounded-2xl bg-card border border-border text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-800 font-bold shadow-lg">
                  2
                </div>
                <div className="w-16 h-16 rounded-xl overflow-hidden mx-auto mb-4 mt-2 border-2 border-gray-400">
                  <img
                    src={topThree[1].avatar_url}
                    alt={topThree[1].nickname}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold mb-1">{topThree[1].nickname}</h3>
                <LevelBadge level={topThree[1].level} className="mb-3" />
                <div className="text-2xl font-bold gradient-text">{topThree[1].reviews_completed * 10}</div>
                <div className="text-xs text-muted-foreground">очков</div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="order-2">
              <div className="relative p-6 rounded-2xl bg-gradient-to-b from-warning/20 to-card border border-warning/30 text-center">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-yellow-900 font-bold shadow-lg">
                      1
                    </div>
                    <Trophy className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <div className="w-20 h-20 rounded-xl overflow-hidden mx-auto mb-4 mt-4 border-2 border-yellow-400 shadow-lg shadow-yellow-400/20">
                  <img
                    src={topThree[0].avatar_url}
                    alt={topThree[0].nickname}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold mb-1">{topThree[0].nickname}</h3>
                <LevelBadge level={topThree[0].level} className="mb-3" />
                <div className="text-3xl font-bold gradient-text">{topThree[0].reviews_completed * 10}</div>
                <div className="text-xs text-muted-foreground">очков</div>
                <div className="flex items-center justify-center gap-1 mt-2 text-warning">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-medium">{topThree[0].streak} дней</span>
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="order-3 pt-12">
              <div className="relative p-6 rounded-2xl bg-card border border-border text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-amber-100 font-bold shadow-lg">
                  3
                </div>
                <div className="w-14 h-14 rounded-xl overflow-hidden mx-auto mb-4 mt-2 border-2 border-amber-600">
                  <img
                    src={topThree[2].avatar_url}
                    alt={topThree[2].nickname}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold mb-1 text-sm">{topThree[2].nickname}</h3>
                <LevelBadge level={topThree[2].level} className="mb-3" />
                <div className="text-xl font-bold gradient-text">{topThree[2].reviews_completed * 10}</div>
                <div className="text-xs text-muted-foreground">очков</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Full Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 text-sm font-medium text-muted-foreground border-b border-border">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-5">Участник</div>
              <div className="col-span-2 text-center">Проверок</div>
              <div className="col-span-2 text-center">Рейтинг</div>
              <div className="col-span-2 text-center">Очки</div>
            </div>

            {leaderboard?.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.id === user?.id;
              
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * Math.min(index, 10) }}
                  className={cn(
                    "grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors",
                    isCurrentUser && "bg-primary/5 border-l-2 border-primary"
                  )}
                >
                  <div className="col-span-1 text-center">
                    {rank <= 3 ? (
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold text-sm",
                        rank === 1 && "bg-yellow-500/20 text-yellow-400",
                        rank === 2 && "bg-gray-400/20 text-gray-400",
                        rank === 3 && "bg-amber-600/20 text-amber-500",
                      )}>
                        {rank === 1 ? <Trophy className="w-4 h-4" /> :
                         rank === 2 ? <Medal className="w-4 h-4" /> :
                         <Award className="w-4 h-4" />}
                      </div>
                    ) : (
                      <span className="text-muted-foreground font-medium">{rank}</span>
                    )}
                  </div>
                  
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-border">
                      <img
                        src={entry.avatar_url}
                        alt={entry.nickname}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {entry.nickname}
                        {isCurrentUser && (
                          <span className="text-xs text-primary">(Вы)</span>
                        )}
                      </div>
                      <LevelBadge level={entry.level} className="scale-75 origin-left" />
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-center">
                    <span className="font-medium">{entry.reviews_completed}</span>
                  </div>
                  
                  <div className="col-span-2 text-center">
                    <div className="flex flex-col items-center">
                      <span className={cn(
                        "font-medium",
                        entry.trust_rating >= 95 && "text-success",
                        entry.trust_rating >= 90 && entry.trust_rating < 95 && "text-warning",
                        entry.trust_rating < 90 && "text-muted-foreground",
                      )}>
                        {entry.trust_rating}%
                      </span>
                      {entry.total_reviews > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {entry.correct_reviews}/{entry.total_reviews}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-center">
                    <span className="font-bold gradient-text">{entry.reviews_completed * 10}</span>
                  </div>
                </motion.div>
              );
            })}

            {(!leaderboard || leaderboard.length === 0) && (
              <div className="p-8 text-center text-muted-foreground">
                Пока нет участников в рейтинге
              </div>
            )}
          </div>

          {/* Your Position */}
          {isInTop && currentProfile && (
            <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="font-medium">Ваша позиция: #{(currentUserRank ?? 0) + 1}</span>
                </div>
                {currentUserRank !== undefined && currentUserRank > 0 && (
                  <span className="text-sm text-muted-foreground">
                    До #{currentUserRank}: нужно ещё {((leaderboard?.[currentUserRank - 1]?.reviews_completed || 0) - currentProfile.reviews_completed) * 10} очков
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
