import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client. Uses the service role key so the API routes can
// read and write freely. This client is only ever imported by route handlers
// that run on the server, so the service key is never shipped to the browser.
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceKey) {
  // Fail loudly in dev if env vars are missing rather than silently breaking.
  console.warn(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});
