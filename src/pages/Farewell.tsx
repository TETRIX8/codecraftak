import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useUserBadges } from '@/hooks/useBadges';
import { useUserSolutions } from '@/hooks/useSolutions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Sun, Heart, Star, Trophy, Flame, CheckCircle, Award, Calendar, Sparkles, LogIn, Waves
} from 'lucide-react';

function Petals() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 22 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          initial={{ x: `${Math.random() * 100}%`, y: -40, rotate: 0, opacity: 0 }}
          animate={{
            y: ['-5%', '110%'],
            x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            rotate: [0, 360],
            opacity: [0, 0.9, 0],
          }}
          transition={{
            duration: 14 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 8,
            ease: 'linear',
          }}
        >
          {['🌅', '🌻', '🍃', '✨', '🕊️', '🌾'][i % 6]}
        </motion.div>
      ))}
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint }: any) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative rounded-2xl p-6 bg-gradient-to-br from-[hsl(var(--card))]/70 to-[hsl(var(--card))]/30 backdrop-blur-xl border border-[hsl(var(--primary))]/25 overflow-hidden"
      style={{ boxShadow: '0 12px 40px -10px hsl(var(--primary) / 0.35)' }}
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[hsl(var(--accent))]/20 blur-2xl" />
      <Icon className="w-8 h-8 text-[hsl(var(--primary))] mb-3" />
      <div className="text-4xl font-bold gradient-text tracking-tight">{value}</div>
      <div className="text-sm font-medium mt-1">{label}</div>
      {hint && <div className="text-xs text-muted-foreground mt-2 italic">{hint}</div>}
    </motion.div>
  );
}

export default function Farewell() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: badges = [] } = useUserBadges(user?.id);
  const { data: solutions = [] } = useUserSolutions();

  const stats = useMemo(() => {
    const accepted = solutions.filter((s: any) => s.status === 'accepted').length;
    const total = solutions.length;
    const days = profile?.created_at
      ? Math.max(1, Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000))
      : 0;
    return { accepted, total, days };
  }, [solutions, profile]);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="p-10 text-center max-w-md glass">
          <Sun className="w-16 h-16 mx-auto mb-4 text-[hsl(var(--primary))] animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">До свидания, лето…</h2>
          <p className="text-muted-foreground mb-6">Войди, чтобы увидеть свой прощальный итог.</p>
          <Link to="/auth"><Button variant="gradient"><LogIn className="w-4 h-4 mr-2" />Войти</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at top, hsl(var(--primary) / 0.25), transparent 60%), radial-gradient(ellipse at bottom, hsl(var(--accent) / 0.2), transparent 60%), hsl(var(--background))',
      }}
    >
      <Petals />

      {/* Sun */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 top-10 w-72 h-72 rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.55), hsl(var(--accent) / 0.25) 60%, transparent 80%)',
          filter: 'blur(8px)',
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 0.95, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative container mx-auto px-4 pt-24 pb-20 max-w-5xl">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Waves className="w-4 h-4 text-[hsl(var(--primary))]" />
            <span className="text-sm tracking-wider uppercase text-muted-foreground">Последний закат</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-4 leading-tight">
            До встречи,<br />наше лето
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground italic max-w-2xl mx-auto">
            «Лето кончается тихо — как страница, перевёрнутая на закате.<br />
            Вот всё, что осталось от тебя, {profile?.nickname || 'друг'}.»
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          <Stat icon={Star} label="Рейтинг доверия" value={profile?.trust_rating ?? 0} hint="всё, что ты заслужил" />
          <Stat icon={Sparkles} label="Баллы" value={profile?.review_balance ?? 0} hint="монеты тёплых дней" />
          <Stat icon={CheckCircle} label="Проверок" value={profile?.reviews_completed ?? 0} hint="внимательных глаз" />
          <Stat icon={Trophy} label="Принятые решения" value={stats.accepted} hint={`из ${stats.total} попыток`} />
          <Stat icon={Heart} label="Получено лайков" value={profile?.likes_received ?? 0} hint="чужое тепло" />
          <Stat icon={Flame} label="Серия дней" value={profile?.streak ?? 0} hint="ты приходил снова и снова" />
          <Stat icon={Award} label="Ачивок" value={badges.length} hint="памятные значки" />
          <Stat icon={Calendar} label="Дней с нами" value={stats.days} hint="как одно длинное лето" />
          <Stat icon={Sun} label="Уровень" value={(profile?.level || 'beginner').toUpperCase()} hint="ступень пути" />
        </div>

        {/* Farewell letter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl p-8 md:p-12 glass-panel text-center"
        >
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary))]/60 to-transparent" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Спасибо за это лето</h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-6">
            Каждое задание было волной, каждый код — песком сквозь пальцы.
            Мы смеялись над багами, грустили над дедлайнами и всё-таки добежали до берега.
            Сохрани это чувство — оно вернётся следующим летом.
          </p>
          <div className="flex justify-center gap-3 text-2xl mb-4">🌅 🌊 🍉 🕯️ 🎐</div>
          <p className="text-sm italic text-[hsl(var(--primary))]">— команда CodeCraft, с любовью</p>
        </motion.div>
      </div>
    </div>
  );
}
