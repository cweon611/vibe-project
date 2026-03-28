import type { Metadata } from "next";
import Link from "next/link";
import { fetchDormitoryMenu } from "@/lib/dormitory-menu/fetch-menu";
import type {
  DormitoryMenuPayload,
  DormitoryMenuNav,
} from "@/lib/dormitory-menu/types";

export const metadata: Metadata = {
  title: "생활관 주간 식단",
  description: "전남대 광주 생활관 주간 식단표 (공식 사이트 연동)",
};

const OFFICIAL_MENU_URL =
  "https://dormitory.jnu.ac.kr/Board/Board.aspx?BoardID=2";

function WeekNav({ nav }: { nav: DormitoryMenuNav }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      {nav.prevWeek ? (
        <Link
          href={`/dormitory-menu?st=${encodeURIComponent(nav.prevWeek.st)}&ed=${encodeURIComponent(nav.prevWeek.ed)}`}
          className="inline-flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 sm:flex-none"
        >
          <span aria-hidden>←</span>
          <span className="truncate">{nav.prevWeek.label}</span>
        </Link>
      ) : (
        <span className="flex-1 sm:flex-none" />
      )}

      <p className="order-first w-full text-center text-base font-semibold text-gray-900 sm:order-none sm:w-auto">
        {nav.weekLabel}
      </p>

      {nav.nextWeek ? (
        <Link
          href={`/dormitory-menu?st=${encodeURIComponent(nav.nextWeek.st)}&ed=${encodeURIComponent(nav.nextWeek.ed)}`}
          className="inline-flex min-w-0 flex-1 items-center justify-end gap-2 text-right text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 sm:flex-none"
        >
          <span className="truncate">{nav.nextWeek.label}</span>
          <span aria-hidden>→</span>
        </Link>
      ) : (
        <span className="flex-1 sm:flex-none" />
      )}
    </div>
  );
}

function MealTimeSection({ data }: { data: DormitoryMenuPayload }) {
  if (data.mealTimeTables.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">식사 시간</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {data.mealTimeTables.map((block, i) => (
          <div
            key={block.title}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <div
              className={
                i === 0
                  ? "bg-emerald-700/90 px-3 py-2 text-center text-sm font-semibold text-white"
                  : "bg-rose-700/90 px-3 py-2 text-center text-sm font-semibold text-white"
              }
            >
              {block.title}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-center text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {block.headers.map((h) => (
                      <th
                        key={h}
                        className="px-2 py-2 font-medium text-gray-700"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-gray-100">
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="px-2 py-2 text-gray-600"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MenuTable({ data }: { data: DormitoryMenuPayload }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <caption className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-left text-base font-semibold text-gray-900">
          {data.caption}
        </caption>
        <thead>
          <tr className="border-b border-gray-200 bg-amber-50/80">
            <th className="sticky left-0 z-10 w-28 min-w-[7rem] border-r border-gray-200 bg-amber-50/95 px-3 py-3 text-xs font-semibold text-gray-800 backdrop-blur sm:w-36">
              구분
            </th>
            {data.columns.map((col) => (
              <th
                key={`${col.weekday}-${col.date}`}
                className="min-w-[8.5rem] px-3 py-3 text-center text-xs font-semibold text-gray-800"
              >
                <span className="block">{col.weekday}</span>
                <span className="mt-0.5 block font-normal text-gray-600">
                  {col.date}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-gray-100 odd:bg-white even:bg-gray-50/60"
            >
              <th className="sticky left-0 z-10 border-r border-gray-200 bg-gray-50/95 px-3 py-3 text-left text-xs font-semibold text-gray-800 backdrop-blur sm:text-sm">
                {row.category}
              </th>
              {row.cells.map((cell, ci) => (
                <td
                  key={ci}
                  className="align-top px-3 py-3 text-xs leading-relaxed text-gray-700 whitespace-pre-line sm:text-sm"
                >
                  {cell || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function DormitoryMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ st?: string; ed?: string }>;
}) {
  const { st, ed } = await searchParams;
  const stClean = st?.trim();
  const edClean = ed?.trim();
  const result = await fetchDormitoryMenu(
    stClean && edClean ? stClean : undefined,
    stClean && edClean ? edClean : undefined,
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-16">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          생활관 주간 식단
        </h1>
        <p className="text-sm text-gray-600">
          전남대학교 광주캠퍼스 생활관 공식 게시판의 주간 식단을 불러옵니다. 변경
          사항은{" "}
          <a
            href={OFFICIAL_MENU_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-emerald-700 underline decoration-emerald-200 underline-offset-2 hover:text-emerald-800"
          >
            생활관 홈페이지
          </a>
          를 기준으로 합니다.
        </p>
      </div>

      {!result.ok ? (
        <div className="space-y-6">
          {result.nav && <WeekNav nav={result.nav} />}

          <div
            className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-6 text-amber-950"
            role="alert"
          >
            <p className="font-medium">{result.error}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/dormitory-menu"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-800"
              >
                <span aria-hidden>←</span> 이번 주 식단 보기
              </Link>
              <a
                href={OFFICIAL_MENU_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-emerald-800 underline underline-offset-2"
              >
                공식 페이지에서 직접 확인
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          <WeekNav nav={result.data} />
          <MealTimeSection data={result.data} />
          {result.data.legendText ? (
            <p className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
              {result.data.legendText}
            </p>
          ) : null}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">이번 주 메뉴</h2>
            <MenuTable data={result.data} />
          </section>
          <p className="text-center text-xs text-gray-400">
            출처:{" "}
            <a
              href={result.data.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600"
            >
              {result.data.sourceUrl}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
