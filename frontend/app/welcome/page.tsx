import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface PublicTeamRow {
  id: string;
  name: string;
}

export default async function WelcomePage() {
  const supabase = await createClient();

  const { data: publicTeamsRaw } = await supabase
    .from("teams")
    .select("id, name, created_at")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(20);

  const publicTeams: PublicTeamRow[] = publicTeamsRaw ?? [];

  const teamIds = publicTeams.map((t) => t.id);
  const memberCounts: Record<string, number> = {};

  if (teamIds.length > 0) {
    const { data: members } = await supabase
      .from("members")
      .select("team_id")
      .in("team_id", teamIds);

    for (const m of members ?? []) {
      memberCounts[m.team_id] = (memberCounts[m.team_id] ?? 0) + 1;
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-16">
      {/* 서비스 소개 */}
      <section className="text-center">
        <p className="text-5xl" aria-hidden="true">
          🍚
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
          오늘 뭐 먹지?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          팀에서 점심 메뉴를 제안하고 투표로 정해요.
          <br />
          아래에서 공개 팀과 생활관 식단을 확인할 수 있어요.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50"
          >
            회원가입
          </Link>
        </div>
      </section>

      {/* 바로가기 */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold text-gray-900">바로가기</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Link
            href="/dormitory-menu"
            className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
          >
            <span className="text-3xl">🍱</span>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-gray-700">
                생활관 주간 식단
              </p>
              <p className="mt-1 text-sm text-gray-500">
                전남대 생활관 이번 주 식단을 한눈에 확인하세요
              </p>
            </div>
          </Link>

          <Link
            href="/login"
            className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
          >
            <span className="text-3xl">🗳️</span>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-gray-700">
                점심 투표 참여
              </p>
              <p className="mt-1 text-sm text-gray-500">
                로그인 후 팀에서 오늘의 점심을 투표로 결정해요
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 공개 팀 */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold text-gray-900">공개 참여 팀</h2>
        <p className="mt-1 text-sm text-gray-500">
          로그인하면 아래 팀에 바로 참여할 수 있어요.
        </p>

        {publicTeams.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-10 text-center">
            <p className="text-sm text-gray-500">
              아직 공개 팀이 없어요. 로그인 후 팀을 만들어 보세요!
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {publicTeams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-gray-900">{team.name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {memberCounts[team.id] ?? 0}명 참여 중
                  </p>
                </div>
                <Link
                  href="/login"
                  className="shrink-0 rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-gray-800"
                >
                  로그인하고 참여
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 하단 CTA */}
      <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 px-6 py-8 text-center">
        <p className="text-sm text-gray-700">
          팀 만들기·투표·이력 등 모든 기능을 이용하려면 계정이 필요해요.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            무료 회원가입
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
