import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Ban, UserX, UserCheck, Loader2, ArrowLeft, Search, Clock,
  CheckCircle2, XCircle, FileCode2, Users, Activity, KeyRound, Edit3,
  AlertTriangle, Shield, ChevronDown, ChevronUp, BookOpen, Palette
} from 'lucide-react';
import { ModeratorTasks } from '@/components/moderator/ModeratorTasks';
import { ModeratorCMS } from '@/components/moderator/ModeratorCMS';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useIsModerator } from '@/hooks/useRoles';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function ModeratorPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isModerator, isLoading: roleLoading } = useIsModerator();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('solutions');
  const [search, setSearch] = useState('');
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserNickname, setSelectedUserNickname] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('24');
  const [nicknameDialogOpen, setNicknameDialogOpen] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [expandedSolution, setExpandedSolution] = useState<string | null>(null);

  // Fetch pending solutions
  const { data: pendingSolutions, isLoading: solutionsLoading } = useQuery({
    queryKey: ['mod-solutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select(`
          *,
          tasks:task_id(id, title, difficulty, language),
          profiles:user_id(id, nickname, avatar_url)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isModerator,
  });

  // Fetch all solutions for activity monitoring
  const { data: allSolutions } = useQuery({
    queryKey: ['mod-all-solutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select(`
          *,
          tasks:task_id(id, title, difficulty, language),
          profiles:user_id(id, nickname, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: isModerator,
  });

  // Fetch users
  const { data: users } = useQuery({
    queryKey: ['mod-users', search],
    queryFn: async () => {
      let q = supabase
        .from('profiles')
        .select('id, nickname, avatar_url, is_deleted, deleted_at, review_balance, trust_rating, reviews_completed, level, created_at, likes_received')
        .order('created_at', { ascending: false });
      if (search.trim()) q = q.ilike('nickname', `%${search}%`);
      const { data, error } = await q.limit(50);
      if (error) throw error;
      return data;
    },
    enabled: isModerator,
  });

  // Fetch active bans
  const { data: activeBans } = useQuery({
    queryKey: ['mod-active-bans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_bans')
        .select('*, profiles!user_bans_user_id_fkey(nickname, avatar_url)')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('banned_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isModerator,
  });

  // Ban user
  const banUser = useMutation({
    mutationFn: async () => {
      const hours = parseInt(banDuration);
      const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
      const { error } = await supabase.from('user_bans').insert({
        user_id: selectedUserId,
        banned_by: user!.id,
        reason: banReason,
        expires_at: expiresAt,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mod-active-bans'] });
      toast.success('Пользователь забанен');
      setBanDialogOpen(false);
      setBanReason('');
      setSelectedUserId('');
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Unban
  const unbanUser = useMutation({
    mutationFn: async (banId: string) => {
      const { error } = await supabase
        .from('user_bans')
        .update({ is_active: false, unbanned_at: new Date().toISOString(), unbanned_by: user!.id })
        .eq('id', banId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mod-active-bans'] });
      toast.success('Бан снят');
    },
  });

  // Soft delete account
  const softDelete = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: user!.id })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mod-users'] });
      toast.success('Аккаунт удалён');
    },
  });

  // Restore account
  const restoreUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_deleted: false, deleted_at: null, deleted_by: null })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mod-users'] });
      toast.success('Аккаунт восстановлен');
    },
  });

  // Change nickname
  const changeNickname = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ nickname: newNickname })
        .eq('id', selectedUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mod-users'] });
      toast.success('Ник изменён');
      setNicknameDialogOpen(false);
      setNewNickname('');
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Change password (via admin API - edge function would be needed, for now we use supabase auth admin)
  const changePassword = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      // Moderators can reset password by updating via admin - this requires edge function
      // For now, update the profile to flag password reset needed
      toast.info('Сброс пароля — отправьте запрос администратору');
      throw new Error('Требуются права администратора для сброса пароля. Обратитесь к админу.');
    },
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'hard': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return '';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">На проверке</Badge>;
      case 'accepted': return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Принято</Badge>;
      case 'rejected': return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Отклонено</Badge>;
      default: return null;
    }
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background py-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isModerator) {
    return (
      <div className="min-h-screen bg-background py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Доступ запрещён</h1>
        <p className="text-muted-foreground mb-6">У вас нет прав модератора.</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          На главную
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-violet-500/5 via-background to-fuchsia-500/5 p-8"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Панель Модератора
              </h1>
              <p className="text-muted-foreground mt-1">
                Проверка решений • Управление пользователями • Мониторинг активности
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-background/60 backdrop-blur border border-border">
              <div className="text-2xl font-bold text-violet-400">{pendingSolutions?.length ?? 0}</div>
              <div className="text-xs text-muted-foreground mt-1">На проверке</div>
            </div>
            <div className="p-4 rounded-xl bg-background/60 backdrop-blur border border-border">
              <div className="text-2xl font-bold text-fuchsia-400">{activeBans?.length ?? 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Активных банов</div>
            </div>
            <div className="p-4 rounded-xl bg-background/60 backdrop-blur border border-border">
              <div className="text-2xl font-bold text-emerald-400">{users?.filter(u => !u.is_deleted).length ?? 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Пользователей</div>
            </div>
            <div className="p-4 rounded-xl bg-background/60 backdrop-blur border border-border">
              <div className="text-2xl font-bold text-amber-400">{users?.filter(u => u.is_deleted).length ?? 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Удалённых</div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="solutions" className="flex items-center gap-2 py-3">
              <FileCode2 className="w-4 h-4" />
              <span className="hidden sm:inline">Решения</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2 py-3">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Активность</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 py-3">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Пользователи</span>
            </TabsTrigger>
            <TabsTrigger value="bans" className="flex items-center gap-2 py-3">
              <Ban className="w-4 h-4" />
              <span className="hidden sm:inline">Баны</span>
            </TabsTrigger>
          </TabsList>

          {/* Solutions Tab */}
          <TabsContent value="solutions" className="space-y-4">
            <Card className="border-violet-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode2 className="w-5 h-5 text-violet-400" />
                  Решения на проверке ({pendingSolutions?.length ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {solutionsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : pendingSolutions?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400/50" />
                    <p>Все решения проверены!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingSolutions?.map((sol: any, idx: number) => (
                      <motion.div
                        key={sol.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="rounded-xl border border-border bg-card overflow-hidden"
                      >
                        <div
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                          onClick={() => setExpandedSolution(expandedSolution === sol.id ? null : sol.id)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0">
                              <img
                                src={sol.profiles?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{sol.profiles?.nickname}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                {sol.tasks?.title}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant="outline" className={getDifficultyColor(sol.tasks?.difficulty)}>
                              {sol.tasks?.difficulty}
                            </Badge>
                            {getStatusBadge(sol.status)}
                            {expandedSolution === sol.id ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedSolution === sol.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 space-y-3">
                                <pre className="bg-secondary/50 rounded-lg p-4 overflow-x-auto text-sm font-mono max-h-[300px] overflow-y-auto border border-border">
                                  {sol.code}
                                </pre>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {format(new Date(sol.created_at), 'dd MMM yyyy HH:mm', { locale: ru })}
                                  <span className="mx-1">•</span>
                                  Голоса: ✅ {sol.accepted_votes} / ❌ {sol.rejected_votes}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
                                    onClick={() => navigate(`/tasks/${sol.task_id}`)}
                                  >
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Передать админу
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card className="border-fuchsia-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-fuchsia-400" />
                  Последняя активность
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allSolutions?.map((sol: any) => (
                    <div key={sol.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0">
                          <img
                            src={sol.profiles?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            <span className="text-foreground">{sol.profiles?.nickname}</span>
                            <span className="text-muted-foreground"> → </span>
                            <span className="text-foreground">{sol.tasks?.title}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(sol.created_at), 'dd MMM yyyy HH:mm', { locale: ru })}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(sol.status)}
                    </div>
                  ))}
                  {(!allSolutions || allSolutions.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">Нет активности</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="border-emerald-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  Управление пользователями
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по нику..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {users?.map((u, idx) => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                        u.is_deleted
                          ? 'bg-destructive/5 border-destructive/20 opacity-60'
                          : 'bg-card border-border hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
                          <img
                            src={u.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium flex items-center gap-2">
                            <span className="truncate">{u.nickname}</span>
                            {u.is_deleted && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">удалён</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                            <span>⭐ {u.trust_rating}</span>
                            <span>💰 {u.review_balance}</span>
                            <span>📝 {u.reviews_completed}</span>
                            <span>❤️ {u.likes_received}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                        {/* Change nickname */}
                        <Dialog
                          open={nicknameDialogOpen && selectedUserId === u.id}
                          onOpenChange={(o) => {
                            setNicknameDialogOpen(o);
                            if (o) { setSelectedUserId(u.id); setNewNickname(u.nickname); }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 px-2">
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Сменить ник — {u.nickname}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Input
                                value={newNickname}
                                onChange={e => setNewNickname(e.target.value)}
                                placeholder="Новый ник"
                              />
                              <Button
                                className="w-full"
                                onClick={() => changeNickname.mutate()}
                                disabled={!newNickname.trim() || changeNickname.isPending}
                              >
                                {changeNickname.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Сохранить
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Ban */}
                        {!u.is_deleted && (
                          <Dialog
                            open={banDialogOpen && selectedUserId === u.id}
                            onOpenChange={(o) => {
                              setBanDialogOpen(o);
                              if (o) { setSelectedUserId(u.id); setSelectedUserNickname(u.nickname); }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 px-2 text-destructive hover:text-destructive">
                                <Ban className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Забанить {u.nickname}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  placeholder="Причина бана..."
                                  value={banReason}
                                  onChange={e => setBanReason(e.target.value)}
                                />
                                <Select value={banDuration} onValueChange={setBanDuration}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">1 час</SelectItem>
                                    <SelectItem value="6">6 часов</SelectItem>
                                    <SelectItem value="24">1 день</SelectItem>
                                    <SelectItem value="72">3 дня</SelectItem>
                                    <SelectItem value="168">7 дней</SelectItem>
                                    <SelectItem value="720">30 дней</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="destructive"
                                  className="w-full"
                                  onClick={() => banUser.mutate()}
                                  disabled={!banReason.trim() || banUser.isPending}
                                >
                                  {banUser.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                  Забанить
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {/* Delete / Restore */}
                        {u.is_deleted ? (
                          <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => restoreUser.mutate(u.id)}>
                            <UserCheck className="w-3 h-3" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-destructive hover:text-destructive"
                            onClick={() => { if (confirm(`Удалить аккаунт ${u.nickname}?`)) softDelete.mutate(u.id); }}
                          >
                            <UserX className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bans Tab */}
          <TabsContent value="bans" className="space-y-4">
            <Card className="border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="w-5 h-5 text-red-400" />
                  Активные баны ({activeBans?.length ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeBans?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-3 text-emerald-400/50" />
                    <p>Нет активных банов</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeBans?.map((ban: any) => (
                      <motion.div
                        key={ban.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                            <Ban className="w-5 h-5 text-destructive" />
                          </div>
                          <div>
                            <div className="font-medium">{ban.profiles?.nickname || 'Unknown'}</div>
                            <p className="text-sm text-muted-foreground">{ban.reason}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                До {format(new Date(ban.expires_at), 'dd MMM yyyy HH:mm', { locale: ru })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => unbanUser.mutate(ban.id)}>
                          Разбанить
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
