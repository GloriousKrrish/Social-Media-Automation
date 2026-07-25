import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "https://your-project.supabase.co" &&
  !supabaseUrl.includes("your-project")
);

// Reusable Singleton Supabase Client Instance
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Reusable Auth Service Methods
export async function signUpWithSupabase(email: string, password: string, fullName?: string) {
  if (!supabase) throw new Error("Supabase is not configured");
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
}

export async function signInWithSupabase(email: string, password: string) {
  if (!supabase) throw new Error("Supabase is not configured");
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOutSupabase() {
  if (!supabase) return;
  return await supabase.auth.signOut();
}

export async function resetSupabasePassword(email: string) {
  if (!supabase) throw new Error("Supabase is not configured");
  return await supabase.auth.resetPasswordForEmail(email);
}

// Reusable Storage Service Methods
export async function uploadBrandAsset(
  bucketName: string,
  path: string,
  file: File
) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, file, { upsert: true });

  if (error) throw error;
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
