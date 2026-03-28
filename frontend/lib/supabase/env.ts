import {
  EMBEDDED_SUPABASE_ANON_KEY,
  EMBEDDED_SUPABASE_URL,
} from "./embedded-public-env";

const API_SETTINGS =
  "https://supabase.com/dashboard/project/_/settings/api";

function firstDefined(...keys: string[]): string {
  for (const key of keys) {
    const raw = process.env[key];
    if (typeof raw === "string") {
      const v = raw.trim();
      if (v) return v;
    }
  }
  return "";
}

function missingMessage(primary: string, fallbacks: string[]): string {
  const names = [primary, ...fallbacks].join(" or ");
  return (
    `[Supabase] ${names} is missing or empty. ` +
    `Create or edit frontend/.env.local (see frontend/.env.example). ` +
    `Restart dev after editing env. From repo root: npm run dev. ` +
    `Values: ${API_SETTINGS}`
  );
}

export function getSupabaseUrl(): string {
  const value = firstDefined("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  if (value) return value;
  if (EMBEDDED_SUPABASE_URL.trim()) return EMBEDDED_SUPABASE_URL.trim();
  throw new Error(missingMessage("NEXT_PUBLIC_SUPABASE_URL", ["SUPABASE_URL"]));
}

export function getSupabaseAnonKey(): string {
  const value = firstDefined(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_ANON_KEY",
  );
  if (value) return value;
  if (EMBEDDED_SUPABASE_ANON_KEY.trim())
    return EMBEDDED_SUPABASE_ANON_KEY.trim();
  throw new Error(
    missingMessage("NEXT_PUBLIC_SUPABASE_ANON_KEY", ["SUPABASE_ANON_KEY"]),
  );
}
