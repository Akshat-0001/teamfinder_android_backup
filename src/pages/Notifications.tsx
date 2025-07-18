import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Trash2, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import LoadingShimmer from '@/components/LoadingShimmer';
import { useState } from 'react';

const Notifications = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, clearAll, dismissNotification } = useNotifications();
  const [swipedNotifications, setSwipedNotifications] = useState<Set<string>>(new Set());

  if (loading && notifications.length === 0) {
    return (
      <div className="mobile-container bg-background">
        <div className="container mx-auto px-4 py-6 max-w-lg">
          <LoadingShimmer />
        </div>
      </div>
    );
  }

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    await clearAll();
  };

  const handleDismiss = async (notificationId: string) => {
    await dismissNotification(notificationId);
  };

  const handleSwipeStart = (notificationId: string, e: React.TouchEvent) => {
    const touch = e.touches[0];
    const element = e.currentTarget as HTMLElement;
    element.dataset.startX = touch.clientX.toString();
    element.dataset.startY = touch.clientY.toString();
  };

  const handleSwipeMove = (notificationId: string, e: React.TouchEvent) => {
    const touch = e.touches[0];
    const element = e.currentTarget as HTMLElement;
    const startX = parseFloat(element.dataset.startX || '0');
    const startY = parseFloat(element.dataset.startY || '0');
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    
    // Only trigger horizontal swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      element.style.transform = `translateX(${deltaX}px)`;
      element.style.opacity = Math.max(0.3, 1 - Math.abs(deltaX) / 200).toString();
    }
  };

  const handleSwipeEnd = (notificationId: string, e: React.TouchEvent) => {
    const element = e.currentTarget as HTMLElement;
    const startX = parseFloat(element.dataset.startX || '0');
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;
    
    if (Math.abs(deltaX) > 100) {
      // Swipe threshold reached - dismiss
      setSwipedNotifications(prev => new Set([...prev, notificationId]));
      setTimeout(() => handleDismiss(notificationId), 300);
    } else {
      // Reset position
      element.style.transform = '';
      element.style.opacity = '';
    }
  };

  return (
    <div className="mobile-container bg-background">

      {/* Content */}
      <main className="mobile-content mobile-scroll">
        <div className="container mx-auto px-4 py-6 max-w-lg">
          {/* Page Title */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                Notifications
                {loading && notifications.length > 0 && (
                  <span className="ml-2 animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></span>
                )}
              </h1>
            </div>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {/* Action Buttons */}
          {notifications.length > 0 && (
            <div className="flex gap-2 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="flex-1"
                disabled={unreadCount === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </Button>
            </div>
          )}

          {/* Notifications List */}
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <div className="text-4xl mb-2">🔔</div>
                    <h3 className="font-medium mb-1">No notifications</h3>
                    <p className="text-sm">You're all caught up!</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-md relative overflow-hidden ${
                    !notification.is_read ? 'bg-primary/5 border-primary/20' : 'opacity-60'
                  } ${swipedNotifications.has(notification.id) ? 'animate-fade-out' : ''}`}
                  onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                  onTouchStart={(e) => handleSwipeStart(notification.id, e)}
                  onTouchMove={(e) => handleSwipeMove(notification.id, e)}
                  onTouchEnd={(e) => handleSwipeEnd(notification.id, e)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm leading-tight">
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismiss(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;