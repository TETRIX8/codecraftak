import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Heart, MessageSquare, Star, Users as UsersIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LevelBadge } from '@/components/common/Badges';
import { useSearchUsers } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';

export default function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { data: users, isLoading } = useSearchUsers(searchQuery);

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <UsersIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Сообщество</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Найти <span className="gradient-text">участников</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ищите других программистов, ставьте лайки и общайтесь
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Поиск по никнейму..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg rounded-xl"
            />
          </div>
        </motion.div>

        {/* Users Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !users?.length ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? 'Пользователи не найдены' : 'Нет пользователей'}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/users/${profile.id}`}>
                  <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group">
                    {/* Avatar */}
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <img
                        src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`}
                        alt={profile.nickname}
                        className="w-full h-full rounded-xl object-cover border-2 border-border group-hover:border-primary/50 transition-colors"
                      />
                      {profile.level && (
                        <div className="absolute -bottom-2 -right-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            profile.level === 'expert' ? 'bg-warning text-warning-foreground' :
                            profile.level === 'reviewer' ? 'bg-primary text-primary-foreground' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {profile.level === 'expert' ? '⭐' : profile.level === 'reviewer' ? '✓' : '•'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="text-center">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {profile.nickname}
                      </h3>
                      {profile.level && (
                        <div className="flex justify-center mb-3">
                          <LevelBadge level={profile.level} />
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-destructive" />
                          <span>{profile.likes_received || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-warning" />
                          <span>{profile.trust_rating || 0}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Action hint */}
                    {user && (
                      <div className="mt-4 pt-4 border-t border-border flex justify-center gap-2">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Heart className="w-3 h-3 mr-1" />
                          Лайк
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Написать
                        </Button>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
