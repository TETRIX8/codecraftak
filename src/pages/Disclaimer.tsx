import { ShieldAlert, AlertTriangle, XOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DisclaimerProps {
  onDismiss: () => void;
}

const Disclaimer = ({ onDismiss }: DisclaimerProps) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-destructive/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-warning/5 blur-3xl" />
      </div>

      <div className="relative mx-4 max-w-2xl">
        {/* Main card */}
        <div className="rounded-lg border border-destructive/30 bg-card p-8 shadow-2xl md:p-12">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>

          {/* Title */}
          <h1 className="mb-4 text-center text-3xl font-bold text-foreground md:text-4xl">
            Доступ запрещён
          </h1>

          {/* Warning badge */}
          <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-4 py-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium text-warning">
              Обнаружена попытка открыть инструменты разработчика
            </span>
          </div>

          {/* Description */}
          <div className="mb-8 space-y-4 text-center text-muted-foreground">
            <p className="text-base leading-relaxed">
              Использование инструментов разработчика на данной платформе
              строго запрещено. Это может привести к нарушению работы сервиса
              и является нарушением правил использования.
            </p>
            <p className="text-base leading-relaxed">
              Любые попытки модификации клиентского кода, инъекции скриптов
              или манипуляции с данными будут зафиксированы системой
              безопасности.
            </p>
          </div>

          {/* Rules box */}
          <div className="mb-8 rounded-lg border border-border bg-muted/50 p-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <XOctagon className="h-4 w-4 text-destructive" />
              Запрещённые действия:
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-destructive" />
                Открытие консоли разработчика (F12, Ctrl+Shift+I)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-destructive" />
                Просмотр и модификация исходного кода страницы
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-destructive" />
                Инъекция JavaScript-кода через консоль
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-destructive" />
                Манипуляция с сетевыми запросами и ответами сервера
              </li>
            </ul>
          </div>

          {/* Action button */}
          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={onDismiss}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
              size="lg"
            >
              Я понимаю, вернуться назад
            </Button>
            <p className="text-xs text-muted-foreground">
              Повторное нарушение может привести к блокировке аккаунта
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
