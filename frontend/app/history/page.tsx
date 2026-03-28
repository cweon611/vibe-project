"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface HistoryEntry {
  id: string;
  date: string;
  menuName: string;
  totalVotes: number;
  teamName?: string;
  isRepeated: boolean;
}

function HistoryLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
      </div>
    </div>
  );
}

function buildHistoryEntries(
  results: Record<string, unknown>[],
  teamNameMap?: Record<string, string>,
): HistoryEntry[] {
  const menuCount = new Map<string, number>();

  const entries: HistoryEntry[] = results.map((r, idx) => {
    const poll = r.polls as { date: string; team_id: string } | null;
    const suggestion = r.menu_suggestions as { name: string } | null;
    const menuName = suggestion?.name ?? "알 수 없음";
    const date = poll?.date ?? "";
    const teamName =
      teamNameMap && poll ? teamNameMap[poll.team_id] : undefined;

    menuCount.set(menuName, (menuCount.get(menuName) ?? 0) + 1);

    return {
      id: `${date}-${idx}`,
      date,
      menuName,
      totalVotes: (r.total_votes as number) ?? 0,
      teamName,
      isRepeated: false,
    };
  });

  for (const entry of entries) {
    if ((menuCount.get(entry.menuName) ?? 0) >= 2) {
      entry.isRepeated = true;
    }
  }

  return entries;
}

function HistoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const teamId = searchParams.get("teamId");

  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const showTeamLabel = !teamId;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      if (teamId) {
        const { data: team } = await supabase
          .from("teams")
          .select("name")
          .eq("id", teamId)
          .single();

        if (cancelled) return;
        if (team) setTeamName(team.name);

        const { data: results } = await supabase
          .from("poll_results")
          .select(
            "decided_at, total_votes, polls!inner(date, team_id), menu_suggestions!winning_suggestion_id(name)",
          )
          .eq("polls.team_id", teamId)
          .order("decided_at", { ascending: false })
          .limit(14);

        if (cancelled) return;

        setHistory(buildHistoryEntries((results as Record<string, unknown>[]) ?? []));
      } else {
        const { data: memberships } = await supabase
          .from("members")
          .select("team_id, teams(name)")
          .eq("user_id", user.id);

        if (cancelled) return;

        const teamIds = (memberships ?? []).map((m) => m.team_id);

        if (teamIds.length === 0) {
          setHistory([]);
          setLoading(false);
          return;
        }

        const teamNameMap: Record<string, string> = {};
        for (const m of memberships ?? []) {
          const t = m.teams as unknown as { name: string } | null;
          if (t) teamNameMap[m.team_id] = t.name;
        }

        const { data: results } = await supabase
          .from("poll_results")
          .select(
            "decided_at, total_votes, polls!inner(date, team_id), menu_suggestions!winning_suggestion_id(name)",
          )
          .in("polls.team_id", teamIds)
          .order("decided_at", { ascending: false })
          .limit(14);

        if (cancelled) return;

        setHistory(
          buildHistoryEntries(
            (results as Record<string, unknown>[]) ?? [],
            teamNameMap,
          ),
        );
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [teamId, router]);

  if (loading) return <HistoryLoading />;

  if (history.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">투표 이력</h1>
        {teamName && (
          <p className="mt-1 text-sm text-gray-500">{teamName}</p>
        )}

        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 px-6 py-16 text-center">
          <div className="text-5xl">📋</div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            아직 이력이 없어요
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            투표가 마감되면 이력이 쌓입니다.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">투표 이력</h1>
      <p className="mt-1 text-sm text-gray-500">
        {teamName || "최근 투표 결과를 확인하세요"}
      </p>

      <ul className="mt-6 space-y-3">
        {history.map((entry) => (
          <li
            key={entry.id}
            className="rounded-xl border border-gray-200 bg-white px-5 py-4 transition-colors hover:border-gray-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate font-semibold text-gray-900">
                  {entry.menuName}
                </span>

                {entry.isRepeated && (
                  <span className="shrink-0 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    단골 메뉴
                  </span>
                )}
              </div>

              <span className="shrink-0 ml-3 text-sm text-gray-500">
                {entry.totalVotes}명 참여
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
              <time>{formatDate(entry.date)}</time>
              {showTeamLabel && entry.teamName && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{entry.teamName}</span>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex justify-center">
        <Link
          href="/"
          className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [, month, day] = dateStr.split("-");
  return `${parseInt(month)}월 ${parseInt(day)}일`;
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<HistoryLoading />}>
      <HistoryContent />
    </Suspense>
  );
}
