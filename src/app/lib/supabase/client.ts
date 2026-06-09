import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      __supabaseClient?: SupabaseClient;
    }
  }

  interface Window {
    __supabaseClient?: SupabaseClient;
  }
}

const globalForSupabase =
  typeof window !== "undefined"
    ? window
    : (globalThis as unknown as NodeJS.Global);

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  if (!globalForSupabase.__supabaseClient) {
    globalForSupabase.__supabaseClient = createSupabaseClient(url, key);
  }

  return globalForSupabase.__supabaseClient;
}
