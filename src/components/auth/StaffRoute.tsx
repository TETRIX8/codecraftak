import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { AppRole, useUserRoles } from '@/hooks/useRoles';

interface StaffRouteProps {
  allowedRoles: AppRole[];
  children: ReactNode;
}

/**
 * Prevents rendering staff panels before the signed-in user's role is verified.
 * This is a UX guard only; the database remains the authorization boundary.
 */
export function StaffRoute({ allowedRoles, children }: StaffRouteProps) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: roles, isLoading: rolesLoading } = useUserRoles();
  const notifiedRef = useRef(false);

  const isAllowed = useMemo(() => {
    if (!user) return false;
    const userRoles = roles ?? [];
    return userRoles.includes('admin') || allowedRoles.some((role) => userRoles.includes(role));
  }, [allowedRoles, roles, user]);

  const isCheckingAccess = authLoading || (Boolean(user) && rolesLoading);

  useEffect(() => {
    if (isCheckingAccess || isAllowed || notifiedRef.current) return;

    notifiedRef.current = true;
    toast.error('А-та-та, шалунишка! Эта панель доступна только сотрудникам.');
    navigate('/', { replace: true });
  }, [isAllowed, isCheckingAccess, navigate]);

  if (isCheckingAccess) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" aria-live="polite">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Проверяем доступ" />
      </div>
    );
  }

  if (!isAllowed) return null;

  return <>{children}</>;
}
