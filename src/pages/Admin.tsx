import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DifficultyBadge, LanguageBadge } from '@/components/common/Badges';
import { useTasks, Task } from '@/hooks/useTasks';
import { useIsAdmin } from '@/hooks/useRoles';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminNotifications } from '@/components/admin/AdminNotifications';

type Difficulty = 'easy' | 'medium' | 'hard';
type Language = 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'java' | 'cpp';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
const languages: Language[] = ['javascript', 'typescript', 'python', 'html', 'css', 'java', 'cpp'];

interface TaskFormData {
  title: string;
  description: string;
  difficulty: Difficulty;
  language: Language;
}

const emptyForm: TaskFormData = {
  title: '',
  description: '',
  difficulty: 'easy',
  language: 'javascript',
};

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const queryClient = useQueryClient();
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>(emptyForm);

  const createTask = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const { error } = await supabase.from('tasks').insert({
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        language: data.language,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Задание создано');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при создании задания');
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TaskFormData }) => {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: data.title,
          description: data.description,
          difficulty: data.difficulty,
          language: data.language,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Задание обновлено');
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при обновлении задания');
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Задание удалено');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при удалении задания');
    },
  });

  const closeDialog = () => {
    setIsOpen(false);
    setEditingTask(null);
    setFormData(emptyForm);
  };

  const openCreate = () => {
    setEditingTask(null);
    setFormData(emptyForm);
    setIsOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      difficulty: task.difficulty,
      language: task.language,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Заполните все поля');
      return;
    }
    if (editingTask) {
      updateTask.mutate({ id: editingTask.id, data: formData });
    } else {
      createTask.mutate(formData);
    }
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background py-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Доступ запрещён</h1>
          <p className="text-muted-foreground mb-6">У вас нет прав для доступа к этой странице.</p>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            На главную
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4">
        {/* Notifications Section */}
        <div className="mb-8">
          <AdminNotifications />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Управление заданиями</h1>
              <p className="text-muted-foreground">Создание и редактирование заданий</p>
            </div>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient" onClick={openCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Новое задание
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingTask ? 'Редактировать задание' : 'Создать задание'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Название</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Название задания"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Описание (поддерживается Markdown)
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="# Заголовок&#10;&#10;Описание задания с **жирным** и *курсивом*..."
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Сложность</label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value: Difficulty) => 
                          setFormData(prev => ({ ...prev, difficulty: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map(d => (
                            <SelectItem key={d} value={d}>
                              {d === 'easy' ? 'Легко' : d === 'medium' ? 'Средне' : 'Сложно'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Язык</label>
                      <Select
                        value={formData.language}
                        onValueChange={(value: Language) => 
                          setFormData(prev => ({ ...prev, language: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map(l => (
                            <SelectItem key={l} value={l}>
                              {l.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={closeDialog}>
                      Отмена
                    </Button>
                    <Button 
                      type="submit" 
                      variant="gradient"
                      disabled={createTask.isPending || updateTask.isPending}
                    >
                      {(createTask.isPending || updateTask.isPending) && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {editingTask ? 'Сохранить' : 'Создать'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {tasksLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks?.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <DifficultyBadge difficulty={task.difficulty} />
                          <LanguageBadge language={task.language} />
                        </div>
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEdit(task)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            if (confirm('Удалить задание?')) {
                              deleteTask.mutate(task.id);
                            }
                          }}
                          disabled={deleteTask.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Выполнений: {task.completions}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {tasks?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Заданий пока нет. Создайте первое!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
