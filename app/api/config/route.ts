import { NextRequest, NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { ALL_COMPONENTS, ComponentKey, DEFAULT_CONFIG } from "@/lib/types";

// Always run this route dynamically so the /data and admin pages reflect
// live database state rather than a cached build-time snapshot.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

// GET /api/config — returns which components appear on pages 2 and 3.
export async function GET() {
  noStore();

  const { data, error } = await supabaseAdmin
    .from("page_config")
    .select("page2, page3")
    .eq("id", 1)
    .single();

  if (error || !data) {
    // Fall back to defaults if the row is somehow missing.
    return NextResponse.json(DEFAULT_CONFIG, { headers: noStoreHeaders });
  }

  return NextResponse.json(
    { page2: data.page2, page3: data.page3 },
    { headers: noStoreHeaders }
  );
}

// POST /api/config — updates the component layout for pages 2 and 3.
// Enforces that each page keeps at least one component.
export async function POST(req: NextRequest) {
  noStore();

  const body = await req.json();
  const page2 = sanitize(body.page2);
  const page3 = sanitize(body.page3);

  if (page2.length === 0 || page3.length === 0) {
    return NextResponse.json(
      { error: "Each page must have at least one component." },
      { status: 400, headers: noStoreHeaders }
    );
  }

  const { error } = await supabaseAdmin
    .from("page_config")
    .update({ page2, page3, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: noStoreHeaders }
    );
  }

  return NextResponse.json({ page2, page3 }, { headers: noStoreHeaders });
}

// Keep only valid, known component keys and drop duplicates.
function sanitize(input: unknown): ComponentKey[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<ComponentKey>();
  for (const item of input) {
    if (ALL_COMPONENTS.includes(item as ComponentKey)) {
      seen.add(item as ComponentKey);
    }
  }
  return Array.from(seen);
}
