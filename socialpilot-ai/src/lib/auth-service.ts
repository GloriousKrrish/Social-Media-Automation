import { supabase, isSupabaseConfigured } from "./supabase";
import { apiClient } from "./api-client";

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  accessToken: string;
}

export interface AuthenticationProvider {
  signUp(email: string, password: string, fullName?: string): Promise<UserSession>;
  signIn(email: string, password: string): Promise<UserSession>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  getSession(): Promise<UserSession | null>;
}

export class SupabaseAuthProvider implements AuthenticationProvider {
  async signUp(email: string, password: string, fullName?: string): Promise<UserSession> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase authentication is unconfigured");
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) throw error;
    if (!data.user || !data.session) {
      throw new Error("Registration email verification required");
    }

    return {
      id: data.user.id,
      email: data.user.email || email,
      fullName: fullName || data.user.email || "User",
      accessToken: data.session.access_token,
    };
  }

  async signIn(email: string, password: string): Promise<UserSession> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase authentication is unconfigured");
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user || !data.session) throw new Error("Invalid login response");

    return {
      id: data.user.id,
      email: data.user.email || email,
      fullName: data.user.user_metadata?.full_name || data.user.email || "User",
      avatarUrl: data.user.user_metadata?.avatar_url,
      accessToken: data.session.access_token,
    };
  }

  async signOut(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut();
    }
  }

  async resetPassword(email: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase authentication is unconfigured");
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  async getSession(): Promise<UserSession | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    return {
      id: session.user.id,
      email: session.user.email || "",
      fullName: session.user.user_metadata?.full_name || session.user.email || "User",
      avatarUrl: session.user.user_metadata?.avatar_url,
      accessToken: session.access_token,
    };
  }
}

export const authProvider: AuthenticationProvider = new SupabaseAuthProvider();
