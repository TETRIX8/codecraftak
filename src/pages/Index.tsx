import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Archive, ArrowRight, Award, BookOpen, CalendarDays, CheckCircle2, Flame, Heart, Medal, ShieldCheck, Sparkles, Star, Target, Trophy, Users } from 'lucide-react';
import { useLeaderboard, type LeaderboardProfile } from '@/hooks/useProfile';

const levelNames = { beginner: 'Новичок', reviewer: 'Ревьюер', expert: 'Эксперт' };

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

function accuracy(profile: LeaderboardProfile) {
  if (!profile.total_reviews) return null;
  return Math.round((profile.correct_reviews / profile.total_reviews) * 100);
}

function Avatar({ profile, size = 'normal' }: { profile: LeaderboardProfile; size?: 'normal' | 'large' }) {
  return (
    <img
      src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`}
      alt={`Аватар ${profile.nickname}`}
      className={`${size === 'large' ? 'h-20 w-20' : 'h-12 w-12'} rounded-2xl border border-border bg-secondary object-cover`}
    />
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Star; value: string | number; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg bg-secondary/70 px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-foreground">{value}</p>
        <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function ParticipantCard({ profile, rank }: { profile: LeaderboardProfile; rank: number }) {
  const profileAccuracy = accuracy(profile);
  const lastActive = formatDate(profile.last_activity_date);
  return (
    <motion.article initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-border bg-card/80 p-4 transition-colors hover:border-primary/35 sm:p-5">
      <div className="flex items-start gap-3">
        <Avatar profile={profile} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-bold text-foreground">{profile.nickname}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{levelNames[profile.level]}{profile.course ? ` · ${profile.course} курс` : ''}</p>
            </div>
            <span className="font-mono text-xs text-muted-foreground">#{rank}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Stat icon={Trophy} value={profile.score} label="очков" />
        <Stat icon={CheckCircle2} value={profile.acceptedSolutions} label="решений" />
        <Stat icon={Award} value={profile.badgePoints} label="награды" />
        <Stat icon={ShieldCheck} value={profile.trust_rating ?? 0} label="доверие" />
        <Stat icon={Target} value={`${profile.correct_reviews ?? 0}/${profile.total_reviews ?? 0}`} label="проверки" />
        <Stat icon={Sparkles} value={profile.reviews_completed ?? 0} label="ревью" />
        {profileAccuracy !== null && <Stat icon={Medal} value={`${profileAccuracy}%`} label="точность" />}
        <Stat icon={Heart} value={profile.likes_received ?? 0} label="лайки" />
        <Stat icon={Star} value={profile.review_balance ?? 0} label="баланс" />
        <Stat icon={Flame} value={profile.streak ?? 0} label="серия" />
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> В проекте с {formatDate(profile.created_at)}</span>
        {lastActive && <span>Активность: {lastActive}</span>}
      </div>
    </motion.article>
  );
}

function PodiumCard({ profile, rank }: { profile: LeaderboardProfile; rank: number }) {
  return (
    <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: rank * 0.1 }} className={`relative overflow-hidden rounded-2xl border bg-card p-5 ${rank === 1 ? 'border-primary/60 lg:-translate-y-4' : 'border-border'}`}>
      <div className="absolute right-4 top-3 font-mono text-5xl font-black text-foreground/5">0{rank}</div>
      <div className="relative flex items-center gap-4">
        <Avatar profile={profile} size="large" />
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <Trophy className={`h-4 w-4 ${rank === 1 ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">место {rank}</span>
          </div>
          <h3 className="truncate text-xl font-extrabold">{profile.nickname}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{profile.score} очков · {profile.acceptedSolutions} решений</p>
        </div>
      </div>
    </motion.article>
  );
}

export default function Index() {
  const { data: participants = [], isLoading, error } = useLeaderboard();
  const totalReviews = participants.reduce((sum, profile) => sum + (profile.reviews_completed || 0), 0);
  const totalSolutions = participants.reduce((sum, profile) => sum + profile.acceptedSolutions, 0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="archive-grid pointer-events-none absolute inset-0 opacity-35" />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 sm:pt-20">
        <header className="border-b border-border pb-14 sm:pb-20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
            <span className="flex items-center gap-2"><Archive className="h-4 w-4 text-primary" /> Архив образовательного проекта</span>
            <span>created by A-Kproject</span>
          </motion.div>
          <div className="grid items-end gap-10 lg:grid-cols-[1.5fr_0.5fr]">
            <div>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 font-mono text-sm uppercase tracking-[0.25em] text-primary">Финальная глава</motion.p>
              <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="text-balance text-5xl font-black tracking-[-0.06em] text-foreground sm:text-7xl lg:text-8xl">
                Проект закрыт.
                <span className="mt-2 block text-muted-foreground">История остаётся.</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }} className="mt-7 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                MOKSUHUB завершил свою работу. Здесь остаются знания, результаты и имена учеников, которые делали проект живым. Спасибо каждому, кто учился, проверял, создавал и помогал другим расти.
              </motion.p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/topics" className="group flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5">Открыть темы <BookOpen className="h-4 w-4" /></Link>
                <Link to="/leaderboard" className="group flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 font-bold text-foreground transition-colors hover:border-primary/50">Итоговый рейтинг <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-1">
              {[[participants.length, 'участников'], [totalSolutions, 'решений'], [totalReviews, 'проверок']].map(([value, label]) => (
                <div key={label} className="bg-card p-4 sm:p-5"><p className="text-2xl font-black sm:text-3xl">{isLoading ? '—' : value}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">{label}</p></div>
              ))}
            </div>
          </div>
        </header>

        <section className="py-14 sm:py-20" aria-labelledby="best-title">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div><p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">Зал славы</p><h2 id="best-title" className="text-3xl font-extrabold tracking-tight sm:text-4xl">Лучшие за всё время</h2></div>
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          {isLoading ? <div className="h-40 animate-pulse rounded-2xl bg-card" /> : participants.length ? <div className="grid gap-4 lg:grid-cols-3">{participants.slice(0, 3).map((profile, index) => <PodiumCard key={profile.id} profile={profile} rank={index + 1} />)}</div> : <p className="rounded-2xl border border-border bg-card p-8 text-muted-foreground">Итоговые данные пока недоступны.</p>}
        </section>

        <section className="border-t border-border pt-14 sm:pt-20" aria-labelledby="participants-title">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div><p className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary"><Users className="h-4 w-4" /> Люди проекта</p><h2 id="participants-title" className="text-3xl font-extrabold tracking-tight sm:text-4xl">Все участники</h2></div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">Финальная статистика каждого ученика — без исчезающих мест и временных сезонов.</p>
          </div>
          {error ? <p className="rounded-2xl border border-destructive/30 bg-card p-6 text-muted-foreground">Не удалось загрузить архив участников.</p> : isLoading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-80 animate-pulse rounded-2xl bg-card" />)}</div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{participants.map((profile, index) => <ParticipantCard key={profile.id} profile={profile} rank={index + 1} />)}</div>}
        </section>

        <footer className="mt-20 flex flex-col items-center gap-3 border-t border-border pt-10 text-center">
          <p className="text-balance text-xl font-bold">Спасибо, что были частью MOKSUHUB.</p>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Проект закрыт · created by A-Kproject</p>
        </footer>
      </div>
    </div>
  );
}
