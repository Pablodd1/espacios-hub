/** Runtime data-mode: LIVE (Supabase) when env vars exist, DEMO (in-memory seed) otherwise. */
export function isLiveMode(): boolean {
  return Boolean(
    (import.meta.env.VITE_SUPABASE_URL as string | undefined) &&
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined),
  );
}
