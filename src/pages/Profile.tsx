import { motion } from 'framer-motion';
import { 
  User, 
  Award, 
  CheckCircle, 
  Flame, 
  Star, 
  Calendar,
  TrendingUp,
  Code2,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LevelBadge } from '@/components/common/Badges';
import { mockUser } from '@/data/mockData';

export default function Profile() {
  const levelProgress = {
    beginner: { current: 0, next: 25, label: 'Ревьюер' },
    reviewer: { current: 25, next: 100, label: 'Эксперт' },
    expert: { current: 100, next: 100, label: 'Максимум' },
  };

  const progress = levelProgress[mockUser.level];
  const progressPercent = mockUser.level === 'expert' 
    ? 100 
    : ((mockUser.reviewsCompleted - progress.current) / (progress.next - progress.current)) * 100;

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
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-background shadow-xl">
                  <img
                    src={mockUser.avatar}
                    alt={mockUser.nickname}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Flame className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>

              {/* Info */}
              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{mockUser.nickname}</h1>
                  <LevelBadge level={mockUser.level} />
                </div>
                <p className="text-muted-foreground mb-4">
                  Участник с {mockUser.joinedAt.toLocaleDateString('ru-RU', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-warning" />
                    <span className="font-semibold">{mockUser.streak}</span>
                    <span className="text-muted-foreground">дней подряд</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-accent" />
                    <span className="font-semibold">{mockUser.badges.length}</span>
                    <span className="text-muted-foreground">бейджей</span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <Button variant="outline" className="shrink-0">
                Редактировать
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              icon: Star,
              label: 'Рейтинг доверия',
              value: `${mockUser.trustRating}%`,
              color: 'text-warning',
              bgColor: 'bg-warning/10',
            },
            {
              icon: CheckCircle,
              label: 'Проверок выполнено',
              value: mockUser.reviewsCompleted,
              color: 'text-success',
              bgColor: 'bg-success/10',
            },
            {
              icon: Code2,
              label: 'Баланс проверок',
              value: mockUser.reviewBalance,
              color: 'text-primary',
              bgColor: 'bg-primary/10',
            },
            {
              icon: TrendingUp,
              label: 'Позиция в рейтинге',
              value: '#4',
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
                <LevelBadge level={mockUser.level} />
                {mockUser.level !== 'expert' && (
                  <span className="text-sm text-muted-foreground">
                    До уровня {progress.label}: {progress.next - mockUser.reviewsCompleted} проверок
                  </span>
                )}
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Прогресс</span>
                  <span className="font-medium">{Math.round(progressPercent)}%</span>
                </div>
                <Progress value={progressPercent} className="h-3" />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                {[
                  { level: 'Новичок', threshold: 0, icon: User },
                  { level: 'Ревьюер', threshold: 25, icon: Shield },
                  { level: 'Эксперт', threshold: 100, icon: Award },
                ].map((item, index) => (
                  <div
                    key={item.level}
                    className={`text-center p-3 rounded-lg ${
                      mockUser.reviewsCompleted >= item.threshold
                        ? 'bg-primary/10'
                        : 'bg-muted/50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mx-auto mb-2 ${
                      mockUser.reviewsCompleted >= item.threshold
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`} />
                    <div className={`text-xs font-medium ${
                      mockUser.reviewsCompleted >= item.threshold
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

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Достижения</h2>
              <span className="text-sm text-muted-foreground">
                {mockUser.badges.length} из 15
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {mockUser.badges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-4 rounded-xl bg-muted/50 text-center group hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                    {badge.icon}
                  </div>
                  <div className="text-sm font-medium mb-1">{badge.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {badge.description}
                  </div>
                </motion.div>
              ))}
              
              {/* Locked badges */}
              {Array.from({ length: 6 - mockUser.badges.length }).map((_, index) => (
                <div
                  key={`locked-${index}`}
                  className="p-4 rounded-xl bg-muted/30 text-center opacity-50"
                >
                  <div className="text-3xl mb-2">🔒</div>
                  <div className="text-sm font-medium mb-1">Заблокировано</div>
                  <div className="text-xs text-muted-foreground">
                    Продолжайте активность
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Activity History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 rounded-xl bg-card border border-border"
        >
          <h2 className="text-xl font-semibold mb-6">Недавняя активность</h2>
          
          <div className="space-y-4">
            {[
              { action: 'Проверили решение', task: 'Палиндром', time: '2 часа назад', type: 'review' },
              { action: 'Отправили решение', task: 'Сортировка массива', time: '5 часов назад', type: 'submit' },
              { action: 'Получили бейдж', task: 'Серия 7', time: '1 день назад', type: 'badge' },
              { action: 'Решение принято', task: 'CSS Flexbox Layout', time: '2 дня назад', type: 'accepted' },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activity.type === 'review' ? 'bg-primary/10 text-primary' :
                  activity.type === 'submit' ? 'bg-accent/10 text-accent' :
                  activity.type === 'badge' ? 'bg-warning/10 text-warning' :
                  'bg-success/10 text-success'
                }`}>
                  {activity.type === 'review' ? <CheckCircle className="w-5 h-5" /> :
                   activity.type === 'submit' ? <Code2 className="w-5 h-5" /> :
                   activity.type === 'badge' ? <Award className="w-5 h-5" /> :
                   <Star className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{activity.action}</div>
                  <div className="text-sm text-muted-foreground">{activity.task}</div>
                </div>
                <div className="text-sm text-muted-foreground">{activity.time}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
