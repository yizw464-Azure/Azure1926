// ═══════════════════════════════════════════════
// UI Module — Navigation, Modals, Toast, Effects
// ═══════════════════════════════════════════════
import { Auth } from './auth.js';
import { Router } from './router.js';

export const UI = {
  // ─── Init ────────────────────────────────
  init() {
    this._initNavScroll();
    this._initScrollAnimation();
    this._initHeroParallax();
    this._initHeroParticles();
    this._initCardMouseTracking();
    this._initStatCounting();
    this._initNavLinks();
    this._initAuthModal();
    this._initGuestMode();
    this._initRoleSelector();
    this._updateUserUI();

    // Listen to auth changes
    Auth.onChange(() => this._updateUserUI());

    // Listen to route changes for dashboard refresh
    Router.onChange((page) => {
      if (page === 'dashboard') {
        import('./app.js').then(m => m.refreshDashboard());
      }
      if (page === 'home') {
        this._restoreRoleSelection();
      }
    });

    // ESC to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAuthModal();
    });
  },

  // ─── Navigation ──────────────────────────
  _initNavLinks() {
    // NOTE: The Router handles all navigation via delegated click on document.
    // We only set visual cursor here — do NOT add individual click handlers
    // to avoid double-triggering with the Router's delegated handler.

    // Set cursor for menu links (visual only)
    document.querySelectorAll('.menu a[data-page]').forEach(a => {
      a.style.cursor = 'pointer';
    });
  },

  _initNavScroll() {
    window.addEventListener('scroll', () => {
      document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
    });
  },

  // ─── Hero Parallax ───────────────────────
  _initHeroParallax() {
    const heroBg = document.getElementById('heroBg');
    if (!heroBg) return;
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrollY * 0.4}px) scale(${1 + scrollY * 0.0003})`;
      }
    });
  },

  // ─── Scroll Animations ───────────────────
  _initScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.animate-on-scroll, .stagger-children').forEach(el => {
      observer.observe(el);
    });
  },

  // ─── Stat Counting ───────────────────────
  _initStatCounting() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'));
          if (!target || el.dataset.counted) return;
          el.dataset.counted = 'true';
          this._animateCount(el, target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.animate-count').forEach(el => observer.observe(el));
  },

  _animateCount(el, target) {
    const duration = 2000;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(tick);
  },

  // ─── User UI ─────────────────────────────
  _updateUserUI() {
    const badge = document.getElementById('userBadge');
    const avatar = document.getElementById('userAvatar');
    const nameEl = document.getElementById('userName');
    const guestBadge = document.getElementById('guestBadge');

    if (Auth.isGuest) {
      badge.classList.add('guest-mode');
      avatar.innerHTML = '&#x1F3AD;';
      nameEl.textContent = '游客';
      badge.title = '点击退出游客模式 · 登录解锁全部功能';
      badge.onclick = (e) => { e.stopPropagation(); this._exitGuest(); };
      if (guestBadge) guestBadge.style.display = 'none';
    } else if (Auth.isLoggedIn) {
      badge.classList.remove('guest-mode');
      avatar.textContent = Auth.avatarChar;
      nameEl.textContent = Auth.displayName;
      badge.title = '点击进入控制台 · 右键退出';
      badge.onclick = (e) => { e.stopPropagation(); Router.navigate('dashboard'); };
      badge.oncontextmenu = (e) => { e.preventDefault(); Auth.logout(); UI.showToast('已退出登录', 'info'); };
      if (guestBadge) guestBadge.style.display = 'none';
    } else {
      badge.classList.remove('guest-mode');
      avatar.textContent = '?';
      nameEl.textContent = '登录';
      badge.title = '点击登录';
      badge.onclick = (e) => { e.stopPropagation(); UI.openAuthModal(); };
      if (guestBadge) guestBadge.style.display = 'flex';
    }

    this._updateHomeAuthBtn();
  },

  _updateHomeAuthBtn() {
    const btn = document.getElementById('btn-home-auth');
    if (!btn) return;
    if (Auth.isGuest) {
      btn.innerHTML = '&#x1F512; 退出游客 · 登录 / 注册';
      btn.onclick = () => this._exitGuest();
    } else if (Auth.isLoggedIn) {
      btn.innerHTML = '&#x1F464; ' + Auth.displayName;
      btn.onclick = () => Router.navigate('dashboard');
    } else {
      btn.innerHTML = '&#x1F464; 登录 / 注册';
      btn.onclick = () => this.openAuthModal();
    }
  },

  // ─── Guest Mode ──────────────────────────
  _initGuestMode() {
    document.getElementById('guestBadge')?.addEventListener('click', () => {
      Auth.enterGuestMode();
      this.showToast('🎭 已进入游客体验模式，无需登录即可使用全部功能', 'info');
      Router.navigate('home');
    });
  },

  _exitGuest() {
    Auth.exitGuestMode();
    this.showToast('已退出游客模式，登录后可保存数据', 'info');
    this.openAuthModal();
  },

  // ─── Auth Modal ──────────────────────────
  _initAuthModal() {
    const userBadge = document.getElementById('userBadge');
    if (userBadge) {
      userBadge.addEventListener('click', (e) => {
        if (!Auth.isLoggedIn && !Auth.isGuest) {
          e.stopPropagation();
          this.openAuthModal();
        }
      });
    }

    document.getElementById('authModalClose')?.addEventListener('click', () => this.closeAuthModal());
    document.getElementById('authModal')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('authModal')) this.closeAuthModal();
    });

    // Tab switching
    document.getElementById('switchToRegister')?.addEventListener('click', () => this._switchAuthTab('register'));
    document.getElementById('switchToLogin')?.addEventListener('click', () => this._switchAuthTab('login'));

    // Login
    document.getElementById('loginBtn')?.addEventListener('click', () => this._doLogin());

    // Register
    document.getElementById('registerBtn')?.addEventListener('click', () => this._doRegister());

    // Guest entry from modal
    const guestEntry = () => {
      this.closeAuthModal();
      Auth.enterGuestMode();
      this.showToast('🎭 已进入游客体验模式', 'info');
      Router.navigate('home');
    };
    document.getElementById('guestEntryBtn')?.addEventListener('click', guestEntry);
    document.getElementById('guestEntryBtn2')?.addEventListener('click', guestEntry);
    document.getElementById('guestLoginBtn')?.addEventListener('click', () => {
      Auth.exitGuestMode();
      this.openAuthModal();
    });

    // Enter key
    document.getElementById('loginPassword')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._doLogin();
    });
  },

  openAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
    this._switchAuthTab('login');
  },

  closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
    this._clearAuthErrors();
  },

  _switchAuthTab(tab) {
    document.getElementById('authTitle').textContent = tab === 'login' ? '登录 Azure Future' : '注册 Azure Future';
    document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
    this._clearAuthErrors();
  },

  async _doLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if (!email || !password) return this._showLoginError('请填写完整信息');

    try {
      document.getElementById('loginBtn').disabled = true;
      document.getElementById('loginBtn').textContent = '登录中…';
      await Auth.login(email, password);
      this.closeAuthModal();
      this.showToast('登录成功！欢迎回来，' + Auth.displayName, 'success');
      Router.navigate('dashboard');
    } catch (err) {
      this._showLoginError(err.message || '登录失败，请检查邮箱和密码');
    } finally {
      document.getElementById('loginBtn').disabled = false;
      document.getElementById('loginBtn').textContent = '登 录';
    }
  },

  async _doRegister() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pw = document.getElementById('regPassword').value;
    const pw2 = document.getElementById('regPassword2').value;

    if (!name || !email || !pw) return this._showRegError('请填写完整信息');
    if (pw.length < 6) return this._showRegError('密码至少6位');
    if (pw !== pw2) return this._showRegError('两次密码不一致');

    try {
      document.getElementById('registerBtn').disabled = true;
      document.getElementById('registerBtn').textContent = '注册中…';
      const result = await Auth.register(email, pw, name);
      this.closeAuthModal();
      if (result.user && result.session) {
        this.showToast('注册成功！欢迎加入 Azure Future', 'success');
        Router.navigate('dashboard');
      } else {
        this.showToast('注册成功！请检查邮箱确认后登录', 'info');
        this.openAuthModal();
      }
    } catch (err) {
      this._showRegError(err.message || '注册失败，请稍后重试');
    } finally {
      document.getElementById('registerBtn').disabled = false;
      document.getElementById('registerBtn').textContent = '注 册';
    }
  },

  _showLoginError(msg) {
    const el = document.getElementById('loginError');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
  },

  _showRegError(msg) {
    const el = document.getElementById('regError');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
  },

  _clearAuthErrors() {
    const loginErr = document.getElementById('loginError');
    const regErr = document.getElementById('regError');
    if (loginErr) loginErr.style.display = 'none';
    if (regErr) regErr.style.display = 'none';
  },

  // ─── Role Selector ───────────────────────
  _initRoleSelector() {
    document.querySelectorAll('.role-card').forEach(card => {
      card.addEventListener('click', () => {
        const role = card.getAttribute('data-role');
        this._selectRole(role);
      });
    });
    this._restoreRoleSelection();
  },

  _selectRole(role) {
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('role-' + role)?.classList.add('selected');
    localStorage.setItem('azure_userRole', role);
    this._updateMainButton(role);
  },

  _restoreRoleSelection() {
    const role = localStorage.getItem('azure_userRole');
    if (role) {
      document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
      document.getElementById('role-' + role)?.classList.add('selected');
      this._updateMainButton(role);
    }
  },

  _updateMainButton(role) {
    const btn = document.getElementById('btn-main-action');
    const navTalent = document.getElementById('nav-talent-pool');
    if (!btn) return;
    const isHR = role === 'hr';
    const targetPage = isHR ? 'talent-pool' : 'cloud-trial';
    // Update data-navigate so the Router's delegated handler picks up correct page
    btn.setAttribute('data-navigate', targetPage);
    if (isHR) {
      btn.textContent = '🔍 开始筛选人才';
      if (navTalent) navTalent.style.display = '';
    } else {
      btn.textContent = '☁ 开始云试工';
      if (navTalent) navTalent.style.display = 'none';
    }
    // Use Router if available, otherwise fallback to data-navigate delegation
    btn.onclick = function(e) {
      if (window.Router) {
        Router.navigate(targetPage);
      } else if (window._fallbackNavigate) {
        window._fallbackNavigate(targetPage);
      }
    };
  },

  // ─── Toast ───────────────────────────────
  showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toastOut .3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // ─── Loading State ───────────────────────
  showLoading(elementId, message = '加载中…') {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = `<div style="text-align:center;padding:40px;">
      <div class="spinner" style="margin:0 auto 16px;"></div>
      <p style="color:var(--text-dim);font-size:14px;">${message}</p>
    </div>`;
  },

  // ─── Helpers ─────────────────────────────
  getRole() {
    return localStorage.getItem('azure_userRole') || null;
  },

  // ─── Hero Particles ──────────────────────
  _initHeroParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'hero-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.width = (2 + Math.random() * 4) + 'px';
      particle.style.height = particle.style.width;
      container.appendChild(particle);
    }
  },

  // ─── Card Mouse Tracking ─────────────────
  _initCardMouseTracking() {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        // Guard: ensure element is in DOM before measuring
        if (!card.isConnected) return;
        const rect = card.getBoundingClientRect();
        if (!rect || rect.width === 0) return;
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', x + '%');
        card.style.setProperty('--mouse-y', y + '%');
      });
    });
  },
};
