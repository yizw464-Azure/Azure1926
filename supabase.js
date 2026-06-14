// ═══════════════════════════════════════════════
// Supabase Client — Non-blocking Lazy Init
// ═══════════════════════════════════════════════

const SUPABASE_URL = 'https://ohlmcfekfhhwejlplvcb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFnZSIsInJlZiI6Im9obG1jZmVrZmhod2VqbHBsdmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNzgwNTAsImV4cCI6MjA5Njk1NDA1MH0.J0qTdovigF-yu34aG4yTNfHvOoXgmaEizvQCc31yZKU';

function createMockClient() {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => { throw new Error('Supabase 不可用，请稍后重试'); },
      signUp: async () => { throw new Error('Supabase 不可用，请稍后重试'); },
      signOut: async () => {},
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), maybeSingle: async () => ({ data: null, error: null }) }) }),
      upsert: async () => ({ error: null }),
      insert: async () => ({ error: null }),
    }),
  };
}

// Start with mock so the entire app boots instantly
let supabase = createMockClient();

// Expose for other modules to await readiness
export function isSupabaseReady() {
  return supabase.auth.signInWithPassword !== createMockClient().auth.signInWithPassword;
}

// Background init — replaces mock with real client when CDN loads
(async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const module = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    clearTimeout(timeout);

    const { createClient } = module;
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
    });
    console.log('✅ Supabase connected');
  } catch (e) {
    console.warn('⚠️ Supabase CDN 不可用，使用离线模式', e.message);
    // supabase already is mock, no need to replace
  }
})();

export { supabase };
