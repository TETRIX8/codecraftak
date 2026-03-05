import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, CheckCircle, Lock, Flame, Heart,
  Code2, Shield, Crown, Zap, Target, Award,
  Sparkles, ChevronRight, Loader2, TrendingUp
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useBadges, useUserBadges } from '@/hooks/useBadges';
import { useAchievementProgress, useCheckAndAwardBadges } from '@/hooks/useAchievements';
import { cn } from '@/lib/utils';

const CATEGORY_MAP: Record<string, { label: string; icon: any; color: string }> = {
  reviews: { label: 'Проверки', icon: Shield, color: 'text-blue-400' },
  solutions: { label: 'Решения', icon: Code2, color: 'text-green-400' },
  streak: { label: 'Серии', icon: Flame, color: 'text-orange-400' },
  trust_rating: { label: 'Рейтинг', icon: Star, color: 'text-yellow-400' },
  likes_received: { label: 'Лайки', icon: Heart, color: 'text-pink-400' },
  leader_days: { label: 'Лидерство', icon: Crown, color: 'text-amber-400' },
  registration: { label: 'Начало', icon: Zap, color: 'text-cyan-400' },
  language: { label: 'Языки', icon: Code2, color: 'text-purple-400' },
};

function getCategory(type: string) {
  if (['js_reviews', 'python_reviews', 'java_reviews', 'cpp_reviews', 'html_reviews', 'ts_reviews'].includes(type)) {
    return 'language';
  }
  return type;
}

function getProgress(badge: any, progress: any): { current: number; max: number } {
  if (!progress?.profile) return { current: 0, max: badge.requirement_value };
  const p = progress.profile;
  
  switch (badge.requirement_type) {
    case 'registration': return { current: 1, max: 1 };
    case 'reviews': return { current: p.reviews_completed || 0, max: badge.requirement_value };
    case 'solutions': return { current: progress.acceptedSolutions || 0, max: badge.requirement_value };
    case 'streak': return { current: p.streak || 0, max: badge.requirement_value };
    case 'trust_rating': return { current: p.trust_rating || 50, max: badge.requirement_value };
    case 'likes_received': return { current: p.likes_received || 0, max: badge.requirement_value };
    case 'js_reviews': return { current: progress.langCounts?.javascript || 0, max: badge.requirement_value };
    case 'python_reviews': return { current: progress.langCounts?.python || 0, max: badge.requirement_value };
    case 'java_reviews': return { current: progress.langCounts?.java || 0, max: badge.requirement_value };
    case 'cpp_reviews': return { current: progress.langCounts?.cpp || 0, max: badge.requirement_value };
    case 'html_reviews': return { current: (progress.langCounts?.html || 0) + (progress.langCounts?.css || 0), max: badge.requirement_value };
    case 'ts_reviews': return { current: progress.langCounts?.typescript || 0, max: badge.requirement_value };
    default: return { current: 0, max: badge.requirement_value };
  }
}

function AchievementCard({ badge, isEarned, earnedAt, progress }: {
  badge: any; isEarned: boolean; earnedAt?: string; progress: any;
}) {
  const [hovered, setHovered] = useState(false);
  const { current, max } = getProgress(badge, progress);
  const pct = Math.min(100, Math.round((current / max) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -4 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={cn(
        'relative p-5 rounded-2xl border transition-all overflow-hidden',
        isEarned
          ? 'bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border-primary/30 shadow-lg shadow-primary/5'
          : 'bg-card/50 border-border/50 opacity-70 hover:opacity-90'
      )}
    >
      {isEarned && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{ x: hovered ? ['100%', '-100%'] : '-100%' }}
          transition={{ duration: 1.2 }}
        />
      )}

      <div className="relative flex items-start gap-4">
        <motion.div
          className={cn(
            'text-4xl flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center',
            isEarned ? 'bg-primary/10' : 'bg-muted/30'
          )}
          animate={{ rotate: hovered && isEarned ? [0, -5, 5, 0] : 0, scale: hovered ? 1.1 : 1 }}
        >
          {isEarned ? badge.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('font-bold text-sm', isEarned ? 'text-foreground' : 'text-muted-foreground')}>
              {badge.name}
            </span>
            {isEarned && <CheckCircle className="w-4 h-4 text-green-500" />}
            <span className={cn(
              'ml-auto text-xs font-bold flex items-center gap-1 px-2 py-0.5 rounded-full',
              isEarned ? 'bg-amber-500/20 text-amber-400' : 'bg-muted/30 text-muted-foreground'
            )}>
              <Trophy className="w-3 h-3" />
              +{badge.reward_points}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{badge.description}</p>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{current} / {max}</span>
              <span className={cn('font-medium', isEarned ? 'text-green-500' : 'text-primary')}>{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  isEarned ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-primary to-accent'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {isEarned && earnedAt && (
            <div className="text-xs text-muted-foreground/60 mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Получено {new Date(earnedAt).toLocaleDateString('ru-RU')}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Achievements() {
  const { user } = useAuth();
  const { data: allBadges, isLoading: badgesLoading } = useBadges();
  const { data: userBadges } = useUserBadges();
  const { data: progress } = useAchievementProgress();
  const checkBadges = useCheckAndAwardBadges();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Auto-check badges on page load
  useEffect(() => {
    if (user) {
      checkBadges.mutate();
    }
  }, [user]);

  const earnedMap = useMemo(() => {
    const map: Record<string, string> = {};
    userBadges?.forEach(ub => { map[ub.badge_id] = ub.earned_at || ''; });
    return map;
  }, [userBadges]);

  const categories = useMemo(() => {
    if (!allBadges) return [];
    const cats = new Set<string>();
    allBadges.forEach(b => cats.add(getCategory(b.requirement_type)));
    return Array.from(cats);
  }, [allBadges]);

  const filteredBadges = useMemo(() => {
    if (!allBadges) return [];
    if (activeCategory === 'all') return allBadges;
    return allBadges.filter(b => getCategory(b.requirement_type) === activeCategory);
  }, [allBadges, activeCategory]);

  const earnedCount = userBadges?.length || 0;
  const totalCount = allBadges?.length || 0;
  const overallPct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;
  
  const earnedPoints = useMemo(() => {
    if (!allBadges || !userBadges) return 0;
    return allBadges
      .filter(b => earnedMap[b.id])
      .reduce((sum, b) => sum + (b.reward_points || 0), 0);
  }, [allBadges, userBadges, earnedMap]);
  
  const totalPoints = useMemo(() => {
    return allBadges?.reduce((sum, b) => sum + (b.reward_points || 0), 0) || 0;
  }, [allBadges]);

  if (badgesLoading) {
    return (
      <div className="min-h-screen bg-background py-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Достижения</h1>
          <p className="text-muted-foreground">Выполняй задания, проверяй код и открывай награды</p>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-semibold">Общий прогресс</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm flex items-center gap-1 text-amber-400 font-bold">
                <Trophy className="w-4 h-4" />
                {earnedPoints} / {totalPoints} баллов
              </span>
              <span className="text-2xl font-bold">{earnedCount} / {totalCount}</span>
            </div>
          </div>
          <div className="h-4 rounded-full bg-muted/30 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-sm mt-2 text-muted-foreground">
            <span>{overallPct}% открыто</span>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => checkBadges.mutate()}
                disabled={checkBadges.isPending}
                className="text-xs"
              >
                <Zap className="w-3 h-3 mr-1" />
                Проверить награды
              </Button>
            )}
          </div>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('all')}
            className="rounded-full"
          >
            Все ({totalCount})
          </Button>
          {categories.map(cat => {
            const info = CATEGORY_MAP[cat] || { label: cat, icon: Award, color: 'text-foreground' };
            const count = allBadges?.filter(b => getCategory(b.requirement_type) === cat).length || 0;
            const earned = allBadges?.filter(b => getCategory(b.requirement_type) === cat && earnedMap[b.id]).length || 0;
            return (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className="rounded-full gap-1"
              >
                <info.icon className={cn('w-3 h-3', activeCategory !== cat && info.color)} />
                {info.label} ({earned}/{count})
              </Button>
            );
          })}
        </div>

        {/* Badge Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredBadges
              .sort((a, b) => {
                const aEarned = !!earnedMap[a.id];
                const bEarned = !!earnedMap[b.id];
                if (aEarned !== bEarned) return aEarned ? -1 : 1;
                return a.requirement_value - b.requirement_value;
              })
              .map((badge, i) => (
                <AchievementCard
                  key={badge.id}
                  badge={badge}
                  isEarned={!!earnedMap[badge.id]}
                  earnedAt={earnedMap[badge.id]}
                  progress={progress}
                />
              ))}
          </AnimatePresence>
        </div>

        {filteredBadges.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Award className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Нет достижений в этой категории</p>
          </div>
        )}
      </div>
    </div>
  );
}
