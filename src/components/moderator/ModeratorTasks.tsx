import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  FileCode2, Search, ChevronDown, ChevronUp, Clock, AlertTriangle, Loader2,
  CheckCircle2, XCircle, Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

export function ModeratorTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [expandedSolution, setExpandedSolution] = useState<string | null>(null);
  const [appealDialog, setAppealDialog] = useState<{ open: boolean; solutionId: string; userId: string }>({ open: false, solutionId: '', userId: '' });
  const [appealReason, setAppealReason] = useState('');

  const { data: solutions, isLoading } = useQuery({
    queryKey: ['mod-all-tasks-solutions', statusFilter],
    queryFn: async () => {
      let q = supabase
        .from('solutions')
        .select(`
          *,
          tasks:task_id(id, title, difficulty, language),
          profiles:user_id(id, nickname, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        q = q.eq('status', statusFilter);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const createAppeal = useMutation({
    mutationFn: async ({ solutionId, userId }: { solutionId: string; userId: string }) => {
      // Check if appeal already exists
      const { data: existing } = await supabase
        .from('appeals')
        .select('id')
        .eq('solution_id', solutionId)
        .maybeSingle();

      if (existing) throw new Error('Апелляция уже существует для этого решения');

      const { error } = await supabase.from('appeals').insert({
        solution_id: solutionId,
        user_id: userId,
        reason: `[Модератор] ${appealReason}`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Апелляция создана');
      setAppealDialog({ open: false, solutionId: '', userId: '' });
      setAppealReason('');
      queryClient.invalidateQueries({ queryKey: ['mod-all-tasks-solutions'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'hard': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return '';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">На проверке</Badge>;
      case 'accepted': return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Принято</Badge>;
      case 'rejected': return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Отклонено</Badge>;
      default: return null;
    }
  };

  const filtered = solutions?.filter((sol: any) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return sol.profiles?.nickname?.toLowerCase().includes(s) || sol.tasks?.title?.toLowerCase().includes(s);
  });

  return (
    <Card className="border-violet-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode2 className="w-5 h-5 text-violet-400" />
          Все задания и решения ({filtered?.length ?? 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по нику или заданию..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="pending">На проверке</SelectItem>
              <SelectItem value="accepted">Принятые</SelectItem>
              <SelectItem value="rejected">Отклонённые</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileCode2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Нет решений</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filtered?.map((sol: any, idx: number) => (
              <motion.div
                key={sol.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => setExpandedSolution(expandedSolution === sol.id ? null : sol.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0">
                      <img
                        src={sol.profiles?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{sol.profiles?.nickname}</div>
                      <div className="text-sm text-muted-foreground truncate">{sol.tasks?.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className={getDifficultyColor(sol.tasks?.difficulty)}>
                      {sol.tasks?.difficulty}
                    </Badge>
                    {getStatusBadge(sol.status)}
                    {expandedSolution === sol.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSolution === sol.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 space-y-3">
                        <pre className="bg-secondary/50 rounded-lg p-4 overflow-x-auto text-sm font-mono max-h-[300px] overflow-y-auto border border-border">
                          {sol.code}
                        </pre>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {format(new Date(sol.created_at), 'dd MMM yyyy HH:mm', { locale: ru })}
                          <span className="mx-1">•</span>
                          Голоса: ✅ {sol.accepted_votes} / ❌ {sol.rejected_votes}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
                            onClick={() => setAppealDialog({ open: true, solutionId: sol.id, userId: sol.user_id })}
                          >
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Отправить на апелляцию
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* Appeal Dialog */}
        <Dialog open={appealDialog.open} onOpenChange={(o) => { if (!o) setAppealDialog({ open: false, solutionId: '', userId: '' }); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать апелляцию</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={appealReason}
                onChange={e => setAppealReason(e.target.value)}
                placeholder="Причина апелляции (минимум 20 символов)..."
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAppealDialog({ open: false, solutionId: '', userId: '' })}>
                  Отмена
                </Button>
                <Button
                  onClick={() => createAppeal.mutate({ solutionId: appealDialog.solutionId, userId: appealDialog.userId })}
                  disabled={appealReason.trim().length < 20 || createAppeal.isPending}
                >
                  {createAppeal.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Отправить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
