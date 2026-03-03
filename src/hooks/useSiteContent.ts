import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SiteContent {
  id: string;
  content_key: string;
  content_value: string;
  content_type: string;
  page: string;
  label: string;
  styles: Record<string, string>;
  updated_at: string;
  updated_by: string | null;
}

export function useSiteContent() {
  return useQuery({
    queryKey: ['site-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('page');
      if (error) throw error;
      return data as SiteContent[];
    },
  });
}

export function useSiteContentByKey(key: string) {
  const { data: allContent } = useSiteContent();
  return allContent?.find(c => c.content_key === key)?.content_value;
}

export function useSiteContentMap() {
  const { data: allContent, isLoading } = useSiteContent();
  const map: Record<string, string> = {};
  allContent?.forEach(c => {
    map[c.content_key] = c.content_value;
  });
  return { content: map, isLoading };
}

export function useUpdateSiteContent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: { content_key: string; content_value: string; styles?: Record<string, string> }[]) => {
      for (const update of updates) {
        const { error } = await supabase
          .from('site_content')
          .update({
            content_value: update.content_value,
            styles: update.styles || {},
            updated_at: new Date().toISOString(),
            updated_by: user?.id,
          })
          .eq('content_key', update.content_key);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
    },
  });
}
