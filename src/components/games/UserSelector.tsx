import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send, Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface Profile {
  id: string;
  nickname: string;
  avatar_url: string | null;
}

interface UserSelectorProps {
  onSelectUser: (userId: string) => void;
  isLoading: boolean;
  sentInvites: string[];
}

export function UserSelector({ onSelectUser, isLoading, sentInvites }: UserSelectorProps) {
  const { user } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    searchUsers();
  }, [searchQuery]);

  async function searchUsers() {
    if (!user?.id) return;

    setIsSearching(true);

    try {
      let query = supabase
        .from('profiles')
        .select('id, nickname, avatar_url')
        .neq('id', user.id)
        .limit(20);

      if (searchQuery.trim()) {
        query = query.ilike('nickname', `%${searchQuery}%`);
      }

      const { data, error } = await query.order('nickname');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  }

  const handleInvite = (userId: string) => {
    onSelectUser(userId);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск пользователя..."
          className="pl-10"
        />
      </div>

      <ScrollArea className="h-[300px] pr-4">
        {isSearching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Пользователи не найдены</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((profile) => {
              const isInvited = sentInvites.includes(profile.id);
              
              return (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback>
                        {profile.nickname.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{profile.nickname}</span>
                  </div>
                  <Button
                    size="sm"
                    variant={isInvited ? "secondary" : "default"}
                    onClick={() => handleInvite(profile.id)}
                    disabled={isLoading || isInvited}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isInvited ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Отправлено
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-1" />
                        Пригласить
                      </>
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
