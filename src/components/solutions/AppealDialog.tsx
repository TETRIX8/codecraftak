import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCreateAppeal, useHasAppeal } from '@/hooks/useAppeals';
import { toast } from 'sonner';

interface AppealDialogProps {
  solutionId: string;
  disabled?: boolean;
}

export function AppealDialog({ solutionId, disabled }: AppealDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const createAppeal = useCreateAppeal();
  const { data: hasAppeal, isLoading: checkingAppeal } = useHasAppeal(solutionId);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Укажите причину апелляции');
      return;
    }

    if (reason.trim().length < 20) {
      toast.error('Причина должна быть не менее 20 символов');
      return;
    }

    try {
      await createAppeal.mutateAsync({ solutionId, reason });
      toast.success('Апелляция отправлена на рассмотрение');
      setIsOpen(false);
      setReason('');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при отправке апелляции');
    }
  };

  if (checkingAppeal) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  if (hasAppeal) {
    return (
      <Button variant="outline" size="sm" disabled>
        <AlertTriangle className="w-4 h-4 mr-2" />
        Апелляция отправлена
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <AlertTriangle className="w-4 h-4 mr-2" />
          Оспорить
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Оспорить решение</DialogTitle>
          <DialogDescription>
            Если вы считаете, что проверяющие ошиблись, опишите причину.
            Администратор рассмотрит вашу апелляцию.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Объясните, почему решение должно быть принято..."
            rows={5}
          />
          <p className="text-xs text-muted-foreground">
            Минимум 20 символов. Подробно опишите, почему считаете проверку неправильной.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="gradient"
              onClick={handleSubmit}
              disabled={createAppeal.isPending || reason.trim().length < 20}
            >
              {createAppeal.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Отправить апелляцию
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
