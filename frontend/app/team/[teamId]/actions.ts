"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function deleteTeamAction(formData: FormData) {
  const teamId = String(formData.get("teamId") ?? "").trim();
  if (!teamId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: team } = await supabase
    .from("teams")
    .select("id, created_by")
    .eq("id", teamId)
    .single();

  if (!team || team.created_by !== user.id) {
    redirect(`/team/${teamId}`);
  }

  await supabase.from("members").delete().eq("team_id", teamId);
  await supabase.from("teams").delete().eq("id", teamId);

  redirect("/");
}

export async function leaveTeamAction(formData: FormData) {
  const teamId = String(formData.get("teamId") ?? "").trim();
  if (!teamId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await supabase
    .from("members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", user.id);

  redirect("/");
}
