import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DifficultyBadge, LanguageBadge } from '@/components/common/Badges';
import { Users, ArrowRight } from 'lucide-react';
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
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link to={`/tasks/${task.id}`}>
        <div className="relative h-full p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
          {/* Glow effect on hover */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex flex-wrap gap-2">
                <DifficultyBadge difficulty={task.difficulty} />
                <LanguageBadge language={task.language} />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
              {task.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {task.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{task.completions} решений</span>
              </div>
              <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium">Решить</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
