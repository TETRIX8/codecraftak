import { Navbar } from './Navbar';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { WelcomePopup } from '@/components/common/WelcomePopup';
import { BanScreen } from '@/components/common/BanScreen';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  useRealtimeNotifications();

  const { data: activeBan, isLoading: banLoading } = useQuery({
    queryKey: ['user-ban-check', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_bans')
        .select('reason, expires_at')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval: 60000,
  });

  if (user && banLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (activeBan) {
    return <BanScreen reason={activeBan.reason} expiresAt={activeBan.expires_at} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <WelcomePopup />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
