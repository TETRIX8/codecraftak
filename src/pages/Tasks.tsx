import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Loader2, Clock, CheckCircle, XCircle, RefreshCw, Rocket, Sparkles } from 'lucide-react';
import { CosmicBackground } from '@/components/common/CosmicBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from '@/components/tasks/TaskCard';
import { useTasksWithSolutions, Task, TaskWithSolution } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

type Difficulty = 'easy' | 'medium' | 'hard' | 'all';
type Language = 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'all';

const difficulties: { value: Difficulty; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const languages: { value: Language; label: string }[] = [
  { value: 'all', label: 'Все языки' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
];

export default function Tasks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('available');

  const { data, isLoading, error } = useTasksWithSolutions();

  const filterTasks = <T extends Task>(tasks: T[]): T[] => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase());
      const matchesDifficulty = selectedDifficulty === 'all' || task.difficulty === selectedDifficulty;
      const matchesLanguage = selectedLanguage === 'all' || task.language === selectedLanguage;
      return matchesSearch && matchesDifficulty && matchesLanguage;
    });
  };

  const availableTasks = filterTasks(data?.available || []);
  const pendingTasks = filterTasks(data?.pending || []);
  const completedTasks = filterTasks(data?.completed || []);

  return (
    <div className="min-h-screen py-24 relative">
      <CosmicBackground />
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/30 backdrop-blur-md mb-5"
            style={{ background: 'linear-gradient(135deg, hsl(280 80% 60% / 0.15), hsl(200 90% 60% / 0.15))' }}
          >
            <Rocket className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary tracking-wider uppercase">Космические миссии</span>
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-black mb-4 bg-gradient-to-r from-purple-300 via-blue-300 to-pink-300 bg-clip-text text-transparent">
            Задания
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Выбери миссию и отправляйся в путешествие. Чтобы отправить решение — сначала проверь чужую работу.
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList
            className="grid w-full grid-cols-3 backdrop-blur-xl border border-white/10 p-1 h-auto"
            style={{ background: 'linear-gradient(135deg, hsl(240 40% 12% / 0.6), hsl(245 50% 8% / 0.6))' }}
          >
            <TabsTrigger value="available" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Доступные</span>
              {availableTasks.length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary border-primary/30">{availableTasks.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2 data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">В проверке</span>
              {pendingTasks.length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{pendingTasks.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Готово</span>
              {completedTasks.length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-green-500/20 text-green-400 border-green-500/30">{completedTasks.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Поиск миссий..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 backdrop-blur-xl border-white/10 bg-card/40"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:w-auto backdrop-blur-xl border-white/10 bg-card/40 hover:bg-primary/10 hover:border-primary/40"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Фильтры
            </Button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-6 rounded-2xl backdrop-blur-xl border border-white/10"
              style={{ background: 'linear-gradient(135deg, hsl(240 40% 12% / 0.6), hsl(245 50% 8% / 0.6))' }}
            >
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">
                    Сложность
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {difficulties.map((d) => (
                      <Button
                        key={d.value}
                        variant={selectedDifficulty === d.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedDifficulty(d.value)}
                      >
                        {d.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">
                    Язык программирования
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((l) => (
                      <Button
                        key={l.value}
                        variant={selectedLanguage === l.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedLanguage(l.value)}
                      >
                        {l.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <p className="text-destructive">Ошибка загрузки заданий</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <>
            {/* Available Tasks */}
            {activeTab === 'available' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key="available"
              >
                <p className="text-sm text-muted-foreground mb-6">
                  Доступно заданий: <span className="font-semibold text-foreground">{availableTasks.length}</span>
                </p>
                
                {!user && (
                  <Card className="mb-6 border-primary/50">
                    <CardContent className="py-4 text-center">
                      <p className="text-muted-foreground">
                        <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth')}>
                          Войдите
                        </Button>
                        {' '}чтобы отправлять решения
                      </p>
                    </CardContent>
                  </Card>
                )}

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableTasks.map((task, index) => (
                    <TaskCard key={task.id} task={task} index={index} />
                  ))}
                </div>

                {availableTasks.length === 0 && (
                  <EmptyState 
                    emoji="🎉" 
                    title="Все задания решены!" 
                    description="Вы молодец! Все задания отправлены на проверку или выполнены." 
                  />
                )}
              </motion.div>
            )}

            {/* Pending Tasks */}
            {activeTab === 'pending' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key="pending"
              >
                <p className="text-sm text-muted-foreground mb-6">
                  На проверке: <span className="font-semibold text-foreground">{pendingTasks.length}</span>
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingTasks.map((task, index) => (
                    <PendingTaskCard key={task.id} task={task} index={index} />
                  ))}
                </div>

                {pendingTasks.length === 0 && (
                  <EmptyState 
                    emoji="📝" 
                    title="Нет заданий на проверке" 
                    description="Отправьте решение на любое задание из раздела 'Доступные'" 
                  />
                )}
              </motion.div>
            )}

            {/* Completed Tasks */}
            {activeTab === 'completed' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key="completed"
              >
                <p className="text-sm text-muted-foreground mb-6">
                  Выполнено: <span className="font-semibold text-foreground">{completedTasks.length}</span>
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedTasks.map((task, index) => (
                    <CompletedTaskCard key={task.id} task={task} index={index} />
                  ))}
                </div>

                {completedTasks.length === 0 && (
                  <EmptyState 
                    emoji="📚" 
                    title="Нет выполненных заданий" 
                    description="Здесь появятся задания после проверки" 
                  />
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16"
    >
      <div className="text-6xl mb-4">{emoji}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}

function PendingTaskCard({ task, index }: { task: TaskWithSolution; index: number }) {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="h-full hover:border-yellow-500/50 transition-colors border-yellow-500/30">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
              <Clock className="h-3 w-3 mr-1" />
              На проверке
            </Badge>
            <Badge variant="secondary">{task.difficulty}</Badge>
          </div>
          
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{task.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{task.description}</p>
          
          <div className="flex items-center justify-between">
            <Badge variant="outline">{task.language}</Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/tasks/${task.id}`)}
            >
              Подробнее
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CompletedTaskCard({ task, index }: { task: TaskWithSolution; index: number }) {
  const navigate = useNavigate();
  const isAccepted = task.solution?.status === 'accepted';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`h-full transition-colors ${
        isAccepted 
          ? 'hover:border-green-500/50 border-green-500/30' 
          : 'hover:border-red-500/50 border-red-500/30'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            {isAccepted ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Принято
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
                <XCircle className="h-3 w-3 mr-1" />
                Отклонено
              </Badge>
            )}
            <Badge variant="secondary">{task.difficulty}</Badge>
          </div>
          
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{task.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{task.description}</p>
          
          <div className="flex items-center justify-between">
            <Badge variant="outline">{task.language}</Badge>
            {!isAccepted && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="text-orange-500 border-orange-500/50 hover:bg-orange-500/10"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Пересдать
              </Button>
            )}
            {isAccepted && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                Просмотр
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}