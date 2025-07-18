import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';
import { registerPlugin } from '@capacitor/core';

// Add this import at the top if using Capacitor v5+
// import { GoogleAuthPlugin } from 'path-to-generated-plugin';

const GoogleAuthPlugin = registerPlugin('GoogleAuthPlugin');

const isAndroid = typeof window !== 'undefined' && (window as any).Capacitor?.getPlatform?.() === 'android';

export async function signInWithGoogleNative() {
  try {
    const result = await GoogleAuthPlugin.signInWithGoogle();
    const { idToken, email, name } = result;
    // Use the idToken to sign in with Supabase
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) {
      return { error };
    }
    // Check if user profile exists in your DB
    let isNewUser = false;
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();
      isNewUser = !!profileError || !profile;
    }
    return {
      user: data.user,
      session: data.session,
      name,
      email,
      isNewUser,
    };
  } catch (err) {
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
    const redirectUrl = `${window.location.origin}/`;
    
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