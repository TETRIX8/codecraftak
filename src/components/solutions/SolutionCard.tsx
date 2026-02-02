import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge, DifficultyBadge, LanguageBadge } from '@/components/common/Badges';
import { SolutionWithTask, useSolutionReviews, useResubmitSolution } from '@/hooks/useSolutions';
import { useProfile } from '@/hooks/useProfile';
import { AppealDialog } from '@/components/solutions/AppealDialog';
import { toast } from 'sonner';

interface SolutionCardProps {
  solution: SolutionWithTask;
}

const languageToMonaco: Record<string, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  html: 'html',
  css: 'css',
  java: 'java',
  cpp: 'cpp',
};

export function SolutionCard({ solution }: SolutionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(solution.code);
  
  const { data: reviews, isLoading: reviewsLoading } = useSolutionReviews(solution.id);
  const { data: profile } = useProfile();
  const resubmit = useResubmitSolution();

  const canResubmit = solution.status === 'rejected' && (profile?.review_balance ?? 0) > 0;

  const handleResubmit = async () => {
    if (!canResubmit) {
      toast.error('Недостаточно баллов проверки');
      return;
    }

    try {
      await resubmit.mutateAsync({ solutionId: solution.id, code: editedCode });
      toast.success('Решение отправлено на повторную проверку!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при отправке');
    }
  };

  const getStatusIcon = () => {
    switch (solution.status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-warning" />;
    }
  };

  return (
    <motion.div
      layout
      className="rounded-xl bg-card border border-border overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          {getStatusIcon()}
          <div>
            <div className="font-medium">{solution.tasks?.title || 'Задание'}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span>{new Date(solution.created_at).toLocaleDateString('ru-RU')}</span>
              <span>•</span>
              <span>{solution.reviews_count} проверок</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {solution.tasks && (
            <div className="hidden sm:flex gap-2">
              <DifficultyBadge difficulty={solution.tasks.difficulty} />
              <LanguageBadge language={solution.tasks.language as any} />
            </div>
          )}
          <StatusBadge status={solution.status} />
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border"
          >
            {/* Votes Summary */}
            <div className="p-4 bg-muted/20 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm">{solution.accepted_votes} принято</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm">{solution.rejected_votes} отклонено</span>
              </div>
            </div>

            {/* Reviews */}
            <div className="p-4 space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Отзывы проверяющих
              </h4>
              
              {reviewsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div 
                      key={review.id}
                      className="p-3 rounded-lg bg-muted/30 border border-border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={review.profiles?.avatar_url}
                            alt={review.profiles?.nickname}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm font-medium">
                            {review.profiles?.nickname}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({review.profiles?.level})
                          </span>
                        </div>
                        <div className={`flex items-center gap-1 text-sm ${
                          review.verdict === 'accepted' ? 'text-success' : 'text-destructive'
                        }`}>
                          {review.verdict === 'accepted' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          {review.verdict === 'accepted' ? 'Принято' : 'Отклонено'}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Отзывов пока нет</p>
              )}
            </div>

            {/* Code */}
            <div className="p-4 border-t border-border">
              <h4 className="font-semibold mb-3">Ваш код</h4>
              <div className="rounded-lg overflow-hidden border border-border">
                <Editor
                  height="200px"
                  language={languageToMonaco[solution.tasks?.language] || 'javascript'}
                  value={isEditing ? editedCode : solution.code}
                  onChange={(value) => setEditedCode(value || '')}
                  theme="vs-dark"
                  options={{
                    readOnly: !isEditing,
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: 'JetBrains Mono, monospace',
                    padding: { top: 12, bottom: 12 },
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>

            {/* Resubmit Actions */}
            {solution.status === 'rejected' && (
              <div className="p-4 border-t border-border bg-destructive/5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="font-medium text-destructive">Решение отклонено</p>
                    <p className="text-sm text-muted-foreground">
                      Исправьте код или оспорьте решение
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsEditing(false);
                            setEditedCode(solution.code);
                          }}
                        >
                          Отмена
                        </Button>
                        <Button 
                          variant="gradient" 
                          onClick={handleResubmit}
                          disabled={resubmit.isPending || !canResubmit}
                        >
                          {resubmit.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Отправить
                        </Button>
                      </>
                    ) : (
                      <>
                        <AppealDialog solutionId={solution.id} />
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(true)}
                          disabled={!canResubmit}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Пересдать
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {!canResubmit && (profile?.review_balance ?? 0) < 1 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Для пересдачи нужен минимум 1 балл проверки
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
