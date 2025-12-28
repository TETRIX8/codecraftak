import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DifficultyBadge, LanguageBadge } from '@/components/common/Badges';
import { MarkdownContent } from '@/components/common/MarkdownContent';
import { useTask } from '@/hooks/useTasks';
import { useSubmitSolution } from '@/hooks/useSolutions';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const languageToMonaco: Record<string, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  html: 'html',
  css: 'css',
  java: 'java',
  cpp: 'cpp',
};

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: task, isLoading: taskLoading } = useTask(id || '');
  const { data: profile } = useProfile();
  const submitSolution = useSubmitSolution();
  
  const [code, setCode] = useState('// Напишите ваше решение здесь\n\n');

  if (taskLoading) {
    return (
      <div className="min-h-screen bg-background py-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Задание не найдено</h1>
          <Link to="/tasks">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться к заданиям
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const canSubmit = user && (profile?.review_balance ?? 0) > 0;

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Необходимо войти в аккаунт');
      navigate('/auth');
      return;
    }

    if (!canSubmit) {
      toast.error('Недостаточно баллов проверки. Сначала проверьте чужое решение.');
      return;
    }

    if (code.trim().length < 10) {
      toast.error('Решение слишком короткое');
      return;
    }

    try {
      await submitSolution.mutateAsync({ taskId: task.id, code });
      toast.success('Решение отправлено на проверку!', {
        description: 'Списан 1 балл проверки. Ожидайте результата.',
      });
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при отправке решения');
    }
  };

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link to="/tasks">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к заданиям
            </Button>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Task Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <DifficultyBadge difficulty={task.difficulty} />
                <LanguageBadge language={task.language} />
              </div>
              <h1 className="text-3xl font-bold mb-4">{task.title}</h1>
              <MarkdownContent content={task.description} />
            </div>

            <div className="p-4 rounded-xl bg-card border border-border">
              <h3 className="font-semibold mb-3">Требования</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Код должен быть читаемым и хорошо структурированным
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Используйте понятные названия переменных и функций
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Добавьте комментарии для сложных участков кода
                </li>
              </ul>
            </div>

            {/* Auth Warning */}
            {!user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-primary/10 border border-primary/20"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-primary mb-1">
                      Войдите в аккаунт
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Чтобы отправить решение, необходимо войти в аккаунт.
                    </p>
                    <Link to="/auth" className="inline-block mt-2">
                      <Button variant="default" size="sm">
                        Войти
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Review Balance Warning */}
            {user && !canSubmit && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-warning/10 border border-warning/20"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-warning mb-1">
                      Недостаточно баллов проверки
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Чтобы отправить решение, необходимо сначала проверить чужое задание.
                    </p>
                    <Link to="/review" className="inline-block mt-2">
                      <Button variant="outline" size="sm">
                        Проверить решение
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Code Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Ваше решение</h2>
              {user && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Баланс: {profile?.review_balance ?? 0} балл(ов)
                </div>
              )}
            </div>

            <div className="rounded-xl overflow-hidden border border-border">
              <Editor
                height="400px"
                language={languageToMonaco[task.language] || 'javascript'}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, monospace',
                  padding: { top: 16, bottom: 16 },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>

            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              disabled={!user || !canSubmit || submitSolution.isPending}
            >
              {submitSolution.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Отправить решение (-1 балл)
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
