import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type AllowedRole = "tutor" | "admin" | "super_admin";

async function getSessionRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, role: null as AllowedRole | null };
  }

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const roleList = (roles ?? []).map((entry) => entry.role);
  const role = roleList.includes("super_admin")
    ? "super_admin"
    : roleList.includes("admin")
      ? "admin"
      : roleList.includes("tutor")
        ? "tutor"
        : null;

  return { supabase, user, role };
}

export async function GET(request: NextRequest) {
  const { supabase, user, role } = await getSessionRole();
  if (!user || !role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const subject = request.nextUrl.searchParams.get("subject");
  const topic = request.nextUrl.searchParams.get("topic");
  const grade = request.nextUrl.searchParams.get("grade");
  const skillType = request.nextUrl.searchParams.get("skillType");

  if (!subject || !topic || !grade || !skillType) {
    return NextResponse.json({ items: [] });
  }

  const { data, error } = await supabase
    .from("anti_repetition_items")
    .select("original_text")
    .eq("subject", subject)
    .eq("topic", topic)
    .eq("grade", grade)
    .eq("skill_type", skillType)
    .order("created_at", { ascending: false })
    .limit(120);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    items: (data ?? [])
      .map((entry) => entry.original_text)
      .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0),
  });
}
