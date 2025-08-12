import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SplashScreen from "./components/SplashScreen";
import OnboardingCarousel from "./components/OnboardingCarousel";
import AuthPage from "./components/AuthPage";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import CreateTeam from "./pages/CreateTeam";
import MyTeams from "./pages/MyTeams";
import TeamDetails from "./pages/TeamDetails";
import TeamChat from "./pages/TeamChat";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import ResetPassword from './pages/ResetPassword';
import PageTransition from "./components/PageTransition";
import ProfileSetup from './pages/ProfileSetup';
import Suggestions from './pages/Suggestions';
import BugReportPage from './pages/BugReportPage';
import Notifications from './pages/Notifications';
import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { supabase } from './integrations/supabase/client';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useToast } from "@/hooks/use-toast";
import VerifyEmail from './pages/VerifyEmail';
import { App as CapacitorApp } from '@capacitor/app';
import AuthGate from './components/AuthGate';
import { Capacitor } from '@capacitor/core';

// Register the pushNotificationReceived handler at the top level to prevent default popup
if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
PushNotifications.addListener('pushNotificationReceived', (notification) => {
  console.log('[DEBUG] pushNotificationReceived handler fired:', notification);
  // No LocalNotifications.schedule here; in-app notifications are handled by your bell UI
});
}

const queryClient = new QueryClient();

async function saveDeviceToken(token, platform) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user) {
    console.log('No user found, cannot save FCM token');
    return;
  }
  const { error } = await supabase
    .from('profiles')
    .update({ fcm_token: token })
    .eq('user_id', user.id);
  if (error) {
    console.error('Error saving FCM token:', error);
  } else {
    console.log('FCM token saved to profiles table:', token);
  }
}

function usePushNotifications(user) {
  const { toast } = useToast();
  const [pendingToken, setPendingToken] = useState(null);

  useEffect(() => {
    if (!(Capacitor.isNativePlatform && Capacitor.isNativePlatform())) return;
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      }
    });

    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      if (user && user.id) {
        console.log('User present at registration, saving token');
        saveDeviceToken(token.value, 'android');
      } else {
        console.log('User not present at registration, storing pending token');
        setPendingToken(token.value);
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error: ', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      // Show a toast in the foreground only
      toast({
        title: notification.title || "Notification",
        description: notification.body || "",
      });
      // No LocalNotifications.schedule or alert here
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ', notification);
    });
  }, [user]);

  useEffect(() => {
    if (user && user.id && pendingToken) {
      console.log('User became available after registration, saving pending token');
      saveDeviceToken(pendingToken, 'android');
      setPendingToken(null);
    }
  }, [user, pendingToken]);
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Deep link handler component
function DeepLinkHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle deep links when app is already running
    const handleDeepLink = ({ url }: { url: string }) => {
      console.log('[DEBUG] Deep link received:', url);
      console.log('[DEBUG] Current location before navigation:', window.location.href);
      
      if (url.startsWith('teamfinder://auth/callback')) {
        console.log('[DEBUG] Auth callback deep link detected');
        
        // Extract everything after the callback part
        const suffix = url.replace('teamfinder://auth/callback', '');
        console.log('[DEBUG] URL suffix:', suffix);
        
        // Check if this is an email verification or password reset
        if (suffix.includes('type=recovery')) {
          // Password reset link
          console.log('[DEBUG] Password reset link detected');
          const targetPath = '/auth/reset-password' + suffix;
          console.log('[DEBUG] Navigating to password reset:', targetPath);
          navigate(targetPath, { replace: true });
        } else if (suffix.includes('type=signup') || suffix.includes('access_token=')) {
          // Email verification link
          console.log('[DEBUG] Email verification link detected');
          const targetPath = '/verify-email' + suffix;
          console.log('[DEBUG] Navigating to email verification:', targetPath);
          navigate(targetPath, { replace: true });
        } else {
          // Default fallback - try to determine from context
          console.log('[DEBUG] Unknown auth callback type, defaulting to password reset');
          const targetPath = '/auth/reset-password' + suffix;
          console.log('[DEBUG] Navigating to:', targetPath);
          navigate(targetPath, { replace: true });
        }
        
        // Log after navigation
        setTimeout(() => {
          console.log('[DEBUG] Location after navigation:', window.location.href);
        }, 100);
      }
    };

    // Handle deep links when app is opened via deep link
    const checkLaunchUrl = async () => {
      try {
        const { url } = await CapacitorApp.getLaunchUrl();
        if (url) {
          console.log('[DEBUG] Launch URL found:', url);
          handleDeepLink({ url });
        } else {
          console.log('[DEBUG] No launch URL found');
        }
      } catch (error) {
        console.log('[DEBUG] Error checking launch URL:', error);
      }
    };

    // Check for launch URL on component mount
    checkLaunchUrl();

    // Listen for deep links when app is already running
    const listener = CapacitorApp.addListener('appUrlOpen', handleDeepLink);

    return () => {
      listener.remove();
    };
  }, [navigate]);

  return null;
}

function App() {
  const { user } = useAuth();
  usePushNotifications(user);

  useEffect(() => {
    if (!(Capacitor.isNativePlatform && Capacitor.isNativePlatform())) return;
    
    // Configure status bar properly for mobile
    const configureStatusBar = async () => {
      try {
        // Don't overlay the webview - this causes the overlap issue
        await StatusBar.setOverlaysWebView({ overlay: false });
        
        // Set transparent background
        await StatusBar.setBackgroundColor({ color: '#00000000' });
        
        // Set dark style for better visibility
        await StatusBar.setStyle({ style: Style.Dark });
        
        // Set status bar height to account for safe areas
        await StatusBar.setPadding({ top: 0, left: 0, right: 0, bottom: 0 });
        
        console.log('[DEBUG] Status bar configured successfully');
      } catch (error) {
        console.error('[DEBUG] Status bar configuration error:', error);
      }
    };
    
    configureStatusBar();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DeepLinkHandler />
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/onboarding" element={<OnboardingCarousel />} />
            <Route
              path="/auth"
              element={user ? <Navigate to="/home" replace /> : <AuthPage />}
            />
            <Route path="/settings/suggestions" element={<Suggestions />} />
            <Route path="/settings/bug-report" element={<BugReportPage />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route element={<AuthGate />}>
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="home" element={<Home />} />
                <Route path="profile" element={<Profile />} />
                <Route path="teams/create" element={<CreateTeam />} />
                <Route path="teams/:id" element={<TeamDetails />} />
                <Route path="my-teams" element={<MyTeams />} />
                <Route path="search" element={<Search />} />
                <Route path="settings" element={<Settings />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="user/:userId" element={<UserProfile />} />
              </Route>
              <Route path="/chat/:teamId" element={<ProtectedRoute><PageTransition><TeamChat /></PageTransition></ProtectedRoute>} />
            </Route>
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
}

export default App;
