import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

// GET /api/users — returns all users for the public /data table.
// No auth by design; this is a testing view of the backing database.
export async function GET() {
  noStore();

  const { data, error } = await supabaseAdmin
    .from("users")
    .select(
      "id, email, about_me, street_address, city, state, zip, birthdate, current_step, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: noStoreHeaders }
    );
  }

  return NextResponse.json({ users: data ?? [] }, { headers: noStoreHeaders });
}
