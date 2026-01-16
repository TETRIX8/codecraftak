import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2, CheckCircle2, XCircle, Eye, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SolutionWithDetails {
  id: string;
  code: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  accepted_votes: number;
  rejected_votes: number;
  task: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    nickname: string;
    avatar_url: string | null;
  };
}

export function AdminSolutions() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSolution, setSelectedSolution] = useState<SolutionWithDetails | null>(null);
  const [filter, setFilter] = useState<'all' | 'rejected' | 'pending'>('rejected');

  const { data: solutions, isLoading } = useQuery({
    queryKey: ['admin-solutions', filter],
    queryFn: async () => {
      let query = supabase
        .from('solutions')
        .select(`
          id,
          code,
          status,
          created_at,
          accepted_votes,
          rejected_votes,
          task:tasks(id, title),
          user:profiles(id, nickname, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as SolutionWithDetails[];
    },
  });

  const updateSolutionStatus = useMutation({
    mutationFn: async ({ solutionId, newStatus }: { solutionId: string; newStatus: 'accepted' | 'rejected' | 'pending' }) => {
      const { error } = await supabase
        .from('solutions')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', solutionId);
      if (error) throw error;

      // If accepting a previously rejected solution, give +5 balance to author
      if (newStatus === 'accepted') {
        const solution = solutions?.find(s => s.id === solutionId);
        if (solution?.user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('review_balance')
            .eq('id', solution.user.id)
            .single();

          if (profile) {
            await supabase
              .from('profiles')
              .update({ 
                review_balance: (profile.review_balance || 0) + 5 
              })
              .eq('id', solution.user.id);
          }
        }
      }

      return newStatus;
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['admin-solutions'] });
      queryClient.invalidateQueries({ queryKey: ['solutions'] });
      queryClient.invalidateQueries({ queryKey: ['user-solutions'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      const statusText = newStatus === 'accepted' ? 'принято' : newStatus === 'rejected' ? 'отклонено' : 'на проверке';
      toast.success(`Решение ${statusText}`);
      setSelectedSolution(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при обновлении статуса');
    },
  });

  const filteredSolutions = solutions?.filter(solution =>
    solution.task?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    solution.user?.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-success/20 text-success border-success/30">Принято</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Отклонено</Badge>;
      default:
        return <Badge className="bg-warning/20 text-warning border-warning/30">На проверке</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          Управление решениями
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('rejected')}
          >
            <XCircle className="w-4 h-4 mr-1" />
            Отклонённые
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            На проверке
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Все
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по заданию или автору..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {filteredSolutions?.map(solution => (
              <div
                key={solution.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => setSelectedSolution(solution)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={solution.user?.avatar_url || undefined} />
                    <AvatarFallback>{solution.user?.nickname?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{solution.task?.title || 'Без названия'}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {solution.user?.nickname || 'Неизвестный'} • {new Date(solution.created_at).toLocaleDateString('ru')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    +{solution.accepted_votes}/-{solution.rejected_votes}
                  </span>
                  {getStatusBadge(solution.status)}
                </div>
              </div>
            ))}
            {filteredSolutions?.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Решения не найдены
              </p>
            )}
          </div>
        )}

        <Dialog open={!!selectedSolution} onOpenChange={(open) => !open && setSelectedSolution(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Просмотр решения
              </DialogTitle>
            </DialogHeader>
            {selectedSolution && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedSolution.user?.avatar_url || undefined} />
                      <AvatarFallback>{selectedSolution.user?.nickname?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedSolution.user?.nickname}</p>
                      <p className="text-sm text-muted-foreground">{selectedSolution.task?.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Голоса: +{selectedSolution.accepted_votes}/-{selectedSolution.rejected_votes}
                    </span>
                    {getStatusBadge(selectedSolution.status)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Код решения</label>
                  <ScrollArea className="h-[300px] rounded-lg border bg-muted/30 p-4">
                    <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                      {selectedSolution.code}
                    </pre>
                  </ScrollArea>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => updateSolutionStatus.mutate({ 
                      solutionId: selectedSolution.id, 
                      newStatus: 'pending' 
                    })}
                    disabled={updateSolutionStatus.isPending || selectedSolution.status === 'pending'}
                  >
                    На проверку
                  </Button>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => updateSolutionStatus.mutate({ 
                      solutionId: selectedSolution.id, 
                      newStatus: 'rejected' 
                    })}
                    disabled={updateSolutionStatus.isPending || selectedSolution.status === 'rejected'}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Отклонить
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={() => updateSolutionStatus.mutate({ 
                      solutionId: selectedSolution.id, 
                      newStatus: 'accepted' 
                    })}
                    disabled={updateSolutionStatus.isPending || selectedSolution.status === 'accepted'}
                  >
                    {updateSolutionStatus.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Принять
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}