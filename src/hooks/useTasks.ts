import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'java' | 'cpp';
  completions: number;
  created_at: string;
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
