import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2, Trash2, AlertTriangle, UserX, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface UserData {
  id: string;
  nickname: string;
  avatar_url: string | null;
  created_at: string | null;
  reviews_completed: number | null;
  review_balance: number | null;
  trust_rating: number | null;
  likes_received: number | null;
  is_deleted: boolean | null;
  is_approved: boolean | null;
}

interface UserRelatedCounts {
  solutions: number;
  reviews: number;
  messages: number;
  badges: number;
  games: number;
  topics: number;
  appeals: number;
  transactions: number;
}

export function AdminHardDelete() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [confirmNickname, setConfirmNickname] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-all-users-delete'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, created_at, reviews_completed, review_balance, trust_rating, likes_received, is_deleted, is_approved')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as UserData[];
    },
  });

  const { data: relatedCounts, isLoading: countsLoading } = useQuery({
    queryKey: ['user-related-counts', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser) return null;
      const uid = selectedUser.id;

      const [solutions, reviews, messages, badges, games, topics, appeals, transactions] = await Promise.all([
        supabase.from('solutions').select('id', { count: 'exact', head: true }).eq('user_id', uid),
        supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('reviewer_id', uid),
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('sender_id', uid),
        supabase.from('user_badges').select('id', { count: 'exact', head: true }).eq('user_id', uid),
        supabase.from('games').select('id', { count: 'exact', head: true }).or(`creator_id.eq.${uid},opponent_id.eq.${uid}`),
        supabase.from('topics').select('id', { count: 'exact', head: true }).eq('author_id', uid),
        supabase.from('appeals').select('id', { count: 'exact', head: true }).eq('user_id', uid),
        supabase.from('point_transactions').select('id', { count: 'exact', head: true }).eq('user_id', uid),
      ]);

      return {
        solutions: solutions.count ?? 0,
        reviews: reviews.count ?? 0,
        messages: messages.count ?? 0,
        badges: badges.count ?? 0,
        games: games.count ?? 0,
        topics: topics.count ?? 0,
        appeals: appeals.count ?? 0,
        transactions: transactions.count ?? 0,
      } as UserRelatedCounts;
    },
    enabled: !!selectedUser,
  });

  const hardDelete = useMutation({
    mutationFn: async (userId: string) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hard-delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ userId }),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Ошибка удаления');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users-delete'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-total-users'] });
      toast.success(`Пользователь ${selectedUser?.nickname} полностью удалён`);
      setSelectedUser(null);
      setShowConfirmDialog(false);
      setConfirmNickname('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при удалении');
    },
  });

  const filteredUsers = users?.filter(u =>
    u.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) &&
    u.id !== user?.id
  );

  const totalRelated = relatedCounts
    ? Object.values(relatedCounts).reduce((a, b) => a + b, 0)
    : 0;

  const dataLabels: { key: keyof UserRelatedCounts; label: string }[] = [
    { key: 'solutions', label: 'Решений' },
    { key: 'reviews', label: 'Проверок' },
    { key: 'messages', label: 'Сообщений' },
    { key: 'badges', label: 'Наград' },
    { key: 'games', label: 'Игр' },
    { key: 'topics', label: 'Тем' },
    { key: 'appeals', label: 'Апелляций' },
    { key: 'transactions', label: 'Транзакций' },
  ];

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <UserX className="w-5 h-5" />
          Полное удаление пользователей
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Безвозвратное удаление аккаунта со всеми данными. Это действие нельзя отменить.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск пользователя..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="max-h-[350px] overflow-y-auto space-y-2">
            {filteredUsers?.map(u => (
              <div
                key={u.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedUser?.id === u.id 
                    ? 'border-destructive bg-destructive/5' 
                    : 'border-border bg-muted/30 hover:bg-muted/50'
                }`}
                onClick={() => setSelectedUser(u)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={u.avatar_url || undefined} />
                    <AvatarFallback>{u.nickname?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{u.nickname}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('ru') : '—'}
                      {u.is_deleted && ' • Скрыт'}
                      {!u.is_approved && ' • Не одобрен'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Очки: {u.trust_rating ?? 50}
                  </Badge>
                </div>
              </div>
            ))}
            {filteredUsers?.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Пользователи не найдены</p>
            )}
          </div>
        )}

        {/* Selected user details */}
        {selectedUser && (
          <div className="border border-destructive/30 rounded-xl p-4 space-y-4 bg-destructive/5">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedUser.avatar_url || undefined} />
                <AvatarFallback>{selectedUser.nickname?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">{selectedUser.nickname}</p>
                <p className="text-xs text-muted-foreground">ID: {selectedUser.id.slice(0, 8)}...</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 rounded-lg bg-background">
                <span className="text-muted-foreground">Проверок:</span>{' '}
                <span className="font-medium">{selectedUser.reviews_completed ?? 0}</span>
              </div>
              <div className="p-2 rounded-lg bg-background">
                <span className="text-muted-foreground">Баланс:</span>{' '}
                <span className="font-medium">{selectedUser.review_balance ?? 0}</span>
              </div>
              <div className="p-2 rounded-lg bg-background">
                <span className="text-muted-foreground">Очки:</span>{' '}
                <span className="font-medium">{selectedUser.trust_rating ?? 50}</span>
              </div>
              <div className="p-2 rounded-lg bg-background">
                <span className="text-muted-foreground">Лайков:</span>{' '}
                <span className="font-medium">{selectedUser.likes_received ?? 0}</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-warning" />
                Связанные данные
                {countsLoading && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
              </p>
              {relatedCounts && (
                <div className="grid grid-cols-4 gap-1.5">
                  {dataLabels.map(({ key, label }) => (
                    <div key={key} className="text-center p-1.5 rounded bg-background text-xs">
                      <p className="font-bold text-destructive">{relatedCounts[key]}</p>
                      <p className="text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              )}
              {relatedCounts && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Всего будет удалено: <strong className="text-destructive">{totalRelated}</strong> записей + профиль + аккаунт
                </p>
              )}
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowConfirmDialog(true)}
              disabled={countsLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Удалить навсегда
            </Button>
          </div>
        )}

        {/* Confirmation dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <Shield className="w-5 h-5" />
                Подтверждение полного удаления
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  Вы собираетесь <strong>безвозвратно удалить</strong> пользователя{' '}
                  <strong>{selectedUser?.nickname}</strong> и все связанные данные.
                </p>
                <p className="text-destructive font-medium">
                  Это действие нельзя отменить! Все решения, проверки, сообщения, 
                  достижения и другие данные будут потеряны навсегда.
                </p>
                <div className="pt-2">
                  <label className="text-sm font-medium block mb-1.5">
                    Введите никнейм <strong>{selectedUser?.nickname}</strong> для подтверждения:
                  </label>
                  <Input
                    value={confirmNickname}
                    onChange={(e) => setConfirmNickname(e.target.value)}
                    placeholder={selectedUser?.nickname}
                    className="border-destructive/50"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmNickname('')}>
                Отмена
              </AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={() => selectedUser && hardDelete.mutate(selectedUser.id)}
                disabled={
                  confirmNickname !== selectedUser?.nickname || 
                  hardDelete.isPending
                }
              >
                {hardDelete.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Удалить безвозвратно
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
