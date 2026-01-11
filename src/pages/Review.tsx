import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Send, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DifficultyBadge, LanguageBadge } from '@/components/common/Badges';
import { usePendingSolutionForReview, useSubmitReview, useDailyReviewsRemaining } from '@/hooks/useSolutions';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

export default function Review() {
  const [verdict, setVerdict] = useState<'accepted' | 'rejected' | null>(null);
  const [comment, setComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);

  const { user } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  
  const { data: solutionData, isLoading, refetch } = usePendingSolutionForReview();
  const { data: remainingReviews, refetch: refetchRemaining } = useDailyReviewsRemaining();
  const submitReview = useSubmitReview();

  const handleSubmitReview = async () => {
    if (!verdict) {
      toast.error('Выберите вердикт: Принять или Отклонить');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Добавьте комментарий (минимум 10 символов)');
      return;
    }

    if (!solutionData?.id) {
      toast.error('Решение не найдено');
      return;
    }

    try {
      await submitReview.mutateAsync({
        solutionId: solutionData.id,
        verdict,
        comment,
      });
      
      toast.success('Проверка отправлена!', {
        description: 'Вы получили +1 балл проверки. Спасибо за вклад!',
      });
      
      refetchRemaining();
      setHasReviewed(true);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при отправке проверки');
    }
  };

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Войдите в аккаунт</h1>
            <p className="text-muted-foreground mb-8">
              Чтобы проверять решения, необходимо войти в аккаунт.
            </p>
            <Link to="/auth">
              <Button variant="gradient" size="lg">
                Войти
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // After review
  if (hasReviewed) {
    return (
      <div className="min-h-screen bg-background py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Спасибо за проверку!</h1>
            <p className="text-muted-foreground mb-8">
              Ваш баланс обновлён. Теперь вы можете отправить своё решение.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={() => {
                setHasReviewed(false);
                setVerdict(null);
                setComment('');
                refetch();
                refetchRemaining();
              }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Проверить ещё
              </Button>
              <Button variant="gradient" onClick={() => navigate('/tasks')}>
                Решить задание
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // No solutions to review
  if (!solutionData) {
    return (
      <div className="min-h-screen bg-background py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-warning" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Нет заданий для проверки</h1>
            <p className="text-muted-foreground mb-8">
              В данный момент нет доступных решений для проверки. 
              Попробуйте позже или отправьте своё решение.
            </p>
            <Button variant="gradient" onClick={() => navigate('/tasks')}>
              Перейти к заданиям
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const task = solutionData.tasks as any;
  const canReview = remainingReviews !== undefined && remainingReviews > 0;

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h1 className="text-3xl font-bold">Проверка решения</h1>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                Осталось сегодня: <span className="text-primary">{remainingReviews ?? 3}</span> из 3
              </span>
            </div>
          </div>
          <p className="text-muted-foreground">
            Внимательно изучите код и дайте объективную оценку. После проверки 
            вы получите +1 балл.
          </p>
        </motion.div>

        {!canReview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto text-center py-12"
          >
            <div className="w-20 h-20 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-warning" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Лимит исчерпан</h2>
            <p className="text-muted-foreground mb-8">
              Вы использовали все 3 проверки на сегодня. Возвращайтесь завтра!
            </p>
            <Button variant="gradient" onClick={() => navigate('/tasks')}>
              Перейти к заданиям
            </Button>
          </motion.div>
        )}

        {canReview && (

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Task & Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {task && (
              <div className="p-6 rounded-xl bg-card border border-border">
                <div className="flex flex-wrap gap-2 mb-4">
                  <DifficultyBadge difficulty={task.difficulty} />
                  <LanguageBadge language={task.language} />
                </div>
                <h2 className="text-xl font-semibold mb-2">{task.title}</h2>
                <p className="text-muted-foreground text-sm">{task.description}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-4">Решение участника</h3>
              <div className="rounded-xl overflow-hidden border border-border">
                <Editor
                  height="400px"
                  language={task?.language || 'javascript'}
                  value={solutionData.code}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: 'JetBrains Mono, monospace',
                    padding: { top: 16, bottom: 16 },
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Review Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="text-lg font-semibold mb-4">Ваша оценка</h3>
              
              {/* Verdict Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Button
                  variant={verdict === 'accepted' ? 'success' : 'outline'}
                  size="lg"
                  onClick={() => setVerdict('accepted')}
                  className={verdict === 'accepted' ? 'ring-2 ring-success ring-offset-2 ring-offset-background' : ''}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Принять
                </Button>
                <Button
                  variant={verdict === 'rejected' ? 'destructive' : 'outline'}
                  size="lg"
                  onClick={() => setVerdict('rejected')}
                  className={verdict === 'rejected' ? 'ring-2 ring-destructive ring-offset-2 ring-offset-background' : ''}
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Отклонить
                </Button>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Комментарий к проверке
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Опишите сильные и слабые стороны решения. Дайте конструктивную обратную связь..."
                  rows={6}
                  className="bg-background border-border resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Минимум 10 символов
                </p>
              </div>

              {/* Submit */}
              <Button
                variant="gradient"
                size="lg"
                className="w-full"
                onClick={handleSubmitReview}
                disabled={!verdict || submitReview.isPending}
              >
                {submitReview.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Отправить проверку (+1 балл)
                  </>
                )}
              </Button>
            </div>

            {/* Guidelines */}
            <div className="p-6 rounded-xl bg-muted/50 border border-border">
              <h4 className="font-semibold mb-3">Критерии проверки</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  Код выполняет поставленную задачу
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  Код читаемый и структурированный
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  Используются правильные паттерны
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  Нет явных ошибок или уязвимостей
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
        )}
      </div>
    </div>
  );
}
