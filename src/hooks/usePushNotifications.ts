import { useEffect, useState, useCallback } from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  is_global: boolean;
  created_at: string;
  sender_id: string | null;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Ваш браузер не поддерживает уведомления');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Уведомления включены!');
        return true;
      } else if (result === 'denied') {
        toast.error('Уведомления заблокированы. Включите их в настройках браузера.');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Ошибка при запросе разрешения');
      return false;
    }
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((title: string, body: string, icon?: string) => {
    if (permission !== 'granted') return;

    try {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        tag: 'code-craft-notification',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [permission]);

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},is_global.eq.true`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id,
  });

  // Mark as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .or(`user_id.eq.${user.id},is_global.eq.true`)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Все уведомления прочитаны');
    },
  });

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up push notifications listener for user:', user.id);

    const channel = supabase
      .channel('push-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Check if this notification is for the current user
          if (newNotification.user_id === user.id || newNotification.is_global) {
            console.log('New notification received:', newNotification);
            
            // Show browser notification
            showBrowserNotification(
              newNotification.title,
              newNotification.message
            );
            
            // Show toast
            toast(newNotification.title, {
              description: newNotification.message,
              duration: 5000,
            });
            
            // Refresh notifications list
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          }
        }
      )
      .subscribe((status) => {
        console.log('Push notifications subscription status:', status);
      });

    return () => {
      console.log('Cleaning up push notifications subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient, showBrowserNotification]);

  const unreadCount = notifications?.filter(n => !n.is_read).length ?? 0;

  return {
    notifications,
    unreadCount,
    isLoading,
    permission,
    requestPermission,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    showBrowserNotification,
  };
}

// Hook for admin to send notifications
export function useAdminNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const sendToAll = useMutation({
    mutationFn: async ({ title, message, type = 'info' }: { title: string; message: string; type?: string }) => {
      const { error } = await supabase.from('notifications').insert({
        title,
        message,
        type,
        is_global: true,
        sender_id: user?.id,
        user_id: null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Уведомление отправлено всем пользователям');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при отправке уведомления');
    },
  });

  const sendToUser = useMutation({
    mutationFn: async ({ userId, title, message, type = 'info' }: { userId: string; title: string; message: string; type?: string }) => {
      const { error } = await supabase.from('notifications').insert({
        title,
        message,
        type,
        is_global: false,
        sender_id: user?.id,
        user_id: userId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Уведомление отправлено');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при отправке уведомления');
    },
  });

  return {
    sendToAll: sendToAll.mutate,
    sendToUser: sendToUser.mutate,
    isSending: sendToAll.isPending || sendToUser.isPending,
  };
}
