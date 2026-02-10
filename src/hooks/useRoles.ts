import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'moderator' | 'user' | 'anticheat' | 'starosta';

export function useUserRoles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data || []).map(r => r.role as AppRole);
    },
    enabled: !!user,
  });
}

export function useIsAdmin() {
  const { data: roles, isLoading } = useUserRoles();
  return {
    isAdmin: roles?.includes('admin') ?? false,
    isLoading,
  };
}

export function useIsAnticheat() {
  const { data: roles, isLoading } = useUserRoles();
  return {
    isAnticheat: (roles?.includes('anticheat') || roles?.includes('admin')) ?? false,
    isLoading,
  };
}

export function useIsStarosta() {
  const { data: roles, isLoading } = useUserRoles();
  return {
    isStarosta: (roles?.includes('starosta') || roles?.includes('admin')) ?? false,
    isLoading,
  };
}

export function useHasAnyRole() {
  const { data: roles, isLoading } = useUserRoles();
  return {
    hasRole: (roles && roles.length > 0) ?? false,
    roles: roles ?? [],
    isLoading,
  };
}
