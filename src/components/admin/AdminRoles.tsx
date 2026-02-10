import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Plus, Trash2, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AppRole } from '@/hooks/useRoles';

const roleLabels: Record<string, string> = {
  admin: 'Админ',
  moderator: 'Модератор',
  anticheat: 'Античитер',
  starosta: 'Староста',
  user: 'Пользователь',
};

const roleColors: Record<string, string> = {
  admin: 'bg-destructive text-destructive-foreground',
  moderator: 'bg-warning text-warning-foreground',
  anticheat: 'bg-primary text-primary-foreground',
  starosta: 'bg-accent text-accent-foreground',
  user: 'bg-secondary text-secondary-foreground',
};

const assignableRoles: AppRole[] = ['anticheat', 'starosta', 'moderator'];

export function AdminRoles() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('anticheat');

  const { data: users } = useQuery({
    queryKey: ['all-users-for-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url')
        .order('nickname');
      if (error) throw error;
      return data;
    },
  });

  const { data: allRoles, isLoading } = useQuery({
    queryKey: ['all-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id, user_id, role, created_at');
      if (error) throw error;

      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) ?? []);
      return data.map(r => ({
        ...r,
        profile: profileMap.get(r.user_id),
      }));
    },
  });

  const addRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase.from('user_roles').insert({
        user_id: userId,
        role,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-user-roles'] });
      toast.success('Роль назначена');
      setSelectedUser('');
    },
    onError: (e: any) => toast.error(e.message || 'Ошибка'),
  });

  const removeRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('user_roles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-user-roles'] });
      toast.success('Роль удалена');
    },
    onError: (e: any) => toast.error(e.message || 'Ошибка'),
  });

  const filteredRoles = allRoles?.filter(r =>
    !search || r.profile?.nickname?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = users?.filter(u =>
    u.nickname?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Управление ролями
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add role */}
        <div className="flex flex-wrap gap-2">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Выберите пользователя" />
            </SelectTrigger>
            <SelectContent>
              {filteredUsers?.map(u => (
                <SelectItem key={u.id} value={u.id}>{u.nickname}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assignableRoles.map(r => (
                <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="gradient"
            onClick={() => selectedUser && addRole.mutate({ userId: selectedUser, role: selectedRole })}
            disabled={!selectedUser || addRole.isPending}
          >
            {addRole.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
            Назначить
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по нику..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Roles list */}
        {isLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-2">
            {filteredRoles?.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-border">
                    <img
                      src={r.profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-medium">{r.profile?.nickname || 'Unknown'}</span>
                  <Badge className={roleColors[r.role] || 'bg-secondary'}>
                    {roleLabels[r.role] || r.role}
                  </Badge>
                </div>
                {r.role !== 'admin' && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeRole.mutate(r.id)}
                    disabled={removeRole.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            {filteredRoles?.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Ролей не найдено</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
