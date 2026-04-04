import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { 
  Plus, Edit2, Trash2, Loader2, ArrowLeft, Shield, Users, Bell, 
  BookOpen, Star, Image, Code2, Scale, UserCheck, LayoutDashboard,
  ListTodo, ChevronRight, UserX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DifficultyBadge, LanguageBadge } from '@/components/common/Badges';
import { useTasks, Task } from '@/hooks/useTasks';
import { useIsAdmin } from '@/hooks/useRoles';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminNotifications } from '@/components/admin/AdminNotifications';
import { AdminTopics } from '@/components/admin/AdminTopics';
import { AdminUserRatings } from '@/components/admin/AdminUserRatings';
import { AdminSolutions } from '@/components/admin/AdminSolutions';
import { AdminAppeals } from '@/components/admin/AdminAppeals';
import { AdminAvatarPermissions } from '@/components/admin/AdminAvatarPermissions';
import { AdminRoles } from '@/components/admin/AdminRoles';
import { AdminUserApprovals } from '@/components/admin/AdminUserApprovals';

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
  const [activeTab, setActiveTab] = useState('overview');

  // Stats queries
  const { data: pendingCount } = useQuery({
    queryKey: ['admin-pending-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false)
        .eq('is_deleted', false);
      return count || 0;
    },
  });

  const { data: totalUsers } = useQuery({
    queryKey: ['admin-total-users'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false);
      return count || 0;
    },
  });

  const { data: pendingSolutions } = useQuery({
    queryKey: ['admin-pending-solutions'],
    queryFn: async () => {
      const { count } = await supabase
        .from('solutions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      return count || 0;
    },
  });

  const { data: pendingAppeals } = useQuery({
    queryKey: ['admin-pending-appeals'],
    queryFn: async () => {
      const { count } = await supabase
        .from('appeals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      return count || 0;
    },
  });

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

  const statCards = [
    { 
      label: 'Ожидают одобрения', 
      value: pendingCount || 0, 
      icon: UserCheck, 
      color: 'text-warning',
      bg: 'bg-warning/10',
      tab: 'approvals'
    },
    { 
      label: 'Всего пользователей', 
      value: totalUsers || 0, 
      icon: Users, 
      color: 'text-primary',
      bg: 'bg-primary/10',
      tab: 'users'
    },
    { 
      label: 'Решения на проверке', 
      value: pendingSolutions || 0, 
      icon: Code2, 
      color: 'text-accent',
      bg: 'bg-accent/10',
      tab: 'solutions'
    },
    { 
      label: 'Активные апелляции', 
      value: pendingAppeals || 0, 
      icon: Scale, 
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      tab: 'appeals'
    },
  ];

  const tabs = [
    { value: 'overview', label: 'Обзор', icon: LayoutDashboard },
    { value: 'approvals', label: 'Заявки', icon: UserCheck, badge: pendingCount },
    { value: 'tasks', label: 'Задания', icon: ListTodo },
    { value: 'solutions', label: 'Решения', icon: Code2 },
    { value: 'users', label: 'Пользователи', icon: Users },
    { value: 'roles', label: 'Роли', icon: Shield },
    { value: 'appeals', label: 'Апелляции', icon: Scale },
    { value: 'topics', label: 'Темы', icon: BookOpen },
    { value: 'avatars', label: 'Аватары', icon: Image },
    { value: 'notifications', label: 'Рассылка', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Панель администратора</h1>
              <p className="text-sm text-muted-foreground">Управление платформой</p>
            </div>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="w-full h-auto flex flex-wrap gap-1 bg-card border border-border p-1.5 rounded-xl">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-warning text-warning-foreground">
                    {tab.badge}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer hover:border-primary/50 transition-all group"
                    onClick={() => setActiveTab(stat.tab)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-warning" />
                    Последние заявки
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AdminUserApprovals />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-primary" />
                    Задания ({tasks?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {tasks?.slice(0, 5).map(task => (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <DifficultyBadge difficulty={task.difficulty} />
                          <span className="text-sm truncate">{task.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{task.completions} решений</span>
                      </div>
                    ))}
                    {(!tasks || tasks.length === 0) && (
                      <p className="text-center text-muted-foreground py-4 text-sm">Заданий пока нет</p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-3" 
                    size="sm"
                    onClick={() => setActiveTab('tasks')}
                  >
                    Все задания
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-warning" />
                  Одобрение новых пользователей
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdminUserApprovals />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold">Управление заданиями</h2>
                <p className="text-sm text-muted-foreground">Создание и редактирование заданий</p>
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
                      <label className="text-sm font-medium mb-2 block">Описание (Markdown)</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="# Заголовок&#10;&#10;Описание задания..."
                        rows={12}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Сложность</label>
                        <Select
                          value={formData.difficulty}
                          onValueChange={(value: Difficulty) => setFormData(prev => ({ ...prev, difficulty: value }))}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
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
                          onValueChange={(value: Language) => setFormData(prev => ({ ...prev, language: value }))}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {languages.map(l => (
                              <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={closeDialog}>Отмена</Button>
                      <Button type="submit" variant="gradient" disabled={createTask.isPending || updateTask.isPending}>
                        {(createTask.isPending || updateTask.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {editingTask ? 'Сохранить' : 'Создать'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {tasksLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-3">
                {tasks?.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="hover:border-primary/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-2 mb-2">
                              <DifficultyBadge difficulty={task.difficulty} />
                              <LanguageBadge language={task.language} />
                            </div>
                            <h3 className="font-semibold">{task.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{task.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">Выполнений: {task.completions}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button variant="outline" size="icon" onClick={() => openEdit(task)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => { if (confirm('Удалить задание?')) deleteTask.mutate(task.id); }}
                              disabled={deleteTask.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {tasks?.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">Заданий пока нет. Создайте первое!</div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Solutions Tab */}
          <TabsContent value="solutions">
            <AdminSolutions />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <AdminUserRatings />
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <AdminRoles />
          </TabsContent>

          {/* Appeals Tab */}
          <TabsContent value="appeals">
            <AdminAppeals />
          </TabsContent>

          {/* Topics Tab */}
          <TabsContent value="topics">
            <AdminTopics />
          </TabsContent>

          {/* Avatars Tab */}
          <TabsContent value="avatars">
            <AdminAvatarPermissions />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <AdminNotifications />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
