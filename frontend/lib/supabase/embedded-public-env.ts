/**
 * Fallback Supabase URL + anon key when process.env is empty in Edge middleware
 * or other runtimes (known issue with some Next.js / Turbopack setups).
 *
 * The anon key is public by design; row-level security protects your data.
 * Override with frontend/.env.local for a different Supabase project.
 */
export const EMBEDDED_SUPABASE_URL =
  "https://hdrqwmjplbhsdfxkjcqa.supabase.co";

export const EMBEDDED_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkcnF3bWpwbGJoc2RmeGtqY3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1Nzc3MDMsImV4cCI6MjA5MDE1MzcwM30.qv-rMPq2Zt3Un6vdglROtE9iaL-4LmJWGk8HkX7W4_U";
