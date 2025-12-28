import { useState, useEffect } from 'react';
import { useTopics, useIncrementViews, Topic } from '@/hooks/useTopics';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MarkdownContent } from '@/components/common/MarkdownContent';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  BookOpen, 
  Search, 
  Eye, 
  Calendar, 
  User, 
  ArrowLeft,
  Code,
  Lightbulb,
  Puzzle,
  Zap,
  FileCode,
  Terminal
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { value: 'all', label: 'Все', icon: BookOpen, color: 'bg-primary/20 text-primary' },
  { value: 'javascript', label: 'JavaScript', icon: FileCode, color: 'bg-yellow-500/20 text-yellow-500' },
  { value: 'typescript', label: 'TypeScript', icon: Code, color: 'bg-blue-500/20 text-blue-500' },
  { value: 'python', label: 'Python', icon: Terminal, color: 'bg-green-500/20 text-green-500' },
  { value: 'algorithms', label: 'Алгоритмы', icon: Puzzle, color: 'bg-purple-500/20 text-purple-500' },
  { value: 'patterns', label: 'Паттерны', icon: Zap, color: 'bg-orange-500/20 text-orange-500' },
  { value: 'tips', label: 'Советы', icon: Lightbulb, color: 'bg-cyan-500/20 text-cyan-500' },
  { value: 'general', label: 'Общее', icon: BookOpen, color: 'bg-muted text-muted-foreground' },
];

function TopicCard({ topic, onClick }: { topic: Topic; onClick: () => void }) {
  const category = CATEGORIES.find(c => c.value === topic.category) || CATEGORIES[CATEGORIES.length - 1];
  const Icon = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="group cursor-pointer overflow-hidden border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full"
        onClick={onClick}
      >
        <CardContent className="p-4 sm:p-6 flex flex-col h-full">
          <div className="flex items-start justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div className={`p-2 sm:p-3 rounded-xl ${category.color} transition-transform group-hover:scale-110`}>
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">
              {category.label}
            </Badge>
          </div>
          
          <h3 className="text-base sm:text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {topic.title}
          </h3>
          
          {topic.description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3 sm:mb-4 flex-1">
              {topic.description}
            </p>
          )}
          
          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border/50 mt-auto">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              {topic.author && (
                <>
                  <Avatar className="h-5 w-5 sm:h-6 sm:w-6 shrink-0">
                    <AvatarImage src={topic.author.avatar_url || ''} />
                    <AvatarFallback className="text-[10px] sm:text-xs">
                      {topic.author.nickname.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[60px] sm:max-w-none">
                    {topic.author.nickname}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground shrink-0">
              <span className="flex items-center gap-0.5 sm:gap-1">
                <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {topic.views_count || 0}
              </span>
              <span className="flex items-center gap-0.5 sm:gap-1">
                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {new Date(topic.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TopicView({ topic, onClose, viewsCount }: { topic: Topic; onClose: () => void; viewsCount: number }) {
  const category = CATEGORIES.find(c => c.value === topic.category) || CATEGORIES[CATEGORIES.length - 1];
  const Icon = category.icon;

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 w-[95vw] sm:w-auto">
      <div className={`p-4 sm:p-6 border-b border-border/50 bg-gradient-to-r ${category.color.replace('text-', 'from-').replace('/20', '/10')} to-transparent`}>
        <Button variant="ghost" size="sm" onClick={onClose} className="mb-3 sm:mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Назад к темам</span>
          <span className="sm:hidden">Назад</span>
        </Button>
        <div className="flex items-start gap-3 sm:gap-4">
          <div className={`p-3 sm:p-4 rounded-xl ${category.color} shrink-0`}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <Badge variant="outline" className="mb-2 text-[10px] sm:text-xs">
              {category.label}
            </Badge>
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-2xl font-bold leading-tight">{topic.title}</DialogTitle>
            </DialogHeader>
            {topic.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2 sm:line-clamp-none">{topic.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
              {topic.author && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <Avatar className="h-4 w-4 sm:h-5 sm:w-5">
                    <AvatarImage src={topic.author.avatar_url || ''} />
                    <AvatarFallback className="text-[8px] sm:text-xs">
                      {topic.author.nickname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-[80px] sm:max-w-none">{topic.author.nickname}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {viewsCount} просм.
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {new Date(topic.created_at).toLocaleDateString('ru-RU', { 
                  day: 'numeric', 
                  month: 'short'
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ScrollArea className="max-h-[55vh] sm:max-h-[60vh]">
        <div className="p-4 sm:p-6">
          <MarkdownContent content={topic.content} />
        </div>
      </ScrollArea>
    </DialogContent>
  );
}

export default function Topics() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [currentViewsCount, setCurrentViewsCount] = useState(0);
  const { data: topics, isLoading } = useTopics(selectedCategory);
  const incrementViews = useIncrementViews();

  const handleOpenTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setCurrentViewsCount((topic.views_count || 0) + 1);
    incrementViews.mutate(topic.id);
  };

  const filteredTopics = topics?.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-8 sm:py-16 mb-4 sm:mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.1),transparent_50%)]" />
        
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary mb-4 sm:mb-6">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">База знаний</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Учебные материалы
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground px-4">
              Изучайте программирование с нашими подробными руководствами
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 pb-8 sm:pb-16">
        {/* Search and Filters */}
        <div className="mb-4 sm:mb-8 space-y-4 sm:space-y-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по темам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 backdrop-blur border-border/50"
            />
          </div>
          
          <ScrollArea className="w-full">
            <div className="flex justify-start sm:justify-center gap-2 pb-2 px-1">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.value;
                return (
                  <Button
                    key={category.value}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                    className={`gap-1.5 sm:gap-2 transition-all shrink-0 text-xs sm:text-sm ${isActive ? '' : 'bg-background/50 hover:bg-background'}`}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">{category.label}</span>
                    <span className="xs:hidden">{category.label.slice(0, 3)}</span>
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Topics Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-[200px] sm:h-[240px] animate-pulse bg-muted/30" />
            ))}
          </div>
        ) : filteredTopics.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 sm:py-16"
          >
            <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground/30 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Темы не найдены</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Скоро здесь появятся новые материалы'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            <AnimatePresence>
              {filteredTopics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TopicCard topic={topic} onClick={() => handleOpenTopic(topic)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Topic View Dialog */}
      <Dialog open={!!selectedTopic} onOpenChange={(open) => !open && setSelectedTopic(null)}>
        {selectedTopic && (
          <TopicView topic={selectedTopic} onClose={() => setSelectedTopic(null)} viewsCount={currentViewsCount} />
        )}
      </Dialog>
    </div>
  );
}
