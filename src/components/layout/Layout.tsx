import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { ProjectClosedOverlay } from '@/components/common/ProjectClosedOverlay';

interface LayoutProps {
  children: React.ReactNode;
}

function isArchiveRoute(pathname: string) {
  return pathname === '/' || pathname === '/leaderboard' || pathname === '/topics' || pathname.startsWith('/topics/');
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isClosed = !isArchiveRoute(location.pathname);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={cnMain(isClosed)}
        aria-hidden={isClosed}
        inert={isClosed ? true : undefined}
      >
        {children}
      </motion.main>
      {isClosed && <ProjectClosedOverlay />}
    </div>
  );
}

function cnMain(isClosed: boolean) {
  return `pt-16 ${isClosed ? 'pointer-events-none select-none opacity-30' : ''}`;
}
