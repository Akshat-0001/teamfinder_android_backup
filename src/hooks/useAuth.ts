import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';
import { registerPlugin } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';

// Add this import at the top if using Capacitor v5+
// import { GoogleAuthPlugin } from 'path-to-generated-plugin';

const GoogleAuthPlugin = registerPlugin('GoogleAuthPlugin');

const isAndroid = typeof window !== 'undefined' && (window as any).Capacitor?.getPlatform?.() === 'android';

export async function signInWithGoogleNative() {
  try {
    console.log('[DEBUG] Starting Google Sign-in...');
    
    // Revert: Remove platform check so this always runs as before
    const result = await GoogleAuthPlugin.signInWithGoogle();
    console.log('[DEBUG] Google plugin result:', result);
    
    const { idToken, email, name } = result;
    console.log('[DEBUG] Got ID token, email, name:', { idToken: !!idToken, email, name });
    
    // Use the idToken to sign in with Supabase
    console.log('[DEBUG] Calling Supabase signInWithIdToken...');
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    
    console.log('[DEBUG] Supabase response:', { data: !!data, error });
    
    if (error) {
      console.error('[DEBUG] Supabase error:', error);
      return { error };
    }
    
    console.log('[DEBUG] Sign-in successful, checking profile...');
    
    // Check if user profile exists in your DB
    let isNewUser = false;
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();
      isNewUser = !!profileError || !profile;
      console.log('[DEBUG] Profile check result:', { profile: !!profile, isNewUser });
    }
    
    console.log('[DEBUG] Google Sign-in completed successfully');
    return {
      user: data.user,
      session: data.session,
      name,
      email,
      isNewUser,
    };
  } catch (err) {
    console.error('[DEBUG] Google Sign-in error:', err);
    return { error: err };
  }
}

const PROFILE_CACHE_KEY = 'teamfinder_profile_cache';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // Load cached profile immediately
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test network connectivity to Supabase
    const testNetwork = async () => {
      try {
        console.log('[DEBUG] Testing network connectivity to Supabase...');
        const response = await fetch('https://kfusideciciedpmtfune.supabase.co/rest/v1/', {
          method: 'HEAD',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdXNpZGVjaWNpZWRwbXRmdW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDQzNzEsImV4cCI6MjA2NzIyMDM3MX0.GY1hpuiPl3Uyk7gIFQsHbt27CTtpa569ss-k5xvo35w'
          }
        });
        console.log('[DEBUG] Network test result:', response.status, response.ok);
      } catch (error) {
        console.error('[DEBUG] Network test failed:', error);
      }
    };
    
    testNetwork();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
              setProfile(profileData);
              // Cache profile
              if (profileData) {
                localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profileData));
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
            }
          }, 0);
        } else {
          setProfile(null);
          localStorage.removeItem(PROFILE_CACHE_KEY);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    // Use deep link for mobile, web origin for web
    const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;
    const redirectUrl = isCapacitor
      ? 'teamfinder://auth/callback'
      : `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { data, error };
  };

  const signInWithGoogle = async () => {
    if (isAndroid) {
      return await signInWithGoogleNative();
    }
    const redirectUrl = `${window.location.origin}/home`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    // Clear cached profile on sign out
    localStorage.removeItem(PROFILE_CACHE_KEY);
    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (data) {
      setProfile(data);
      // Update cache
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
    }

    return { data, error };
  };

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile
  };
};