"use client";

import { useState } from "react";
import {
  deleteTeamAction,
  leaveTeamAction,
} from "@/app/team/[teamId]/actions";

export default function TeamDangerZone({
  teamId,
  teamName,
  isCreator,
}: {
  teamId: string;
  teamName: string;
  isCreator: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const actionLabel = isCreator ? "팀 삭제" : "팀 나가기";
  const actionDescription = isCreator
    ? "팀과 모든 팀원 정보가 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
    : "이 팀에서 나갑니다. 다시 참여하려면 초대 코드가 필요합니다.";

  return (
    <section className="mt-12 rounded-2xl border border-red-200 bg-red-50/50 p-5">
      <h2 className="text-sm font-semibold text-red-900">위험 영역</h2>

      {!confirmOpen ? (
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-red-800">{actionDescription}</p>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="shrink-0 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
          >
            {actionLabel}
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-sm font-medium text-red-900">
            정말 <span className="font-bold">{teamName}</span>{" "}
            {isCreator ? "팀을 삭제" : "에서 나가"}하시겠습니까?
          </p>
          <div className="flex gap-2">
            <form
              action={isCreator ? deleteTeamAction : leaveTeamAction}
              onSubmit={() => setSubmitting(true)}
            >
              <input type="hidden" name="teamId" value={teamId} />
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {submitting
                  ? "처리 중…"
                  : isCreator
                    ? "삭제 확인"
                    : "나가기 확인"}
              </button>
            </form>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
