import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InviteCodeBlock from "@/components/InviteCodeBlock";
import TeamDangerZone from "@/components/TeamDangerZone";

interface PageProps {
  params: Promise<{ teamId: string }>;
}

export default async function TeamDetailPage({ params }: PageProps) {
  const { teamId } = await params;

  if (!teamId) {
    notFound();
  }

  const supabase = await createClient();

  let user;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    redirect("/login");
  }

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect("/");
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, name, invite_code, created_at, is_public, created_by")
    .eq("id", teamId)
    .single();

  if (teamError || !team) {
    notFound();
  }

  const { data: teammates } = await supabase
    .from("members")
    .select("id, nickname, joined_at")
    .eq("team_id", teamId)
    .order("joined_at", { ascending: true });

  const isPublic = Boolean(
    team.is_public as boolean | null | undefined,
  );

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link
        href="/"
        className="text-sm text-gray-500 transition-colors hover:text-gray-800"
      >
        ← 홈
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
        {isPublic && (
          <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800">
            공개 참여 팀
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-500">
        팀원이면 언제든지 이 페이지에서 초대 코드를 다시 볼 수 있어요.
      </p>

      <div className="mt-8">
        <InviteCodeBlock code={team.invite_code} teamName={team.name} />
      </div>

      <div className="mt-6 rounded-lg border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
        <strong className="font-semibold">닉네임으로 친구 초대</strong>는 계정
        검색 기능이 필요해 아직 없어요. 초대 코드를 공유하거나, 공개 팀이면
        홈에서 바로 참여할 수 있어요.
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-gray-900">팀원</h2>
        <p className="mt-1 text-xs text-gray-500">
          팀 안에서 쓰는 닉네임이에요
        </p>
        <ul className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {(teammates ?? []).map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span className="font-medium text-gray-900">{m.nickname}</span>
              <span className="text-xs text-gray-400">
                {m.joined_at
                  ? new Date(m.joined_at).toLocaleDateString("ko-KR")
                  : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/vote?teamId=${team.id}`}
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          오늘 투표
        </Link>
        <Link
          href={`/history?teamId=${team.id}`}
          className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50"
        >
          팀 이력
        </Link>
        <Link
          href="/team"
          className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          다른 팀 참여
        </Link>
      </div>

      <TeamDangerZone
        teamId={team.id}
        teamName={team.name}
        isCreator={team.created_by === user.id}
      />
    </div>
  );
}
