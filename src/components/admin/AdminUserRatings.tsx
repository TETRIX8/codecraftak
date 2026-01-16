import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Minus, Loader2, Star, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useUsers } from '@/hooks/useUsers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserStats {
  id: string;
  nickname: string;
  avatar_url: string | null;
  trust_rating: number;
  correct_reviews: number;
  total_reviews: number;
  reviews_completed: number;
  review_balance: number;
}

export function AdminUserRatings() {
  const { data: users, isLoading } = useUsers();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);
  const [activeTab, setActiveTab] = useState('trust_rating');
  const [inputValue, setInputValue] = useState('');

  const updateProfile = useMutation({
    mutationFn: async ({ userId, field, value }: { userId: string; field: string; value: number }) => {
      const clampedValue = field === 'trust_rating' 
        ? Math.max(0, Math.min(100, value))
        : Math.max(0, value);
      
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: clampedValue })
        .eq('id', userId);
      if (error) throw error;
      return { field, value: clampedValue };
    },
    onSuccess: ({ field, value }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      const fieldNames: Record<string, string> = {
        trust_rating: 'Очки',
        correct_reviews: 'Правильных проверок',
        total_reviews: 'Всего проверок',
        reviews_completed: 'Выполнено проверок',
        review_balance: 'Баланс проверок',
      };
      toast.success(`${fieldNames[field] || field} обновлено: ${value}`);
      setSelectedUser(null);
      setInputValue('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при обновлении');
    },
  });

  const filteredUsers = users?.filter(user =>
    user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApplyChange = (isAdd: boolean) => {
    if (!selectedUser || !inputValue) return;
    const change = parseInt(inputValue) || 0;
    const currentValue = (selectedUser as any)[activeTab] || 0;
    const newValue = isAdd ? currentValue + change : currentValue - change;
    updateProfile.mutate({ userId: selectedUser.id, field: activeTab, value: newValue });
  };

  const handleSetValue = () => {
    if (!selectedUser || !inputValue) return;
    const newValue = parseInt(inputValue) || 0;
    updateProfile.mutate({ userId: selectedUser.id, field: activeTab, value: newValue });
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      trust_rating: 'Очки',
      correct_reviews: 'Правильных проверок',
      total_reviews: 'Всего проверок',
      reviews_completed: 'Выполнено проверок',
      review_balance: 'Баланс проверок',
    };
    return labels[field] || field;
  };

  const getCurrentValue = () => {
    if (!selectedUser) return 0;
    return (selectedUser as any)[activeTab] || 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" />
          Управление статистикой пользователей
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
                  trust_rating: user.trust_rating ?? 50,
                  correct_reviews: (user as any).correct_reviews ?? 0,
                  total_reviews: (user as any).total_reviews ?? 0,
                  reviews_completed: user.reviews_completed ?? 0,
                  review_balance: (user as any).review_balance ?? 0,
                })}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{user.nickname[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium">{user.nickname}</span>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>Очки: {user.trust_rating}%</span>
                      <span>Проверок: {user.reviews_completed}</span>
                    </div>
                  </div>
                </div>
                <Star className="w-4 h-4 text-warning" />
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Изменить статистику</DialogTitle>
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
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="trust_rating">Очки</TabsTrigger>
                    <TabsTrigger value="review_balance">Баланс</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="correct_reviews">Правильные</TabsTrigger>
                    <TabsTrigger value="total_reviews">Всего</TabsTrigger>
                    <TabsTrigger value="reviews_completed">Выполнено</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">{getFieldLabel(activeTab)}</p>
                  <p className="text-2xl font-bold text-primary">
                    {getCurrentValue()}{activeTab === 'trust_rating' ? '%' : ''}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Значение</label>
                  <Input
                    type="number"
                    min="0"
                    max={activeTab === 'trust_rating' ? 100 : undefined}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Введите число"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleApplyChange(true)}
                    disabled={!inputValue || updateProfile.isPending}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Добавить
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleApplyChange(false)}
                    disabled={!inputValue || updateProfile.isPending}
                  >
                    <Minus className="w-4 h-4 mr-1" />
                    Вычесть
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={handleSetValue}
                    disabled={!inputValue || updateProfile.isPending}
                  >
                    {updateProfile.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                    Установить
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  {activeTab === 'trust_rating' 
                    ? 'Очки ограничены диапазоном 0-100%'
                    : 'Значение не может быть отрицательным'}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
