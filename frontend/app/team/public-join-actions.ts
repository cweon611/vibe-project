"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { JoinPublicTeamState } from "./public-join-types";

export async function joinPublicTeamAction(
  _prev: JoinPublicTeamState | undefined,
  formData: FormData,
): Promise<JoinPublicTeamState> {
  const teamId = String(formData.get("teamId") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim();

  if (!teamId || !nickname) {
    return { error: "팀과 닉네임을 확인해 주세요." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요해요." };
  }

  const { data: team, error: teamErr } = await supabase
    .from("teams")
    .select("id, is_public")
    .eq("id", teamId)
    .single();

  if (teamErr || !team) {
    return { error: "팀을 찾을 수 없어요." };
  }

  if (!team.is_public) {
    return { error: "공개 참여가 아닌 팀이에요." };
  }

  const { data: existing } = await supabase
    .from("members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return { error: "이미 이 팀에 참여 중이에요." };
  }

  const { error: insErr } = await supabase.from("members").insert({
    team_id: teamId,
    user_id: user.id,
    nickname,
  });

  if (insErr) {
    return { error: insErr.message };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
