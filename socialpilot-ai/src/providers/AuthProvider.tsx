"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

import { realtimeClient, subscriptionManager } from "@/lib/realtime";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role?: string;
  initials?: string;
  is_active: boolean;
  is_verified: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  updateUser: (updated: Partial<UserProfile>) => void;
}

export function deriveNameFromEmail(email: string): string {
  if (!email || !email.includes("@")) return "User";
  const handle = email.split("@")[0];
  const parts = handle.replace(/[^a-zA-Z0-9]/g, " ").trim().split(/\s+/);
  return (
    parts
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join(" ") || "User"
  );
}

export function getInitials(name: string): string {
  if (!name) return "US";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function processProfile(raw: Partial<UserProfile>): UserProfile {
  const email = raw.email || "";
  const full_name =
    raw.full_name && raw.full_name.trim() !== ""
      ? raw.full_name
      : deriveNameFromEmail(email);

  return {
    id: raw.id || "usr-local",
    email,
    full_name,
    avatar_url: raw.avatar_url,
    role: raw.role || "Admin",
    initials: getInitials(full_name),
    is_active: raw.is_active ?? true,
    is_verified: raw.is_verified ?? true,
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check local storage saved profile first for instantaneous hydration
    const savedProfileStr = localStorage.getItem("socialpilot_user_profile");
    let cachedUser: UserProfile | null = null;
    if (savedProfileStr) {
      try {
        cachedUser = JSON.parse(savedProfileStr);
        setUser(cachedUser);
      } catch (e) {
        console.error("Failed to parse cached user profile", e);
      }
    }

    // 2. Supabase Session Sync (if configured)
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          apiClient.setToken(session.access_token);
          const email = session.user.email || "";
          const metaName = session.user.user_metadata?.full_name;
          const profile = processProfile({
            id: session.user.id,
            email,
            full_name: metaName || deriveNameFromEmail(email),
          });
          setUser(profile);
          localStorage.setItem("socialpilot_user_profile", JSON.stringify(profile));
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          apiClient.setToken(session.access_token);
          const email = session.user.email || "";
          const metaName = session.user.user_metadata?.full_name;
          const profile = processProfile({
            id: session.user.id,
            email,
            full_name: metaName || deriveNameFromEmail(email),
          });
          setUser(profile);
          localStorage.setItem("socialpilot_user_profile", JSON.stringify(profile));
          realtimeClient.reconnect();
        } else {
          apiClient.setToken(null);
          setUser(null);
          localStorage.removeItem("socialpilot_user_profile");
          localStorage.removeItem("socialpilot_access_token");
          subscriptionManager.clearAll();
          realtimeClient.disconnect();
        }
      });

      setIsLoading(false);
      return () => {
        subscription.unsubscribe();
      };
    }

    // 3. Local Storage Token Sync (Fallback backend API query)
    const savedToken = localStorage.getItem("socialpilot_access_token");
    if (savedToken) {
      apiClient.setToken(savedToken);
      apiClient
        .get<UserProfile>("/users/me")
        .then((profileData) => {
          const profile = processProfile(profileData);
          setUser(profile);
          localStorage.setItem("socialpilot_user_profile", JSON.stringify(profile));
        })
        .catch((err: any) => {
          if (err?.status === 401 || err?.status === 403) {
            apiClient.setToken(null);
            setUser(null);
            localStorage.removeItem("socialpilot_access_token");
            localStorage.removeItem("socialpilot_user_profile");
            subscriptionManager.clearAll();
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (token: string, rawProfile: Partial<UserProfile>) => {
    const profile = processProfile(rawProfile);
    apiClient.setToken(token);
    localStorage.setItem("socialpilot_access_token", token);
    localStorage.setItem("socialpilot_user_profile", JSON.stringify(profile));
    setUser(profile);
    realtimeClient.reconnect();
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut();
    }
    apiClient.setToken(null);
    localStorage.removeItem("socialpilot_access_token");
    localStorage.removeItem("socialpilot_user_profile");
    subscriptionManager.clearAll();
    realtimeClient.disconnect();
    setUser(null);
  };

  const updateUser = (updatedFields: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = processProfile({
        ...prev,
        ...updatedFields,
      });
      localStorage.setItem("socialpilot_user_profile", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
