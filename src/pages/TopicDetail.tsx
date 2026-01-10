import { useParams, useNavigate } from 'react-router-dom';
import { useTopic } from '@/hooks/useTopics';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarkdownContent } from '@/components/common/MarkdownContent';
import { 
  BookOpen, 
  Eye, 
  Calendar, 
  User, 
  ArrowLeft,
  Code,
  Lightbulb,
  Puzzle,
  Zap,
  FileCode,
  Terminal,
  Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { value: 'all', label: 'Все', icon: BookOpen, color: 'bg-primary/20 text-primary', gradient: 'from-primary/10' },
  { value: 'javascript', label: 'JavaScript', icon: FileCode, color: 'bg-yellow-500/20 text-yellow-500', gradient: 'from-yellow-500/10' },
  { value: 'typescript', label: 'TypeScript', icon: Code, color: 'bg-blue-500/20 text-blue-500', gradient: 'from-blue-500/10' },
  { value: 'python', label: 'Python', icon: Terminal, color: 'bg-green-500/20 text-green-500', gradient: 'from-green-500/10' },
  { value: 'algorithms', label: 'Алгоритмы', icon: Puzzle, color: 'bg-purple-500/20 text-purple-500', gradient: 'from-purple-500/10' },
  { value: 'patterns', label: 'Паттерны', icon: Zap, color: 'bg-orange-500/20 text-orange-500', gradient: 'from-orange-500/10' },
  { value: 'tips', label: 'Советы', icon: Lightbulb, color: 'bg-cyan-500/20 text-cyan-500', gradient: 'from-cyan-500/10' },
  { value: 'general', label: 'Общее', icon: BookOpen, color: 'bg-muted text-muted-foreground', gradient: 'from-muted/50' },
];

export default function TopicDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: topic, isLoading, error } = useTopic(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Загрузка темы...</p>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Тема не найдена</h2>
          <p className="text-muted-foreground mb-6">Возможно, она была удалена или не существует</p>
          <Button onClick={() => navigate('/topics')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            К списку тем
          </Button>
        </div>
      </div>
    );
  }

  const category = CATEGORIES.find(c => c.value === topic.category) || CATEGORIES[CATEGORIES.length - 1];
  const Icon = category.icon;

  return (
    <div className="min-h-screen pb-8 sm:pb-16">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`relative overflow-hidden bg-gradient-to-br ${category.gradient} via-transparent to-transparent`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        
        <div className="relative container mx-auto px-4 py-6 sm:py-10">
          {/* Back button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/topics')}
            className="mb-4 sm:mb-6 -ml-2 hover:bg-background/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Назад к темам</span>
            <span className="sm:hidden">Назад</span>
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            {/* Icon */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`p-4 sm:p-5 rounded-2xl ${category.color} shrink-0 self-start`}
            >
              <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
            </motion.div>

            {/* Title and meta */}
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <Badge variant="outline" className="mb-3 text-xs">
                  {category.label}
                </Badge>
              </motion.div>

              <motion.h1 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-tight"
              >
                {topic.title}
              </motion.h1>

              {topic.description && (
                <motion.p 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-sm sm:text-base text-muted-foreground mb-4"
                >
                  {topic.description}
                </motion.p>
              )}

              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground"
              >
                {topic.author && (
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                      <AvatarImage src={topic.author.avatar_url || ''} />
                      <AvatarFallback className="text-[10px] sm:text-xs">
                        {topic.author.nickname.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{topic.author.nickname}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{topic.views_count || 0} просм.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>
                    {new Date(topic.created_at).toLocaleDateString('ru-RU', { 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="container mx-auto px-4 py-6 sm:py-10"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-card/50 backdrop-blur rounded-2xl border border-border/50 p-4 sm:p-6 md:p-8">
            <MarkdownContent content={topic.content} />
          </div>
        </div>
      </motion.div>

      {/* Bottom navigation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="container mx-auto px-4 mt-6"
      >
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate('/topics')}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться к списку тем
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
