import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    permission,
    requestPermission,
    markAsRead,
    markAllAsRead,
  } = usePushNotifications();
  
  const [open, setOpen] = useState(false);
  const [hasAskedPermission, setHasAskedPermission] = useState(false);

  // Ask for permission on first interaction if not already granted/denied
  useEffect(() => {
    const asked = localStorage.getItem('notification-permission-asked');
    if (asked) {
      setHasAskedPermission(true);
    }
  }, []);

  const handleAskPermission = async () => {
    await requestPermission();
    localStorage.setItem('notification-permission-asked', 'true');
    setHasAskedPermission(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'error':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      default:
        return 'bg-primary/10 border-primary/20 text-primary';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Уведомления</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsRead()}
                className="text-xs"
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Прочитать все
              </Button>
            )}
          </div>
          
          {/* Permission request */}
          {permission !== 'granted' && !hasAskedPermission && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20"
            >
              <p className="text-xs text-muted-foreground mb-2">
                Включите уведомления, чтобы не пропускать важные события
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="gradient" onClick={handleAskPermission}>
                  Включить
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    localStorage.setItem('notification-permission-asked', 'true');
                    setHasAskedPermission(true);
                  }}
                >
                  Позже
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          {notifications && notifications.length > 0 ? (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.is_read ? 'bg-muted/30' : ''
                  }`}
                  onClick={() => {
                    if (!notification.is_read) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                      notification.is_read ? 'bg-muted-foreground/30' : 'bg-primary'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getTypeColor(notification.type)}`}>
                          {notification.is_global ? '📢 Всем' : 'Личное'}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <span className="text-xs text-muted-foreground/60 mt-2 block">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: ru,
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Нет уведомлений</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
