import { Difficulty, Language, UserLevel } from '@/types';
import { cn } from '@/lib/utils';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const labels: Record<Difficulty, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        difficulty === 'easy' && "bg-success/20 text-success",
        difficulty === 'medium' && "bg-warning/20 text-warning",
        difficulty === 'hard' && "bg-destructive/20 text-destructive",
        className
      )}
    >
      {labels[difficulty]}
    </span>
  );
}

interface LanguageBadgeProps {
  language: Language;
  className?: string;
}

const languageColors: Record<Language, string> = {
  javascript: 'bg-yellow-500/20 text-yellow-400',
  typescript: 'bg-blue-500/20 text-blue-400',
  python: 'bg-green-500/20 text-green-400',
  html: 'bg-orange-500/20 text-orange-400',
  css: 'bg-purple-500/20 text-purple-400',
  java: 'bg-red-500/20 text-red-400',
  cpp: 'bg-cyan-500/20 text-cyan-400',
};

const languageLabels: Record<Language, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  html: 'HTML',
  css: 'CSS',
  java: 'Java',
  cpp: 'C++',
};

export function LanguageBadge({ language, className }: LanguageBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium",
        languageColors[language],
        className
      )}
    >
      {languageLabels[language]}
    </span>
  );
}

interface LevelBadgeProps {
  level: UserLevel;
  className?: string;
}

export function LevelBadge({ level, className }: LevelBadgeProps) {
  const labels: Record<UserLevel, string> = {
    beginner: 'Новичок',
    reviewer: 'Ревьюер',
    expert: 'Эксперт',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
        level === 'beginner' && "bg-primary/20 text-primary",
        level === 'reviewer' && "bg-accent/20 text-accent",
        level === 'expert' && "bg-warning/20 text-warning",
        className
      )}
    >
      {labels[level]}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'pending' | 'accepted' | 'rejected';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const labels = {
    pending: 'Ожидает проверки',
    accepted: 'Принято',
    rejected: 'Отклонено',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
        status === 'pending' && "bg-muted text-muted-foreground",
        status === 'accepted' && "bg-success/20 text-success",
        status === 'rejected' && "bg-destructive/20 text-destructive",
        className
      )}
    >
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === 'pending' && "bg-muted-foreground animate-pulse",
        status === 'accepted' && "bg-success",
        status === 'rejected' && "bg-destructive",
      )} />
      {labels[status]}
    </span>
  );
}
