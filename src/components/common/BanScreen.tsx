import { Ban, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface BanScreenProps {
  reason: string;
  expiresAt: string;
}

export function BanScreen({ reason, expiresAt }: BanScreenProps) {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <Ban className="w-10 h-10 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-destructive mb-2">Аккаунт заблокирован</h1>
          <p className="text-muted-foreground">
            Ваш аккаунт временно заблокирован за нарушение правил.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-left space-y-3">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Причина</span>
            <p className="text-sm">{reason}</p>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Блокировка до {format(new Date(expiresAt), 'dd MMMM yyyy, HH:mm', { locale: ru })}
            </span>
          </div>
        </div>
        <Button variant="outline" onClick={signOut} className="w-full">
          Выйти из аккаунта
        </Button>
      </div>
    </div>
  );
}
