import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function AdminTaskAssignments() {
  const queryClient = useQueryClient();
  const [taskId, setTaskId] = useState('');
  const [userId, setUserId] = useState('');

  const { data: tasks = [] } = useQuery({
    queryKey: ['admin-assignment-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tasks').select('id, title, course').order('title');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-assignment-users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id, nickname, course').eq('is_deleted', false).order('nickname');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['admin-task-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('task_assignments').select('id, task_id, user_id, created_at, tasks(title), profiles(nickname)').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const assignTask = useMutation({
    mutationFn: async () => {
      if (!taskId || !userId) throw new Error('Выберите задание и ученика');
      const { error } = await supabase.from('task_assignments').insert({ task_id: taskId, user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-task-assignments'] });
      toast.success('Задание назначено ученику');
      setTaskId('');
      setUserId('');
    },
    onError: (error: Error) => toast.error(error.message.includes('duplicate') ? 'Это задание уже назначено' : error.message),
  });

  const removeAssignment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('task_assignments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-task-assignments'] });
      toast.success('Назначение удалено');
    },
  });

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" />Индивидуальные задания</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Select value={taskId} onValueChange={setTaskId}><SelectTrigger><SelectValue placeholder="Выберите задание" /></SelectTrigger><SelectContent>{tasks.map((task) => <SelectItem key={task.id} value={task.id}>{task.title} — {task.course} курс</SelectItem>)}</SelectContent></Select>
          <Select value={userId} onValueChange={setUserId}><SelectTrigger><SelectValue placeholder="Выберите ученика" /></SelectTrigger><SelectContent>{users.map((user) => <SelectItem key={user.id} value={user.id}>{user.nickname} — {user.course} курс</SelectItem>)}</SelectContent></Select>
          <Button onClick={() => assignTask.mutate()} disabled={!taskId || !userId || assignTask.isPending}>{assignTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Назначить'}</Button>
        </div>
        <div className="space-y-2">
          {isLoading ? <Loader2 className="mx-auto animate-spin" /> : assignments.map((assignment: any) => <div key={assignment.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm"><span>{assignment.tasks?.title || 'Задание'} → {assignment.profiles?.nickname || 'Ученик'}</span><Button variant="ghost" size="icon" onClick={() => removeAssignment.mutate(assignment.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div>)}
          {!isLoading && assignments.length === 0 && <p className="text-center text-sm text-muted-foreground">Индивидуальных назначений пока нет.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
