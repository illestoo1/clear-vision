import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ─── Supabase Client ──────────────────────────────────────────

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return createSupabaseClient(url, key);
}

// ─── Types ────────────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  created_at: string;
}

export interface Scan {
  id: string;
  user_id: string;
  image_url: string | null;
  result: string | null;
  risk_level: string | null;
  condition_notes: string | null;
  ai_analysis: Record<string, unknown> | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  doctor: string;
  specialty: string | null;
  date: string;
  time: string;
  type: string;
  location: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

// ─── Profile Functions ────────────────────────────────────────

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("getProfile:", error.message);
    return null;
  }

  return data as Profile;
}

export async function updateProfile(
  updates: Partial<Pick<Profile, "full_name" | "email">>,
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

// ─── Scan Functions ───────────────────────────────────────────

export async function getScans(): Promise<Scan[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("scans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getScans:", error.message);
    return [];
  }

  return data ?? [];
}

export async function insertScan(
  scan: Omit<Scan, "id" | "user_id" | "created_at">,
): Promise<Scan> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("scans")
    .insert({
      ...scan,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Scan;
}

export async function deleteScan(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("scans").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

// ─── Appointment Functions ────────────────────────────────────

export async function getAppointments(): Promise<Appointment[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  if (error) {
    console.error("getAppointments:", error.message);
    return [];
  }

  return data ?? [];
}

export async function insertAppointment(
  appt: Omit<Appointment, "id" | "user_id" | "created_at">,
): Promise<Appointment> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      ...appt,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Appointment;
}

export async function updateAppointment(
  id: string,
  updates: Partial<Omit<Appointment, "id" | "user_id" | "created_at">>,
) {
  const supabase = createClient();

  const { error } = await supabase
    .from("appointments")
    .update(updates)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteAppointment(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("appointments").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
