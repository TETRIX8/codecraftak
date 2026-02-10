import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Ban, UserX, UserCheck, Loader2, ArrowLeft, Search, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useIsAnticheat } from '@/hooks/useRoles';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function AnticheatPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAnticheat, isLoading: roleLoading } = useIsAnticheat();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('24');

  const { data: users } = useQuery({
    queryKey: ['anticheat-users', search],
    queryFn: async () => {
      let q = supabase
        .from('profiles')
        .select('id, nickname, avatar_url, is_deleted, deleted_at, review_balance, trust_rating')
        .order('nickname');
      if (search.trim()) q = q.ilike('nickname', `%${search}%`);
      const { data, error } = await q.limit(50);
      if (error) throw error;
      return data;
    },
    enabled: isAnticheat,
  });

  const { data: activeBans } = useQuery({
    queryKey: ['active-bans'],
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
    enabled: isAnticheat,
  });

  const { data: deletedUsers } = useQuery({
    queryKey: ['deleted-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, deleted_at')
        .eq('is_deleted', true)
        .order('deleted_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAnticheat,
  });

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
      queryClient.invalidateQueries({ queryKey: ['active-bans'] });
      toast.success('Пользователь забанен');
      setBanDialogOpen(false);
      setBanReason('');
      setSelectedUserId('');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const unbanUser = useMutation({
    mutationFn: async (banId: string) => {
      const { error } = await supabase
        .from('user_bans')
        .update({ is_active: false, unbanned_at: new Date().toISOString(), unbanned_by: user!.id })
        .eq('id', banId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-bans'] });
      toast.success('Бан снят');
    },
  });

  const softDelete = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: user!.id })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anticheat-users'] });
      queryClient.invalidateQueries({ queryKey: ['deleted-users'] });
      toast.success('Аккаунт удалён (мягко)');
    },
  });

  const restoreUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_deleted: false, deleted_at: null, deleted_by: null })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anticheat-users'] });
      queryClient.invalidateQueries({ queryKey: ['deleted-users'] });
      toast.success('Аккаунт восстановлен');
    },
  });

  if (roleLoading) {
    return <div className="min-h-screen bg-background py-24 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!isAnticheat) {
    return (
      <div className="min-h-screen bg-background py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Доступ запрещён</h1>
        <Button variant="outline" onClick={() => navigate('/')}><ArrowLeft className="w-4 h-4 mr-2" />На главную</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Панель Античитера</h1>
            <p className="text-muted-foreground">Баны, удаление и восстановление аккаунтов</p>
          </div>
        </div>

        {/* Active Bans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-destructive" />
              Активные баны ({activeBans?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeBans?.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Нет активных банов</p>
            ) : (
              <div className="space-y-2">
                {activeBans?.map(ban => (
                  <div key={ban.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div>
                      <span className="font-medium">{(ban as any).profiles?.nickname || 'Unknown'}</span>
                      <p className="text-sm text-muted-foreground">{ban.reason}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          До {format(new Date(ban.expires_at), 'dd MMM yyyy HH:mm', { locale: ru })}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => unbanUser.mutate(ban.id)}>
                      Разбанить
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users search + ban */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Пользователи
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Поиск по нику..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {users?.filter(u => !u.is_deleted).map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-border">
                      <img src={u.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="font-medium">{u.nickname}</span>
                      <p className="text-xs text-muted-foreground">Баланс: {u.review_balance} | Рейтинг: {u.trust_rating}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={banDialogOpen && selectedUserId === u.id} onOpenChange={(o) => { setBanDialogOpen(o); if (o) setSelectedUserId(u.id); }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Ban className="w-3 h-3 mr-1" />Бан
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { if (confirm(`Удалить аккаунт ${u.nickname}?`)) softDelete.mutate(u.id); }}
                    >
                      <UserX className="w-3 h-3 mr-1" />Удалить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Deleted users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-warning" />
              Удалённые аккаунты ({deletedUsers?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deletedUsers?.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Нет удалённых аккаунтов</p>
            ) : (
              <div className="space-y-2">
                {deletedUsers?.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <div>
                      <span className="font-medium">{u.nickname}</span>
                      {u.deleted_at && (
                        <p className="text-xs text-muted-foreground">
                          Удалён {format(new Date(u.deleted_at), 'dd MMM yyyy', { locale: ru })}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => restoreUser.mutate(u.id)}>
                      <UserCheck className="w-3 h-3 mr-1" />Восстановить
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
