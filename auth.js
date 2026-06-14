// ═══════════════════════════════════════════════
// Auth Module — Supabase Authentication
// ═══════════════════════════════════════════════
import { supabase } from './supabase.js';
import { Router } from './router.js';

class AuthModule {
  constructor() {
    this.user = null;
    this.session = null;
    this.isGuest = false;
    this.listeners = [];
    this._authSubscription = null;
  }

  async init() {
    // Check existing session
    const { data: { session } } = await supabase.auth.getSession();
    this.session = session;
    this.user = session?.user ?? null;

    // Listen to auth changes (save subscription for cleanup)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      this.session = session;
      this.user = session?.user ?? null;
      if (event === 'SIGNED_OUT') {
        this.user = null;
        this.session = null;
      }
      this.notifyListeners();
    });
    this._authSubscription = subscription;

    // Check guest mode from localStorage
    this.isGuest = localStorage.getItem('azure_isGuest') === 'true';

    this.notifyListeners();
  }

  get isLoggedIn() {
    return !!this.user;
  }

  get displayName() {
    if (this.isGuest) return '游客';
    if (this.user) return this.user.user_metadata?.name || this.user.email?.split('@')[0] || '用户';
    return '登录';
  }

  get avatarChar() {
    if (this.isGuest) return '🎭';
    if (this.user) {
      const name = this.displayName;
      return name[0]?.toUpperCase() || '?';
    }
    return '?';
  }

  // ─── Login ───────────────────────────────
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.user = data.user;
    this.session = data.session;
    this.isGuest = false;
    localStorage.removeItem('azure_isGuest');
    this.notifyListeners();
    return data;
  }

  // ─── Register ────────────────────────────
  async register(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        // If email confirmation is enabled, don't auto-sign-in
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;

    // If email confirmation is required, user/session may be null
    if (data.user && data.session) {
      this.user = data.user;
      this.session = data.session;
      this.isGuest = false;
      localStorage.removeItem('azure_isGuest');
    }
    // Even if email confirmation is needed, notify listeners
    this.notifyListeners();
    return data;
  }

  // ─── Logout ──────────────────────────────
  async logout() {
    await supabase.auth.signOut();
    this.user = null;
    this.session = null;
    this.notifyListeners();
  }

  // ─── Guest Mode ──────────────────────────
  enterGuestMode() {
    this.isGuest = true;
    localStorage.setItem('azure_isGuest', 'true');
    this.notifyListeners();
  }

  exitGuestMode() {
    this.isGuest = false;
    localStorage.removeItem('azure_isGuest');
    this.notifyListeners();
  }

  // ─── Update Profile ──────────────────────
  async updateProfile(updates) {
    if (!this.user) return;
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: this.user.id, ...updates, updated_at: new Date().toISOString() });
    if (error) throw error;
  }

  // ─── Get Profile ─────────────────────────
  async getProfile() {
    if (!this.user) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Failed to load profile:', err.message);
      return null;
    }
  }

  // ─── Listeners ───────────────────────────
  onChange(fn) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(f => f !== fn); };
  }

  notifyListeners() {
    const state = {
      isLoggedIn: this.isLoggedIn,
      isGuest: this.isGuest,
      user: this.user,
      displayName: this.displayName,
      avatarChar: this.avatarChar,
    };
    this.listeners.forEach(fn => fn(state));
  }
}

export const Auth = new AuthModule();
