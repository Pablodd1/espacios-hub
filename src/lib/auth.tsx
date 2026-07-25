/**
 * Auth layer — Supabase Auth (email/password) for Espacios Hub.
 *
 * Design notes:
 * - SEPARATE client from the data client (supabaseClient.ts): the data client
 *   has GoTrue disabled to avoid the page-load lock deadlock; this auth client
 *   has sessions enabled (persistSession + autoRefresh) with its own storageKey
 *   so the two never collide.
 * - TESTING MODE: the app does NOT gate routes yet (REQUIRE_AUTH = false in
 *   mode.ts). Login works end-to-end; enforcement is a one-line flip later.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { isLiveMode } from './mode';

let _authClient: SupabaseClient | null = null;

export function getAuthClient(): SupabaseClient | null {
  if (!isLiveMode()) return null;
  if (!_authClient) {
    _authClient = createClient(
      import.meta.env.VITE_SUPABASE_URL as string,
      import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'espacios-hub-auth',
        },
      },
    );
  }
  return _authClient;
}

export async function signIn(email: string, password: string) {
  const client = getAuthClient();
  if (!client) throw new Error('Auth disponible solo en modo EN VIVO');
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  const client = getAuthClient();
  if (client) await client.auth.signOut();
}

interface AuthState {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({ session: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, loading: true });

  useEffect(() => {
    const client = getAuthClient();
    if (!client) {
      setState({ session: null, loading: false });
      return;
    }
    client.auth.getSession().then(({ data }) => {
      setState({ session: data.session, loading: false });
    });
    const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
      setState({ session, loading: false });
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
