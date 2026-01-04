import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function WelcomePopup() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isNewDay, setIsNewDay] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkDailyVisit = async () => {
      const today = new Date().toISOString().split('T')[0];
      const lastVisitKey = `last_visit_${user.id}`;
      const lastVisit = localStorage.getItem(lastVisitKey);

      // Already visited today
      if (lastVisit === today) {
        return;
      }

      // Fetch current profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('streak, last_activity_date')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      const lastActivityDate = profile.last_activity_date;
      let newStreak = profile.streak || 0;

      if (lastActivityDate) {
        const lastDate = new Date(lastActivityDate);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive day - increase streak
          newStreak += 1;
          setIsNewDay(true);
        } else if (diffDays > 1) {
          // Streak broken - reset to 1
          newStreak = 1;
          setIsNewDay(true);
        }
        // If diffDays === 0, it's the same day (shouldn't happen due to localStorage check)
      } else {
        // First visit ever
        newStreak = 1;
        setIsNewDay(true);
      }

      // Update profile with new streak and date
      await supabase
        .from('profiles')
        .update({
          streak: newStreak,
          last_activity_date: today,
        })
        .eq('id', user.id);

      // Save to localStorage
      localStorage.setItem(lastVisitKey, today);

      setStreak(newStreak);
      setIsOpen(true);
    };

    checkDailyVisit();
  }, [user]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md p-8 rounded-3xl bg-card border border-border shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Decorative elements */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-primary via-accent to-warning flex items-center justify-center shadow-lg shadow-primary/30"
              >
                <Flame className="w-12 h-12 text-white" />
              </motion.div>
            </div>

            {/* Content */}
            <div className="mt-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold mb-2">
                  Добро пожаловать! 👋
                </h2>
                <p className="text-muted-foreground mb-6">
                  Рады видеть тебя снова
                </p>
              </motion.div>

              {/* Streak counter */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-warning/20 to-destructive/20 border border-warning/30 mb-6"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-warning" />
                  <span className="text-3xl font-bold text-warning">{streak}</span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">
                    {streak === 1 ? 'день' : streak >= 2 && streak <= 4 ? 'дня' : 'дней'}
                  </div>
                  <div className="text-xs text-muted-foreground">подряд</div>
                </div>
              </motion.div>

              {/* Motivational message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                {streak >= 7 && (
                  <div className="flex items-center justify-center gap-2 text-sm text-success">
                    <Sparkles className="w-4 h-4" />
                    <span>Отличная серия! Так держать!</span>
                  </div>
                )}
                {streak >= 3 && streak < 7 && (
                  <div className="flex items-center justify-center gap-2 text-sm text-primary">
                    <Calendar className="w-4 h-4" />
                    <span>Хорошее начало! Продолжай!</span>
                  </div>
                )}
                {streak < 3 && isNewDay && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4" />
                    <span>Начни серию посещений!</span>
                  </div>
                )}
              </motion.div>

              {/* Start button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleClose}
                  className="w-full h-14 text-lg font-semibold rounded-xl"
                >
                  Начать
                </Button>
              </motion.div>
            </div>

            {/* Confetti-like particles */}
            {streak >= 5 && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: '50%', 
                      y: '50%', 
                      scale: 0,
                      opacity: 1 
                    }}
                    animate={{ 
                      x: `${20 + Math.random() * 60}%`,
                      y: `${10 + Math.random() * 80}%`,
                      scale: [0, 1, 0.5],
                      opacity: [1, 1, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                    className={`absolute w-2 h-2 rounded-full ${
                      ['bg-primary', 'bg-warning', 'bg-success', 'bg-accent', 'bg-destructive', 'bg-secondary'][i]
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
