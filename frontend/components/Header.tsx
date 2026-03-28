"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/", label: "홈" },
  { href: "/vote", label: "투표" },
  { href: "/history", label: "이력" },
  { href: "/dormitory-menu", label: "생활관 식단" },
];

const hideHeaderRoutes = ["/login", "/signup", "/welcome"];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/login");
  };

  if (hideHeaderRoutes.includes(pathname)) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        {/* 서비스 이름 */}
        <Link href="/" className="text-lg font-bold tracking-tight">
          🍚 오늘 뭐 먹지?
        </Link>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden items-center gap-1 sm:flex">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={handleSignOut}
            className="ml-3 rounded-md px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            로그아웃
          </button>
        </nav>

        {/* 모바일 햄버거 버튼 */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 sm:hidden"
          aria-label="메뉴 열기"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {mobileOpen && (
        <nav className="border-t border-gray-200 bg-white px-4 pb-3 pt-2 sm:hidden">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-1 block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            로그아웃
          </button>
        </nav>
      )}
    </header>
  );
}
