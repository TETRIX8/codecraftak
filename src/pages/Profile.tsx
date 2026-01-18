import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Lock
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

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: userBadges } = useUserBadges();
  const { data: allBadges } = useBadges();
  const { data: solutions } = useUserSolutions();

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Войдите в аккаунт</h1>
            <p className="text-muted-foreground mb-8">
              Чтобы просмотреть профиль, необходимо войти в аккаунт.
            </p>
            <Link to="/auth">
              <Button variant="gradient" size="lg">
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

  const levelProgress = {
    beginner: { current: 0, next: 25, label: 'Ревьюер' },
    reviewer: { current: 25, next: 100, label: 'Эксперт' },
    expert: { current: 100, next: 100, label: 'Максимум' },
  };

  const progress = levelProgress[profile.level];
  const progressPercent = profile.level === 'expert' 
    ? 100 
    : ((profile.reviews_completed - progress.current) / (progress.next - progress.current)) * 100;

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12"
        >
          <div className="absolute inset-0 h-48 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl" />
          
          <div className="relative pt-24 px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar with Leader Badge */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-background shadow-xl">
                  <img
                    src={profile.avatar_url}
                    alt={profile.nickname}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Flame className="w-5 h-5 text-primary-foreground" />
                </div>
                {/* Leader Badge - показывается если есть бейдж "Легенда рейтинга" */}
                {userBadges?.some(b => b.badges.requirement_type === 'leader_days') && (
                  <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30 animate-pulse">
                    <Crown className="w-5 h-5 text-yellow-900" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{profile.nickname}</h1>
                  <LevelBadge level={profile.level} />
                  <EditProfileDialog profile={profile} />
                </div>
                <p className="text-muted-foreground mb-4">
                  Участник с {new Date(profile.created_at).toLocaleDateString('ru-RU', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-warning" />
                    <span className="font-semibold">{profile.streak}</span>
                    <span className="text-muted-foreground">дней подряд</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-accent" />
                    <span className="font-semibold">{userBadges?.length || 0}</span>
                    <span className="text-muted-foreground">бейджей</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              icon: Star,
              label: 'Рейтинг доверия',
              value: `${profile.trust_rating}%`,
              subtext: profile.total_reviews > 0 
                ? `${profile.correct_reviews}/${profile.total_reviews} верных`
                : 'Нет проверок',
              color: 'text-warning',
              bgColor: 'bg-warning/10',
            },
            {
              icon: CheckCircle,
              label: 'Проверок выполнено',
              value: profile.reviews_completed,
              subtext: profile.total_reviews > 0
                ? `${Math.round((profile.correct_reviews / profile.total_reviews) * 100)}% точность`
                : undefined,
              color: 'text-success',
              bgColor: 'bg-success/10',
            },
            {
              icon: Code2,
              label: 'Баланс проверок',
              value: profile.review_balance,
              subtext: undefined,
              color: 'text-primary',
              bgColor: 'bg-primary/10',
            },
            {
              icon: TrendingUp,
              label: 'Решений отправлено',
              value: solutions?.length || 0,
              subtext: undefined,
              color: 'text-accent',
              bgColor: 'bg-accent/10',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-xl bg-card border border-border"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              {stat.subtext && (
                <div className="text-xs text-muted-foreground/70 mt-1">{stat.subtext}</div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Level Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl bg-card border border-border"
          >
            <h2 className="text-xl font-semibold mb-6">Прогресс уровня</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <LevelBadge level={profile.level} />
                {profile.level !== 'expert' && (
                  <span className="text-sm text-muted-foreground">
                    До уровня {progress.label}: {progress.next - profile.reviews_completed} проверок
                  </span>
                )}
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Прогресс</span>
                  <span className="font-medium">{Math.round(Math.max(0, progressPercent))}%</span>
                </div>
                <Progress value={Math.max(0, progressPercent)} className="h-3" />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                {[
                  { level: 'Новичок', threshold: 0, icon: UserIcon },
                  { level: 'Ревьюер', threshold: 25, icon: Shield },
                  { level: 'Эксперт', threshold: 100, icon: Award },
                ].map((item) => (
                  <div
                    key={item.level}
                    className={`text-center p-3 rounded-lg ${
                      profile.reviews_completed >= item.threshold
                        ? 'bg-primary/10'
                        : 'bg-muted/50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mx-auto mb-2 ${
                      profile.reviews_completed >= item.threshold
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`} />
                    <div className={`text-xs font-medium ${
                      profile.reviews_completed >= item.threshold
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}>
                      {item.level}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.threshold}+
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* All Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Все достижения</h2>
              <span className="text-sm text-muted-foreground">
                {userBadges?.length || 0} из {allBadges?.length || 0}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
              {allBadges?.map((badge) => {
                const isEarned = userBadges?.some(ub => ub.badge_id === badge.id);
                const earnedBadge = userBadges?.find(ub => ub.badge_id === badge.id);
                
                // Генерируем читаемое условие
                const getRequirementText = () => {
                  switch (badge.requirement_type) {
                    case 'reviews': return `Проверить ${badge.requirement_value} заданий`;
                    case 'solutions': return `Решить ${badge.requirement_value} задач`;
                    case 'streak': return `Серия ${badge.requirement_value} дней подряд`;
                    case 'trust_rating': return `Рейтинг доверия ${badge.requirement_value}%`;
                    case 'likes_received': return `Получить ${badge.requirement_value} лайков`;
                    case 'weekly_reviews': return `${badge.requirement_value} проверок за неделю`;
                    case 'registration': return 'Зарегистрироваться';
                    case 'leader_days': return `Быть лидером ${badge.requirement_value} дней`;
                    case 'python_reviews': return `Проверить ${badge.requirement_value} Python заданий`;
                    case 'ts_reviews': return `Проверить ${badge.requirement_value} TypeScript заданий`;
                    case 'js_reviews': return `Проверить ${badge.requirement_value} JavaScript заданий`;
                    case 'java_reviews': return `Проверить ${badge.requirement_value} Java заданий`;
                    case 'cpp_reviews': return `Проверить ${badge.requirement_value} C++ заданий`;
                    case 'html_reviews': return `Проверить ${badge.requirement_value} HTML/CSS заданий`;
                    default: return badge.description;
                  }
                };

                // Бонус очков за бейдж
                const getBonusPoints = () => {
                  if (badge.requirement_type === 'leader_days') return 500;
                  if (badge.requirement_type === 'trust_rating' && badge.requirement_value >= 95) return 200;
                  if (badge.requirement_type === 'trust_rating' && badge.requirement_value >= 90) return 150;
                  if (badge.requirement_type === 'trust_rating' && badge.requirement_value >= 80) return 100;
                  if (badge.requirement_value >= 100) return 100;
                  if (badge.requirement_value >= 50) return 50;
                  if (badge.requirement_value >= 25) return 25;
                  if (badge.requirement_value >= 10) return 15;
                  return 10;
                };

                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "p-4 rounded-xl border transition-all",
                      isEarned 
                        ? "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30" 
                        : "bg-muted/30 border-border opacity-60 hover:opacity-80"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "text-3xl flex-shrink-0",
                        !isEarned && "grayscale"
                      )}>
                        {isEarned ? badge.icon : <Lock className="w-7 h-7 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "font-semibold text-sm truncate",
                            isEarned ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {badge.name}
                          </span>
                          {isEarned && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-success/20 text-success flex-shrink-0">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {badge.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-primary/80 font-medium">
                            {getRequirementText()}
                          </span>
                          <span className={cn(
                            "text-xs font-bold",
                            isEarned ? "text-warning" : "text-muted-foreground"
                          )}>
                            +{getBonusPoints()} 🏆
                          </span>
                        </div>
                        {isEarned && earnedBadge && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Получено {new Date(earnedBadge.earned_at).toLocaleDateString('ru-RU')}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
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
            className="mt-8"
          >
            <h2 className="text-xl font-semibold mb-6">Мои решения</h2>
            
            <div className="space-y-4">
              {solutions.map((solution) => (
                <SolutionCard key={solution.id} solution={solution} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
