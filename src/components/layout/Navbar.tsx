import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Home, ListTodo, CheckSquare, User, Trophy, Menu, X, LogOut, Settings, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useIsAdmin } from '@/hooks/useRoles';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const navItems = [
  { path: '/', label: 'Главная', icon: Home },
  { path: '/tasks', label: 'Задания', icon: ListTodo },
  { path: '/review', label: 'Проверка', icon: CheckSquare },
  { path: '/users', label: 'Участники', icon: Users },
  { path: '/messages', label: 'Чаты', icon: MessageSquare },
  { path: '/leaderboard', label: 'Рейтинг', icon: Trophy },
  { path: '/profile', label: 'Профиль', icon: User },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { isAdmin } = useIsAdmin();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Code2 className="w-5 h-5 text-background" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-50 blur-xl transition-opacity" />
            </div>
            <span className="text-xl font-bold hidden sm:block">
              Code<span className="gradient-text">⚡Craft</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    className={cn(
                      "relative px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Админ
                    </Button>
                  </Link>
                )}
                <NotificationBell />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-medium">{profile?.review_balance ?? 0} балл(ов)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/profile">
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-border">
                      <img 
                        src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                        alt={profile?.nickname || 'User'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="gradient" size="sm">
                  Войти
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-4 mt-2 border-t border-border">
                {user ? (
                  <div className="space-y-3">
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full mb-2">
                          <Settings className="w-4 h-4 mr-2" />
                          Админ-панель
                        </Button>
                      </Link>
                    )}
                    <div className="flex items-center gap-2 px-4">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm">{profile?.review_balance ?? 0} балл(ов)</span>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Выйти
                    </Button>
                  </div>
                ) : (
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="gradient" className="w-full">
                      Войти
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
