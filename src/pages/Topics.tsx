import { useState } from 'react';
import { useTopics, Topic } from '@/hooks/useTopics';
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
        className="group cursor-pointer overflow-hidden border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className={`p-3 rounded-xl ${category.color} transition-transform group-hover:scale-110`}>
              <Icon className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-xs">
              {category.label}
            </Badge>
          </div>
          
          <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {topic.title}
          </h3>
          
          {topic.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {topic.description}
            </p>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              {topic.author && (
                <>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={topic.author.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {topic.author.nickname.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{topic.author.nickname}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {topic.views_count}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(topic.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TopicView({ topic, onClose }: { topic: Topic; onClose: () => void }) {
  const category = CATEGORIES.find(c => c.value === topic.category) || CATEGORIES[CATEGORIES.length - 1];
  const Icon = category.icon;

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
      <div className={`p-6 border-b border-border/50 bg-gradient-to-r ${category.color.replace('text-', 'from-').replace('/20', '/10')} to-transparent`}>
        <Button variant="ghost" size="sm" onClick={onClose} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к темам
        </Button>
        <div className="flex items-start gap-4">
          <div className={`p-4 rounded-xl ${category.color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <Badge variant="outline" className="mb-2">
              {category.label}
            </Badge>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{topic.title}</DialogTitle>
            </DialogHeader>
            {topic.description && (
              <p className="text-muted-foreground mt-2">{topic.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              {topic.author && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={topic.author.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {topic.author.nickname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{topic.author.nickname}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {topic.views_count} просмотров
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(topic.created_at).toLocaleDateString('ru-RU', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ScrollArea className="max-h-[60vh]">
        <div className="p-6">
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
  const { data: topics, isLoading } = useTopics(selectedCategory);

  const filteredTopics = topics?.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-16 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.1),transparent_50%)]" />
        
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">База знаний</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Учебные материалы
            </h1>
            <p className="text-lg text-muted-foreground">
              Изучайте программирование с нашими подробными руководствами и статьями
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по темам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 backdrop-blur border-border/50"
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.value;
              return (
                <Button
                  key={category.value}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className={`gap-2 transition-all ${isActive ? '' : 'bg-background/50 hover:bg-background'}`}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Topics Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-[240px] animate-pulse bg-muted/30" />
            ))}
          </div>
        ) : filteredTopics.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Темы не найдены</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Скоро здесь появятся новые материалы'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredTopics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TopicCard topic={topic} onClick={() => setSelectedTopic(topic)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Topic View Dialog */}
      <Dialog open={!!selectedTopic} onOpenChange={(open) => !open && setSelectedTopic(null)}>
        {selectedTopic && (
          <TopicView topic={selectedTopic} onClose={() => setSelectedTopic(null)} />
        )}
      </Dialog>
    </div>
  );
}
