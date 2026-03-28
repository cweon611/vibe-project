import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md text-center">
        <p className="text-5xl" aria-hidden="true">
          🍚
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
          오늘 뭐 먹지?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          팀에서 점심 메뉴를 제안하고 투표로 정해요. 로그인하면 팀 만들기·참여와
          투표를 이용할 수 있어요.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50"
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
