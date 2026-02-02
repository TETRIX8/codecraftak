import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  MessageSquare,
  User as UserIcon,
  Gavel
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DifficultyBadge, LanguageBadge } from '@/components/common/Badges';
import { usePendingAppeals, useResolveAppeal, AppealWithDetails } from '@/hooks/useAppeals';
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

function AppealCard({ appeal }: { appeal: AppealWithDetails }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const resolveAppeal = useResolveAppeal();

  // Get reviewers who voted to reject (they were "wrong" if we accept the appeal)
  const rejectReviewers = appeal.reviews?.filter(r => r.verdict === 'rejected') || [];

  const handleResolve = async (decision: 'approved' | 'rejected') => {
    if (!comment.trim()) {
      toast.error('Добавьте комментарий к решению');
      return;
    }

    try {
      await resolveAppeal.mutateAsync({
        appealId: appeal.id,
        decision,
        comment,
        solutionId: appeal.solution_id,
        incorrectReviewerIds: decision === 'approved' ? selectedReviewers : [],
      });
      toast.success(decision === 'approved' ? 'Апелляция принята' : 'Апелляция отклонена');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при обработке апелляции');
    }
  };

  const toggleReviewer = (reviewerId: string) => {
    setSelectedReviewers(prev =>
      prev.includes(reviewerId)
        ? prev.filter(id => id !== reviewerId)
        : [...prev, reviewerId]
    );
  };

  return (
    <motion.div
      layout
      className="rounded-xl bg-card border border-warning/30 overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <div>
            <div className="font-medium">{appeal.solutions?.tasks?.title || 'Задание'}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span>от {appeal.profiles?.nickname}</span>
              <span>•</span>
              <span>{new Date(appeal.created_at).toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {appeal.solutions?.tasks && (
            <div className="hidden sm:flex gap-2">
              <DifficultyBadge difficulty={appeal.solutions.tasks.difficulty as any} />
              <LanguageBadge language={appeal.solutions.tasks.language as any} />
            </div>
          )}
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
            {/* Appeal Reason */}
            <div className="p-4 bg-warning/5 border-b border-border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Причина апелляции
              </h4>
              <p className="text-sm text-muted-foreground">{appeal.reason}</p>
            </div>

            {/* Reviews */}
            <div className="p-4 border-b border-border">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Проверки решения
              </h4>
              <div className="space-y-3">
                {appeal.reviews?.map((review) => (
                  <div 
                    key={review.id}
                    className="p-3 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={review.reviewer?.avatar_url}
                          alt={review.reviewer?.nickname}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm font-medium">
                          {review.reviewer?.nickname}
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
                )) || <p className="text-sm text-muted-foreground">Проверок нет</p>}
              </div>
            </div>

            {/* Solution Code */}
            <div className="p-4 border-b border-border">
              <h4 className="font-semibold mb-3">Код решения</h4>
              <div className="rounded-lg overflow-hidden border border-border">
                <Editor
                  height="200px"
                  language={languageToMonaco[appeal.solutions?.tasks?.language] || 'javascript'}
                  value={appeal.solutions?.code || ''}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: 'JetBrains Mono, monospace',
                    padding: { top: 12, bottom: 12 },
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>

            {/* Penalize Reviewers Section */}
            {rejectReviewers.length > 0 && (
              <div className="p-4 border-b border-border bg-destructive/5">
                <h4 className="font-semibold mb-3 text-destructive flex items-center gap-2">
                  <Gavel className="w-4 h-4" />
                  Штрафовать проверяющих (при принятии апелляции)
                </h4>
                <div className="space-y-2">
                  {rejectReviewers.map((review) => (
                    <div key={review.id} className="flex items-center gap-3">
                      <Checkbox
                        id={`reviewer-${review.reviewer_id}`}
                        checked={selectedReviewers.includes(review.reviewer_id)}
                        onCheckedChange={() => toggleReviewer(review.reviewer_id)}
                      />
                      <label
                        htmlFor={`reviewer-${review.reviewer_id}`}
                        className="text-sm flex items-center gap-2 cursor-pointer"
                      >
                        <img
                          src={review.reviewer?.avatar_url}
                          alt={review.reviewer?.nickname}
                          className="w-5 h-5 rounded-full"
                        />
                        {review.reviewer?.nickname}
                        <span className="text-muted-foreground">(-1 балл)</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Form */}
            <div className="p-4">
              <h4 className="font-semibold mb-3">Решение по апелляции</h4>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Комментарий к решению..."
                rows={3}
                className="mb-4"
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                  onClick={() => handleResolve('rejected')}
                  disabled={resolveAppeal.isPending}
                >
                  {resolveAppeal.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <XCircle className="w-4 h-4 mr-2" />
                  Отклонить апелляцию
                </Button>
                <Button
                  variant="gradient"
                  className="flex-1"
                  onClick={() => handleResolve('approved')}
                  disabled={resolveAppeal.isPending}
                >
                  {resolveAppeal.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Принять апелляцию
                </Button>
              </div>
              {selectedReviewers.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  При принятии апелляции: автору +5 баллов, выбранным проверяющим -1 балл каждому
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function AdminAppeals() {
  const { data: appeals, isLoading } = usePendingAppeals();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Апелляции
          {appeals && appeals.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-warning/20 text-warning">
              {appeals.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : appeals && appeals.length > 0 ? (
          <div className="space-y-4">
            {appeals.map((appeal) => (
              <AppealCard key={appeal.id} appeal={appeal} />
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            Нет ожидающих апелляций
          </p>
        )}
      </CardContent>
    </Card>
  );
}
