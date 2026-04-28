import { supabase } from "@/lib/supabase";

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  pronouns: string | null;
  gender_identity: string | null;
  city: string | null;
  skills: string[];
  interests: string[];
  goals: string[];
  anonymous_default: boolean;
  nickname_mode: boolean;
  show_city_public: boolean;
  show_pronouns_public: boolean;
  profile_complete: boolean;
};

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) { console.error("getProfile error:", error); return null; }
  return data as Profile;
}

export async function upsertProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...updates }, { onConflict: "id" })
    .select()
    .single();
  if (error) console.error("upsertProfile error:", error);
  return { data, error };
}

export async function uploadAvatar(userId: string, file: File) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/avatar.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });
  if (uploadError) { console.error("uploadAvatar error:", uploadError); return null; }
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export async function getMyPostsCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) console.error("getMyPostsCount error:", error);
  return count ?? 0;
}

export async function getJoinedCommunities(userId: string) {
  const { data, error } = await supabase
    .from("community_members")
    .select("community_id, communities(id, name, description)")
    .eq("user_id", userId);
  if (error) console.error("getJoinedCommunities error:", error);
  return (data ?? []).map((row: any) => row.communities).filter(Boolean);
}

export async function getSavedJobs(userId: string) {
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("*")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });
  if (error) console.error("getSavedJobs error:", error);
  return data ?? [];
}