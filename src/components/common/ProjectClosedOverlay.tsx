import { Archive, ArrowRight, BookOpen, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function ProjectClosedOverlay() {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-background/88 px-4 py-24 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-closed-title"
    >
      <div className="absolute inset-0 archive-grid opacity-40" aria-hidden="true" />
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-primary/25 bg-card/95 p-6 shadow-2xl sm:p-10"
      >
        <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-5">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <Archive className="h-5 w-5" />
            Архив MOKSUHUB
          </div>
          <span className="rounded-full border border-border bg-secondary px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            доступ закрыт
          </span>
        </div>

        <p className="mb-3 font-mono text-sm uppercase tracking-[0.25em] text-muted-foreground">Финальная запись</p>
        <h1 id="project-closed-title" className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          Проект закрыт
        </h1>
        <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Этот раздел больше не принимает действия. История проекта, учебные материалы и итоговый рейтинг сохранены в открытом архиве.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Link to="/" className="group flex items-center justify-between rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">
            Главная <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/topics" className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-3 font-semibold text-foreground transition-colors hover:border-primary/50">
            <BookOpen className="h-4 w-4 text-primary" /> Темы
          </Link>
          <Link to="/leaderboard" className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-3 font-semibold text-foreground transition-colors hover:border-primary/50">
            <Trophy className="h-4 w-4 text-primary" /> Рейтинг
          </Link>
        </div>

        <div className="mt-10 flex items-center gap-3 border-t border-border pt-5">
          <span className="h-px flex-1 bg-border" />
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">created by A-Kproject</p>
        </div>
      </motion.section>
    </div>
  );
}
