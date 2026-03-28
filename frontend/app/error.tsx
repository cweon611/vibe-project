"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl" aria-hidden="true">
        ⚠️
      </p>
      <h1 className="mt-4 text-xl font-bold text-gray-900">
        페이지를 불러올 수 없습니다
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        일시적인 오류가 발생했어요. 다시 시도하거나 로그인을 다시 해 주세요.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          다시 시도
        </button>
        <a
          href="/login"
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          로그인 페이지로
        </a>
      </div>
    </div>
  );
}
