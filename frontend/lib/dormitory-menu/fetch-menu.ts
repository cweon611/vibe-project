import * as cheerio from "cheerio";
import type {
  DormitoryMenuColumn,
  DormitoryMenuPayload,
  DormitoryMenuResult,
  DormitoryMenuRow,
  DormitoryMealTimeTable,
  DormitoryWeekNav,
} from "./types";

const ORIGIN = "https://dormitory.jnu.ac.kr";

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; JNU-DormMenuReader/1.0; +https://github.com/)",
  Accept: "text/html,application/xhtml+xml",
};

export function buildDormitoryBoardUrl(st?: string, ed?: string): string {
  if (st && ed) {
    const params = new URLSearchParams({
      BoardID: "2",
      Mode: "List",
      PageNum: "1",
      Key: "",
      Value: "",
      Cate: "",
      ST_DT: st,
      ED_DT: ed,
    });
    return `${ORIGIN}/Board/Board.aspx?${params.toString()}`;
  }
  return `${ORIGIN}/Board/Board.aspx?BoardID=2`;
}

function parseWeekNav(
  $: cheerio.CheerioAPI,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- cheerio element handle
  el: cheerio.Cheerio<any>,
): DormitoryWeekNav | null {
  const href = el.attr("href");
  if (!href) return null;
  let url: URL;
  try {
    url = new URL(href, ORIGIN);
  } catch {
    return null;
  }
  const st = url.searchParams.get("ST_DT");
  const ed = url.searchParams.get("ED_DT");
  if (!st || !ed) return null;
  const label = el.find("span").first().text().trim() || el.text().trim();
  return { st, ed, label };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- cheerio element handle
function extractCellText(el: cheerio.Cheerio<any>): string {
  const html = el.html() ?? "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\r\n/g, "\n")
    .trim();
}

function parseMenuTable(
  $: cheerio.CheerioAPI,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- cheerio element handle
  table: cheerio.Cheerio<any>,
): Pick<
  DormitoryMenuPayload,
  "caption" | "columns" | "rows"
> | null {
  const caption = table.find("caption").first().text().trim();
  const headerCells = table.find("thead th").toArray();
  if (headerCells.length < 2) return null;

  const columns: DormitoryMenuColumn[] = [];
  for (let i = 1; i < headerCells.length; i++) {
    const th = $(headerCells[i]);
    const weekday = th.clone().children("p").remove().end().text().trim();
    const date = th.find("p").first().text().trim();
    columns.push({ weekday, date });
  }

  const rows: DormitoryMenuRow[] = [];
  table.find("tbody tr").each((_, tr) => {
    const $tr = $(tr);
    const th = $tr.find("th").first();
    if (!th.length) return;
    const category = th.text().replace(/\s+/g, " ").trim();
    const cells = $tr
      .find("td")
      .toArray()
      .map((td) => extractCellText($(td)));
    if (cells.length === columns.length) {
      rows.push({ category, cells });
    }
  });

  if (columns.length === 0 || rows.length === 0) return null;

  return { caption, columns, rows };
}

function parseMealTimeTables(
  $: cheerio.CheerioAPI,
): DormitoryMealTimeTable[] {
  const out: DormitoryMealTimeTable[] = [];
  $(".meal-time-info .card").each((_, card) => {
    const $card = $(card);
    const title = $card.find(".card-header").first().text().trim();
    const table = $card.find("table").first();
    if (!title || !table.length) return;

    const headers = table
      .find("thead th")
      .toArray()
      .map((th) => $(th).text().trim());

    const rows: string[][] = [];
    table.find("tbody tr").each((_, tr) => {
      const row: string[] = [];
      $(tr)
        .find("td")
        .each((_, td) => {
          const $td = $(td);
          const text = $td.text().trim();
          const colspan = Math.max(1, parseInt($td.attr("colspan") ?? "1", 10));
          for (let k = 0; k < colspan; k++) row.push(text);
        });
      if (row.length) rows.push(row);
    });

    out.push({ title, headers, rows });
  });
  return out;
}

export async function fetchDormitoryMenu(
  st?: string,
  ed?: string,
): Promise<DormitoryMenuResult> {
  const sourceUrl = buildDormitoryBoardUrl(st, ed);

  let res: Response;
  try {
    res = await fetch(sourceUrl, {
      headers: FETCH_HEADERS,
      next: { revalidate: 1800 },
    });
  } catch {
    return { ok: false, error: "생활관 사이트에 연결할 수 없습니다." };
  }

  if (!res.ok) {
    return {
      ok: false,
      error: `식단 페이지를 불러오지 못했습니다. (${res.status})`,
      status: res.status,
    };
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const weekLabel = $("#ctl00_PageContentPlaceHolder_ctl00_lbl_Date")
    .text()
    .trim();

  const prevWeek = parseWeekNav($, $("a.week-prev").first());
  const nextWeek = parseWeekNav($, $("a.week-next").first());

  const legendText = $(".menuplan > .pt-1.pb-1").first().text().replace(/\s+/g, " ").trim();

  const table = $(".menuplan table.color").first();
  if (!table.length) {
    return {
      ok: false,
      error: "식단표 형식을 인식하지 못했습니다. 원문 사이트를 확인해 주세요.",
    };
  }

  const parsed = parseMenuTable($, table);
  if (!parsed) {
    return {
      ok: false,
      error: "식단표 데이터를 읽을 수 없습니다.",
    };
  }

  const mealTimeTables = parseMealTimeTables($);

  return {
    ok: true,
    data: {
      weekLabel: weekLabel || parsed.columns.map((c) => c.date).join(" ~ "),
      prevWeek,
      nextWeek,
      legendText,
      caption: parsed.caption,
      columns: parsed.columns,
      rows: parsed.rows,
      mealTimeTables,
      sourceUrl,
    },
  };
}
