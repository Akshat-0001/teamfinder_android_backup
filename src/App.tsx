import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { supabase } from './integrations/supabase/client';

const queryClient = new QueryClient();

async function saveDeviceToken(token, platform) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('device_tokens').upsert({
    user_id: user.id,
    token,
    platform,
  });
}

function usePushNotifications(user) {
  const [pendingToken, setPendingToken] = useState(null);

  useEffect(() => {
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      }
    });

    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      if (user && user.id) {
        saveDeviceToken(token.value, 'android');
      } else {
        setPendingToken(token.value);
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error: ', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      alert('Push received: ' + JSON.stringify(notification));
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ', notification);
    });
  }, [user]);

  useEffect(() => {
    if (user && user.id && pendingToken) {
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

function App() {
  const { user } = useAuth();
  usePushNotifications(user);
  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/onboarding" element={<OnboardingCarousel />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/settings/suggestions" element={<Suggestions />} />
          <Route path="/settings/bug-report" element={<BugReportPage />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
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
