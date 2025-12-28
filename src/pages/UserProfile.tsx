import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageSquare, 
  Star, 
  CheckCircle, 
  Award,
  ArrowLeft,
  Loader2,
  Code2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LevelBadge, DifficultyBadge, LanguageBadge } from '@/components/common/Badges';
import { useUserProfile, useUserSolutionsPublic } from '@/hooks/useUsers';
import { useProfileLikes, useToggleLike } from '@/hooks/useLikes';
import { useCreatePrivateChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading } = useUserProfile(id!);
  const { data: solutions } = useUserSolutionsPublic(id!);
  const { data: likesData } = useProfileLikes(id);
  const toggleLike = useToggleLike();
  const createChat = useCreatePrivateChat();

  const handleLike = async () => {
    if (!user) {
      toast.error('Войдите, чтобы ставить лайки');
      return;
    }
    if (id === user.id) {
      toast.error('Нельзя лайкнуть себя');
      return;
    }
    try {
      await toggleLike.mutateAsync({ userId: id!, isLiked: likesData?.isLiked || false });
      toast.success(likesData?.isLiked ? 'Лайк убран' : 'Лайк поставлен!');
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const handleMessage = async () => {
    if (!user) {
      toast.error('Войдите, чтобы написать');
      return;
    }
    try {
      const chat = await createChat.mutateAsync(id!);
      navigate(`/messages?chat=${chat.id}`);
    } catch (error) {
      toast.error('Ошибка создания чата');
    }
  };

  if (isLoading) {
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
          <p className="text-muted-foreground">Пользователь не найден</p>
          <Link to="/users">
            <Button variant="link" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к списку
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link to="/users">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </Link>

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
                    src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`}
                    alt={profile.nickname}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{profile.nickname}</h1>
                  {profile.level && <LevelBadge level={profile.level} />}
                </div>
                <p className="text-muted-foreground mb-4">
                  Участник с {profile.created_at ? new Date(profile.created_at).toLocaleDateString('ru-RU', { 
                    month: 'long', 
                    year: 'numeric' 
                  }) : 'недавно'}
                </p>
              </div>

              {/* Actions */}
              {user && user.id !== id && (
                <div className="flex gap-3">
                  <Button
                    variant={likesData?.isLiked ? "destructive" : "outline"}
                    onClick={handleLike}
                    disabled={toggleLike.isPending}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${likesData?.isLiked ? 'fill-current' : ''}`} />
                    {likesData?.count || 0}
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={handleMessage}
                    disabled={createChat.isPending}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Написать
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              icon: Heart,
              label: 'Получено лайков',
              value: likesData?.count || 0,
              color: 'text-destructive',
              bgColor: 'bg-destructive/10',
            },
            {
              icon: Star,
              label: 'Рейтинг доверия',
              value: `${profile.trust_rating || 0}%`,
              color: 'text-warning',
              bgColor: 'bg-warning/10',
            },
            {
              icon: CheckCircle,
              label: 'Проверок выполнено',
              value: profile.reviews_completed || 0,
              color: 'text-success',
              bgColor: 'bg-success/10',
            },
            {
              icon: Code2,
              label: 'Решений принято',
              value: solutions?.length || 0,
              color: 'text-primary',
              bgColor: 'bg-primary/10',
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

        {/* Accepted Solutions */}
        {solutions && solutions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Выполненные задания
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {solutions.map((solution: any, index: number) => (
                <motion.div
                  key={solution.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium">{solution.tasks?.title || 'Задание'}</h3>
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex items-center gap-2">
                    {solution.tasks?.difficulty && (
                      <DifficultyBadge difficulty={solution.tasks.difficulty} />
                    )}
                    {solution.tasks?.language && (
                      <LanguageBadge language={solution.tasks.language} />
                    )}
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {new Date(solution.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
