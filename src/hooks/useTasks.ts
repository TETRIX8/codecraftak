import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Task {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'java' | 'cpp';
  completions: number;
  created_at: string;
}

export interface TaskWithSolution extends Task {
  solution?: {
    id: string;
    status: 'pending' | 'accepted' | 'rejected';
    code: string;
    created_at: string;
  };
}

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
  });
}

// Хук для получения заданий с учетом решений пользователя
export function useTasksWithSolutions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tasks-with-solutions', user?.id],
    queryFn: async () => {
      // Получаем все задания
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      if (!user?.id) {
        return {
          available: tasks as Task[],
          pending: [] as TaskWithSolution[],
          completed: [] as TaskWithSolution[],
        };
      }

      // Получаем решения пользователя
      const { data: solutions, error: solutionsError } = await supabase
        .from('solutions')
        .select('id, task_id, status, code, created_at')
        .eq('user_id', user.id);

      if (solutionsError) throw solutionsError;

      // Создаем map решений по task_id
      const solutionsMap = new Map<string, typeof solutions[0]>();
      solutions?.forEach(sol => {
        // Берем последнее решение по каждой задаче
        const existing = solutionsMap.get(sol.task_id);
        if (!existing || new Date(sol.created_at) > new Date(existing.created_at)) {
          solutionsMap.set(sol.task_id, sol);
        }
      });

      // Разделяем задания на категории
      const available: Task[] = [];
      const pending: TaskWithSolution[] = [];
      const completed: TaskWithSolution[] = [];

      (tasks as Task[]).forEach(task => {
        const solution = solutionsMap.get(task.id);
        
        if (!solution) {
          // Нет решения - доступно для выполнения
          available.push(task);
        } else if (solution.status === 'pending') {
          // На проверке
          pending.push({
            ...task,
            solution: {
              id: solution.id,
              status: solution.status,
              code: solution.code,
              created_at: solution.created_at,
            },
          });
        } else {
          // Принято или отклонено
          completed.push({
            ...task,
            solution: {
              id: solution.id,
              status: solution.status,
              code: solution.code,
              created_at: solution.created_at,
            },
          });
        }
      });

      return { available, pending, completed };
    },
    enabled: true,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Task | null;
    },
    enabled: !!id,
  });
}
