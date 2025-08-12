import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const VerifyEmail = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const email = location.state?.email || user?.email;

  // Handle email verification from deep link
  useEffect(() => {
    const processVerification = async () => {
      console.log('[DEBUG] VerifyEmail mounted');
      console.log('[DEBUG] Location:', location.pathname + location.search + location.hash);
      
      // Extract tokens from URL
      let access_token = null;
      let refresh_token = null;
      
      // Check query parameters
      const urlParams = new URLSearchParams(location.search);
      access_token = urlParams.get('access_token');
      refresh_token = urlParams.get('refresh_token');
      
      // Check hash fragment
      if (!access_token || !refresh_token) {
        const hash = location.hash.replace(/^#/, '');
        const hashParams = new URLSearchParams(hash);
        access_token = access_token || hashParams.get('access_token');
        refresh_token = refresh_token || hashParams.get('refresh_token');
      }
      
      if (access_token && refresh_token) {
        console.log('[DEBUG] Found verification tokens, processing...');
        setVerifying(true);
        
        try {
          // Set the session with the tokens
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });
          
          if (sessionError) {
            console.error('[DEBUG] Session error:', sessionError);
            setVerificationStatus('failed');
            setError('Failed to verify email. Please try again.');
          } else {
            console.log('[DEBUG] Email verification successful');
            setVerificationStatus('success');
            toast({ title: 'Email verified successfully!' });
            
            // Redirect to profile setup after a short delay
            setTimeout(() => {
              navigate('/profile-setup', { replace: true });
            }, 2000);
          }
        } catch (error) {
          console.error('[DEBUG] Verification error:', error);
          setVerificationStatus('failed');
          setError('An error occurred during verification.');
        } finally {
          setVerifying(false);
        }
      } else {
        console.log('[DEBUG] No verification tokens found');
        setVerificationStatus('pending');
      }
    };
    
    processVerification();
  }, [location, navigate]);

  const handleResend = async () => {
    setChecking(true);
    setError('');
    setResent(false);
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    setChecking(false);
    if (error) {
      setError('Failed to resend email.');
    } else {
      setResent(true);
      toast({ title: 'Verification email resent!' });
    }
  };

  const handleCheck = async () => {
    setChecking(true);
    setError('');
    const { data, error } = await supabase.auth.getUser();
    setChecking(false);
    if (error) {
      setError('Failed to check verification.');
      return;
    }
    if (data?.user?.email_confirmed_at) {
      navigate('/profile-setup');
    } else {
      setError('Email not verified yet. Please check your inbox.');
    }
  };

  // Show loading state while verifying
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="text-center space-y-2">
            <CardTitle>Verifying Your Email</CardTitle>
            <CardDescription>
              Please wait while we verify your email address...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success state
  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-green-600">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified. Redirecting to profile setup...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="text-green-600 text-6xl">✓</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (verificationStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-red-600">Verification Failed</CardTitle>
            <CardDescription>
              {error || 'Failed to verify your email. Please try again.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/auth')} className="w-full btn-gradient">
              Back to Sign In
            </Button>
            <Button onClick={handleResend} className="w-full" variant="outline">
              Resend Verification Email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show default verification page
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center space-y-2">
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to <b>{email}</b>.<br />
            Please check your inbox and click the link to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleResend} className="w-full" disabled={checking}>
            {checking ? 'Resending...' : 'Resend Email'}
          </Button>
          <Button onClick={() => navigate('/auth')} className="w-full btn-gradient">
            Back to Sign In
          </Button>
          <div className="text-muted-foreground text-center">
            After verifying, <b>please log in again</b>.
          </div>
          {resent && <div className="text-green-600 text-sm text-center">Verification email resent!</div>}
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail; 