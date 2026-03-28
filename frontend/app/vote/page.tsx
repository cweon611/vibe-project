"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Poll, MenuSuggestion } from "@/lib/types";

interface SuggestionWithCount extends MenuSuggestion {
  vote_count: number;
}

function VoteLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
      </div>
    </div>
  );
}

function VoteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const teamId = searchParams.get("teamId");

  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [memberId, setMemberId] = useState<string | null>(null);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionWithCount[]>([]);
  const [myVoteSuggestionId, setMyVoteSuggestionId] = useState<string | null>(
    null,
  );
  const [menuInput, setMenuInput] = useState("");
  const [duplicateAlert, setDuplicateAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const loadPollData = useCallback(
    async (pollId: string, mId: string) => {
      const supabase = createClient();

      const [{ data: sugs }, { data: allVotes }, { data: myVote }] =
        await Promise.all([
          supabase
            .from("menu_suggestions")
            .select("*")
            .eq("poll_id", pollId)
            .order("created_at", { ascending: true }),
          supabase
            .from("votes")
            .select("suggestion_id")
            .eq("poll_id", pollId),
          supabase
            .from("votes")
            .select("suggestion_id")
            .eq("poll_id", pollId)
            .eq("member_id", mId)
            .maybeSingle(),
        ]);

      const voteCounts: Record<string, number> = {};
      for (const v of allVotes ?? []) {
        voteCounts[v.suggestion_id] =
          (voteCounts[v.suggestion_id] ?? 0) + 1;
      }

      setSuggestions(
        (sugs ?? []).map((s) => ({
          ...(s as MenuSuggestion),
          vote_count: voteCounts[s.id] ?? 0,
        })),
      );
      setMyVoteSuggestionId(myVote?.suggestion_id ?? null);
    },
    [],
  );

  useEffect(() => {
    if (!teamId) {
      router.push("/");
      return;
    }

    let cancelled = false;

    async function init() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const [{ data: team }, { data: member }] = await Promise.all([
        supabase.from("teams").select("name").eq("id", teamId!).single(),
        supabase
          .from("members")
          .select("id")
          .eq("team_id", teamId!)
          .eq("user_id", user.id)
          .single(),
      ]);

      if (cancelled) return;

      if (!team) {
        setError("팀을 찾을 수 없습니다.");
        setLoading(false);
        return;
      }
      setTeamName(team.name);

      if (!member) {
        setError("이 팀의 멤버가 아닙니다.");
        setLoading(false);
        return;
      }
      setMemberId(member.id);

      const { data: pollData } = await supabase
        .from("polls")
        .select("*")
        .eq("team_id", teamId!)
        .eq("date", today)
        .maybeSingle();

      if (cancelled) return;

      if (pollData) {
        setPoll(pollData as Poll);
        await loadPollData(pollData.id, member.id);
      }

      setLoading(false);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [teamId, today, router, loadPollData]);

  async function handleOpenPoll() {
    if (!teamId || !memberId || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { data: newPoll, error: pollError } = await supabase
        .from("polls")
        .insert({
          team_id: teamId,
          date: today,
          status: "open",
          deadline: `${today}T12:00:00Z`,
        })
        .select()
        .single();

      if (pollError) throw pollError;
      setPoll(newPoll as Poll);
      setSuggestions([]);
      setMyVoteSuggestionId(null);
    } catch {
      setError(
        "투표를 열지 못했습니다. 이미 오늘의 투표가 존재할 수 있습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSuggest() {
    if (!poll || !memberId || isSubmitting) return;
    const trimmed = menuInput.trim();
    if (!trimmed) return;

    if (suggestions.some((s) => s.name === trimmed)) {
      setDuplicateAlert(true);
      setTimeout(() => setDuplicateAlert(false), 2000);
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: newSug, error: sugError } = await supabase
        .from("menu_suggestions")
        .insert({
          poll_id: poll.id,
          name: trimmed,
          suggested_by: memberId,
        })
        .select()
        .single();

      if (sugError) {
        if (sugError.code === "23505") {
          setDuplicateAlert(true);
          setTimeout(() => setDuplicateAlert(false), 2000);
        }
        return;
      }

      setSuggestions((prev) => [
        ...prev,
        { ...(newSug as MenuSuggestion), vote_count: 0 },
      ]);
      setMenuInput("");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVote(suggestionId: string) {
    if (!poll || !memberId || poll.status !== "open" || isSubmitting) return;

    const previousVote = myVoteSuggestionId;
    if (previousVote === suggestionId) return;

    setMyVoteSuggestionId(suggestionId);
    setSuggestions((prev) =>
      prev.map((s) => {
        let count = s.vote_count;
        if (s.id === previousVote) count = Math.max(0, count - 1);
        if (s.id === suggestionId) count++;
        return { ...s, vote_count: count };
      }),
    );

    try {
      const supabase = createClient();
      const { error: voteError } = await supabase.from("votes").upsert(
        {
          poll_id: poll.id,
          member_id: memberId,
          suggestion_id: suggestionId,
        },
        { onConflict: "poll_id,member_id" },
      );

      if (voteError) {
        setMyVoteSuggestionId(previousVote);
        setSuggestions((prev) =>
          prev.map((s) => {
            let count = s.vote_count;
            if (s.id === suggestionId) count = Math.max(0, count - 1);
            if (s.id === previousVote) count++;
            return { ...s, vote_count: count };
          }),
        );
      }
    } catch {
      setMyVoteSuggestionId(previousVote);
      setSuggestions((prev) =>
        prev.map((s) => {
          let count = s.vote_count;
          if (s.id === suggestionId) count = Math.max(0, count - 1);
          if (s.id === previousVote) count++;
          return { ...s, vote_count: count };
        }),
      );
    }
  }

  async function handleClosePoll() {
    if (!poll || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/polls/${poll.id}/close`, {
        method: "POST",
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to close poll");
      }

      setPoll({ ...poll, status: "closed" });
    } catch {
      setError("투표를 마감하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <VoteLoading />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">투표</h1>
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 px-6 py-16 text-center">
          <div className="text-5xl">⚠️</div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">{error}</h2>
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

  if (!poll) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">투표</h1>
        <p className="mt-1 text-sm text-gray-500">
          {teamName} · {today}
        </p>

        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 px-6 py-16 text-center">
          <div className="text-5xl">🗳️</div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            오늘의 투표가 아직 없어요
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            투표를 열어 팀원들과 메뉴를 정해 보세요!
          </p>
          <button
            type="button"
            onClick={handleOpenPoll}
            disabled={isSubmitting}
            className="mt-6 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "여는 중…" : "투표 열기"}
          </button>
        </div>
      </div>
    );
  }

  if (poll.status === "closed") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">투표</h1>
        <p className="mt-1 text-sm text-gray-500">
          {teamName} · {poll.date}
        </p>

        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 px-6 py-16 text-center">
          <div className="text-5xl">✅</div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            이미 마감된 투표입니다
          </h2>
          <p className="mt-1 text-sm text-gray-500">결과를 확인해 보세요.</p>
          <Link
            href={`/result?teamId=${teamId}&pollId=${poll.id}`}
            className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            결과 보기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">투표</h1>
          <p className="mt-1 text-sm text-gray-500">
            {teamName} · {poll.date}
          </p>
        </div>
        {poll.deadline && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            마감{" "}
            {new Date(poll.deadline).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {/* 메뉴 제안 입력 */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-gray-700">메뉴 제안하기</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSuggest();
          }}
          className="mt-2 flex gap-2"
        >
          <input
            type="text"
            value={menuInput}
            onChange={(e) => {
              setMenuInput(e.target.value);
              setDuplicateAlert(false);
            }}
            placeholder="메뉴 이름을 입력하세요"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            제안하기
          </button>
        </form>
        {duplicateAlert && (
          <p className="mt-2 text-xs font-medium text-red-600">
            이미 같은 이름의 메뉴가 제안되어 있습니다.
          </p>
        )}
      </section>

      {/* 제안된 메뉴 목록 & 투표 */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-gray-700">
          제안 메뉴 ({suggestions.length})
        </h2>

        {suggestions.length === 0 ? (
          <p className="mt-4 text-center text-sm text-gray-400">
            아직 제안된 메뉴가 없습니다. 첫 번째로 제안해 보세요!
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {suggestions.map((sug) => {
              const isMyVote = myVoteSuggestionId === sug.id;

              return (
                <li key={sug.id}>
                  <button
                    type="button"
                    onClick={() => handleVote(sug.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                      isMyVote
                        ? "border-emerald-300 bg-emerald-50 ring-1 ring-emerald-300"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          isMyVote
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {isMyVote ? "✓" : sug.vote_count}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {sug.name}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-medium ${
                        isMyVote ? "text-emerald-700" : "text-gray-400"
                      }`}
                    >
                      {sug.vote_count}표
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 투표 마감 버튼 */}
      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={handleClosePoll}
          disabled={isSubmitting}
          className="rounded-lg border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          투표 마감하기
        </button>
      </div>
    </div>
  );
}

export default function VotePage() {
  return (
    <Suspense fallback={<VoteLoading />}>
      <VoteContent />
    </Suspense>
  );
}
