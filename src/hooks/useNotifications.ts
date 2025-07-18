import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

const NOTIFICATIONS_CACHE_KEY = 'teamfinder_notifications_cache';

export const useNotifications = () => {
  const { user } = useAuth();
  // Load cached notifications immediately
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const cached = localStorage.getItem(NOTIFICATIONS_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [unreadCount, setUnreadCount] = useState(() => notifications.filter(n => !n.is_read).length);
  const [loading, setLoading] = useState(true);

  // Move fetchNotifications to top-level so it can be reused
  const fetchNotifications = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
      // Cache notifications
      localStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(data || []));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;

    let subscription: any;

    fetchNotifications();

    // Listen for real-time changes
    subscription = supabase
      .channel('notifications-' + user.id)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications', 
        filter: `user_id=eq.${user.id}` 
      }, (payload) => {
        console.log('Real-time notification update:', payload);
        fetchNotifications();
      })
      .subscribe();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    // Optimistic update
    setNotifications(prev => {
      const updated = prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n);
      // Update cache
      localStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error marking notification as read:', error);
      // Revert optimistic update on error
      setNotifications(prev => {
        const reverted = prev.map(n => n.id === notificationId ? { ...n, is_read: false } : n);
        localStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(reverted));
        return reverted;
      });
      setUnreadCount(prev => prev + 1);
    }
    // Always refetch to ensure badge is in sync
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    if (!user) return;

    // Optimistic update
    const unreadNotifications = notifications.filter(n => !n.is_read);
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, is_read: true }));
      localStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(0);

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert optimistic update on error
      setNotifications(prev => {
        const reverted = prev.map(n => unreadNotifications.find(u => u.id === n.id) ? { ...n, is_read: false } : n);
        localStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(reverted));
        return reverted;
      });
      setUnreadCount(unreadNotifications.length);
    }
    // Always refetch to ensure badge is in sync
    fetchNotifications();
  };

  const clearAll = async () => {
    if (!user) return;

    // Optimistic update
    const previousNotifications = [...notifications];
    setNotifications([]);
    setUnreadCount(0);
    localStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify([]));

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing all notifications:', error);
      // Revert optimistic update on error
      setNotifications(previousNotifications);
      setUnreadCount(previousNotifications.filter(n => !n.is_read).length);
      localStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(previousNotifications));
    }
    // Always refetch to ensure badge is in sync
    fetchNotifications();
  };

  const dismissNotification = async (notificationId: string) => {
    if (!user) return;

    // Optimistic update
    const notificationToRemove = notifications.find(n => n.id === notificationId);
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== notificationId);
      localStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(updated));
      return updated;
    });
    if (notificationToRemove && !notificationToRemove.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error dismissing notification:', error);
      // Revert optimistic update on error
      if (notificationToRemove) {
        setNotifications(prev => {
          const reverted = [...prev, notificationToRemove].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          localStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(reverted));
          return reverted;
        });
        if (!notificationToRemove.is_read) {
          setUnreadCount(prev => prev + 1);
        }
      }
    } else {
      fetchNotifications();
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearAll,
    dismissNotification
  };
};