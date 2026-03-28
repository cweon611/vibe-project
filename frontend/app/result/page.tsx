"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface DistributionItem {
  id: string;
  name: string;
  count: number;
  ratio: number;
  isWinner: boolean;
}

function ResultLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
      </div>
    </div>
  );
}

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const teamId = searchParams.get("teamId");
  const pollIdParam = searchParams.get("pollId");

  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [pollDate, setPollDate] = useState("");
  const [winnerName, setWinnerName] = useState("");
  const [totalVotes, setTotalVotes] = useState(0);
  const [distribution, setDistribution] = useState<DistributionItem[]>([]);
  const [hasResult, setHasResult] = useState(false);

  useEffect(() => {
    if (!teamId) {
      router.push("/");
      return;
    }

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

      const { data: team } = await supabase
        .from("teams")
        .select("name")
        .eq("id", teamId!)
        .single();

      if (cancelled) return;
      if (team) setTeamName(team.name);

      let pollId = pollIdParam;

      if (!pollId) {
        const today = new Date().toISOString().slice(0, 10);
        const { data: poll } = await supabase
          .from("polls")
          .select("id, date")
          .eq("team_id", teamId!)
          .eq("date", today)
          .eq("status", "closed")
          .maybeSingle();

        if (cancelled) return;

        if (!poll) {
          setLoading(false);
          return;
        }

        pollId = poll.id;
        setPollDate(poll.date);
      } else {
        const { data: poll } = await supabase
          .from("polls")
          .select("date")
          .eq("id", pollId)
          .single();

        if (cancelled) return;
        if (poll) setPollDate(poll.date);
      }

      const { data: result } = await supabase
        .from("poll_results")
        .select("*, menu_suggestions!winning_suggestion_id(name)")
        .eq("poll_id", pollId!)
        .single();

      if (cancelled) return;

      if (!result) {
        setLoading(false);
        return;
      }

      setHasResult(true);
      setWinnerName(
        (result.menu_suggestions as unknown as { name: string })?.name ?? "",
      );
      setTotalVotes(result.total_votes);

      const [{ data: suggestions }, { data: allVotes }] = await Promise.all([
        supabase
          .from("menu_suggestions")
          .select("id, name")
          .eq("poll_id", pollId!),
        supabase
          .from("votes")
          .select("suggestion_id")
          .eq("poll_id", pollId!),
      ]);

      if (cancelled) return;

      const voteCounts: Record<string, number> = {};
      for (const v of allVotes ?? []) {
        voteCounts[v.suggestion_id] =
          (voteCounts[v.suggestion_id] ?? 0) + 1;
      }

      const total = allVotes?.length ?? 0;

      const dist = (suggestions ?? [])
        .map((s) => ({
          id: s.id,
          name: s.name,
          count: voteCounts[s.id] ?? 0,
          ratio: total > 0 ? (voteCounts[s.id] ?? 0) / total : 0,
          isWinner: s.id === result.winning_suggestion_id,
        }))
        .sort((a, b) => b.count - a.count);

      setDistribution(dist);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [teamId, pollIdParam, router]);

  if (loading) return <ResultLoading />;

  if (!hasResult) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">투표 결과</h1>

        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 px-6 py-16 text-center">
          <div className="text-5xl">📭</div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            아직 결과가 없어요
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            투표가 마감되면 결과를 확인할 수 있습니다.
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
      <h1 className="text-2xl font-bold text-gray-900">투표 결과</h1>
      <p className="mt-1 text-sm text-gray-500">
        {pollDate} · {teamName}
      </p>

      <section className="mt-8 flex flex-col items-center rounded-2xl bg-gradient-to-b from-amber-50 to-white border border-amber-100 px-6 py-10 text-center">
        <span className="text-6xl">🎉</span>
        <p className="mt-4 text-sm font-medium text-amber-700">
          오늘의 메뉴
        </p>
        <h2 className="mt-1 text-3xl font-extrabold text-gray-900">
          {winnerName}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          총{" "}
          <span className="font-semibold text-gray-700">{totalVotes}명</span>이
          투표에 참여했어요
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-gray-700">득표 분포</h2>

        <ul className="mt-4 space-y-3">
          {distribution.map((item) => (
            <li key={item.id}>
              <div className="flex items-center justify-between text-sm">
                <span
                  className={`font-medium ${
                    item.isWinner ? "text-amber-700" : "text-gray-700"
                  }`}
                >
                  {item.isWinner && "🏆 "}
                  {item.name}
                </span>
                <span className="text-gray-500">
                  {item.count}표 ({Math.round(item.ratio * 100)}%)
                </span>
              </div>

              <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.isWinner ? "bg-amber-400" : "bg-gray-300"
                  }`}
                  style={{ width: `${Math.max(item.ratio * 100, 2)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

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

export default function ResultPage() {
  return (
    <Suspense fallback={<ResultLoading />}>
      <ResultContent />
    </Suspense>
  );
}
