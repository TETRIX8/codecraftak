import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Search, Loader2, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUsers } from '@/hooks/useUsers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function AdminAvatarPermissions() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: users, isLoading } = useUsers();
  const queryClient = useQueryClient();

  const togglePermission = useMutation({
    mutationFn: async ({ userId, canUpload }: { userId: string; canUpload: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ can_upload_avatar: canUpload })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: (_, { canUpload }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success(canUpload ? 'Разрешение выдано' : 'Разрешение отозвано');
    },
    onError: () => {
      toast.error('Ошибка при изменении прав');
    },
  });

  const filteredUsers = users?.filter(user =>
    user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Права на загрузку аватара
        </CardTitle>
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
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {filteredUsers?.slice(0, 20).map((user) => {
              const canUpload = (user as any).can_upload_avatar ?? false;
              
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar_url || ''} />
                      <AvatarFallback>{user.nickname[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user.nickname}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.reviews_completed || 0} проверок
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {canUpload && (
                      <Badge variant="secondary" className="text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Разрешено
                      </Badge>
                    )}
                    <Button
                      variant={canUpload ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => togglePermission.mutate({ 
                        userId: user.id, 
                        canUpload: !canUpload 
                      })}
                      disabled={togglePermission.isPending}
                    >
                      {togglePermission.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : canUpload ? (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          Отозвать
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-1" />
                          Выдать
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}

            {filteredUsers?.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Пользователи не найдены
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
