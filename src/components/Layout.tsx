import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import FloatingActionButton from '@/components/FloatingActionButton';
import PageTransition from '@/components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  User, 
  Settings, 
  LogOut,
  Users,
  Search,
  Bell
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';

const Layout = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Match full path segment (so /profile matches /profile and /profile/edit, but not /profiled)
  const isActive = (path: string) => {
    const current = location.pathname;
    if (current === path) return true;
    // Only match if next char is / or end of string
    return current.startsWith(path + '/') && (path !== '/');
  };

  return (
    <div className="mobile-container bg-background no-copy no-drag">
      {/* Header */}
      <motion.header 
        className="mobile-header bg-card/80 backdrop-blur-lg border-b border-border/50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Only .mobile-header should have safe area top padding. Do not add padding-top elsewhere. */}
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/home" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dmz1x7at4/image/upload/cropped_circle_image-min_xiyyo5.png"
                  alt="TeamFinder Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-xl text-foreground">TeamFinder</span>
            </Link>
          </motion.div>

          <div className="flex items-center space-x-2">
            {/* Notification Bell Icon */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link to="/notifications">
                <Button variant="ghost" size="icon" className="touch-target relative">
                  <Bell className="h-5 w-5" />
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </Link>
            </motion.div>
            {/* Search Icon */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link to="/search">
                <Button variant="ghost" size="icon" className="touch-target">
                  <Search className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="mobile-content mobile-scroll">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Bottom Navigation */}
      <motion.nav 
        className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-t border-border/50 safe-area-bottom-fixed"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link to="/home">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex-col h-12 w-16 touch-target transition-all duration-200 ${
                    isActive('/home') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Home className="h-5 w-5" />
                  <span className="text-xs">Home</span>
                  {isActive('/home') && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 w-1 h-1 bg-primary rounded-full"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link to="/my-teams">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex-col h-12 w-16 touch-target transition-all duration-200 ${
                    isActive('/my-teams') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Users className="h-5 w-5 mx-auto" />
                  <span className="text-xs">My Teams</span>
                  {isActive('/my-teams') && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 w-1 h-1 bg-primary rounded-full"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link to="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex-col h-12 w-16 touch-target transition-all duration-200 ${
                    isActive('/profile') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span className="text-xs">Profile</span>
                  {isActive('/profile') && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 w-1 h-1 bg-primary rounded-full"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link to="/settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex-col h-12 w-16 touch-target transition-all duration-200 ${
                    isActive('/settings') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <span className="text-xs">Settings</span>
                  {isActive('/settings') && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 w-1 h-1 bg-primary rounded-full"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>
    </div>
  );
};

export default Layout;