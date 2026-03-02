import { motion } from 'framer-motion';
import { Clock, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function PendingApprovalScreen() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-warning/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-md w-full"
      >
        <div className="p-8 rounded-2xl bg-card border border-border text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-warning/10 flex items-center justify-center"
          >
            <Clock className="w-10 h-10 text-warning" />
          </motion.div>

          <h1 className="text-2xl font-bold text-foreground mb-3">
            Ожидание одобрения
          </h1>
          
          <p className="text-muted-foreground mb-2">
            Ваш аккаунт ещё не одобрен администратором.
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            Пожалуйста, подождите — администратор рассмотрит вашу заявку в ближайшее время.
          </p>

          <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-muted/50 mb-6">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground text-left">
              После одобрения вы получите полный доступ ко всем функциям платформы.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={signOut}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти из аккаунта
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
