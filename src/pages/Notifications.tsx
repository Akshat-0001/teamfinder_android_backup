import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Trash2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import LoadingShimmer from '@/components/LoadingShimmer';

const Notifications = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, clearAll } = useNotifications();

  if (loading) {
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

  return (
    <div className="mobile-container bg-background">
      {/* Header */}
      <header className="mobile-header bg-card/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/home">
              <Button variant="ghost" size="icon" className="touch-target">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dmz1x7at4/image/upload/cropped_circle_image-min_xiyyo5.png"
                  alt="TeamFinder Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-xl text-foreground">TeamFinder</span>
            </div>
          </div>

          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="mobile-content mobile-scroll">
        <div className="container mx-auto px-4 py-6 max-w-lg">
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
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    !notification.is_read ? 'bg-primary/5 border-primary/20' : 'opacity-60'
                  }`}
                  onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm leading-tight">
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
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