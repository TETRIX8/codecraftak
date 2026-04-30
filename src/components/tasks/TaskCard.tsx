import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DifficultyBadge, LanguageBadge } from '@/components/common/Badges';
import { Users, ArrowRight, Sparkles } from 'lucide-react';
import { Task } from '@/hooks/useTasks';

interface TaskCardProps {
  task: Task;
  index?: number;
}

export function TaskCard({ task, index = 0 }: TaskCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative"
    >
      <Link to={`/tasks/${task.id}`}>
        {/* Outer glow */}
        <div
          className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-500"
          style={{
            background:
              'linear-gradient(135deg, hsl(280 80% 60% / 0.6), hsl(200 90% 60% / 0.6), hsl(330 85% 60% / 0.6))',
          }}
        />

        <div
          className="relative h-full p-6 rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, hsl(240 40% 12% / 0.7), hsl(245 50% 8% / 0.7))',
          }}
        >
          {/* Floating sparkle */}
          <motion.div
            className="absolute top-3 right-3 text-primary/40 group-hover:text-primary transition-colors"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>

          {/* Star dust shimmer */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at var(--mx,50%) var(--my,30%), hsl(280 80% 70% / 0.15), transparent 60%)',
            }}
          />

          <div className="relative z-10">
            <div className="flex flex-wrap gap-2 mb-4">
              <DifficultyBadge difficulty={task.difficulty} />
              <LanguageBadge language={task.language} />
            </div>

            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
              {task.title}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-5">
              {task.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{task.completions} решений</span>
              </div>
              <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0">
                <span className="text-sm font-semibold">Решить</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
