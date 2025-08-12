import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function AuthGate() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || profile === null) return; // Wait until profile is loaded
    console.debug('[AuthGate] user:', user);
    console.debug('[AuthGate] profile:', profile);
    console.debug('[AuthGate] profile.university:', profile && profile.university);
    if (user && user.email_confirmed_at) {
      const uni = profile && typeof profile.university === 'string' ? profile.university.trim() : profile?.university;
      if (!uni) {
        console.debug('[AuthGate] Redirecting to /profile-setup');
        navigate('/profile-setup', { replace: true });
      } else {
        console.debug('[AuthGate] Profile complete, not redirecting');
      }
    }
  }, [user, profile, authLoading, navigate]);

  // Show a spinner while loading or while profile is null
  if (authLoading || profile === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <Outlet />;
} 