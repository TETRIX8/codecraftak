import { Navbar } from './Navbar';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { WelcomePopup } from '@/components/common/WelcomePopup';
import { DevToolsGuard } from '@/components/common/DevToolsGuard';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Enable realtime notifications for logged-in users
  useRealtimeNotifications();

  return (
    <DevToolsGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        <WelcomePopup />
        <main className="pt-16">
          {children}
        </main>
      </div>
    </DevToolsGuard>
  );
}
