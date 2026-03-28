"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { joinPublicTeamAction } from "@/app/team/public-join-actions";
import type { JoinPublicTeamState } from "@/app/team/public-join-types";

const initial: JoinPublicTeamState = {};

export interface PublicTeamListItem {
  id: string;
  name: string;
  memberCount: number;
}

export default function PublicTeamJoinCard({
  team,
  defaultNickname,
}: {
  team: PublicTeamListItem;
  defaultNickname: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    joinPublicTeamAction,
    initial,
  );

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between"
    >
      <input type="hidden" name="teamId" value={team.id} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900">{team.name}</p>
        <p className="mt-0.5 text-xs text-gray-500">
          {team.memberCount}명 참여 중 · 초대 코드 없이 참여
        </p>
        <label className="mt-3 block text-xs font-medium text-gray-600">
          팀에서 쓸 닉네임
          <input
            name="nickname"
            required
            defaultValue={defaultNickname}
            placeholder="닉네임"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:max-w-xs"
          />
        </label>
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        {state.error && (
          <p className="text-right text-xs text-red-600">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? "참여 중…" : "바로 참여"}
        </button>
      </div>
    </form>
  );
}
