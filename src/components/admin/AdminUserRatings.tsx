import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Minus, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUsers } from '@/hooks/useUsers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function AdminUserRatings() {
  const { data: users, isLoading } = useUsers();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    nickname: string;
    avatar_url: string | null;
    trust_rating: number;
  } | null>(null);
  const [ratingChange, setRatingChange] = useState('');

  const updateRating = useMutation({
    mutationFn: async ({ userId, newRating }: { userId: string; newRating: number }) => {
      const clampedRating = Math.max(0, Math.min(100, newRating));
      const { error } = await supabase
        .from('profiles')
        .update({ trust_rating: clampedRating })
        .eq('id', userId);
      if (error) throw error;
      return clampedRating;
    },
    onSuccess: (newRating) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast.success(`Рейтинг обновлён: ${newRating}%`);
      setSelectedUser(null);
      setRatingChange('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при обновлении рейтинга');
    },
  });

  const filteredUsers = users?.filter(user =>
    user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApplyChange = (isAdd: boolean) => {
    if (!selectedUser || !ratingChange) return;
    const change = parseInt(ratingChange) || 0;
    const newRating = isAdd 
      ? selectedUser.trust_rating + change 
      : selectedUser.trust_rating - change;
    updateRating.mutate({ userId: selectedUser.id, newRating });
  };

  const handleSetRating = () => {
    if (!selectedUser || !ratingChange) return;
    const newRating = parseInt(ratingChange) || 0;
    updateRating.mutate({ userId: selectedUser.id, newRating });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-warning" />
          Управление рейтингом пользователей
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени..."
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
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {filteredUsers?.slice(0, 20).map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => setSelectedUser({
                  id: user.id,
                  nickname: user.nickname,
                  avatar_url: user.avatar_url,
                  trust_rating: user.trust_rating,
                })}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{user.nickname[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.nickname}</span>
                </div>
                <span className="text-sm font-medium text-warning">
                  {user.trust_rating}%
                </span>
              </div>
            ))}
            {filteredUsers?.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Пользователи не найдены
              </p>
            )}
          </div>
        )}

        <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Изменить рейтинг</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <Avatar>
                    <AvatarImage src={selectedUser.avatar_url || undefined} />
                    <AvatarFallback>{selectedUser.nickname[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.nickname}</p>
                    <p className="text-sm text-muted-foreground">
                      Текущий рейтинг: <span className="text-warning font-medium">{selectedUser.trust_rating}%</span>
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Значение</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={ratingChange}
                    onChange={(e) => setRatingChange(e.target.value)}
                    placeholder="Введите число"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleApplyChange(true)}
                    disabled={!ratingChange || updateRating.isPending}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Добавить
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleApplyChange(false)}
                    disabled={!ratingChange || updateRating.isPending}
                  >
                    <Minus className="w-4 h-4 mr-1" />
                    Вычесть
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={handleSetRating}
                    disabled={!ratingChange || updateRating.isPending}
                  >
                    {updateRating.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                    Установить
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Рейтинг будет ограничен диапазоном 0-100%
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
