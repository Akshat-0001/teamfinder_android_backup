import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<'processing' | 'form' | 'error'>('processing');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('[DEBUG] ResetPassword mounted');
    console.log('[DEBUG] Location:', location.pathname + location.search + location.hash);
    
    const processPasswordReset = async () => {
      try {
        // Extract tokens from URL - try multiple approaches
        let access_token = null;
        let refresh_token = null;
        
        // Method 1: Check query parameters
        const urlParams = new URLSearchParams(location.search);
        access_token = urlParams.get('access_token');
        refresh_token = urlParams.get('refresh_token');
        
        console.log('[DEBUG] Query params - access_token:', !!access_token, 'refresh_token:', !!refresh_token);
        
        // Method 2: Check hash fragment
        if (!access_token || !refresh_token) {
          const hash = location.hash.replace(/^#/, '');
          const hashParams = new URLSearchParams(hash);
          access_token = access_token || hashParams.get('access_token');
          refresh_token = refresh_token || hashParams.get('refresh_token');
          console.log('[DEBUG] Hash params - access_token:', !!access_token, 'refresh_token:', !!refresh_token);
        }
        
        // Method 3: Check if we have a token in the URL path
        if (!access_token) {
          const pathParts = location.pathname.split('/');
          const lastPart = pathParts[pathParts.length - 1];
          if (lastPart.includes('access_token=')) {
            const tokenPart = decodeURIComponent(lastPart);
            const tokenParams = new URLSearchParams(tokenPart);
            access_token = tokenParams.get('access_token');
            refresh_token = tokenParams.get('refresh_token');
            console.log('[DEBUG] Path params - access_token:', !!access_token, 'refresh_token:', !!refresh_token);
          }
        }
        
        if (!access_token) {
          console.log('[DEBUG] No access_token found, showing error');
          setStatus('error');
          return;
        }
        
        console.log('[DEBUG] Found tokens, setting session...');
        
        // Set the session with the tokens
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token: refresh_token || undefined
        });
        
        if (sessionError) {
          console.error('[DEBUG] Session error:', sessionError);
          setStatus('error');
          return;
        }
        
        console.log('[DEBUG] Session set successfully:', !!data.session);
        
        // Wait a moment for auth state to update, then show form
        setTimeout(() => {
          setStatus('form');
        }, 1000);
        
      } catch (error) {
        console.error('[DEBUG] Error processing password reset:', error);
        setStatus('error');
      }
    };
    
    processPasswordReset();
  }, [location]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      
      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 2000);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    }
    
    setLoading(false);
  };

  if (status === 'processing') {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Processing password reset...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Password Reset Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              We couldn't process your password reset link. This could happen if:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-1 text-sm text-muted-foreground">
              <li>The link has expired</li>
              <li>The link has already been used</li>
              <li>There was an issue with the link format</li>
            </ul>
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="New password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <Button type="submit" className="w-full btn-gradient" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
            {error && <div className="text-destructive text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword; 