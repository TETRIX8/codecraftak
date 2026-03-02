import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2, UserCheck, UserX, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function AdminUserApprovals() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: pendingUsers, isLoading } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, created_at, is_approved')
        .eq('is_approved', false)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const approveUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      toast.success('Пользователь одобрен');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при одобрении');
    },
  });

  const rejectUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      toast.success('Заявка отклонена');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка');
    },
  });

  const filtered = pendingUsers?.filter(u =>
    u.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-warning" />
          <h3 className="font-semibold text-lg">Ожидают одобрения</h3>
          {pendingUsers && pendingUsers.length > 0 && (
            <Badge className="bg-warning/20 text-warning border-warning/30">
              {pendingUsers.length}
            </Badge>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по никнейму..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filtered.map(user => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback>{user.nickname?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.nickname}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(user.created_at!).toLocaleString('ru')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => rejectUser.mutate(user.id)}
                  disabled={rejectUser.isPending}
                >
                  <UserX className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="gradient"
                  onClick={() => approveUser.mutate(user.id)}
                  disabled={approveUser.isPending}
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  Одобрить
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>Нет заявок на одобрение</p>
        </div>
      )}
    </div>
  );
}
