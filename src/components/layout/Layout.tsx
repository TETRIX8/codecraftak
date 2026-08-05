import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { WelcomePopup } from '@/components/common/WelcomePopup';
import { BanScreen } from '@/components/common/BanScreen';
import { PendingApprovalScreen } from '@/components/common/PendingApprovalScreen';
import { NeonLoader } from '@/components/common/NeonLoader';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  useRealtimeNotifications();
  const location = useLocation();
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    setRouteLoading(true);
    const t = setTimeout(() => setRouteLoading(false), 650);
    return () => clearTimeout(t);
  }, [location.pathname]);



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

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-approval-check', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_approved')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  if (user && (banLoading || profileLoading)) {
    return <NeonLoader label="СИНХРОНИЗАЦИЯ" />;
  }

  if (activeBan) {
    return <BanScreen reason={activeBan.reason} expiresAt={activeBan.expires_at} />;
  }

  if (user && profile && !profile.is_approved) {
    return <PendingApprovalScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <WelcomePopup />
      <AnimatePresence>
        {routeLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <NeonLoader />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="pt-16"
      >
        {children}
      </motion.main>
    </div>
  );
}
