import { useEffect, useState, useCallback, useRef } from 'react';
import Disclaimer from '@/pages/Disclaimer';

export function DevToolsGuard({ children }: { children: React.ReactNode }) {
  const [showWarning, setShowWarning] = useState(false);
  const devtoolsCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerWarning = useCallback(() => {
    setShowWarning(true);
  }, []);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
  }, []);

  useEffect(() => {
    // Block keyboard shortcuts for dev tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning();
        return false;
      }

      // Ctrl+Shift+I (Inspect)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning();
        return false;
      }

      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning();
        return false;
      }

      // Ctrl+Shift+C (Element picker)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning();
        return false;
      }

      // Ctrl+U (View source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning();
        return false;
      }

      // Cmd+Option+I (macOS Inspect)
      if (e.metaKey && e.altKey && e.key === 'i') {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning();
        return false;
      }

      // Cmd+Option+J (macOS Console)
      if (e.metaKey && e.altKey && e.key === 'j') {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning();
        return false;
      }

      // Cmd+Option+C (macOS Element picker)
      if (e.metaKey && e.altKey && e.key === 'c') {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning();
        return false;
      }

      // Cmd+Option+U (macOS View source)
      if (e.metaKey && e.altKey && e.key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning();
        return false;
      }
    };

    // Block right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerWarning();
      return false;
    };

    // Detect devtools via window size difference (outer vs inner)
    const checkDevTools = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;

      if (widthDiff > threshold || heightDiff > threshold) {
        triggerWarning();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);

    // Periodic devtools size check
    devtoolsCheckRef.current = setInterval(checkDevTools, 1000);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      if (devtoolsCheckRef.current) {
        clearInterval(devtoolsCheckRef.current);
      }
    };
  }, [triggerWarning]);

  // Disable console methods to discourage usage
  useEffect(() => {
    const noop = () => {};
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug,
    };

    // Override console methods in production
    if (import.meta.env.PROD) {
      console.log = noop;
      console.warn = noop;
      console.error = noop;
      console.info = noop;
      console.debug = noop;
    }

    return () => {
      // Restore on cleanup
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.info = originalConsole.info;
      console.debug = originalConsole.debug;
    };
  }, []);

  return (
    <>
      {showWarning && <Disclaimer onDismiss={dismissWarning} />}
      <div className={showWarning ? 'hidden' : undefined}>{children}</div>
    </>
  );
}
