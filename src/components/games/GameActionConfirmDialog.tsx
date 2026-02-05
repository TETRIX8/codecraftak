import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface GameActionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => Promise<void> | void;
  delay?: number; // Delay in seconds before confirm button is enabled
  variant?: 'default' | 'destructive';
}

export function GameActionConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  onConfirm,
  delay = 2,
  variant = 'default',
}: GameActionConfirmDialogProps) {
  const [countdown, setCountdown] = useState(delay);
  const [isConfirming, setIsConfirming] = useState(false);

  // Reset countdown when dialog opens
  useEffect(() => {
    if (open) {
      setCountdown(delay);
    }
  }, [open, delay]);

  // Countdown timer
  useEffect(() => {
    if (!open || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [open, countdown]);

  const handleConfirm = async () => {
    if (countdown > 0) return;
    
    setIsConfirming(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsConfirming(false);
    }
  };

  const canConfirm = countdown === 0 && !isConfirming;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${variant === 'destructive' ? 'text-destructive' : 'text-warning'}`} />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
          >
            Отмена
          </Button>
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: canConfirm ? 1 : 0.95 }}
          >
            <Button
              variant={variant === 'destructive' ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="min-w-[120px]"
            >
              {isConfirming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : countdown > 0 ? (
                `Подождите (${countdown})`
              ) : (
                confirmText
              )}
            </Button>
          </motion.div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
