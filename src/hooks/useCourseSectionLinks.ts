import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type CourseTaskStatus = 'locked' | 'available' | 'pending' | 'reviewing' | 'rejected' | 'accepted';

export interface CourseSectionTaskLink {
  id: string;
  course_slug: string;
  section_id: string;
  section_title: string;
  section_position: number;
  task_id: string;
  tasks?: {
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    language: string;
  } | null;
}

interface UserSolution {
  id: string;
  task_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  reviews_count: number;
  accepted_votes: number;
  rejected_votes: number;
  created_at: string;
}

export interface CourseSectionProgress extends CourseSectionTaskLink {
  status: CourseTaskStatus;
  solution?: UserSolution;
  isUnlocked: boolean;
}

export function sectionSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]+/gi, '-')
    .replace(/^-|-$/g, '');
}

export function useCourseSectionProgress(courseSlug: string, userId?: string) {
  return useQuery({
    queryKey: ['course-section-progress', courseSlug, userId],
    queryFn: async (): Promise<CourseSectionProgress[]> => {
      const { data: links, error: linksError } = await supabase
        .from('course_section_task_links')
        .select('*, tasks(id, title, description, difficulty, language)')
        .eq('course_slug', courseSlug)
        .order('section_position', { ascending: true });
      if (linksError) throw linksError;

      if (!userId || !links?.length) {
        return (links || []).map((link, index) => ({
          ...link,
          status: index === 0 ? 'available' : 'locked',
          isUnlocked: index === 0,
        })) as CourseSectionProgress[];
      }

      const taskIds = links.map(link => link.task_id);
      const { data: solutions, error: solutionsError } = await supabase
        .from('solutions')
        .select('id, task_id, status, reviews_count, accepted_votes, rejected_votes, created_at')
        .eq('user_id', userId)
        .in('task_id', taskIds)
        .order('created_at', { ascending: false });
      if (solutionsError) throw solutionsError;

      const latest = new Map<string, UserSolution>();
      (solutions || []).forEach(solution => {
        if (!latest.has(solution.task_id)) latest.set(solution.task_id, solution as UserSolution);
      });

      let previousAccepted = true;
      return (links || []).map(link => {
        const solution = latest.get(link.task_id);
        const isUnlocked = previousAccepted;
        const status: CourseTaskStatus = !isUnlocked
          ? 'locked'
          : !solution
            ? 'available'
            : solution.status === 'accepted'
              ? 'accepted'
              : solution.status === 'rejected'
                ? 'rejected'
                : solution.reviews_count > 0
                  ? 'reviewing'
                  : 'pending';
        previousAccepted = Boolean(solution?.status === 'accepted');
        return { ...link, solution, status, isUnlocked } as CourseSectionProgress;
      });
    },
    enabled: !!courseSlug,
  });
}

export function useCourseTaskLinksAdmin() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const linksQuery = useQuery({
    queryKey: ['course-section-task-links-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_section_task_links')
        .select('*, tasks(id, title, language)')
        .order('course_slug')
        .order('section_position');
      if (error) throw error;
      return data as CourseSectionTaskLink[];
    },
    enabled: !!user,
  });

  const saveLink = useMutation({
    mutationFn: async (input: { courseSlug: string; sectionId: string; sectionTitle: string; sectionPosition: number; taskId: string }) => {
      const { data, error } = await supabase
        .from('course_section_task_links')
        .upsert({
          course_slug: input.courseSlug,
          section_id: input.sectionId,
          section_title: input.sectionTitle,
          section_position: input.sectionPosition,
          task_id: input.taskId,
        }, { onConflict: 'course_slug,section_id' })
        .select('*, tasks(id, title, language)')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-section-task-links-admin'] });
      queryClient.invalidateQueries({ queryKey: ['course-section-progress'] });
    },
  });

  const removeLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('course_section_task_links').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-section-task-links-admin'] });
      queryClient.invalidateQueries({ queryKey: ['course-section-progress'] });
    },
  });

  return { ...linksQuery, saveLink, removeLink };
}
