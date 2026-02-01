import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  CheckCircle, 
  Flame, 
  Star, 
  TrendingUp,
  Code2,
  Shield,
  User as UserIcon,
  Loader2,
  LogIn,
  Crown,
  Lock,
  Calendar,
  Target,
  Zap,
  Trophy,
  Activity,
  BarChart3,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LevelBadge } from '@/components/common/Badges';
import { SolutionCard } from '@/components/solutions/SolutionCard';
import { EditProfileDialog } from '@/components/profile/EditProfileDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useUserBadges, useBadges } from '@/hooks/useBadges';
import { useUserSolutions } from '@/hooks/useSolutions';
import { cn } from '@/lib/utils';

// Animated background particles
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, '-20%'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}

// Activity Graph Component
function ActivityGraph({ solutions }: { solutions: any[] }) {
  const activityData = useMemo(() => {
    const today = new Date();
    const data: { date: string; count: number; level: number }[] = [];
    
    // Generate last 12 weeks (84 days)
    for (let i = 83; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = solutions?.filter(s => 
        s.created_at.split('T')[0] === dateStr
      ).length || 0;
      
      let level = 0;
      if (count >= 5) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;
      
      data.push({ date: dateStr, count, level });
    }
    
    return data;
  }, [solutions]);

  const weeks = useMemo(() => {
    const result: typeof activityData[] = [];
    for (let i = 0; i < activityData.length; i += 7) {
      result.push(activityData.slice(i, i + 7));
    }
    return result;
  }, [activityData]);

  const totalActivity = activityData.reduce((sum, d) => sum + d.count, 0);
  const activeDays = activityData.filter(d => d.count > 0).length;

  const levelColors = [
    'bg-muted/30',
    'bg-emerald-500/30',
    'bg-emerald-500/50',
    'bg-emerald-500/70',
    'bg-emerald-500',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-semibold">График активности</h3>
            <p className="text-sm text-muted-foreground">Последние 12 недель</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-warning" />
            <span className="font-semibold">{totalActivity}</span>
            <span className="text-muted-foreground">действий</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-semibold">{activeDays}</span>
            <span className="text-muted-foreground">активных дней</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 justify-center">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => (
              <motion.div
                key={day.date}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: (weekIndex * 7 + dayIndex) * 0.005 }}
                className={cn(
                  'w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-125',
                  levelColors[day.level]
                )}
                title={`${day.date}: ${day.count} действий`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
        <span>Меньше</span>
        {levelColors.map((color, i) => (
          <div key={i} className={cn('w-3 h-3 rounded-sm', color)} />
        ))}
        <span>Больше</span>
      </div>
    </motion.div>
  );
}

// Animated Stat Card
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subtext, 
  color, 
  gradient,
  delay = 0 
}: { 
  icon: any;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
  gradient: string;
  delay?: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 100 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <div className={cn(
        'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl',
        gradient
      )} />
      <div className="relative p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 backdrop-blur-sm overflow-hidden">
        {/* Animated background glow */}
        <motion.div
          className={cn('absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20', gradient)}
          animate={{
            scale: isHovered ? 1.5 : 1,
            opacity: isHovered ? 0.4 : 0.2,
          }}
        />
        
        <div className="relative">
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300',
            gradient,
            isHovered && 'scale-110'
          )}>
            <Icon className={cn('w-7 h-7', color)} />
          </div>
          
          <motion.div
            className="text-3xl font-bold mb-1"
            animate={{ scale: isHovered ? 1.05 : 1 }}
          >
            {value}
          </motion.div>
          <div className="text-sm text-muted-foreground font-medium">{label}</div>
          {subtext && (
            <div className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {subtext}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Achievement Card with animations
function AchievementCard({ badge, isEarned, earnedAt }: { badge: any; isEarned: boolean; earnedAt?: string }) {
  const [isHovered, setIsHovered] = useState(false);

  const getRequirementText = () => {
    switch (badge.requirement_type) {
      case 'reviews': return `Проверить ${badge.requirement_value} заданий`;
      case 'solutions': return `Решить ${badge.requirement_value} задач`;
      case 'streak': return `Серия ${badge.requirement_value} дней`;
      case 'trust_rating': return `Рейтинг ${badge.requirement_value}%`;
      case 'likes_received': return `${badge.requirement_value} лайков`;
      case 'weekly_reviews': return `${badge.requirement_value}/неделю`;
      case 'registration': return 'Регистрация';
      case 'leader_days': return `Лидер ${badge.requirement_value} дней`;
      default: return badge.description;
    }
  };

  const getBonusPoints = () => {
    if (badge.requirement_type === 'leader_days') return 500;
    if (badge.requirement_type === 'trust_rating' && badge.requirement_value >= 95) return 200;
    if (badge.requirement_value >= 100) return 100;
    if (badge.requirement_value >= 50) return 50;
    return 25;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'relative p-4 rounded-xl border transition-all overflow-hidden',
        isEarned 
          ? 'bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-primary/30' 
          : 'bg-muted/20 border-border/50 opacity-60 hover:opacity-80'
      )}
    >
      {/* Shimmer effect for earned badges */}
      {isEarned && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: isHovered ? ['100%', '-100%'] : '-100%',
          }}
          transition={{
            duration: 1,
            ease: 'easeInOut',
          }}
        />
      )}

      <div className="relative flex items-start gap-3">
        <motion.div 
          className={cn(
            'text-3xl flex-shrink-0',
            !isEarned && 'grayscale'
          )}
          animate={{
            rotate: isHovered && isEarned ? [0, -10, 10, 0] : 0,
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          {isEarned ? badge.icon : <Lock className="w-7 h-7 text-muted-foreground" />}
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              'font-semibold text-sm truncate',
              isEarned ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {badge.name}
            </span>
            {isEarned && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs px-1.5 py-0.5 rounded-full bg-success/20 text-success"
              >
                <CheckCircle className="w-3 h-3" />
              </motion.span>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
            {badge.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-primary/80 font-medium">
              {getRequirementText()}
            </span>
            <span className={cn(
              'text-xs font-bold flex items-center gap-1',
              isEarned ? 'text-warning' : 'text-muted-foreground'
            )}>
              <Trophy className="w-3 h-3" />
              +{getBonusPoints()}
            </span>
          </div>
          
          {isEarned && earnedAt && (
            <div className="text-xs text-muted-foreground/60 mt-1">
              {new Date(earnedAt).toLocaleDateString('ru-RU')}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Level Progress Component
function LevelProgressCard({ profile }: { profile: any }) {
  const levelProgress = {
    beginner: { current: 0, next: 25, label: 'Ревьюер', nextLevel: 'reviewer' },
    reviewer: { current: 25, next: 100, label: 'Эксперт', nextLevel: 'expert' },
    expert: { current: 100, next: 100, label: 'Максимум', nextLevel: null },
  };

  const progress = levelProgress[profile.level as keyof typeof levelProgress];
  const progressPercent = profile.level === 'expert' 
    ? 100 
    : Math.max(0, ((profile.reviews_completed - progress.current) / (progress.next - progress.current)) * 100);

  const levels = [
    { level: 'beginner', name: 'Новичок', threshold: 0, icon: UserIcon, color: 'from-blue-500 to-blue-600' },
    { level: 'reviewer', name: 'Ревьюер', threshold: 25, icon: Shield, color: 'from-purple-500 to-purple-600' },
    { level: 'expert', name: 'Эксперт', threshold: 100, icon: Award, color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h3 className="font-semibold">Прогресс уровня</h3>
          <p className="text-sm text-muted-foreground">
            {profile.level !== 'expert' 
              ? `До ${progress.label}: ${progress.next - profile.reviews_completed} проверок`
              : 'Максимальный уровень достигнут!'
            }
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Прогресс</span>
          <span className="font-medium">{Math.round(progressPercent)}%</span>
        </div>
        <div className="relative h-4 rounded-full bg-muted/30 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['0%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Level Steps */}
      <div className="grid grid-cols-3 gap-3">
        {levels.map((item, index) => {
          const isCompleted = profile.reviews_completed >= item.threshold;
          const isCurrent = profile.level === item.level;
          
          return (
            <motion.div
              key={item.level}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={cn(
                'relative p-4 rounded-xl text-center transition-all',
                isCurrent 
                  ? `bg-gradient-to-br ${item.color} text-white shadow-lg`
                  : isCompleted
                    ? 'bg-primary/10 border border-primary/30'
                    : 'bg-muted/30 border border-border/50'
              )}
            >
              {isCurrent && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-2.5 h-2.5 text-primary" />
                </motion.div>
              )}
              
              <item.icon className={cn(
                'w-6 h-6 mx-auto mb-2',
                isCurrent ? 'text-white' : isCompleted ? 'text-primary' : 'text-muted-foreground'
              )} />
              <div className={cn(
                'text-sm font-medium',
                !isCurrent && !isCompleted && 'text-muted-foreground'
              )}>
                {item.name}
              </div>
              <div className={cn(
                'text-xs',
                isCurrent ? 'text-white/80' : 'text-muted-foreground'
              )}>
                {item.threshold}+ проверок
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: userBadges } = useUserBadges();
  const { data: allBadges } = useBadges();
  const { data: solutions } = useUserSolutions();

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-24 relative overflow-hidden">
        <FloatingParticles />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto text-center"
          >
            <motion.div 
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-6"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <LogIn className="w-12 h-12 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-4">Войдите в аккаунт</h1>
            <p className="text-muted-foreground mb-8">
              Чтобы просмотреть профиль, необходимо войти в аккаунт.
            </p>
            <Link to="/auth">
              <Button variant="gradient" size="lg" className="gap-2">
                <LogIn className="w-4 h-4" />
                Войти
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background py-24 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background py-24">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Профиль не найден</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-24 relative overflow-hidden">
      <FloatingParticles />
      
      <div className="container mx-auto px-4 relative">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 h-56 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}
            />
          </div>
          
          <div className="relative pt-28 px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-36 h-36 rounded-3xl overflow-hidden border-4 border-background shadow-2xl">
                  <img
                    src={profile.avatar_url || '/placeholder.svg'}
                    alt={profile.nickname}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Streak badge */}
                <motion.div 
                  className="absolute -bottom-2 -right-2 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Flame className="w-6 h-6 text-white" />
                </motion.div>
                
                {/* Leader badge */}
                {userBadges?.some(b => b.badges.requirement_type === 'leader_days') && (
                  <motion.div 
                    className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        '0 10px 15px -3px rgba(234, 179, 8, 0.3)',
                        '0 10px 15px -3px rgba(234, 179, 8, 0.5)',
                        '0 10px 15px -3px rgba(234, 179, 8, 0.3)',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Crown className="w-6 h-6 text-yellow-900" />
                  </motion.div>
                )}
              </motion.div>

              {/* Info */}
              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    {profile.nickname}
                  </h1>
                  <LevelBadge level={profile.level} />
                  <EditProfileDialog profile={profile} />
                </div>
                
                <p className="text-muted-foreground mb-4 flex items-center justify-center sm:justify-start gap-2">
                  <Calendar className="w-4 h-4" />
                  Участник с {new Date(profile.created_at).toLocaleDateString('ru-RU', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                  <motion.div 
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="font-bold text-orange-500">{profile.streak}</span>
                    <span className="text-sm text-muted-foreground">дней подряд</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Award className="w-5 h-5 text-purple-500" />
                    <span className="font-bold text-purple-500">{userBadges?.length || 0}</span>
                    <span className="text-sm text-muted-foreground">достижений</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Star}
            label="Рейтинг доверия"
            value={`${profile.trust_rating}%`}
            subtext={profile.total_reviews > 0 
              ? `${profile.correct_reviews}/${profile.total_reviews} верных`
              : 'Нет проверок'}
            color="text-yellow-500"
            gradient="bg-gradient-to-br from-yellow-500/20 to-amber-500/20"
            delay={0}
          />
          <StatCard
            icon={CheckCircle}
            label="Проверок выполнено"
            value={profile.reviews_completed}
            subtext={profile.total_reviews > 0
              ? `${Math.round((profile.correct_reviews / profile.total_reviews) * 100)}% точность`
              : undefined}
            color="text-emerald-500"
            gradient="bg-gradient-to-br from-emerald-500/20 to-green-500/20"
            delay={0.1}
          />
          <StatCard
            icon={Code2}
            label="Баланс проверок"
            value={profile.review_balance}
            color="text-blue-500"
            gradient="bg-gradient-to-br from-blue-500/20 to-cyan-500/20"
            delay={0.2}
          />
          <StatCard
            icon={BarChart3}
            label="Решений отправлено"
            value={solutions?.length || 0}
            color="text-purple-500"
            gradient="bg-gradient-to-br from-purple-500/20 to-pink-500/20"
            delay={0.3}
          />
        </div>

        {/* Activity Graph */}
        <div className="mb-8">
          <ActivityGraph solutions={solutions || []} />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Level Progress */}
          <LevelProgressCard profile={profile} />

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Достижения</h3>
                  <p className="text-sm text-muted-foreground">
                    {userBadges?.length || 0} из {allBadges?.length || 0} получено
                  </p>
                </div>
              </div>
              <Link to="/achievements" className="text-sm text-primary flex items-center gap-1 hover:underline">
                Все <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {allBadges?.slice(0, 6).map((badge) => {
                const earnedBadge = userBadges?.find(ub => ub.badge_id === badge.id);
                return (
                  <AchievementCard
                    key={badge.id}
                    badge={badge}
                    isEarned={!!earnedBadge}
                    earnedAt={earnedBadge?.earned_at}
                  />
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* My Solutions */}
        {solutions && solutions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Мои решения</h3>
                  <p className="text-sm text-muted-foreground">{solutions.length} всего</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {solutions.map((solution, index) => (
                <motion.div
                  key={solution.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <SolutionCard solution={solution} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
