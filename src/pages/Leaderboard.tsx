import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Flame, TrendingUp } from 'lucide-react';
import { LevelBadge } from '@/components/common/Badges';
import { mockLeaderboard } from '@/data/mockData';
import { cn } from '@/lib/utils';

export default function Leaderboard() {
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
                  src={mockLeaderboard[1].user.avatar}
                  alt={mockLeaderboard[1].user.nickname}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold mb-1">{mockLeaderboard[1].user.nickname}</h3>
              <LevelBadge level={mockLeaderboard[1].user.level} className="mb-3" />
              <div className="text-2xl font-bold gradient-text">{mockLeaderboard[1].score}</div>
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
                  src={mockLeaderboard[0].user.avatar}
                  alt={mockLeaderboard[0].user.nickname}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold mb-1">{mockLeaderboard[0].user.nickname}</h3>
              <LevelBadge level={mockLeaderboard[0].user.level} className="mb-3" />
              <div className="text-3xl font-bold gradient-text">{mockLeaderboard[0].score}</div>
              <div className="text-xs text-muted-foreground">очков</div>
              <div className="flex items-center justify-center gap-1 mt-2 text-warning">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-medium">{mockLeaderboard[0].user.streak} дней</span>
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
                  src={mockLeaderboard[2].user.avatar}
                  alt={mockLeaderboard[2].user.nickname}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold mb-1 text-sm">{mockLeaderboard[2].user.nickname}</h3>
              <LevelBadge level={mockLeaderboard[2].user.level} className="mb-3" />
              <div className="text-xl font-bold gradient-text">{mockLeaderboard[2].score}</div>
              <div className="text-xs text-muted-foreground">очков</div>
            </div>
          </div>
        </motion.div>

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

            {mockLeaderboard.map((entry, index) => (
              <motion.div
                key={entry.user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={cn(
                  "grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors",
                  entry.rank === 4 && "bg-primary/5 border-l-2 border-primary"
                )}
              >
                <div className="col-span-1 text-center">
                  {entry.rank <= 3 ? (
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold text-sm",
                      entry.rank === 1 && "bg-yellow-500/20 text-yellow-400",
                      entry.rank === 2 && "bg-gray-400/20 text-gray-400",
                      entry.rank === 3 && "bg-amber-600/20 text-amber-500",
                    )}>
                      {entry.rank === 1 ? <Trophy className="w-4 h-4" /> :
                       entry.rank === 2 ? <Medal className="w-4 h-4" /> :
                       <Award className="w-4 h-4" />}
                    </div>
                  ) : (
                    <span className="text-muted-foreground font-medium">{entry.rank}</span>
                  )}
                </div>
                
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-border">
                    <img
                      src={entry.user.avatar}
                      alt={entry.user.nickname}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {entry.user.nickname}
                      {entry.rank === 4 && (
                        <span className="text-xs text-primary">(Вы)</span>
                      )}
                    </div>
                    <LevelBadge level={entry.user.level} className="scale-75 origin-left" />
                  </div>
                </div>
                
                <div className="col-span-2 text-center">
                  <span className="font-medium">{entry.user.reviewsCompleted}</span>
                </div>
                
                <div className="col-span-2 text-center">
                  <span className={cn(
                    "font-medium",
                    entry.user.trustRating >= 95 && "text-success",
                    entry.user.trustRating >= 90 && entry.user.trustRating < 95 && "text-warning",
                    entry.user.trustRating < 90 && "text-muted-foreground",
                  )}>
                    {entry.user.trustRating}%
                  </span>
                </div>
                
                <div className="col-span-2 text-center">
                  <span className="font-bold gradient-text">{entry.score}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Your Position */}
          <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-medium">Ваша позиция: #4</span>
              </div>
              <span className="text-sm text-muted-foreground">
                До #3: нужно ещё 90 очков
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
