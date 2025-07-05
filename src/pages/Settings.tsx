import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Settings as SettingsIcon, Palette, Waves, Trees, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import BugReport from '@/components/BugReport';

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('system');

  const themes = [
    { id: 'light', name: 'Light', icon: Sun, description: 'Blue Lagoon - Clean and bright' },
    { id: 'dark', name: 'Dark', icon: Moon, description: 'Electric Indigo - Sleek and modern' },
    { id: 'theme-ocean', name: 'Ocean Sunset', icon: Waves, description: 'Tropical vibes with warm accents' },
    { id: 'theme-forest', name: 'Forest', icon: Trees, description: 'Natural greens and earth tones' },
    { id: 'theme-cosmic', name: 'Cosmic', icon: Sparkles, description: 'Deep space with vibrant purples' }
  ];

  useEffect(() => {
    setCurrentTheme(theme || 'system');
  }, [theme]);

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    setTheme(themeId);
    
    // Apply custom theme classes
    document.documentElement.className = document.documentElement.className
      .replace(/theme-\w+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (themeId.startsWith('theme-')) {
      document.documentElement.classList.add(themeId);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="touch-target"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Customize your app experience</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Themes</CardTitle>
            </div>
            <CardDescription>
              Choose your perfect color palette
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {themes.map((themeOption) => {
              const IconComponent = themeOption.icon;
              const isSelected = currentTheme === themeOption.id;
              
              return (
                <div
                  key={themeOption.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-primary bg-primary/5 shadow-lg' 
                      : 'border-border hover:border-primary/50 hover:bg-accent/5'
                  }`}
                  onClick={() => handleThemeChange(themeOption.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{themeOption.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {themeOption.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              <CardTitle>Account</CardTitle>
            </div>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            
            <div className="pt-4 border-t space-y-2">
              <BugReport />
              <Button
                variant="destructive"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full"
              >
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>About TeamFinder</CardTitle>
            <CardDescription>
              Connect with amazing people and build incredible teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Version 1.0.0</p>
              <p>Built with love for team collaboration</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;