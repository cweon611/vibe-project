"use client";

import { useState } from "react";

export default function InviteCodeBlock({
  code,
  teamName,
}: {
  code: string;
  teamName: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const shareLine = `「${teamName}」 팀 초대 코드: ${code}`;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-5">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
        초대 코드
      </p>
      <p className="mt-2 font-mono text-2xl font-bold tracking-widest text-gray-900 sm:text-3xl">
        {code}
      </p>
      <p className="mt-3 text-xs text-gray-500">{shareLine}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          {copied ? "복사됨!" : "코드 복사"}
        </button>
      </div>
    </div>
  );
}
