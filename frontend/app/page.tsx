import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type VoteStatus = "open" | "closed" | "none";

interface TeamRow {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
}

const statusConfig: Record<
  VoteStatus,
  { label: string; color: string; dot: string }
> = {
  open: {
    label: "투표 진행 중",
    color: "text-emerald-700 bg-emerald-50",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "마감됨",
    color: "text-gray-600 bg-gray-100",
    dot: "bg-gray-400",
  },
  none: {
    label: "아직 없음",
    color: "text-amber-700 bg-amber-50",
    dot: "bg-amber-500",
  },
};

function TeamCard({
  team,
  status,
  memberCount,
}: {
  team: TeamRow;
  status: VoteStatus;
  memberCount: number;
}) {
  const cfg = statusConfig[status];

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
      <Link
        href={`/team/${team.id}`}
        className="group block p-5 pb-4 transition-colors hover:bg-gray-50/80"
      >
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">
            {team.name}
          </h2>
          <span
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
              />
            </svg>
            {memberCount}명
          </span>
          <span className="inline-flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
            {new Date(team.created_at).toLocaleDateString("ko-KR")}
          </span>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          탭해서 초대 코드·팀원 보기 →
        </p>
      </Link>

      <div className="flex border-t border-gray-100">
        <Link
          href={`/vote?teamId=${team.id}`}
          className="flex flex-1 items-center justify-center py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          오늘 투표
        </Link>
        <Link
          href={`/team/${team.id}`}
          className="flex flex-1 items-center justify-center border-l border-gray-100 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          팀 정보
        </Link>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 px-6 py-16 text-center">
      <div className="text-5xl">🍽️</div>
      <h2 className="mt-4 text-lg font-semibold text-gray-900">
        아직 팀이 없어요
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        팀을 만들거나, 초대 코드로 참여해 보세요!
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/team"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          팀 만들기
        </Link>
        <Link
          href="/team"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          팀 참여하기
        </Link>
      </div>
    </div>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: myMemberships } = await supabase
    .from("members")
    .select("team_id, teams(id, name, invite_code, created_at)")
    .eq("user_id", user.id);

  const myTeams: TeamRow[] = (myMemberships ?? [])
    .map((m) => m.teams as unknown as TeamRow)
    .filter(Boolean);

  const teamIds = myTeams.map((t) => t.id);

  const memberCounts: Record<string, number> = {};
  const pollStatusMap: Record<string, VoteStatus> = {};

  if (teamIds.length > 0) {
    const { data: allMembers } = await supabase
      .from("members")
      .select("team_id")
      .in("team_id", teamIds);

    for (const m of allMembers ?? []) {
      memberCounts[m.team_id] = (memberCounts[m.team_id] ?? 0) + 1;
    }

    const today = new Date().toISOString().slice(0, 10);
    const { data: todayPolls } = await supabase
      .from("polls")
      .select("team_id, status")
      .in("team_id", teamIds)
      .eq("date", today);

    for (const p of todayPolls ?? []) {
      pollStatusMap[p.team_id] = p.status as VoteStatus;
    }
  }

  const hasTeams = myTeams.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">내 팀</h1>
      <p className="mt-1 text-sm text-gray-500">
        오늘의 점심, 팀과 함께 정해요
      </p>

      <section className="mt-6">
        {hasTeams ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {myTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                status={pollStatusMap[team.id] ?? "none"}
                memberCount={memberCounts[team.id] ?? 0}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>
    </div>
  );
}
