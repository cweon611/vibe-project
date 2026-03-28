import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Always load .env* from the frontend app root (this file's directory), not repo cwd.
const frontendRoot = path.dirname(fileURLToPath(import.meta.url));
loadEnvConfig(frontendRoot);

const supabaseUrl = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  ""
).trim();

const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  ""
).trim();

const nextConfig: NextConfig = {
  // Inlines into Edge middleware + client so vars are never "missing" at runtime.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
  },
};

export default nextConfig;
