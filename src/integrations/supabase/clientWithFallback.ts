// IMPORTANT:
// Prefer the auto-generated client at `@/integrations/supabase/client`.
// This fallback client exists to prevent a hard crash when Vite env vars are not
// injected correctly in certain preview/build environments.
//
// The URL and publishable key below are safe to ship (they are not secrets).

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const FALLBACK_SUPABASE_URL = "https://wnbsrehkhixdrvpaqihg.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduYnNyZWhraGl4ZHJ2cGFxaWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MTc5MzcsImV4cCI6MjA4NDQ5MzkzN30.bNCwt1IYa0_V1iK3gbwey0HYhnuweY0fPgSI1FzXtHM";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  (import.meta.env.VITE_SUPABASE_PROJECT_ID
    ? `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`
    : FALLBACK_SUPABASE_URL);

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  FALLBACK_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
