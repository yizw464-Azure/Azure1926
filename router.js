// ═══════════════════════════════════════════════
// Router — SPA Navigation with History API
// ═══════════════════════════════════════════════

class RouterClass {
  constructor() {
    this.currentPage = 'home';
    this.listeners = [];
    this.guards = {};
  }

  // Initialize — listen to popstate & link clicks
  init() {
    // Disable fallback navigation to avoid double-trigger
    if (window._disableFallback) {
      window._disableFallback();
    }

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      const page = e.state?.page || 'home';
      this.navigate(page, false);
    });

    // Delegate all nav clicks — handle both [data-navigate] and [data-page]
    document.addEventListener('click', (e) => {
      // Check for [data-navigate] first (cards, buttons, footer links)
      const navLink = e.target.closest('[data-navigate]');
      if (navLink) {
        e.preventDefault();
        const page = navLink.getAttribute('data-navigate');
        if (page) this.navigate(page);
        return;
      }
      // Also handle nav menu <a data-page="...">
      const pageLink = e.target.closest('.menu a[data-page]');
      if (pageLink) {
        e.preventDefault();
        const page = pageLink.getAttribute('data-page');
        if (page) this.navigate(page);
      }
    });

    // Restore from URL hash
    const hash = window.location.hash.replace('#', '');
    if (hash && this.isValidPage(hash)) {
      this.navigate(hash, false);
    }
  }

  isValidPage(page) {
    return ['home', 'cloud-trial', 'happiness', 'ai-chat', 'dashboard', 'talent-pool'].includes(page);
  }

  // Navigate to a page
  navigate(page, pushState = true) {
    if (!this.isValidPage(page)) {
      console.warn(`Unknown page: ${page}`);
      return;
    }

    // Run guard if exists
    if (this.guards[page]) {
      const result = this.guards[page](page);
      if (result === false) return;
    }

    const oldPage = this.currentPage;
    this.currentPage = page;

    // Update DOM
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');

    // Update nav links
    document.querySelectorAll('.menu a[data-page]').forEach(a => {
      a.classList.toggle('active', a.getAttribute('data-page') === page);
    });

    // Update URL
    if (pushState && oldPage !== page) {
      history.pushState({ page }, '', '#' + page);
    } else if (!pushState) {
      history.replaceState({ page }, '', '#' + page);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Notify listeners
    this.listeners.forEach(fn => fn(page, oldPage));
  }

  // Add page change listener
  onChange(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(f => f !== fn);
    };
  }

  // Add navigation guard
  addGuard(page, fn) {
    this.guards[page] = fn;
  }
}

const router = new RouterClass();
export const Router = router;
// Expose to window for inline onclick handlers
window.Router = router;
