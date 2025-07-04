import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  User, 
  Settings, 
  LogOut,
  MessageSquare,
  Search
} from 'lucide-react';

const Layout = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/home" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-sm">TF</span>
            </div>
            <span className="font-bold text-xl text-foreground">TeamFinder</span>
          </Link>

          <div className="flex items-center space-x-2">
            <Link to="/search">
              <Button variant="ghost" size="icon" className="touch-target">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="touch-target"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-card/80 backdrop-blur-lg border-t border-border/50 sticky bottom-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            <Link to="/home">
              <Button
                variant="ghost"
                size="sm"
                className={`flex-col h-12 w-16 ${
                  isActive('/home') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Home className="h-5 w-5" />
                <span className="text-xs">Home</span>
              </Button>
            </Link>

            <Link to="/my-teams">
              <Button
                variant="ghost"
                size="sm"
                className={`flex-col h-12 w-16 ${
                  isActive('/my-teams') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <MessageSquare className="h-5 w-5" />
                <span className="text-xs">My Teams</span>
              </Button>
            </Link>

            <Link to="/profile">
              <Button
                variant="ghost"
                size="sm"
                className={`flex-col h-12 w-16 ${
                  isActive('/profile') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <User className="h-5 w-5" />
                <span className="text-xs">Profile</span>
              </Button>
            </Link>

            <Link to="/settings">
              <Button
                variant="ghost"
                size="sm"
                className={`flex-col h-12 w-16 ${
                  isActive('/settings') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Settings className="h-5 w-5" />
                <span className="text-xs">Settings</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;