import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Settings as SettingsIcon, Palette, Waves, Trees, Sparkles, Lock, Bug, MessageSquare } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import BugReportDialog from '@/components/BugReportDialog';
import SuggestionDialog from '@/components/SuggestionDialog';

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('system');
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);
  const [showBugReportDialog, setShowBugReportDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionForm, setSuggestionForm] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showChangeEmailDialog, setShowChangeEmailDialog] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');
  const [changeEmailForm, setChangeEmailForm] = useState({ email: '', password: '' });
  const [changeEmailLoading, setChangeEmailLoading] = useState(false);
  const [changeEmailError, setChangeEmailError] = useState('');
  const [changeEmailSuccess, setChangeEmailSuccess] = useState('');

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

  // Fetch user's suggestions
  useEffect(() => {
    if (!user) return;
    setLoadingSuggestions(true);
    supabase
      .from('suggestions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setSuggestions(data || []);
        setLoadingSuggestions(false);
      });
  }, [user, showSuggestionDialog]);

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


  const handleChangePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChangePasswordForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleChangeEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChangeEmailForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordSuccess('');
    if (!changePasswordForm.current || !changePasswordForm.new || !changePasswordForm.confirm) {
      setChangePasswordError('All fields are required.');
      return;
    }
    if (changePasswordForm.new.length < 6) {
      setChangePasswordError('New password must be at least 6 characters.');
      return;
    }
    if (changePasswordForm.new !== changePasswordForm.confirm) {
      setChangePasswordError('Passwords do not match.');
      return;
    }
    setChangePasswordLoading(true);
    // Re-authenticate user
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: changePasswordForm.current
    });
    if (signInError) {
      setChangePasswordError('Current password is incorrect.');
      setChangePasswordLoading(false);
      return;
    }
    // Update password
    const { error } = await supabase.auth.updateUser({ password: changePasswordForm.new });
    if (error) {
      setChangePasswordError(error.message);
    } else {
      setChangePasswordSuccess('Password updated successfully!');
      setChangePasswordForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setShowChangePasswordDialog(false), 1200);
    }
    setChangePasswordLoading(false);
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeEmailError('');
    setChangeEmailSuccess('');
    if (!changeEmailForm.email || !changeEmailForm.password) {
      setChangeEmailError('All fields are required.');
      return;
    }
    // Re-authenticate user
    setChangeEmailLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: changeEmailForm.password
    });
    if (signInError) {
      setChangeEmailError('Current password is incorrect.');
      setChangeEmailLoading(false);
      return;
    }
    // Update email
    const { error } = await supabase.auth.updateUser({ email: changeEmailForm.email });
    if (error) {
      setChangeEmailError(error.message);
    } else {
      setChangeEmailSuccess('Email update requested! Check your new email to confirm.');
      setChangeEmailForm({ email: '', password: '' });
      setTimeout(() => setShowChangeEmailDialog(false), 2000);
    }
    setChangeEmailLoading(false);
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
        {/* User Experience Section */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>User Experience</CardTitle>
            </div>
            <CardDescription>
              Help us improve your experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowSuggestionDialog(true)}
              >
                <MessageSquare className="h-4 w-4 mr-3" />
                Share Feedback/Suggestions
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowBugReportDialog(true)}
              >
                <Bug className="h-4 w-4 mr-3" />
                Report Bug
              </Button>
            </div>
          </CardContent>
        </Card>

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
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div className="pt-4 border-t space-y-2">
              <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <Input
                      name="current"
                      type="password"
                      placeholder="Current password"
                      value={changePasswordForm.current}
                      onChange={handleChangePasswordInput}
                      required
                    />
                    <Input
                      name="new"
                      type="password"
                      placeholder="New password"
                      value={changePasswordForm.new}
                      onChange={handleChangePasswordInput}
                      required
                    />
                    <Input
                      name="confirm"
                      type="password"
                      placeholder="Confirm new password"
                      value={changePasswordForm.confirm}
                      onChange={handleChangePasswordInput}
                      required
                    />
                    {changePasswordError && <div className="text-destructive text-sm">{changePasswordError}</div>}
                    {changePasswordSuccess && <div className="text-green-600 text-sm">{changePasswordSuccess}</div>}
                    <Button type="submit" className="w-full btn-gradient" disabled={changePasswordLoading}>
                      {changePasswordLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog open={showChangeEmailDialog} onOpenChange={setShowChangeEmailDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Change Email
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Email</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleChangeEmail} className="space-y-4">
                    <Input
                      name="email"
                      type="email"
                      placeholder="New email address"
                      value={changeEmailForm.email}
                      onChange={handleChangeEmailInput}
                      required
                    />
                    <Input
                      name="password"
                      type="password"
                      placeholder="Current password"
                      value={changeEmailForm.password}
                      onChange={handleChangeEmailInput}
                      required
                    />
                    {changeEmailError && <div className="text-destructive text-sm">{changeEmailError}</div>}
                    {changeEmailSuccess && <div className="text-green-600 text-sm">{changeEmailSuccess}</div>}
                    <Button type="submit" className="w-full btn-gradient" disabled={changeEmailLoading}>
                      {changeEmailLoading ? 'Updating...' : 'Update Email'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={isSigningOut}
                    className="w-full mt-2"
                  >
                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign Out</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to sign out?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                    >
                      Sign Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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

      {/* Dialog Components */}
      <BugReportDialog 
        open={showBugReportDialog} 
        onOpenChange={setShowBugReportDialog} 
      />
      <SuggestionDialog 
        open={showSuggestionDialog} 
        onOpenChange={setShowSuggestionDialog} 
      />
    </div>
  );
};

export default Settings;