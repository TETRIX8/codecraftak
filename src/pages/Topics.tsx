import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTopics, Topic } from '@/hooks/useTopics';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  Search, 
  Eye, 
  Calendar, 
  Code,
  Lightbulb,
  Puzzle,
  Zap,
  FileCode,
  Terminal
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { frontendCourse, courseStages } from '@/data/frontendCourse';
import { javascriptRoadmapCourse, javascriptRoadmapStages } from '@/data/javascriptRoadmapCourse';
import { javascript118Course, javascript118Stages } from '@/data/javascript118Course';

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

export default function Topics() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: topics, isLoading } = useTopics(selectedCategory);
  const navigate = useNavigate();

  const handleOpenTopic = (topic: Topic) => {
    navigate(`/topics/${topic.id}`);
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
        {/* Featured learning path */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card/70 to-purple-500/10 shadow-xl shadow-primary/5"
        >
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge className="gap-1"><Zap className="h-3 w-3" /> Полный маршрут</Badge>
                <Badge variant="outline">48 часов</Badge>
                <Badge variant="outline">24 занятия</Badge>
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl">{frontendCourse.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{frontendCourse.description} Каждая тема содержит аналогию, простое объяснение, код и практическое задание.</p>
              <div className="mt-4 flex flex-wrap gap-2">{courseStages.map(stage => <span key={stage.name} className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-muted-foreground">{stage.name} · {stage.hours} ч.</span>)}</div>
            </div>
            <Button size="lg" className="gap-2" onClick={() => navigate(`/courses/${frontendCourse.slug}`)}><BookOpen className="h-4 w-4" /> Открыть курс</Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-card/70 to-purple-500/10"
        >
          <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2"><Badge className="bg-yellow-500/15 text-yellow-300" variant="outline">JavaScript Roadmap</Badge><Badge variant="outline">{javascriptRoadmapCourse.totalHours} часов</Badge><Badge variant="outline">{javascriptRoadmapCourse.lessons.length} занятий</Badge></div>
              <h2 className="text-2xl font-bold sm:text-3xl">{javascriptRoadmapCourse.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{javascriptRoadmapCourse.description} Курс собран по прикреплённой дорожной карте и ведёт от массивов и объектов к DOM, API, модулям и реальным проектам.</p>
              <div className="mt-4 flex flex-wrap gap-2">{javascriptRoadmapStages.map(stage => <span key={stage.name} className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-muted-foreground">{stage.name} · {stage.hours} ч.</span>)}</div>
            </div>
            <Button size="lg" variant="outline" className="gap-2 border-yellow-500/40 hover:bg-yellow-500/10" onClick={() => navigate(`/courses/${javascriptRoadmapCourse.slug}`)}><FileCode className="h-4 w-4" /> Открыть JavaScript</Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/20 via-card/80 to-blue-500/10 shadow-xl shadow-primary/5"
        >
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2"><Badge className="gap-1"><Sparkles className="h-3 w-3" /> Полная программа</Badge><Badge variant="outline">{javascript118Course.totalHours} часов</Badge><Badge variant="outline">{javascript118Course.lessons.length} уроков</Badge></div>
              <h2 className="text-2xl font-bold sm:text-3xl">{javascript118Course.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{javascript118Course.description} Каждый урок посвящён одной цели и заканчивается практикой, вопросами и самостоятельным заданием.</p>
              <div className="mt-4 flex flex-wrap gap-2">{javascript118Stages.slice(0, 6).map(stage => <span key={stage.name} className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-muted-foreground">{stage.name} · {stage.hours} ч.</span>)}</div>
            </div>
            <Button size="lg" className="gap-2" onClick={() => navigate(`/courses/${javascript118Course.slug}`)}><BookOpen className="h-4 w-4" /> Открыть курс 118 часов</Button>
          </div>
        </motion.div>

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

    </div>
  );
}
