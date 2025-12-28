import { Navbar } from './Navbar';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Enable realtime notifications for logged-in users
  useRealtimeNotifications();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
