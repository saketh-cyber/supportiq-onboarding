import { NextRequest, NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { UserRecord } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const PASSWORD_COST = 12;
const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

// POST /api/user
// Two modes:
//   action = "start"  -> create or resume a user from email + password (page 1)
//   action = "update" -> save profile fields for an existing user (pages 2 & 3)
export async function POST(req: NextRequest) {
  noStore();

  const body = await req.json();
  const action = body.action as string;

  if (action === "start") {
    return handleStart(body);
  }
  if (action === "update") {
    return handleUpdate(body);
  }
  return NextResponse.json(
    { error: "Unknown action." },
    { status: 400, headers: noStoreHeaders }
  );
}

async function handleStart(body: any) {
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400, headers: noStoreHeaders }
    );
  }

  // If the user already exists, resume them at their saved step so a partially
  // completed flow picks up where they left off.
  const { data: existing } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    const user = existing as UserRecord;
    // Verify the password matches the stored hash before resuming.
    const matches = await bcrypt.compare(password, (existing as any).password);
    if (!matches) {
      return NextResponse.json(
        { error: "That email is already registered with a different password." },
        { status: 401, headers: noStoreHeaders }
      );
    }
    return NextResponse.json(
      { user: stripPassword(user), resumed: true },
      { headers: noStoreHeaders }
    );
  }

  // New user: create the record starting at step 2.
  const passwordHash = await bcrypt.hash(password, PASSWORD_COST);
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({
      email,
      password: passwordHash,
      current_step: 2,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Could not create user." },
      { status: 500, headers: noStoreHeaders }
    );
  }

  return NextResponse.json(
    { user: stripPassword(data as UserRecord), resumed: false },
    { headers: noStoreHeaders }
  );
}

async function handleUpdate(body: any) {
  const id = body.id as string;
  if (!id) {
    return NextResponse.json(
      { error: "Missing user id." },
      { status: 400, headers: noStoreHeaders }
    );
  }

  // Only allow known profile columns to be written.
  const allowed = [
    "about_me",
    "street_address",
    "city",
    "state",
    "zip",
    "birthdate",
    "current_step",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Could not update user." },
      { status: 500, headers: noStoreHeaders }
    );
  }

  return NextResponse.json(
    { user: stripPassword(data as UserRecord) },
    { headers: noStoreHeaders }
  );
}

function stripPassword(user: UserRecord & { password?: string }) {
  const { password, ...rest } = user as any;
  return rest;
}
