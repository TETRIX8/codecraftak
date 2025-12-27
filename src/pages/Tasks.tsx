import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskCard } from '@/components/tasks/TaskCard';
import { mockTasks } from '@/data/mockData';
import { Difficulty, Language } from '@/types';

const difficulties: { value: Difficulty | 'all'; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const languages: { value: Language | 'all'; label: string }[] = [
  { value: 'all', label: 'Все языки' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
];

export default function Tasks() {
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<Language | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTasks = mockTasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || task.difficulty === selectedDifficulty;
    const matchesLanguage = selectedLanguage === 'all' || task.language === selectedLanguage;
    return matchesSearch && matchesDifficulty && matchesLanguage;
  });

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Задания</h1>
          <p className="text-muted-foreground text-lg">
            Выберите задание для решения. Чтобы отправить решение, необходимо сначала проверить чужое задание.
          </p>
        </motion.div>

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
                placeholder="Поиск заданий..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:w-auto"
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
              className="p-6 rounded-xl bg-card border border-border"
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

        {/* Results count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-sm text-muted-foreground">
            Найдено заданий: <span className="font-semibold text-foreground">{filteredTasks.length}</span>
          </p>
        </motion.div>

        {/* Tasks Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task, index) => (
            <TaskCard key={task.id} task={task} index={index} />
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Задания не найдены</h3>
            <p className="text-muted-foreground">
              Попробуйте изменить параметры поиска или фильтры
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
