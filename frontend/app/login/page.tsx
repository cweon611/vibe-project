"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, EMAIL_NOT_CONFIRMED_TAG } from "@/app/auth/actions";
import type { AuthFormState } from "@/app/auth/types";

const initialState: AuthFormState = {};

function EmailNotConfirmedBanner() {
  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
          />
        </svg>
        <div>
          <p className="font-semibold">이메일 인증이 완료되지 않았어요</p>
          <p className="mt-1 text-amber-800">
            가입 시 입력한 이메일의 받은편지함(스팸함 포함)에서 인증 링크를
            클릭한 뒤 다시 로그인해 주세요.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  const isEmailNotConfirmed = state.error === EMAIL_NOT_CONFIRMED_TAG;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-bold tracking-tight">
          로그인
        </h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          오늘 뭐 먹지? 에 오신 걸 환영해요
        </p>

        {isEmailNotConfirmed && <EmailNotConfirmedBanner />}

        {state.error && !isEmailNotConfirmed && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "로그인 중…" : "로그인"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          아직 계정이 없으신가요?{" "}
          <Link
            href="/signup"
            className="font-medium text-gray-900 underline-offset-4 hover:underline"
          >
            회원가입
          </Link>
        </p>

        <p className="mt-4 text-center text-sm">
          <Link
            href="/welcome"
            className="text-gray-500 underline-offset-4 hover:text-gray-800 hover:underline"
          >
            로그인 없이 둘러보기
          </Link>
        </p>
      </div>
    </div>
  );
}
