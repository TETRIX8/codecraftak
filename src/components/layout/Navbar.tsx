import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Archive, BookOpen, Home, Menu, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Главная', icon: Home },
  { path: '/topics', label: 'Темы', icon: BookOpen },
  { path: '/leaderboard', label: 'Рейтинг', icon: Trophy },
];

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="MOKSUHUB — главная">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
              <Archive className="h-4 w-4 text-primary" />
            </div>
            <div className="leading-none">
              <span className="block text-sm font-extrabold tracking-[0.12em]">MOKSUHUB</span>
              <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">закрытый проект</span>
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path} className="relative">
                  <motion.span
                    whileHover={{ y: -1 }}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {isActive && <motion.span layoutId="archive-nav" className="absolute inset-0 -z-10 rounded-lg bg-primary/10" />}
                  </motion.span>
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground md:flex">
            created by <span className="text-foreground">A-Kproject</span>
          </div>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen((value) => !value)} aria-label="Открыть меню">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-border py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={cn('flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium', location.pathname === item.path ? 'bg-primary/10 text-primary' : 'text-muted-foreground')}>
                  <item.icon className="h-5 w-5" /> {item.label}
                </Link>
              ))}
              <p className="px-4 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">created by A-Kproject</p>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
