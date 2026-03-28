"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "@/app/auth/actions";
import type { AuthFormState } from "@/app/auth/types";

const initialState: AuthFormState = {};

function EmailSentScreen({ email }: { email?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg
            className="h-8 w-8 text-emerald-600"
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
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
          이메일을 확인해 주세요
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          {email ? (
            <>
              <span className="font-semibold text-gray-900">{email}</span>
              으로 인증 링크를 보냈어요.
            </>
          ) : (
            "입력하신 이메일로 인증 링크를 보냈어요."
          )}
        </p>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-left text-sm text-amber-900">
          <p className="font-semibold">로그인 전에 반드시 인증이 필요합니다</p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-amber-800">
            <li>받은 메일함(스팸함 포함)을 확인하세요</li>
            <li>메일의 인증 링크를 클릭하세요</li>
            <li>인증 완료 후 아래 로그인 버튼을 눌러 주세요</li>
          </ol>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            로그인하러 가기
          </Link>
          <Link
            href="/signup"
            className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            다시 가입하기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(
    signupAction,
    initialState,
  );

  if (state.info) {
    return <EmailSentScreen email={state.email} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-bold tracking-tight">
          회원가입
        </h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          새 계정을 만들고 팀에 참여하세요
        </p>

        {state.error && (
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
              minLength={6}
              autoComplete="new-password"
              placeholder="6자 이상"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="nickname"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              닉네임
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              autoComplete="nickname"
              placeholder="팀에서 사용할 이름"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "가입 중…" : "가입하기"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="font-medium text-gray-900 underline-offset-4 hover:underline"
          >
            로그인
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
