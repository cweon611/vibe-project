"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Section = "idle" | "created" | "joined";

export default function TeamPage() {
  const router = useRouter();
  const [section, setSection] = useState<Section>("idle");

  const [teamName, setTeamName] = useState("");
  const [nickname, setNickname] = useState("");
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [joinNickname, setJoinNickname] = useState("");

  const [createdInviteCode, setCreatedInviteCode] = useState("");
  const [createdTeamId, setCreatedTeamId] = useState("");
  const [joinedTeamName, setJoinedTeamName] = useState("");
  const [joinedTeamId, setJoinedTeamId] = useState("");
  const [joinError, setJoinError] = useState("");
  const [createError, setCreateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublicTeam, setIsPublicTeam] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      const defaultNick = user?.user_metadata?.nickname ?? "";
      if (defaultNick) {
        setNickname(defaultNick);
        setJoinNickname(defaultNick);
      }
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({ name: teamName.trim(), is_public: isPublicTeam })
        .select()
        .single();

      if (teamError) {
        setCreateError(teamError.message);
        return;
      }
      if (!team) {
        setCreateError("팀 정보를 불러오지 못했어요. 다시 시도해 주세요.");
        return;
      }

      const { error: memberError } = await supabase
        .from("members")
        .insert({
          team_id: team.id,
          user_id: user.id,
          nickname: nickname.trim(),
        });

      if (memberError) {
        setCreateError(memberError.message);
        return;
      }

      setCreatedInviteCode(team.invite_code);
      setCreatedTeamId(team.id);
      setSection("created");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" &&
              err !== null &&
              "message" in err &&
              typeof (err as { message: unknown }).message === "string"
            ? (err as { message: string }).message
            : "팀 생성에 실패했어요.";
      setCreateError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError("");
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: teamRows, error: findError } = await supabase.rpc(
        "get_team_for_invite",
        { p_invite: inviteCodeInput.trim() },
      );

      const team = teamRows?.[0];

      if (findError || !team) {
        setJoinError("유효하지 않은 초대 코드예요. 다시 확인해 주세요.");
        return;
      }

      const { data: existing } = await supabase
        .from("members")
        .select("id")
        .eq("team_id", team.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        setJoinError("이미 이 팀에 참여하고 있어요.");
        return;
      }

      const { error: memberError } = await supabase
        .from("members")
        .insert({
          team_id: team.id,
          user_id: user.id,
          nickname: joinNickname.trim(),
        });

      if (memberError) throw memberError;

      setJoinedTeamName(team.name);
      setJoinedTeamId(team.id);
      setSection("joined");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "팀 참여에 실패했어요.";
      setJoinError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (section === "created") {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl">🎉</div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            팀이 만들어졌어요!
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            아래 초대 코드를 팀원들에게 공유하세요
          </p>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              초대 코드
            </p>
            <p className="mt-2 font-mono text-3xl font-bold tracking-widest text-gray-900">
              {createdInviteCode}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-2">
            {createdTeamId && (
              <Link
                href={`/team/${createdTeamId}`}
                className="inline-block w-full rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                팀 페이지 (코드·팀원)
              </Link>
            )}
            <Link
              href="/"
              className="inline-block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              홈으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (section === "joined") {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl">🙌</div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            팀에 참여했어요!
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            <span className="font-semibold text-gray-700">
              {joinedTeamName}
            </span>{" "}
            팀에 합류했습니다
          </p>

          <div className="mt-8 flex flex-col gap-2">
            {joinedTeamId && (
              <Link
                href={`/team/${joinedTeamId}`}
                className="inline-block w-full rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                팀 페이지 보기
              </Link>
            )}
            <Link
              href="/"
              className="inline-block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              홈으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">팀 설정</h1>
      <p className="mt-1 text-sm text-gray-500">
        새 팀을 만들거나, 초대 코드로 기존 팀에 참여하세요
      </p>

      {/* 팀 만들기 */}
      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">팀 만들기</h2>
        <p className="mt-1 text-sm text-gray-500">
          팀을 만들면 초대 코드가 자동 생성돼요
        </p>

        {createError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {createError}
          </div>
        )}

        <form onSubmit={handleCreate} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="teamName"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              팀 이름
            </label>
            <input
              id="teamName"
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="예: 개발팀"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="createNickname"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              닉네임
            </label>
            <input
              id="createNickname"
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="팀에서 사용할 이름"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={isPublicTeam}
              onChange={(e) => setIsPublicTeam(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            <span>
              <span className="font-medium text-gray-900">공개 팀으로 홈에 노출</span>
              <span className="mt-0.5 block text-xs text-gray-500">
                켜면 누구나 초대 코드 없이 홈에서 이 팀에 참여할 수 있어요.
              </span>
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "만드는 중…" : "만들기"}
          </button>
        </form>
      </section>

      {/* 구분선 */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-sm text-gray-400">또는</span>
        </div>
      </div>

      {/* 팀 참여하기 */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">팀 참여하기</h2>
        <p className="mt-1 text-sm text-gray-500">
          팀 관리자에게 받은 초대 코드를 입력하세요
        </p>

        <form onSubmit={handleJoin} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="inviteCode"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              초대 코드
            </label>
            <input
              id="inviteCode"
              type="text"
              required
              value={inviteCodeInput}
              onChange={(e) => {
                setInviteCodeInput(e.target.value);
                setJoinError("");
              }}
              placeholder="예: X7kQ9m"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="joinNickname"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              닉네임
            </label>
            <input
              id="joinNickname"
              type="text"
              required
              value={joinNickname}
              onChange={(e) => setJoinNickname(e.target.value)}
              placeholder="팀에서 사용할 이름"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          {joinError && (
            <p className="text-sm text-red-600">{joinError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "참여하는 중…" : "참여하기"}
          </button>
        </form>
      </section>
    </div>
  );
}
