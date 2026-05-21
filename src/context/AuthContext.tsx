'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndRole = async (currentUser: User) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      } else if (profileError) {
        console.warn('Profile not found or error loading:', profileError.message);
      }

      // Check if user is Admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', currentUser.id)
        .single();

      if (adminData) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        if (adminError && adminError.code !== 'PGRST116') { // PGRST116 is code for 0 rows returned
          console.error('Error checking admin status:', adminError.message);
        }
      }
    } catch (error) {
      console.error('Error fetching profile and roles:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndRole(user);
    }
  };

  useEffect(() => {
    // 1. Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfileAndRole(session.user);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfileAndRole(currentUser);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    
    // 1. Instantly wipe all auth and cache keys from localStorage
    if (typeof window !== 'undefined') {
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.startsWith('cached_') || key.includes('admin') || key.includes('vip_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn('Error clearing localStorage on sign out:', e);
      }
    }

    // 2. Instantly clear local states so the UI updates instantly
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    setLoading(false);

    // 3. Fire the server sign-out in the background without blocking the UI
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise(resolve => setTimeout(resolve, 800)) // 800ms max timeout for server notification
      ]);
    } catch (err) {
      console.warn('Silent sign-out network request warning:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
