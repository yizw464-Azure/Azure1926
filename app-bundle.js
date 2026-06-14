// ═══════════════════════════════════════════════
// Azure Future — Self-Contained App Bundle
// All modules merged, no ES Module imports
// Works on file:// and http:// protocols
// ═══════════════════════════════════════════════

(function() {
'use strict';

// ═══ HELPERS ═══════════════════════════════════
function escapeHTML(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ═══ SUPABASE MOCK CLIENT ══════════════════════
// No CDN import needed — works offline on file://
var supabase = {
  auth: {
    getSession: function() { return Promise.resolve({ data: { session: null }, error: null }); },
    onAuthStateChange: function() { return { data: { subscription: { unsubscribe: function() {} } } }; },
    signInWithPassword: function() { return Promise.reject(new Error('Supabase 不可用，请稍后重试')); },
    signUp: function() { return Promise.reject(new Error('Supabase 不可用，请稍后重试')); },
    signOut: function() { return Promise.resolve(); }
  },
  from: function() {
    return {
      select: function() {
        return {
          eq: function() { return { single: function() { return Promise.resolve({ data: null, error: null }); }, maybeSingle: function() { return Promise.resolve({ data: null, error: null }); } }; }
        };
      },
      upsert: function() { return Promise.resolve({ error: null }); },
      insert: function() { return Promise.resolve({ error: null }); }
    };
  }
};

// ═══ DATA SERVICE ══════════════════════════════
var MAX_RECORDS = 50;
var DataService = {
  saveTrial: function(userId, trialData) {
    if (!userId) return DataService._saveLocal('azure_trialHistory', trialData);
    return supabase.from('trials').insert({
      user_id: userId, name: trialData.name, exp: trialData.exp,
      location: trialData.location, mode: trialData.mode,
      birthplace: trialData.birthplace, dream_city: trialData.dreamCity,
      hobbies: trialData.hobbies, mbti: trialData.mbti,
      industry: trialData.industry, last_role: trialData.lastRole,
      skills: trialData.skills, description: trialData.desc,
      target_industry: trialData.targetIndustry, target_role: trialData.targetRole,
      target_skills: trialData.targetSkills,
      self_learn: trialData.selfLearn, self_logic: trialData.selfLogic,
      self_comm: trialData.selfComm, self_drive: trialData.selfDrive,
      self_stress: trialData.selfStress,
      match_score: trialData.matchScore, cost_score: trialData.costScore,
      potential_score: trialData.potentialScore, happiness_score: trialData.happinessScore,
      report_html: trialData.reportHTML
    }).select().single().then(function(r) { return r.data; });
  },
  getTrials: function(userId) {
    if (!userId) return Promise.resolve(DataService._getLocal('azure_trialHistory') || []);
    return supabase.from('trials').select('*').eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(MAX_RECORDS)
      .then(function(r) {
        return (r.data || []).map(function(row) { return {
          id: row.id, name: row.name, exp: row.exp, location: row.location,
          mode: row.mode, birthplace: row.birthplace, dreamCity: row.dream_city,
          hobbies: row.hobbies, mbti: row.mbti, industry: row.industry,
          lastRole: row.last_role, skills: row.skills, desc: row.description,
          targetIndustry: row.target_industry, targetRole: row.target_role,
          targetSkills: row.target_skills,
          selfLearn: row.self_learn, selfLogic: row.self_logic,
          selfComm: row.self_comm, selfDrive: row.self_drive,
          selfStress: row.self_stress,
          matchScore: row.match_score, costScore: row.cost_score,
          potentialScore: row.potential_score, happinessScore: row.happiness_score,
          reportHTML: row.report_html,
          timestamp: new Date(row.created_at).getTime(),
          type: 'cloud-trial', typeLabel: '云试工'
        }; });
      });
  },
  saveHappiness: function(userId, data) {
    if (!userId) return DataService._saveLocal('azure_happinessHistory', data);
    return supabase.from('happiness_assessments').insert({
      user_id: userId, name: data.name, elements: data.elements,
      keywords: data.keywords, literary_gift: data.literaryGift,
      q1: data.q1, q2: data.q2, q3: data.q3, q4: data.q4,
      q5: data.q5, q6: data.q6, q7: data.q7, q8: data.q8,
      q9: data.q9, q10: data.q10, q11: data.q11, q12: data.q12,
      score_interest: data.scores ? data.scores.interest : null,
      score_life: data.scores ? data.scores.life : null,
      score_growth: data.scores ? data.scores.growth : null,
      score_balance: data.scores ? data.scores.balance : null,
      score_total: data.scores ? data.scores.total : null,
      presentation: data.presentation, animal: data.animal,
      plant: data.plant, food: data.food, report_html: data.reportHTML
    }).select().single().then(function(r) { return r.data; });
  },
  getHappiness: function(userId) {
    if (!userId) return Promise.resolve(DataService._getLocal('azure_happinessHistory') || []);
    return supabase.from('happiness_assessments').select('*').eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(MAX_RECORDS)
      .then(function(r) {
        return (r.data || []).map(function(row) { return {
          id: row.id, name: row.name, elements: row.elements,
          keywords: row.keywords, literaryGift: row.literary_gift,
          q1: row.q1, q2: row.q2, q3: row.q3, q4: row.q4,
          q5: row.q5, q6: row.q6, q7: row.q7, q8: row.q8,
          q9: row.q9, q10: row.q10, q11: row.q11, q12: row.q12,
          scores: { interest: row.score_interest, life: row.score_life,
                    growth: row.score_growth, balance: row.score_balance,
                    total: row.score_total },
          presentation: row.presentation, animal: row.animal,
          plant: row.plant, food: row.food, reportHTML: row.report_html,
          timestamp: new Date(row.created_at).getTime(),
          type: 'happiness', typeLabel: '幸福指数'
        }; });
      });
  },
  getDashboardStats: function(userId) {
    if (!userId) {
      var trials = DataService._getLocal('azure_trialHistory') || [];
      var happiness = DataService._getLocal('azure_happinessHistory') || [];
      return Promise.resolve({
        trialCount: trials.length, happinessCount: happiness.length,
        avgScore: trials.length > 0 ? Math.round(trials.reduce(function(a,b){return a+(b.matchScore||0);},0)/trials.length) : 0
      });
    }
    return Promise.all([
      supabase.from('trials').select('match_score').eq('user_id', userId),
      supabase.from('happiness_assessments').select('id', { count: 'exact', head: true }).eq('user_id', userId)
    ]).then(function(results) {
      var trialScores = (results[0].data || []).map(function(r){return r.match_score;}).filter(Boolean);
      return {
        trialCount: results[0].data ? results[0].data.length : 0,
        happinessCount: results[1].count || 0,
        avgScore: trialScores.length > 0 ? Math.round(trialScores.reduce(function(a,b){return a+b;},0)/trialScores.length) : 0
      };
    });
  },
  _saveLocal: function(key, data) {
    var list = JSON.parse(localStorage.getItem(key) || '[]');
    list.unshift(Object.assign({}, data, { timestamp: Date.now() }));
    if (list.length > MAX_RECORDS) list.length = MAX_RECORDS;
    localStorage.setItem(key, JSON.stringify(list));
    return list[0];
  },
  _getLocal: function(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch(e) { return []; }
  }
};

// ═══ ROUTER ════════════════════════════════════
var Router = {
  currentPage: 'home',
  listeners: [],
  guards: {},

  init: function() {
    // Disable fallback navigation to avoid double-trigger
    if (window._disableFallback) window._disableFallback();

    window.addEventListener('popstate', function(e) {
      var page = (e.state && e.state.page) || 'home';
      Router.navigate(page, false);
    });

    document.addEventListener('click', function(e) {
      var navLink = e.target.closest('[data-navigate]');
      if (navLink) {
        e.preventDefault();
        var page = navLink.getAttribute('data-navigate');
        if (page) Router.navigate(page);
        return;
      }
      var pageLink = e.target.closest('.menu a[data-page]');
      if (pageLink) {
        e.preventDefault();
        var p = pageLink.getAttribute('data-page');
        if (p) Router.navigate(p);
      }
    });

    var hash = window.location.hash.replace('#', '');
    if (hash && Router.isValidPage(hash)) {
      Router.navigate(hash, false);
    }
  },

  isValidPage: function(page) {
    return ['home','cloud-trial','happiness','ai-chat','dashboard','talent-pool'].indexOf(page) !== -1;
  },

  navigate: function(page, pushState) {
    if (pushState === undefined) pushState = true;
    if (!Router.isValidPage(page)) { console.warn('Unknown page: ' + page); return; }
    if (Router.guards[page]) { if (Router.guards[page](page) === false) return; }

    var oldPage = Router.currentPage;
    Router.currentPage = page;

    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    var target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');

    document.querySelectorAll('.menu a[data-page]').forEach(function(a) {
      a.classList.toggle('active', a.getAttribute('data-page') === page);
    });

    if (pushState && oldPage !== page) {
      history.pushState({ page: page }, '', '#' + page);
    } else if (!pushState) {
      history.replaceState({ page: page }, '', '#' + page);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    Router.listeners.forEach(function(fn) { fn(page, oldPage); });
  },

  onChange: function(fn) {
    Router.listeners.push(fn);
    return function() { Router.listeners = Router.listeners.filter(function(f){return f!==fn;}); };
  },

  addGuard: function(page, fn) { Router.guards[page] = fn; }
};
window.Router = Router;

// ═══ AUTH MODULE ═══════════════════════════════
var Auth = {
  user: null,
  session: null,
  isGuest: false,
  listeners: [],
  _authSubscription: null,

  init: function() {
    return supabase.auth.getSession().then(function(result) {
      Auth.session = result.data.session;
      Auth.user = result.data.session ? result.data.session.user : null;
      var sub = supabase.auth.onAuthStateChange(function(event, session) {
        Auth.session = session;
        Auth.user = session ? session.user : null;
        if (event === 'SIGNED_OUT') { Auth.user = null; Auth.session = null; }
        Auth._notify();
      });
      Auth._authSubscription = sub.data.subscription;
      Auth.isGuest = localStorage.getItem('azure_isGuest') === 'true';
      Auth._notify();
    }).catch(function(e) {
      console.warn('Auth init failed:', e.message);
      Auth.isGuest = localStorage.getItem('azure_isGuest') === 'true';
      Auth._notify();
    });
  },

  get isLoggedIn() { return !!Auth.user; },
  get displayName() {
    if (Auth.isGuest) return '游客';
    if (Auth.user) {
      var meta = Auth.user.user_metadata || {};
      return meta.name || (Auth.user.email ? Auth.user.email.split('@')[0] : '用户');
    }
    return '登录';
  },
  get avatarChar() {
    if (Auth.isGuest) return '🎭';
    if (Auth.user) { var n = Auth.displayName; return n[0] ? n[0].toUpperCase() : '?'; }
    return '?';
  },

  login: function(email, password) {
    return supabase.auth.signInWithPassword({ email: email, password: password }).then(function(result) {
      if (result.error) throw result.error;
      Auth.user = result.data.user;
      Auth.session = result.data.session;
      Auth.isGuest = false;
      localStorage.removeItem('azure_isGuest');
      Auth._notify();
      return result.data;
    });
  },

  register: function(email, password, name) {
    return supabase.auth.signUp({
      email: email, password: password,
      options: { data: { name: name }, emailRedirectTo: window.location.origin }
    }).then(function(result) {
      if (result.error) throw result.error;
      if (result.data.user && result.data.session) {
        Auth.user = result.data.user;
        Auth.session = result.data.session;
        Auth.isGuest = false;
        localStorage.removeItem('azure_isGuest');
      }
      Auth._notify();
      return result.data;
    });
  },

  logout: function() {
    return supabase.auth.signOut().then(function() {
      Auth.user = null; Auth.session = null; Auth._notify();
    });
  },

  enterGuestMode: function() {
    Auth.isGuest = true;
    localStorage.setItem('azure_isGuest', 'true');
    Auth._notify();
  },

  exitGuestMode: function() {
    Auth.isGuest = false;
    localStorage.removeItem('azure_isGuest');
    Auth._notify();
  },

  updateProfile: function(updates) {
    if (!Auth.user) return Promise.resolve();
    return supabase.from('profiles').upsert(
      Object.assign({}, updates, { id: Auth.user.id, updated_at: new Date().toISOString() })
    );
  },

  getProfile: function() {
    if (!Auth.user) return Promise.resolve(null);
    return supabase.from('profiles').select('*').eq('id', Auth.user.id).maybeSingle()
      .then(function(r) { return r.data; })
      .catch(function(err) { console.warn('Failed to load profile:', err.message); return null; });
  },

  onChange: function(fn) {
    Auth.listeners.push(fn);
    return function() { Auth.listeners = Auth.listeners.filter(function(f){return f!==fn;}); };
  },

  _notify: function() {
    var state = { isLoggedIn: Auth.isLoggedIn, isGuest: Auth.isGuest, user: Auth.user,
                  displayName: Auth.displayName, avatarChar: Auth.avatarChar };
    Auth.listeners.forEach(function(fn) { fn(state); });
  }
};

// ═══ LITERARY DATABASE ═════════════════════════
var LITERARY_DB = {
  adventurous: {
    mood: '探索者', moodEmoji: '⛵',
    items: [
      { type:'book', title:'《海底两万里》', author:'儒勒·凡尔纳', quote:'海洋就是一切。它覆盖了地球的十分之七。它的呼吸是纯净和健康的。', source:'法国经典科幻小说' },
      { type:'poem', title:'《未选择的路》', author:'罗伯特·弗罗斯特', quote:'一片树林里分出两条路——而我选择了人迹更少的一条，从此决定了我一生的道路。', source:'美国现代主义诗歌' },
      { type:'movie', title:'《白日梦想家》', author:'本·斯蒂勒 导演', quote:'去感受世界，去冒险，去突破自己。生活不是坐在那里等待，而是走出去寻找。', source:'2013年美国电影' },
      { type:'music', title:'《Viva La Vida》', author:'Coldplay', quote:'I used to rule the world, seas would rise when I gave the word. Now in the morning I sleep alone, sweep the streets I used to own.', source:'2008年英国摇滚' },
      { type:'quote', title:'名言', author:'马克·吐温', quote:'二十年后，让你失望的不是你做过的事，而是你没做过的事。所以解开帆索，驶出安全的港湾，让信风鼓起你的帆。', source:'美国文学巨匠' }
    ]
  },
  peaceful: {
    mood: '守望者', moodEmoji: '🌿',
    items: [
      { type:'book', title:'《瓦尔登湖》', author:'梭罗', quote:'我到林中去，因为我希望谨慎地生活，只面对生活的基本事实，看看我是否能学到它要教给我的东西。', source:'美国自然文学经典' },
      { type:'poem', title:'《饮酒·其五》', author:'陶渊明', quote:'采菊东篱下，悠然见南山。山气日夕佳，飞鸟相与还。', source:'东晋田园诗' },
      { type:'movie', title:'《小森林》', author:'森淳一 导演', quote:'在那些静得只听得见呼吸的日子里，你明白孤独即生活。', source:'2014年日本电影' },
      { type:'music', title:'《风の诗》', author:'押尾光太郎', quote:'（纯音乐）—— 风穿过树叶的声音，就是最好的旋律。', source:'日本指弹吉他' },
      { type:'quote', title:'名言', author:'老子', quote:'上善若水。水善利万物而不争，处众人之所恶，故几于道。', source:'《道德经》' }
    ]
  },
  ambitious: {
    mood: '攀登者', moodEmoji: '🏔️',
    items: [
      { type:'book', title:'《人类群星闪耀时》', author:'茨威格', quote:'一个人生命中最大的幸运，莫过于在他的人生中途，即在他年富力强的时候发现了自己的使命。', source:'奥地利传记文学经典' },
      { type:'poem', title:'《行路难》', author:'李白', quote:'长风破浪会有时，直挂云帆济沧海。', source:'唐代浪漫主义诗歌' },
      { type:'movie', title:'《当幸福来敲门》', author:'加布里尔·穆奇诺 导演', quote:'别让别人告诉你，你成不了才。如果你有梦想，就要去捍卫它。', source:'2006年美国励志电影' },
      { type:'music', title:'《Hall of Fame》', author:'The Script', quote:'You can be the greatest, you can be the best. You can be the King Kong banging on your chest.', source:'2012年爱尔兰流行摇滚' },
      { type:'quote', title:'名言', author:'尼采', quote:'凡不能毁灭我的，必将使我更强大。', source:'德国哲学经典' }
    ]
  },
  meaningful: {
    mood: '燃灯者', moodEmoji: '🕯️',
    items: [
      { type:'book', title:'《活着》', author:'余华', quote:'人是为了活着本身而活着，而不是为了活着之外的任何事物而活着。', source:'中国当代文学经典' },
      { type:'poem', title:'《假如生活欺骗了你》', author:'普希金', quote:'假如生活欺骗了你，不要悲伤，不要心急！忧郁的日子里须要镇静：相信吧，快乐的日子将会来临！', source:'俄国浪漫主义诗歌' },
      { type:'movie', title:'《死亡诗社》', author:'彼得·威尔 导演', quote:'我们读诗写诗，并不是因为它们好玩，而是因为我们是人类的一分子，而人类是充满激情的。', source:'1989年美国电影' },
      { type:'music', title:'《Imagine》', author:'John Lennon', quote:'You may say I\'m a dreamer, but I\'m not the only one. I hope someday you\'ll join us, and the world will live as one.', source:'1971年经典歌曲' },
      { type:'quote', title:'名言', author:'罗曼·罗兰', quote:'世界上只有一种真正的英雄主义，那就是在认清生活的真相后依然热爱生活。', source:'《米开朗基罗传》' }
    ]
  },
  growing: {
    mood: '播种者', moodEmoji: '🌱',
    items: [
      { type:'book', title:'《小王子》', author:'圣埃克苏佩里', quote:'正是你为你的玫瑰花费的时间，才使你的玫瑰变得如此重要。', source:'法国经典童话' },
      { type:'poem', title:'《春江花月夜》', author:'张若虚', quote:'江畔何人初见月？江月何年初照人？人生代代无穷已，江月年年望相似。', source:'唐代孤篇压全唐' },
      { type:'movie', title:'《千与千寻》', author:'宫崎骏 导演', quote:'不管前方的路有多苦，只要走的方向正确，不管多么崎岖不平，都比站在原地更接近幸福。', source:'2001年日本动画电影' },
      { type:'music', title:'《Try Everything》', author:'Shakira', quote:'I won\'t give up, no I won\'t give in, till I reach the end and then I\'ll start again.', source:'《疯狂动物城》主题曲' },
      { type:'quote', title:'名言', author:'孔子', quote:'譬如为山，未成一篑，止，吾止也。譬如平地，虽覆一篑，进，吾往也。', source:'《论语·子罕》' }
    ]
  }
};

// ═══ UI MODULE ═════════════════════════════════
var UI = {
  init: function() {
    UI._initNavScroll();
    UI._initScrollAnimation();
    UI._initHeroParallax();
    UI._initHeroParticles();
    UI._initCardMouseTracking();
    UI._initStatCounting();
    UI._initNavLinks();
    UI._initAuthModal();
    UI._initGuestMode();
    UI._initRoleSelector();
    UI._updateUserUI();

    Auth.onChange(function() { UI._updateUserUI(); });

    Router.onChange(function(page) {
      if (page === 'dashboard') refreshDashboard();
      if (page === 'home') UI._restoreRoleSelection();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') UI.closeAuthModal();
    });
  },

  _initNavLinks: function() {
    document.querySelectorAll('.menu a[data-page]').forEach(function(a) { a.style.cursor = 'pointer'; });
    // Logo click → home
    var logo = document.getElementById('logoBtn');
    if (logo) logo.addEventListener('click', function() { Router.navigate('home'); });
  },

  _initNavScroll: function() {
    window.addEventListener('scroll', function() {
      var nav = document.getElementById('navbar');
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
    });
  },

  _initHeroParallax: function() {
    var heroBg = document.getElementById('heroBg');
    if (!heroBg) return;
    window.addEventListener('scroll', function() {
      var scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroBg.style.transform = 'translateY(' + (scrollY * 0.4) + 'px) scale(' + (1 + scrollY * 0.0003) + ')';
      }
    });
  },

  _initScrollAnimation: function() {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.animate-on-scroll, .stagger-children').forEach(function(el) { observer.observe(el); });
  },

  _initStatCounting: function() {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-target'));
          if (!target || el.dataset.counted) return;
          el.dataset.counted = 'true';
          UI._animateCount(el, target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.animate-count').forEach(function(el) { observer.observe(el); });
  },

  _animateCount: function(el, target) {
    var duration = 2000;
    var start = performance.now();
    function tick(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(tick);
  },

  _updateUserUI: function() {
    var badge = document.getElementById('userBadge');
    var avatar = document.getElementById('userAvatar');
    var nameEl = document.getElementById('userName');
    var guestBadge = document.getElementById('guestBadge');
    if (!badge) return;

    if (Auth.isGuest) {
      badge.classList.add('guest-mode');
      avatar.innerHTML = '&#x1F3AD;';
      nameEl.textContent = '游客';
      badge.title = '点击退出游客模式 · 登录解锁全部功能';
      badge.onclick = function(e) { e.stopPropagation(); UI._exitGuest(); };
      if (guestBadge) guestBadge.style.display = 'none';
    } else if (Auth.isLoggedIn) {
      badge.classList.remove('guest-mode');
      avatar.textContent = Auth.avatarChar;
      nameEl.textContent = Auth.displayName;
      badge.title = '点击进入控制台 · 右键退出';
      badge.onclick = function(e) { e.stopPropagation(); Router.navigate('dashboard'); };
      badge.oncontextmenu = function(e) { e.preventDefault(); Auth.logout(); UI.showToast('已退出登录', 'info'); };
      if (guestBadge) guestBadge.style.display = 'none';
    } else {
      badge.classList.remove('guest-mode');
      avatar.textContent = '?';
      nameEl.textContent = '登录';
      badge.title = '点击登录';
      badge.onclick = function(e) { e.stopPropagation(); UI.openAuthModal(); };
      if (guestBadge) guestBadge.style.display = 'flex';
    }
    UI._updateHomeAuthBtn();
  },

  _updateHomeAuthBtn: function() {
    var btn = document.getElementById('btn-home-auth');
    if (!btn) return;
    if (Auth.isGuest) {
      btn.innerHTML = '&#x1F512; 退出游客 · 登录 / 注册';
      btn.onclick = function() { UI._exitGuest(); };
    } else if (Auth.isLoggedIn) {
      btn.innerHTML = '&#x1F464; ' + Auth.displayName;
      btn.onclick = function() { Router.navigate('dashboard'); };
    } else {
      btn.innerHTML = '&#x1F464; 登录 / 注册';
      btn.onclick = function() { UI.openAuthModal(); };
    }
  },

  _initGuestMode: function() {
    var gb = document.getElementById('guestBadge');
    if (gb) gb.addEventListener('click', function() {
      Auth.enterGuestMode();
      UI.showToast('🎭 已进入游客体验模式，无需登录即可使用全部功能', 'info');
      Router.navigate('home');
    });
  },

  _exitGuest: function() {
    Auth.exitGuestMode();
    UI.showToast('已退出游客模式，登录后可保存数据', 'info');
    UI.openAuthModal();
  },

  _initAuthModal: function() {
    var userBadge = document.getElementById('userBadge');
    if (userBadge) {
      userBadge.addEventListener('click', function(e) {
        if (!Auth.isLoggedIn && !Auth.isGuest) { e.stopPropagation(); UI.openAuthModal(); }
      });
    }
    var closeBtn = document.getElementById('authModalClose');
    if (closeBtn) closeBtn.addEventListener('click', function() { UI.closeAuthModal(); });
    var modal = document.getElementById('authModal');
    if (modal) modal.addEventListener('click', function(e) { if (e.target === modal) UI.closeAuthModal(); });

    var switchReg = document.getElementById('switchToRegister');
    if (switchReg) switchReg.addEventListener('click', function() { UI._switchAuthTab('register'); });
    var switchLogin = document.getElementById('switchToLogin');
    if (switchLogin) switchLogin.addEventListener('click', function() { UI._switchAuthTab('login'); });

    var loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.addEventListener('click', function() { UI._doLogin(); });
    var regBtn = document.getElementById('registerBtn');
    if (regBtn) regBtn.addEventListener('click', function() { UI._doRegister(); });

    function guestEntry() {
      UI.closeAuthModal();
      Auth.enterGuestMode();
      UI.showToast('🎭 已进入游客体验模式', 'info');
      Router.navigate('home');
    }
    var geb1 = document.getElementById('guestEntryBtn');
    if (geb1) geb1.addEventListener('click', guestEntry);
    var geb2 = document.getElementById('guestEntryBtn2');
    if (geb2) geb2.addEventListener('click', guestEntry);
    var glb = document.getElementById('guestLoginBtn');
    if (glb) glb.addEventListener('click', function() { Auth.exitGuestMode(); UI.openAuthModal(); });

    var pwInput = document.getElementById('loginPassword');
    if (pwInput) pwInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') UI._doLogin(); });
  },

  openAuthModal: function() {
    var modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'flex';
    UI._switchAuthTab('login');
  },

  closeAuthModal: function() {
    var modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none';
    UI._clearAuthErrors();
  },

  _switchAuthTab: function(tab) {
    var title = document.getElementById('authTitle');
    if (title) title.textContent = tab === 'login' ? '登录 Azure Future' : '注册 Azure Future';
    var loginForm = document.getElementById('loginForm');
    var regForm = document.getElementById('registerForm');
    if (loginForm) loginForm.style.display = tab === 'login' ? 'block' : 'none';
    if (regForm) regForm.style.display = tab === 'register' ? 'block' : 'none';
    UI._clearAuthErrors();
  },

  _doLogin: function() {
    var email = (document.getElementById('loginEmail') || {}).value || '';
    email = email.trim();
    var password = (document.getElementById('loginPassword') || {}).value || '';
    password = password.trim();
    if (!email || !password) return UI._showLoginError('请填写完整信息');

    var btn = document.getElementById('loginBtn');
    btn.disabled = true; btn.textContent = '登录中…';
    Auth.login(email, password).then(function() {
      UI.closeAuthModal();
      UI.showToast('登录成功！欢迎回来，' + Auth.displayName, 'success');
      Router.navigate('dashboard');
    }).catch(function(err) {
      UI._showLoginError(err.message || '登录失败，请检查邮箱和密码');
    }).finally(function() {
      btn.disabled = false; btn.textContent = '登 录';
    });
  },

  _doRegister: function() {
    var name = (document.getElementById('regName') || {}).value || ''; name = name.trim();
    var email = (document.getElementById('regEmail') || {}).value || ''; email = email.trim();
    var pw = (document.getElementById('regPassword') || {}).value || '';
    var pw2 = (document.getElementById('regPassword2') || {}).value || '';

    if (!name || !email || !pw) return UI._showRegError('请填写完整信息');
    if (pw.length < 6) return UI._showRegError('密码至少6位');
    if (pw !== pw2) return UI._showRegError('两次密码不一致');

    var btn = document.getElementById('registerBtn');
    btn.disabled = true; btn.textContent = '注册中…';
    Auth.register(email, pw, name).then(function(result) {
      UI.closeAuthModal();
      if (result.user && result.session) {
        UI.showToast('注册成功！欢迎加入 Azure Future', 'success');
        Router.navigate('dashboard');
      } else {
        UI.showToast('注册成功！请检查邮箱确认后登录', 'info');
        UI.openAuthModal();
      }
    }).catch(function(err) {
      UI._showRegError(err.message || '注册失败，请稍后重试');
    }).finally(function() {
      btn.disabled = false; btn.textContent = '注 册';
    });
  },

  _showLoginError: function(msg) {
    var el = document.getElementById('loginError');
    if (!el) return;
    el.textContent = msg; el.style.display = 'block';
  },

  _showRegError: function(msg) {
    var el = document.getElementById('regError');
    if (!el) return;
    el.textContent = msg; el.style.display = 'block';
  },

  _clearAuthErrors: function() {
    var le = document.getElementById('loginError'); if (le) le.style.display = 'none';
    var re = document.getElementById('regError'); if (re) re.style.display = 'none';
  },

  _initRoleSelector: function() {
    document.querySelectorAll('.role-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var role = card.getAttribute('data-role');
        UI._selectRole(role);
      });
    });
    UI._restoreRoleSelection();
  },

  _selectRole: function(role) {
    document.querySelectorAll('.role-card').forEach(function(c) { c.classList.remove('selected'); });
    var target = document.getElementById('role-' + role);
    if (target) target.classList.add('selected');
    localStorage.setItem('azure_userRole', role);
    UI._updateMainButton(role);
  },

  _restoreRoleSelection: function() {
    var role = localStorage.getItem('azure_userRole');
    if (role) {
      document.querySelectorAll('.role-card').forEach(function(c) { c.classList.remove('selected'); });
      var target = document.getElementById('role-' + role);
      if (target) target.classList.add('selected');
      UI._updateMainButton(role);
    }
  },

  _updateMainButton: function(role) {
    var btn = document.getElementById('btn-main-action');
    var navTalent = document.getElementById('nav-talent-pool');
    if (!btn) return;
    var isHR = role === 'hr';
    var targetPage = isHR ? 'talent-pool' : 'cloud-trial';
    // Update data-navigate so the Router's delegated handler picks up correct page
    btn.setAttribute('data-navigate', targetPage);
    if (isHR) {
      btn.textContent = '🔍 开始筛选人才';
      if (navTalent) navTalent.style.display = '';
    } else {
      btn.textContent = '☁ 开始云试工';
      if (navTalent) navTalent.style.display = 'none';
    }
    btn.onclick = function(e) {
      if (window.Router) {
        Router.navigate(targetPage);
      }
      else if (window._fallbackNavigate) {
        window._fallbackNavigate(targetPage);
      }
    };
  },

  showToast: function(msg, type) {
    type = type || 'info';
    var container = document.getElementById('toastContainer');
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(function() {
      toast.style.animation = 'toastOut .3s ease forwards';
      setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
  },

  showLoading: function(elementId, message) {
    message = message || '加载中…';
    var el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = '<div style="text-align:center;padding:40px;"><div class="spinner" style="margin:0 auto 16px;"></div><p style="color:var(--text-dim);font-size:14px;">' + message + '</p></div>';
  },

  getRole: function() { return localStorage.getItem('azure_userRole') || null; },

  _initHeroParticles: function() {
    var container = document.getElementById('heroParticles');
    if (!container) return;
    for (var i = 0; i < 20; i++) {
      var particle = document.createElement('div');
      particle.className = 'hero-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.width = (2 + Math.random() * 4) + 'px';
      particle.style.height = particle.style.width;
      container.appendChild(particle);
    }
  },

  _initCardMouseTracking: function() {
    document.querySelectorAll('.card').forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        if (!card.isConnected) return;
        var rect = card.getBoundingClientRect();
        if (!rect || rect.width === 0) return;
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', x + '%');
        card.style.setProperty('--mouse-y', y + '%');
      });
    });
  }
};

// ═══ CLOUD TRIAL ENGINE ════════════════════════
var CloudTrial = {
  trialData: {},
  currentStep: 1,

  init: function() {
    CloudTrial._renderPanels();
    CloudTrial._bindEvents();
  },

  _renderPanels: function() {
    var container = document.getElementById('trial-panels');
    if (!container) return;
    container.innerHTML =
      '<div class="trial-panel active" id="trial-step-1">' +
        '<div class="trial-card">' +
          '<h3 style="margin-bottom:16px;">📋 基本信息</h3>' +
          '<div class="form-row">' +
            '<div class="form-group" style="flex:1;"><label>你的名字</label><input class="form-input" id="trial-name" placeholder="如何称呼你？"></div>' +
            '<div class="form-group" style="flex:1;"><label>所在城市</label><input class="form-input" id="trial-location" placeholder="如：北京"></div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group" style="flex:1;"><label>出生地</label><input class="form-input" id="trial-birthplace" placeholder="如：成都"></div>' +
            '<div class="form-group" style="flex:1;"><label>梦想城市</label><input class="form-input" id="trial-dreamcity" placeholder="你想去哪里？"></div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group" style="flex:1;"><label>工作经验</label><select class="form-select" id="trial-exp"><option value="0-1">0-1年</option><option value="1-3">1-3年</option><option value="3-5">3-5年</option><option value="5-10">5-10年</option><option value="10+">10年以上</option></select></div>' +
            '<div class="form-group" style="flex:1;"><label>工作模式偏好</label><select class="form-select" id="trial-mode"><option value="remote">远程</option><option value="hybrid">混合</option><option value="onsite">线下</option><option value="any">不限</option></select></div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group" style="flex:1;"><label>兴趣爱好</label><input class="form-input" id="trial-hobbies" placeholder="如：摄影、编程、旅行"></div>' +
            '<div class="form-group" style="flex:1;"><label>MBTI（选填）</label><select class="form-select" id="trial-mbti"><option value="">不限</option><option>INTJ</option><option>INTP</option><option>ENTJ</option><option>ENTP</option><option>INFJ</option><option>INFP</option><option>ENFJ</option><option>ENFP</option><option>ISTJ</option><option>ISFJ</option><option>ESTJ</option><option>ESFJ</option><option>ISTP</option><option>ISFP</option><option>ESTP</option><option>ESFP</option></select></div>' +
          '</div>' +
        '</div>' +
        '<button class="btn btn-primary" id="trial-next-1">下一步 →</button>' +
      '</div>' +
      '<div class="trial-panel" id="trial-step-2">' +
        '<div class="trial-card">' +
          '<h3 style="margin-bottom:16px;">💼 过往经历</h3>' +
          '<div class="form-group"><label>所在行业</label><input class="form-input" id="trial-industry" placeholder="如：互联网、金融、教育"></div>' +
          '<div class="form-group"><label>最近职位</label><input class="form-input" id="trial-last-role" placeholder="如：产品经理"></div>' +
          '<div class="form-group"><label>已有技能（点击选择或输入自定义）</label>' +
            '<div class="skill-tags" id="trial-skills-tags">' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">Python</span>' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">数据分析</span>' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">项目管理</span>' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">沟通协调</span>' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">UI设计</span>' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">Java</span>' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">SQL</span>' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">英语</span>' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">团队管理</span>' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">市场营销</span>' +
            '</div>' +
            '<div style="display:flex;gap:8px;margin-top:8px;">' +
              '<input class="form-input" id="trial-custom-skill" placeholder="添加自定义技能">' +
              '<button class="btn btn-outline btn-sm" id="trial-add-skill">添加</button>' +
            '</div>' +
          '</div>' +
          '<div class="form-group"><label>自我描述（选填）</label><textarea class="form-textarea" id="trial-desc" placeholder="简单描述你的职业经历和特点…"></textarea></div>' +
        '</div>' +
        '<button class="btn btn-primary" id="trial-next-2">下一步 →</button>' +
      '</div>' +
      '<div class="trial-panel" id="trial-step-3">' +
        '<div class="trial-card">' +
          '<h3 style="margin-bottom:16px;">🎯 目标岗位</h3>' +
          '<div class="form-group"><label>目标行业</label><input class="form-input" id="trial-target-industry" placeholder="如：AI、云计算"></div>' +
          '<div class="form-group"><label>目标职位</label><input class="form-input" id="trial-target-role" placeholder="如：AI产品经理"></div>' +
          '<div class="form-group"><label>目标技能（点击选择或输入自定义）</label>' +
            '<div class="skill-tags" id="trial-target-skills-tags">' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">机器学习</span>' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">深度学习</span>' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">NLP</span>' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">云计算</span>' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">产品设计</span>' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">敏捷开发</span>' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">数据分析</span>' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">战略规划</span>' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">用户研究</span>' +
              '<span class="skill-tag" onclick="this.classList.toggle(\'selected\')">商业分析</span>' +
            '</div>' +
            '<div style="display:flex;gap:8px;margin-top:8px;">' +
              '<input class="form-input" id="trial-target-custom-skill" placeholder="添加自定义技能">' +
              '<button class="btn btn-outline btn-sm" id="trial-add-target-skill">添加</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<button class="btn btn-primary" id="trial-next-3">下一步 →</button>' +
      '</div>' +
      '<div class="trial-panel" id="trial-step-4">' +
        '<div class="trial-card">' +
          '<h3 style="margin-bottom:16px;">📊 能力自评（1-10分）</h3>' +
          '<div class="slider-row"><label>学习能力</label><input type="range" min="1" max="10" value="5" id="trial-self-learn" oninput="document.getElementById(\'trial-self-learn-val\').textContent=this.value"><span class="slider-val" id="trial-self-learn-val">5</span></div>' +
          '<div class="slider-row"><label>逻辑思维</label><input type="range" min="1" max="10" value="5" id="trial-self-logic" oninput="document.getElementById(\'trial-self-logic-val\').textContent=this.value"><span class="slider-val" id="trial-self-logic-val">5</span></div>' +
          '<div class="slider-row"><label>沟通表达</label><input type="range" min="1" max="10" value="5" id="trial-self-comm" oninput="document.getElementById(\'trial-self-comm-val\').textContent=this.value"><span class="slider-val" id="trial-self-comm-val">5</span></div>' +
          '<div class="slider-row"><label>自驱力</label><input type="range" min="1" max="10" value="5" id="trial-self-drive" oninput="document.getElementById(\'trial-self-drive-val\').textContent=this.value"><span class="slider-val" id="trial-self-drive-val">5</span></div>' +
          '<div class="slider-row"><label>抗压能力</label><input type="range" min="1" max="10" value="5" id="trial-self-stress" oninput="document.getElementById(\'trial-self-stress-val\').textContent=this.value"><span class="slider-val" id="trial-self-stress-val">5</span></div>' +
        '</div>' +
        '<button class="btn btn-primary" id="trial-generate">🚀 生成评估报告</button>' +
      '</div>' +
      '<div class="trial-panel" id="trial-step-5">' +
        '<div id="trial-report"></div>' +
        '<div style="display:flex;gap:12px;margin-top:24px;">' +
          '<button class="btn btn-outline" id="trial-retry">🔄 重新评估</button>' +
          '<button class="btn btn-primary" id="trial-save">💾 保存到控制台</button>' +
        '</div>' +
      '</div>';
  },

  _bindEvents: function() {
    var n1 = document.getElementById('trial-next-1'); if (n1) n1.addEventListener('click', function() { CloudTrial.goToStep(2); });
    var n2 = document.getElementById('trial-next-2'); if (n2) n2.addEventListener('click', function() { CloudTrial.goToStep(3); });
    var n3 = document.getElementById('trial-next-3'); if (n3) n3.addEventListener('click', function() { CloudTrial.goToStep(4); });
    var gen = document.getElementById('trial-generate'); if (gen) gen.addEventListener('click', function() { CloudTrial.generateReport(); });
    var retry = document.getElementById('trial-retry'); if (retry) retry.addEventListener('click', function() { CloudTrial.reset(); });
    var save = document.getElementById('trial-save'); if (save) save.addEventListener('click', function() { CloudTrial.saveReport(); });

    var addSkill = document.getElementById('trial-add-skill');
    if (addSkill) addSkill.addEventListener('click', function() { CloudTrial._addCustomSkill('trial-custom-skill', 'trial-skills-tags'); });
    var addTarget = document.getElementById('trial-add-target-skill');
    if (addTarget) addTarget.addEventListener('click', function() { CloudTrial._addCustomSkill('trial-target-custom-skill', 'trial-target-skills-tags'); });

    ['trial-custom-skill', 'trial-target-custom-skill'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          var targetId = id === 'trial-custom-skill' ? 'trial-skills-tags' : 'trial-target-skills-tags';
          CloudTrial._addCustomSkill(id, targetId);
        }
      });
    });
  },

  goToStep: function(step) {
    CloudTrial.currentStep = step;
    document.querySelectorAll('.trial-panel').forEach(function(p) { p.classList.remove('active'); });
    var target = document.getElementById('trial-step-' + step);
    if (target) target.classList.add('active');

    document.querySelectorAll('.trial-step').forEach(function(s, i) {
      s.classList.remove('active', 'done');
      if (i + 1 < step) s.classList.add('done');
      if (i + 1 === step) s.classList.add('active');
    });

    var container = document.querySelector('.trial-container');
    if (container) window.scrollTo({ top: container.offsetTop - 100, behavior: 'smooth' });
  },

  _addCustomSkill: function(inputId, containerId) {
    var input = document.getElementById(inputId);
    var val = input.value.trim();
    if (!val) return;
    var container = document.getElementById(containerId);
    var tag = document.createElement('span');
    tag.className = 'skill-tag selected';
    tag.textContent = val;
    tag.onclick = function() { this.classList.toggle('selected'); };
    container.appendChild(tag);
    input.value = '';
  },

  _getSelectedSkills: function(containerId) {
    var result = [];
    document.querySelectorAll('#' + containerId + ' .skill-tag.selected').forEach(function(t) { result.push(t.textContent); });
    return result;
  },

  _getData: function() {
    return {
      name: (document.getElementById('trial-name') || {}).value || '未填写',
      exp: (document.getElementById('trial-exp') || {}).value || '0-1',
      location: (document.getElementById('trial-location') || {}).value || '',
      mode: (document.getElementById('trial-mode') || {}).value || 'any',
      birthplace: (document.getElementById('trial-birthplace') || {}).value || '',
      dreamCity: (document.getElementById('trial-dreamcity') || {}).value || '',
      hobbies: (document.getElementById('trial-hobbies') || {}).value || '',
      mbti: (document.getElementById('trial-mbti') || {}).value || '',
      industry: (document.getElementById('trial-industry') || {}).value || '',
      lastRole: (document.getElementById('trial-last-role') || {}).value || '',
      skills: CloudTrial._getSelectedSkills('trial-skills-tags'),
      desc: (document.getElementById('trial-desc') || {}).value || '',
      targetIndustry: (document.getElementById('trial-target-industry') || {}).value || '',
      targetRole: (document.getElementById('trial-target-role') || {}).value || '',
      targetSkills: CloudTrial._getSelectedSkills('trial-target-skills-tags'),
      selfLearn: parseInt((document.getElementById('trial-self-learn') || {}).value) || 5,
      selfLogic: parseInt((document.getElementById('trial-self-logic') || {}).value) || 5,
      selfComm: parseInt((document.getElementById('trial-self-comm') || {}).value) || 5,
      selfDrive: parseInt((document.getElementById('trial-self-drive') || {}).value) || 5,
      selfStress: parseInt((document.getElementById('trial-self-stress') || {}).value) || 5
    };
  },

  generateReport: function() {
    var data = CloudTrial._getData();
    var role = UI.getRole();
    var isHR = role === 'hr';

    var industryPairs = [
      ['互联网','科技','IT','软件','SaaS','AI','云计算','数据'],
      ['金融','银行','保险','证券','投资','风控'],
      ['教育','培训','在线教育','知识付费'],
      ['制造业','工业','供应链','物流','硬件'],
      ['医疗','健康','医药','生物','器械'],
      ['零售','电商','消费','跨境电商','新零售'],
      ['媒体','广告','营销','公关','内容']
    ];

    var industryMatch = false;
    var srcIndustry = data.industry;
    var tgtIndustry = data.targetIndustry;
    for (var g = 0; g < industryPairs.length; g++) {
      var group = industryPairs[g];
      var srcInGroup = group.some(function(k) { return srcIndustry.indexOf(k) !== -1; });
      var tgtInGroup = group.some(function(k) { return tgtIndustry.indexOf(k) !== -1; });
      if (srcInGroup && tgtInGroup) { industryMatch = true; break; }
    }

    var costScore = industryMatch ? 70 : 40;
    costScore += Math.min(data.skills.filter(function(s) { return data.targetSkills.indexOf(s) !== -1; }).length * 5, 25);
    if (data.exp === '10+' || data.exp === '5-10') costScore += 5;
    costScore = Math.min(100, Math.max(10, costScore));

    var selfScores = [data.selfLearn, data.selfLogic, data.selfComm, data.selfDrive, data.selfStress];
    var selfAvg = selfScores.reduce(function(a, b) { return a + b; }, 0) / selfScores.length;
    var potentialScore = Math.round(selfAvg * 10);
    var skillOverlap = data.skills.filter(function(s) { return data.targetSkills.indexOf(s) !== -1; }).length;
    potentialScore += skillOverlap * 3;
    if (data.hobbies && data.hobbies.length > 0) potentialScore += 5;
    potentialScore = Math.min(100, Math.max(10, potentialScore));

    var happinessScore = 50;
    try {
      var hh = JSON.parse(localStorage.getItem('azure_happinessHistory') || '[]');
      if (hh.length > 0) {
        happinessScore = hh[0].scores ? (hh[0].scores.total || 50) : (hh[0].happinessScore || 50);
      }
    } catch(e) {}

    var matchScore = Math.round(costScore * 0.35 + potentialScore * 0.40 + happinessScore * 0.25);

    CloudTrial.trialData = {
      name: data.name, exp: data.exp, location: data.location, mode: data.mode,
      birthplace: data.birthplace, dreamCity: data.dreamCity, hobbies: data.hobbies,
      mbti: data.mbti, industry: data.industry, lastRole: data.lastRole,
      skills: data.skills, desc: data.desc,
      targetIndustry: data.targetIndustry, targetRole: data.targetRole,
      targetSkills: data.targetSkills,
      selfLearn: data.selfLearn, selfLogic: data.selfLogic,
      selfComm: data.selfComm, selfDrive: data.selfDrive, selfStress: data.selfStress,
      costScore: costScore, potentialScore: potentialScore,
      happinessScore: happinessScore, matchScore: matchScore,
      timestamp: Date.now()
    };

    var scoreClass = matchScore >= 70 ? 'score-high' : matchScore >= 40 ? 'score-mid' : 'score-low';
    var level = matchScore >= 70 ? '高度匹配' : matchScore >= 40 ? '中等匹配' : '需要提升';
    var levelEmoji = matchScore >= 70 ? '🌟' : matchScore >= 40 ? '📈' : '💪';

    var reportHTML =
      '<div class="result-card">' +
        '<div class="result-header">' +
          '<div class="result-score ' + scoreClass + '">' +
            '<span style="font-size:14px;font-weight:400;">匹配度</span>' +
            '<span>' + matchScore + '</span>' +
          '</div>' +
          '<h3>' + levelEmoji + ' ' + level + '</h3>' +
          '<p style="color:var(--text-dim);margin-top:8px;">' + escapeHTML(data.name) + ' → ' + escapeHTML(data.targetRole || '目标岗位') + '</p>' +
        '</div>' +
        '<div class="bar-group"><div class="bar-label"><span>' + (isHR ? '用人成本' : '生存成本') + '</span><span>' + costScore + '分</span></div><div class="bar-track"><div class="bar-fill ' + (costScore >= 60 ? 'high' : costScore >= 35 ? 'mid' : 'low') + '" style="width:' + costScore + '%"></div></div></div>' +
        '<div class="bar-group"><div class="bar-label"><span>成长潜质</span><span>' + potentialScore + '分</span></div><div class="bar-track"><div class="bar-fill ' + (potentialScore >= 60 ? 'high' : potentialScore >= 35 ? 'mid' : 'low') + '" style="width:' + potentialScore + '%"></div></div></div>' +
        '<div class="bar-group"><div class="bar-label"><span>幸福指数</span><span>' + happinessScore + '分</span></div><div class="bar-track"><div class="bar-fill ' + (happinessScore >= 60 ? 'high' : happinessScore >= 35 ? 'mid' : 'low') + '" style="width:' + happinessScore + '%"></div></div></div>' +
        '<div class="recommendation-box"><h4>💡 AI 建议</h4><p style="font-size:14px;line-height:1.8;color:rgba(255,255,255,.8);">' + CloudTrial._getRecommendation(matchScore, costScore, potentialScore, data, isHR) + '</p></div>' +
      '</div>';

    document.getElementById('trial-report').innerHTML = reportHTML;
    CloudTrial.trialData.reportHTML = reportHTML;

    requestAnimationFrame(function() {
      document.querySelectorAll('.bar-fill').forEach(function(bar) {
        var targetWidth = bar.style.width;
        bar.style.width = '0%';
        void bar.offsetWidth;
        bar.style.transition = 'width 0.8s cubic-bezier(.25,.46,.45,.94)';
        bar.style.width = targetWidth;
      });
    });

    CloudTrial.goToStep(5);
  },

  _getRecommendation: function(matchScore, costScore, potentialScore, data, isHR) {
    var parts = [];
    if (matchScore >= 70) {
      parts.push('你的综合匹配度较高，说明你具备较强的可迁移能力和行业适配性。');
      parts.push('建议在面试中突出你的跨行业经验和快速学习能力。');
    } else if (matchScore >= 40) {
      parts.push('你具备一定的基础匹配度，但仍有提升空间。');
      parts.push('建议重点补强' + data.targetSkills.slice(0, 3).join('、') + '等目标技能。');
    } else {
      parts.push('当前匹配度偏低，但这不代表你不适合——只是需要更多准备。');
      parts.push('建议从基础技能入手，通过项目实践积累经验，逐步靠近目标。');
    }
    if (potentialScore >= 70) {
      parts.push('你的成长潜质突出，学习能力和自驱力是你的核心竞争力。');
    }
    return parts.join(' ');
  },

  saveReport: function() {
    if (!CloudTrial.trialData.matchScore) { UI.showToast('请先生成评估报告', 'error'); return; }
    DataService.saveTrial(Auth.user ? Auth.user.id : null, CloudTrial.trialData).then(function() {
      UI.showToast('报告已保存到控制台！', 'success');
    }).catch(function() {
      DataService._saveLocal('azure_trialHistory', CloudTrial.trialData);
      UI.showToast('已保存到本地（登录后可同步到云端）', 'info');
    });
  },

  reset: function() {
    CloudTrial.trialData = {};
    CloudTrial.goToStep(1);
    ['trial-name','trial-location','trial-birthplace','trial-dreamcity','trial-hobbies',
     'trial-industry','trial-last-role','trial-desc','trial-target-industry','trial-target-role'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.value = '';
    });
    document.querySelectorAll('#trial-skills-tags .skill-tag, #trial-target-skills-tags .skill-tag').forEach(function(t) { t.classList.remove('selected'); });
    var defaults = ['Python','数据分析','项目管理','沟通协调','UI设计','Java','SQL','英语','团队管理','市场营销',
                    '机器学习','深度学习','NLP','云计算','产品设计','敏捷开发','战略规划','用户研究','商业分析'];
    document.querySelectorAll('#trial-skills-tags .skill-tag, #trial-target-skills-tags .skill-tag').forEach(function(t) {
      if (defaults.indexOf(t.textContent) === -1) t.remove();
    });
  }
};

// ═══ HAPPINESS INDEX ENGINE ════════════════════
var Happiness = {
  data: {},
  currentStep: 1,
  presentation: 'score',

  init: function() {
    Happiness._bindEvents();
  },

  _bindEvents: function() {
    for (var i = 1; i <= 5; i++) {
      (function(idx) {
        var btn = document.getElementById('hnext-' + idx);
        if (btn) btn.addEventListener('click', function() {
          if (idx === 3) Happiness._analyzeKeywords();
          else Happiness.goToStep(idx + 1);
        });
      })(i);
    }
    var h6 = document.getElementById('hnext-6');
    if (h6) h6.addEventListener('click', function() { Happiness.generateReport(); });
    var retry = document.getElementById('happiness-retry');
    if (retry) retry.addEventListener('click', function() { Happiness.reset(); });
    var save = document.getElementById('happiness-save');
    if (save) save.addEventListener('click', function() { Happiness._saveReport(); });

    document.querySelectorAll('#pres-options .pres-option').forEach(function(opt) {
      opt.addEventListener('click', function() {
        document.querySelectorAll('#pres-options .pres-option').forEach(function(o) { o.classList.remove('selected'); });
        opt.classList.add('selected');
        Happiness.presentation = opt.getAttribute('data-pres');
      });
    });
  },

  goToStep: function(step) {
    Happiness.currentStep = step;
    document.querySelectorAll('.happiness-panel').forEach(function(p) { p.classList.remove('active'); });
    var target = document.getElementById('hstep-' + step);
    if (target) target.classList.add('active');

    document.querySelectorAll('.hstep').forEach(function(s, i) {
      s.classList.remove('active', 'done');
      if (i + 1 < step) s.classList.add('done');
      if (i + 1 === step) s.classList.add('active');
    });

    var el = document.querySelector('#page-happiness .section');
    window.scrollTo({ top: el ? el.offsetTop - 100 : 0, behavior: 'smooth' });
  },

  _analyzeKeywords: function() {
    var keywords = (document.getElementById('happiness-keywords') || {}).value || '';
    keywords = keywords.trim();
    if (!keywords) { UI.showToast('请输入你的关键词', 'error'); return; }

    document.getElementById('literary-gift-container').innerHTML =
      '<div style="text-align:center;padding:40px;"><div class="spinner" style="margin:0 auto 16px;"></div><p style="color:var(--text-dim);">AI 正在分析你的心境…</p></div>';
    Happiness.goToStep(4);

    // Show the "next step" button
    var hnext4 = document.getElementById('hnext-4');
    if (hnext4) hnext4.style.display = '';

    setTimeout(function() {
      var mood = Happiness._detectMood(keywords);
      var result = LITERARY_DB[mood];
      Happiness.data.keywords = keywords;
      Happiness.data.literaryGift = { mood: mood, result: result };

      var typeLabels = { book:'📚 著作', poem:'📜 诗歌', movie:'🎬 影视', music:'🎵 音乐', quote:'💬 名言' };

      document.getElementById('literary-gift-container').innerHTML =
        '<div class="trial-card" style="text-align:center;margin-bottom:16px;">' +
          '<div style="font-size:48px;">' + result.moodEmoji + '</div>' +
          '<h3 style="margin-top:8px;">你的心境：<span style="color:var(--accent);">' + result.mood + '</span></h3>' +
          '<p style="color:var(--text-dim);font-size:14px;margin-top:4px;">AI 从你的关键词中感受到了探索与成长的渴望</p>' +
        '</div>' +
        '<h3 style="margin-bottom:16px;">🎁 AI 为你精选的文艺赠礼</h3>' +
        result.items.map(function(item) {
          return '<div class="literary-item">' +
            '<span class="literary-type ' + item.type + '">' + (typeLabels[item.type] || item.type) + '</span>' +
            '<div class="literary-title">' + item.title + '</div>' +
            '<div class="literary-author">' + item.author + ' · ' + item.source + '</div>' +
            '<div class="literary-quote">"' + item.quote + '"</div>' +
          '</div>';
        }).join('');
    }, 1500 + Math.random() * 1000);
  },

  _detectMood: function(text) {
    if (/冒险|探索|远方|未知|挑战|出发|新|勇敢|闯|飞|跑/i.test(text)) return 'adventurous';
    if (/平静|安|慢|淡|简单|自然|田园|宁|静|佛|禅|治愈/i.test(text)) return 'peaceful';
    if (/成功|目标|第一|赢|巅|梦想|野心|超越|登|攀|峰|顶|强/i.test(text)) return 'ambitious';
    if (/意义|价值|使命|贡献|改变|世界|帮助|爱|善良|温暖|人|光/i.test(text)) return 'meaningful';
    return 'growing';
  },

  generateReport: function() {
    var scores = {};
    for (var i = 1; i <= 12; i++) {
      scores['q' + i] = parseInt((document.getElementById('h-q' + i) || {}).value) || 3;
    }

    var interest = Math.round((scores.q1 + scores.q2 + scores.q3) / 3 * 20);
    var life = Math.round((scores.q4 + scores.q5 + scores.q6) / 3 * 20);
    var growth = Math.round((scores.q7 + scores.q8 + scores.q9) / 3 * 20);
    var balance = Math.round((scores.q10 + scores.q11 + scores.q12) / 3 * 20);
    var total = Math.round((interest + life + growth + balance) / 4);

    var elements = [];
    document.querySelectorAll('#happiness-elements .h-element.selected').forEach(function(el) {
      elements.push(el.getAttribute('data-element'));
    });

    // Use window._happyPres if set by inline onclick, otherwise use Happiness.presentation
    if (window._happyPres) Happiness.presentation = window._happyPres;

    Happiness.data = {
      keywords: Happiness.data.keywords, literaryGift: Happiness.data.literaryGift,
      elements: elements,
      q1: scores.q1, q2: scores.q2, q3: scores.q3, q4: scores.q4,
      q5: scores.q5, q6: scores.q6, q7: scores.q7, q8: scores.q8,
      q9: scores.q9, q10: scores.q10, q11: scores.q11, q12: scores.q12,
      scores: { interest: interest, life: life, growth: growth, balance: balance, total: total },
      presentation: Happiness.presentation,
      name: Auth.displayName || '探索者'
    };

    var reportHTML;
    switch (Happiness.presentation) {
      case 'animal': reportHTML = Happiness._animalReport(interest, life, growth, balance, total); break;
      case 'plant': reportHTML = Happiness._plantReport(interest, life, growth, balance, total); break;
      case 'food': reportHTML = Happiness._foodReport(interest, life, growth, balance, total); break;
      default: reportHTML = Happiness._scoreReport(interest, life, growth, balance, total);
    }

    document.getElementById('happiness-report').innerHTML = reportHTML;
    Happiness.data.reportHTML = reportHTML;
    Happiness.goToStep(7);
  },

  _scoreReport: function(interest, life, growth, balance, total) {
    var dims = [['兴趣与热忱',interest],['城市与生活',life],['成长与回报',growth],['节奏与平衡',balance]];
    return '<div class="result-card" style="text-align:center;">' +
      '<div class="happiness-score-circle"><span class="score-num">' + total + '</span><span class="score-label">幸福指数</span></div>' +
      '<div class="happiness-meta">' +
        dims.map(function(d) { return '<div class="happiness-meta-item"><div class="meta-val">' + d[1] + '</div><div class="meta-label">' + d[0] + '</div></div>'; }).join('') +
      '</div>' +
      dims.map(function(d) {
        return '<div class="bar-group"><div class="bar-label"><span>' + d[0] + '</span><span>' + d[1] + '分</span></div><div class="bar-track"><div class="bar-fill ' + (d[1] >= 70 ? 'high' : d[1] >= 45 ? 'mid' : 'low') + '" style="width:' + d[1] + '%"></div></div></div>';
      }).join('') +
      '<div class="recommendation-box"><h4>💡 幸福建议</h4><p style="font-size:14px;line-height:1.8;color:rgba(255,255,255,.8);">' + Happiness._getAdvice(total, interest, life, growth, balance) + '</p></div>' +
    '</div>';
  },

  _animalReport: function(interest, life, growth, balance, total) {
    var animals = [
      { name:'海豚', emoji:'🐬', min:80, desc:'你像海豚一样充满智慧与活力，在工作中游刃有余，享受每一刻。你的热情感染着身边的人，团队因你而闪耀。' },
      { name:'鹰', emoji:'🦅', min:65, desc:'你像鹰一样目光敏锐、志向高远。你看得清方向，敢于飞向更高的天空。独立而自信是你的底色。' },
      { name:'猫', emoji:'🐱', min:50, desc:'你像猫一样优雅从容，懂得在忙碌中保持自己的节奏。你重视生活品质，工作只是你精彩人生的一部分。' },
      { name:'鹿', emoji:'🦌', min:35, desc:'你像鹿一样温和而敏感，对周围环境有细腻的感知。你正在寻找属于自己的森林，慢一点也没关系。' },
      { name:'海龟', emoji:'🐢', min:0, desc:'你像海龟一样坚韧而沉稳。虽然步伐不快，但每一步都踏实有力。长途跋涉需要耐心，你拥有这份力量。' }
    ];
    var animal = animals.find(function(a) { return total >= a.min; }) || animals[animals.length-1];
    Happiness.data.animal = animal.name;
    return '<div class="result-card" style="text-align:center;">' +
      '<div style="font-size:80px;">' + animal.emoji + '</div>' +
      '<h2 style="margin-top:8px;">你是 <span style="color:var(--accent);">' + animal.name + '</span> 型工作者</h2>' +
      '<div class="happiness-score-circle" style="margin-top:24px;"><span class="score-num">' + total + '</span><span class="score-label">幸福指数</span></div>' +
      '<p style="font-size:16px;line-height:2;color:rgba(255,255,255,.85);margin-top:20px;">' + animal.desc + '</p>' +
      '<div class="recommendation-box"><h4>💡 幸福建议</h4><p style="font-size:14px;line-height:1.8;color:rgba(255,255,255,.8);">' + Happiness._getAdvice(total, interest, life, growth, balance) + '</p></div>' +
    '</div>';
  },

  _plantReport: function(interest, life, growth, balance, total) {
    var plants = [
      { name:'向日葵', emoji:'🌻', min:80, desc:'你像向日葵一样永远面向阳光。积极乐观是你的天性，无论在哪里都能给团队带来温暖和能量。' },
      { name:'竹子', emoji:'🎋', min:65, desc:'你像竹子一样厚积薄发。表面平静，地下却在疯狂扎根。当机会来临时，你会以惊人的速度成长。' },
      { name:'薰衣草', emoji:'💜', min:50, desc:'你像薰衣草一样散发着让人安心的气息。你追求内心的平静与美好，懂得用温柔化解压力。' },
      { name:'多肉', emoji:'🪴', min:35, desc:'你像多肉植物一样生命力顽强。不需要太多资源也能活得很好，在逆境中反而更加坚韧。' },
      { name:'苔藓', emoji:'🌿', min:0, desc:'你像苔藓一样安静而持久。也许不引人注目，但你在自己的角落里默默生长，终会铺满整片森林。' }
    ];
    var plant = plants.find(function(p) { return total >= p.min; }) || plants[plants.length-1];
    Happiness.data.plant = plant.name;
    return '<div class="result-card" style="text-align:center;">' +
      '<div style="font-size:80px;">' + plant.emoji + '</div>' +
      '<h2 style="margin-top:8px;">你是 <span style="color:#34d399;">' + plant.name + '</span> 型工作者</h2>' +
      '<div class="happiness-score-circle" style="margin-top:24px;border-color:#34d399;box-shadow:0 0 40px rgba(52,211,153,.15);"><span class="score-num">' + total + '</span><span class="score-label">幸福指数</span></div>' +
      '<p style="font-size:16px;line-height:2;color:rgba(255,255,255,.85);margin-top:20px;">' + plant.desc + '</p>' +
      '<div class="recommendation-box"><h4>💡 幸福建议</h4><p style="font-size:14px;line-height:1.8;color:rgba(255,255,255,.8);">' + Happiness._getAdvice(total, interest, life, growth, balance) + '</p></div>' +
    '</div>';
  },

  _foodReport: function(interest, life, growth, balance, total) {
    var foods = [
      { name:'火锅', emoji:'🍲', min:80, desc:'你像火锅一样热气腾腾、包容万象。和你在一起的人都会被你感染，你是团队中的核心凝聚点。' },
      { name:'寿司', emoji:'🍣', min:65, desc:'你像寿司一样精致而有内涵。每一份努力都经过精心打磨，追求品质而非数量。简约但不简单。' },
      { name:'咖啡', emoji:'☕', min:50, desc:'你像咖啡一样先苦后甜。工作对你来说是种品味，你享受思考的深度和解决问题的成就感。' },
      { name:'面包', emoji:'🍞', min:35, desc:'你像面包一样朴实而温暖。虽然不张扬，但你是团队中最可靠的基石。稳定输出，持续贡献。' },
      { name:'苦瓜', emoji:'🥒', min:0, desc:'你像苦瓜一样，懂得"吃得苦中苦"的道理。虽然当下辛苦，但你在积蓄力量，甜美的收获即将到来。' }
    ];
    var food = foods.find(function(f) { return total >= f.min; }) || foods[foods.length-1];
    Happiness.data.food = food.name;
    return '<div class="result-card" style="text-align:center;">' +
      '<div style="font-size:80px;">' + food.emoji + '</div>' +
      '<h2 style="margin-top:8px;">你是 <span style="color:#fbbf24;">' + food.name + '</span> 型工作者</h2>' +
      '<div class="happiness-score-circle" style="margin-top:24px;border-color:#fbbf24;box-shadow:0 0 40px rgba(251,191,36,.15);"><span class="score-num">' + total + '</span><span class="score-label">幸福指数</span></div>' +
      '<p style="font-size:16px;line-height:2;color:rgba(255,255,255,.85);margin-top:20px;">' + food.desc + '</p>' +
      '<div class="recommendation-box"><h4>💡 幸福建议</h4><p style="font-size:14px;line-height:1.8;color:rgba(255,255,255,.8);">' + Happiness._getAdvice(total, interest, life, growth, balance) + '</p></div>' +
    '</div>';
  },

  _getAdvice: function(total, interest, life, growth, balance) {
    var dims = [
      { score:interest, label:'兴趣与热忱' },
      { score:life, label:'城市与生活' },
      { score:growth, label:'成长与回报' },
      { score:balance, label:'节奏与平衡' }
    ];
    var sortedAsc = dims.slice().sort(function(a,b) { return a.score - b.score; });
    var lowest = sortedAsc[0];
    var highest = sortedAsc[sortedAsc.length-1];

    var parts = [];
    parts.push('你的最强维度是「' + highest.label + '」(' + highest.score + '分)，这是你的幸福支柱，请继续保持！');
    parts.push('值得关注的是「' + lowest.label + '」(' + lowest.score + '分)，建议在这方面多加投入。');

    if (total >= 70) parts.push('整体幸福指数较高，你已找到工作的意义和乐趣。');
    else if (total >= 45) parts.push('幸福指数处于中等水平，在忙碌中别忘了照顾自己的内心需求。');
    else parts.push('当前幸福指数偏低，也许是时候重新审视工作与生活的关系了。');

    return parts.join(' ');
  },

  _saveReport: function() {
    if (!Happiness.data.scores) { UI.showToast('请先生成幸福画像', 'error'); return; }
    DataService.saveHappiness(Auth.user ? Auth.user.id : null, Happiness.data).then(function() {
      UI.showToast('幸福画像已保存！', 'success');
    }).catch(function() {
      DataService._saveLocal('azure_happinessHistory', Happiness.data);
      UI.showToast('已保存到本地（登录后可同步到云端）', 'info');
    });
  },

  reset: function() {
    Happiness.data = {};
    Happiness.presentation = 'score';
    window._happyPres = 'score';
    Happiness.goToStep(1);
    var kw = document.getElementById('happiness-keywords'); if (kw) kw.value = '';
    document.querySelectorAll('#happiness-elements .h-element.selected').forEach(function(el) { el.classList.remove('selected'); });
    document.querySelectorAll('#pres-options .pres-option').forEach(function(o) { o.classList.remove('selected'); });
    var defPres = document.querySelector('#pres-options .pres-option[data-pres="score"]');
    if (defPres) defPres.classList.add('selected');
    for (var i = 1; i <= 12; i++) {
      var slider = document.getElementById('h-q' + i);
      if (slider) { slider.value = 3; var dv = document.getElementById('hv-q' + i); if (dv) dv.textContent = '3'; }
    }
  }
};

// ═══ TALENT POOL MODULE (HR) ════════════════════
var TalentPool = {
  mockCandidates: [
    { name:'张伟', exp:'5-10年', industry:'互联网 / 科技', lastRole:'高级产品经理', targetIndustry:'互联网 / 科技', targetRole:'产品经理', matchScore:85, costScore:78, potentialScore:88, happinessScore:76, skills:['产品设计','数据分析','项目管理','敏捷开发'], selfLearn:9, selfLogic:8, selfComm:8, selfDrive:9, selfStress:7, location:'北京', mode:'hybrid', mbti:'ENTJ', desc:'8年互联网产品经验，主导过千万级用户产品的从0到1。擅长数据驱动决策，有跨团队协作经验。' },
    { name:'李娜', exp:'3-5年', industry:'金融', lastRole:'数据分析师', targetIndustry:'互联网 / 科技', targetRole:'AI 工程师', matchScore:62, costScore:55, potentialScore:72, happinessScore:68, skills:['Python','SQL','数据分析','机器学习'], selfLearn:9, selfLogic:9, selfComm:6, selfDrive:8, selfStress:6, location:'上海', mode:'onsite', mbti:'INTP', desc:'3年金融数据分析经验，熟悉Python/SQL，自学机器学习一年，希望转型AI领域。' },
    { name:'王磊', exp:'1-3年', industry:'教育', lastRole:'前端开发', targetIndustry:'互联网 / 科技', targetRole:'前端开发', matchScore:78, costScore:82, potentialScore:75, happinessScore:70, skills:['JavaScript','React','UI设计','CSS'], selfLearn:8, selfLogic:7, selfComm:7, selfDrive:8, selfStress:7, location:'深圳', mode:'remote', mbti:'INFP', desc:'2年前端开发经验，精通React/Vue生态，对用户体验有敏锐感知，热爱开源项目。' },
    { name:'陈静', exp:'10+', industry:'制造业', lastRole:'项目经理', targetIndustry:'互联网 / 科技', targetRole:'项目经理', matchScore:71, costScore:65, potentialScore:80, happinessScore:65, skills:['项目管理','团队管理','沟通协调','战略规划'], selfLearn:7, selfLogic:8, selfComm:9, selfDrive:8, selfStress:8, location:'杭州', mode:'hybrid', mbti:'ENFJ', desc:'12年制造业项目管理经验，PMP认证，成功交付多个千万级项目。希望转行到科技行业。' },
    { name:'刘洋', exp:'0-1年', industry:'零售 / 电商', lastRole:'运营专员', targetIndustry:'零售 / 电商', targetRole:'运营专员', matchScore:73, costScore:80, potentialScore:68, happinessScore:74, skills:['市场营销','沟通协调','团队管理','数据分析'], selfLearn:7, selfLogic:6, selfComm:9, selfDrive:8, selfStress:6, location:'广州', mode:'any', mbti:'ENFP', desc:'应届生，电商专业背景，实习期间负责过双11活动运营，数据敏感度高。' },
    { name:'赵敏', exp:'3-5年', industry:'媒体 / 广告', lastRole:'UI设计师', targetIndustry:'互联网 / 科技', targetRole:'UI/UX 设计师', matchScore:80, costScore:75, potentialScore:84, happinessScore:78, skills:['UI设计','Figma','用户研究','创意设计'], selfLearn:8, selfLogic:7, selfComm:7, selfDrive:9, selfStress:6, location:'成都', mode:'remote', mbti:'ISFP', desc:'4年设计经验，服务过多家一线品牌，擅长B端产品设计，作品集丰富。' },
    { name:'孙浩', exp:'5-10年', industry:'互联网 / 科技', lastRole:'后端开发工程师', targetIndustry:'互联网 / 科技', targetRole:'后端开发', matchScore:92, costScore:88, potentialScore:94, happinessScore:80, skills:['Java','Python','云计算','架构设计'], selfLearn:10, selfLogic:9, selfComm:7, selfDrive:9, selfStress:8, location:'北京', mode:'onsite', mbti:'INTJ', desc:'8年后端开发经验，精通Java/微服务架构，有大型分布式系统设计经验。' },
    { name:'周婷', exp:'1-3年', industry:'医疗 / 健康', lastRole:'人力资源', targetIndustry:'医疗 / 健康', targetRole:'人力资源', matchScore:88, costScore:82, potentialScore:86, happinessScore:90, skills:['招聘','员工关系','培训发展','绩效管理'], selfLearn:7, selfLogic:8, selfComm:10, selfDrive:8, selfStress:7, location:'武汉', mode:'hybrid', mbti:'ESFJ', desc:'2年HR经验，擅长人才招聘和员工关系管理，熟悉劳动法规。' }
  ],
  filteredCandidates: [],
  init: function() {
    TalentPool._bindEvents();
  },
  _bindEvents: function() {
    var searchBtn = document.getElementById('tp-search-btn');
    if (searchBtn) searchBtn.addEventListener('click', function() { TalentPool.filter(); });
    var resetBtn = document.getElementById('tp-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', function() {
      var fi = document.getElementById('tp-filter-industry'); if (fi) fi.value = '';
      var fr = document.getElementById('tp-filter-role'); if (fr) fr.value = '';
      var fs = document.getElementById('tp-filter-score'); if (fs) fs.value = '0';
      TalentPool.filter();
    });
    ['tp-filter-industry','tp-filter-role','tp-filter-score'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('keydown', function(e) { if (e.key === 'Enter') TalentPool.filter(); });
    });
  },
  filter: function() {
    var industry = (document.getElementById('tp-filter-industry') || {}).value || '';
    var role = (document.getElementById('tp-filter-role') || {}).value || '';
    var scoreThreshold = parseInt((document.getElementById('tp-filter-score') || {}).value) || 0;
    var candidates = TalentPool.mockCandidates.slice();
    try {
      JSON.parse(localStorage.getItem('azure_trialHistory') || '[]').forEach(function(t) {
        if (t.name && t.matchScore) candidates.push({ name:t.name, exp:t.exp||'未知', industry:t.industry||'未填写', lastRole:t.lastRole||'', targetIndustry:t.targetIndustry||'未填写', targetRole:t.targetRole||'未填写', matchScore:t.matchScore||0, costScore:t.costScore||0, potentialScore:t.potentialScore||0, happinessScore:t.happinessScore||50, skills:t.skills||[], selfLearn:t.selfLearn||5, selfLogic:t.selfLogic||5, selfComm:t.selfComm||5, selfDrive:t.selfDrive||5, selfStress:t.selfStress||5, location:t.location||'', mode:t.mode||'any', mbti:t.mbti||'', desc:t.desc||'' });
      });
    } catch(e) {}
    TalentPool.filteredCandidates = candidates.filter(function(c) {
      if (industry && c.targetIndustry.indexOf(industry) === -1) return false;
      if (role && c.targetRole.indexOf(role) === -1) return false;
      if (c.matchScore < scoreThreshold) return false;
      return true;
    }).sort(function(a,b){return b.matchScore-a.matchScore;});
    TalentPool._render();
    TalentPool._updateStats(industry, role);
  },
  _updateStats: function(industry, role) {
    var fc = TalentPool.filteredCandidates;
    var total = fc.length;
    var highCount = fc.filter(function(c){return c.matchScore>=70;}).length;
    var avgMatch = total>0 ? Math.round(fc.reduce(function(s,c){return s+c.matchScore;},0)/total) : 0;
    var el; el=document.getElementById('tp-total-count');if(el)el.textContent=total;el=document.getElementById('tp-high-count');if(el)el.textContent=highCount;el=document.getElementById('tp-avg-match');if(el)el.textContent=avgMatch||'--';el=document.getElementById('tp-filter-info');
    if(el) el.textContent=(industry?industry:'')+((industry&&role)?' + ':'')+(role?role:'')||'全部';
  },
  _render: function() {
    var listEl = document.getElementById('talent-list'), emptyEl = document.getElementById('talent-empty');
    if (!listEl) return;
    if (TalentPool.filteredCandidates.length===0) { listEl.innerHTML=''; if(emptyEl)emptyEl.style.display='block'; return; }
    if(emptyEl) emptyEl.style.display='none';
    listEl.innerHTML=TalentPool.filteredCandidates.map(function(c,i){
      var scoreLevel = c.matchScore>=70?'high':c.matchScore>=45?'mid':'low';
      var levelText = {high:'高度匹配',mid:'中等匹配',low:'待观察'}[scoreLevel];
      var skillTags=(c.skills||[]).map(function(s){return '<span class="tp-skill-tag">'+escapeHTML(s)+'</span>'; }).join('');
      var barsHtml=[{v:c.matchScore,l:c.matchScore>=70?'high':c.matchScore>=45?'mid':'low',n:'匹配度'},{v:c.potentialScore,l:c.potentialScore>=60?'high':c.potentialScore>=35?'mid':'low',n:'潜质'},{v:c.costScore,l:c.costScore>=60?'high':c.costScore>=35?'mid':'low',n:'成本适配'},{v:c.happinessScore,l:c.happinessScore>=60?'high':c.happinessScore>=35?'mid':'low',n:'幸福指数'}].map(function(b){return '<div class="tp-bar-item"><div class="tp-bar-name">'+b.n+'</div><div class="bar-track"><div class="bar-fill '+b.l+'" style="width:'+Math.min(100,b.v)+'%"></div></div><div class="tp-bar-val '+(b.v>=70?'high':b.v>=40?'mid':'low')+'">'+b.v+'</div></div>'; }).join('');
      var selfBars=['selfLearn','selfLogic','selfComm','selfDrive','selfStress'];
      var selfLabels=['学','逻','沟','驱','压'];
      var selfHtml=selfBars.map(function(k,si){
        var v=c[k]||5, l=v>=7?'high':v>=4?'mid':'low';
        return '<div class="tp-self-item" title="'+['学习能力','逻辑思维','沟通表达','自驱力','抗压能力'][si]+'"><div class="bar-track"><div class="bar-fill '+l+'" style="width:'+(v*10)+'%"></div></div><span class="tp-self-label">'+selfLabels[si]+'</span></div>';
      }).join('');
      return '<div class="tp-card" style="animation-delay:'+(i*0.05)+'s">'+
        '<div class="tp-card-avatar-col">'+
          '<div class="tp-avatar">'+(c.name?c.name[0]:'?')+'</div>'+
          '<div class="tp-match-score '+scoreLevel+'">'+c.matchScore+'</div>'+
          '<div class="tp-score-label">匹配分</div>'+
          '<span class="tp-level-tag '+scoreLevel+'">'+levelText+'</span>'+
        '</div>'+
        '<div class="tp-card-info">'+
          '<div class="tp-card-header">'+
            '<strong class="tp-name">'+escapeHTML(c.name)+'</strong>'+
            '<span class="tp-meta">'+escapeHTML(c.exp)+' · '+escapeHTML(c.location||'--')+'</span>'+
          '</div>'+
          '<div class="tp-career-path">'+escapeHTML(c.lastRole)+' → <strong>'+escapeHTML(c.targetRole)+'</strong> · '+escapeHTML(c.targetIndustry)+'</div>'+
          '<div class="tp-desc">'+(c.desc?escapeHTML(c.desc):'')+'</div>'+
          '<div>'+skillTags+'</div>'+
          '<div class="tp-bars-row">'+barsHtml+'</div>'+
        '</div>'+
        '<div class="tp-card-self">'+
          '<div class="tp-self-title">能力自评</div>'+
          '<div class="tp-self-grid">'+selfHtml+'</div>'+
          (c.mbti?'<div class="tp-mbti-tag">'+c.mbti+'</div>':'')+
        '</div>'+
      '</div>';
    }).join('');
  }
};

// ═══ AI CHAT MODULE ════════════════════════════

var FALLBACK_KB = {
  '面试': '关于面试准备，我建议先从云试工评估开始，了解自己的优劣势。然后针对性补强短板。模拟面试也很重要，可以找朋友或对着镜子练习常见问题。记得准备STAR法则回答行为面试题！',
  '求职': '求职的核心是匹配度。试试云试工功能，我们会帮你量化分析你与目标岗位的匹配度。同时建议优化简历，突出「成果」而非「职责」，用数据说话更有说服力。',
  '转行': '转行并不可怕！关键在于挖掘你的可迁移技能。试试云试工功能，我们会帮你量化分析你在新行业中的匹配度与成长空间。建议先从小项目或副业开始积累新领域经验。',
  '简历': '好简历的核心是突出「成果」而非「职责」。云试工报告中的技能维度和匹配分析可以作为你简历优化的数据支撑。建议用STAR法则（情境-任务-行动-结果）来组织经历描述。',
  '薪资': '薪资受行业、城市、经验等多因素影响。建议在完成云试工评估后，结合你的匹配分和行业基准来做薪资预期。同时关注隐形福利（培训、股票、弹性工作等）。',
  '你好': '你好呀！👋 我是 Azure AI 职业顾问。有什么求职或职业发展的问题，尽管问我！你可以试试云试工评估自己的岗位匹配度，或者做幸福指数测评了解什么工作最适合你。',
  '谢谢': '不客气！能帮到你我很开心。随时来找我聊天，祝你求职顺利！✨',
  '帮助': '我可以帮你：1. 🔍 分析岗位匹配度（云试工）2. 💡 解答职业规划问题 3. 😊 幸福指数测评 4. 📝 求职建议与简历优化。直接问我吧！或者去「云试工」页面体验完整评估流程。',
  '职业规划': '职业规划建议从三个维度来思考：1）你擅长什么（能力）；2）你喜欢什么（兴趣）；3）市场需要什么（需求）。三者的交集就是你的甜蜜点。试试云试工和幸福指数，帮你更清晰地认识自己！',
  '技能': '在AI时代，建议关注三类技能：1）硬技能（编程、数据分析等）；2）软技能（沟通、领导力）；3）元技能（学习能力、批判性思维）。云试工评估可以帮助你发现技能缺口！',
  'AI': 'AI行业正在快速发展，机会很多！无论你的背景是什么，都可以找到切入点。建议关注：1）AI产品经理（需要懂业务+AI）；2）提示工程师（新兴岗位）；3）AI应用开发。试试云试工评估你的AI行业匹配度吧！'
};

var DEFAULT_REPLY = '这是一个很好的问题！作为 AI 职业顾问，我建议你从几个方面来思考：首先，明确你的职业目标；其次，评估现有技能与目标的差距；最后，制定可执行的成长计划。你也可以试试云试工功能，我会帮你量化分析匹配度。需要我帮你更具体地分析吗？';

var aiChat = {
  messages: [],
  apiEndpoint: '',
  useRealAPI: false,
  apiKey: '',
  model: 'gpt-3.5-turbo',

  _loadConfig: function() {
    try {
      var config = JSON.parse(localStorage.getItem('azure_aiConfig') || '{}');
      if (config.apiKey && config.apiEndpoint) {
        aiChat.apiKey = config.apiKey;
        aiChat.apiEndpoint = config.apiEndpoint;
        aiChat.model = config.model || 'gpt-3.5-turbo';
        aiChat.useRealAPI = true;
      }
    } catch(e) {}
  },

  _saveConfig: function() {
    localStorage.setItem('azure_aiConfig', JSON.stringify({
      apiKey: aiChat.apiKey, apiEndpoint: aiChat.apiEndpoint, model: aiChat.model
    }));
  },

  configureAPI: function(apiKey, apiEndpoint, model) {
    aiChat.apiKey = apiKey;
    aiChat.apiEndpoint = apiEndpoint || 'https://api.openai.com/v1/chat/completions';
    aiChat.model = model || 'gpt-3.5-turbo';
    aiChat.useRealAPI = !!(apiKey && aiChat.apiEndpoint);
    aiChat._saveConfig();
    return aiChat.useRealAPI;
  },

  disableRealAPI: function() {
    aiChat.apiKey = ''; aiChat.apiEndpoint = ''; aiChat.useRealAPI = false;
    localStorage.removeItem('azure_aiConfig');
  },

  getStatus: function() {
    return { useRealAPI: aiChat.useRealAPI, model: aiChat.model, hasKey: !!aiChat.apiKey };
  },

  sendMessage: function(userMessage, userId, context) {
    context = context || {};
    aiChat.messages.push({ role: 'user', content: userMessage });

    if (aiChat.messages.length > 40) aiChat.messages = aiChat.messages.slice(-40);

    var reply;
    var startTime = performance.now();

    if (aiChat.useRealAPI && aiChat.apiKey) {
      return aiChat._callRealAPI(userMessage, context).then(function(r) {
        var latency = Math.round(performance.now() - startTime);
        aiChat.messages.push({ role: 'assistant', content: r });
        return { reply: r, latency: latency, source: 'AI' };
      }).catch(function(err) {
        console.warn('AI API failed, using local fallback:', err.message);
        var r = aiChat._callLocalAI(userMessage, context);
        var latency = Math.round(performance.now() - startTime);
        aiChat.messages.push({ role: 'assistant', content: r });
        return { reply: r, latency: latency, source: 'local' };
      });
    } else {
      reply = aiChat._callLocalAI(userMessage, context);
      var latency = Math.round(performance.now() - startTime);
      aiChat.messages.push({ role: 'assistant', content: reply });
      return Promise.resolve({ reply: reply, latency: latency, source: 'local' });
    }
  },

  _callRealAPI: function(userMessage, context) {
    var messages = [{ role: 'system', content: SYSTEM_PROMPT }];

    if (context.role || context.trialData) {
      var ctxMsg = '用户身份：';
      ctxMsg += context.role === 'hr' ? 'HR/雇主' : '求职者';
      if (context.trialData) ctxMsg += '。最近评估数据：' + JSON.stringify(context.trialData);
      messages.push({ role: 'system', content: ctxMsg });
    }

    var recentMessages = aiChat.messages.slice(-10);
    messages = messages.concat(recentMessages);

    var controller = new AbortController();
    var timeout = setTimeout(function() { controller.abort(); }, 15000);

    return fetch(aiChat.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + aiChat.apiKey },
      body: JSON.stringify({ model: aiChat.model, messages: messages, max_tokens: 500, temperature: 0.7 }),
      signal: controller.signal
    }).then(function(response) {
      clearTimeout(timeout);
      if (!response.ok) {
        return response.text().then(function(t) {
          throw new Error('API error ' + response.status + ': ' + t.slice(0, 100));
        });
      }
      return response.json();
    }).then(function(data) {
      return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || DEFAULT_REPLY;
    }).catch(function(err) {
      clearTimeout(timeout);
      throw err;
    });
  },

  _callLocalAI: function(query, context) {
    var q = query.toLowerCase();
    context = context || {};

    var keys = Object.keys(FALLBACK_KB);
    for (var i = 0; i < keys.length; i++) {
      if (q.indexOf(keys[i]) !== -1) return FALLBACK_KB[keys[i]];
    }

    var role = context.role;
    if (role === 'hr') {
      if (q.indexOf('筛选') !== -1 || q.indexOf('人才') !== -1 || q.indexOf('招聘') !== -1) {
        return '作为HR，高效筛选人才的关键是明确岗位画像。建议先确定核心能力要求，然后用云试工让候选人完成评估，AI会帮你量化匹配度。这样可以节省大量筛选时间！';
      }
      if (q.indexOf('评估') !== -1 || q.indexOf('匹配') !== -1) {
        return '云试工评估可以从生存成本、成长潜质、幸福指数三个维度量化候选人与岗位的匹配度。作为HR，你可以更客观地做出招聘决策。';
      }
    } else {
      if (q.indexOf('迷茫') !== -1 || q.indexOf('不知道') !== -1 || q.indexOf('困惑') !== -1 || q.indexOf('方向') !== -1) {
        return '感到迷茫很正常！建议先做两件事：1）试试幸福指数测评，了解什么样的工作让你快乐；2）做云试工评估，发现你的可迁移技能。方向往往是在探索中逐渐清晰的。';
      }
      if (q.indexOf('焦虑') !== -1 || q.indexOf('压力') !== -1 || q.indexOf('担心') !== -1) {
        return '求职过程中的焦虑是正常的。深呼吸，记住：每一次面试都是一次练习，每一次拒绝都让你更接近合适的机会。试试幸福指数测评，也许能帮你找到内心平静的方向。';
      }
    }

    return DEFAULT_REPLY;
  },

  getChatCount: function(userId) {
    if (!userId) return Promise.resolve(aiChat.messages.filter(function(m){return m.role==='user';}).length);
    return supabase.from('chat_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('role', 'user')
      .then(function(r) { return r.count || 0; });
  },

  clearHistory: function() { aiChat.messages = []; }
};

// Load saved AI config
aiChat._loadConfig();

// ═══ DASHBOARD ═════════════════════════════════
function refreshDashboard() {
  var userId = Auth.user ? Auth.user.id : null;
  var listEl = document.getElementById('history-list');
  if (listEl) {
    listEl.innerHTML = '<div class="skeleton" style="height:80px;margin-bottom:12px;"></div><div class="skeleton" style="height:80px;margin-bottom:12px;"></div><div class="skeleton" style="height:80px;"></div>';
  }

  Promise.all([
    DataService.getTrials(userId),
    DataService.getHappiness(userId),
    DataService.getDashboardStats(userId)
  ]).then(function(results) {
    var trials = results[0];
    var happiness = results[1];
    var stats = results[2];

    return aiChat.getChatCount(userId).then(function(chatCount) {
      return { trials: trials, happiness: happiness, stats: stats, chatCount: chatCount };
    });
  }).then(function(data) {
    var elTrials = document.getElementById('dash-trials');
    if (elTrials) elTrials.textContent = data.stats.trialCount;
    var elAvg = document.getElementById('dash-avg');
    if (elAvg) elAvg.textContent = data.stats.avgScore || '--';
    var elChats = document.getElementById('dash-chats');
    if (elChats) elChats.textContent = data.chatCount;

    if (Auth.isGuest) {
      var dw = document.getElementById('dashWelcome'); if (dw) dw.textContent = '游客控制台 · 预览模式';
      var ds = document.getElementById('dashSub'); if (ds) ds.textContent = '登录后可保存记录，解锁完整控制台功能';
      var gb = document.getElementById('guestBanner'); if (gb) gb.style.display = 'block';
      var dst = document.getElementById('dash-status'); if (dst) dst.innerHTML = '🟡 游客';
      var das = document.getElementById('dash-auth-status'); if (das) das.textContent = '未认证';
    } else if (Auth.isLoggedIn) {
      var dw2 = document.getElementById('dashWelcome'); if (dw2) dw2.textContent = Auth.displayName + ' 的控制台';
      var ds2 = document.getElementById('dashSub'); if (ds2) ds2.textContent = '欢迎回来，管理你的云试工记录与个人数据';
      var gb2 = document.getElementById('guestBanner'); if (gb2) gb2.style.display = 'none';
      var dst2 = document.getElementById('dash-status'); if (dst2) dst2.innerHTML = '🟢 在线';
      var das2 = document.getElementById('dash-auth-status'); if (das2) das2.textContent = '已认证';
    }

    var allHistory = data.trials.concat(data.happiness);
    allHistory.sort(function(a, b) { return b.timestamp - a.timestamp; });

    if (!listEl) return;

    if (allHistory.length === 0) {
      listEl.innerHTML = '<p style="color:var(--text-muted);font-size:14px;padding:20px;text-align:center;">暂无评估记录，去试试「云试工」或「幸福指数」吧！</p>';
      return;
    }

    listEl.innerHTML = allHistory.slice(0, 20).map(function(r, i) {
      var isHappy = r.type === 'happiness';
      var name = isHappy ? (r.name || '探索者') : (r.lastRole || '?');
      var arrow = isHappy ? ' · 幸福测评' : (' → ' + (r.targetRole || '?'));
      var badgeStyle = isHappy ? 'rgba(167,139,250,.15)' : 'rgba(110,168,255,.15)';
      var badgeColor = isHappy ? '#a78bfa' : 'var(--accent)';
      var score = isHappy ? (r.scores ? r.scores.total : '--') : (r.matchScore || '--');
      var scoreColor = isHappy ? 'var(--accent3)' : (r.matchScore >= 70 ? '#34d399' : r.matchScore >= 40 ? '#fbbf24' : '#f87171');
      var dateStr = new Date(r.timestamp).toLocaleDateString('zh-CN', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });

      return '<div style="background:var(--glass);border:1px solid var(--glass-border);border-radius:var(--radius);padding:20px;display:flex;justify-content:space-between;align-items:center;animation:slideUp .4s ease;animation-delay:' + (i*0.05) + 's;">' +
        '<div>' +
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<strong>' + escapeHTML(name) + escapeHTML(arrow) + '</strong>' +
            '<span style="padding:2px 8px;border-radius:999px;font-size:11px;background:' + badgeStyle + ';color:' + badgeColor + ';">' + r.typeLabel + '</span>' +
          '</div>' +
          '<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">' + dateStr + '</div>' +
        '</div>' +
        '<div style="font-size:28px;font-weight:800;color:' + scoreColor + ';">' + score + '<span style="font-size:12px;color:var(--text-dim);">分</span></div>' +
      '</div>';
    }).join('');
  }).catch(function(err) {
    console.error('Dashboard load error:', err);
    if (listEl) listEl.innerHTML = '<p style="color:var(--text-muted);font-size:14px;padding:20px;text-align:center;">加载失败，请刷新页面重试</p>';
  });
}

// ═══ AI CHAT INIT ══════════════════════════════
function initChat() {
  var input = document.getElementById('chatInput');
  var sendBtn = document.getElementById('chatSendBtn');
  if (!input || !sendBtn) return;

  updateAIStatus();

  function sendMessage() {
    var text = input.value.trim();
    if (!text) return;

    input.disabled = true; sendBtn.disabled = true;
    appendMessage(text, 'user');
    input.value = '';

    var typingEl = addTypingIndicator();

    var context = { role: UI.getRole(), trialData: null };

    aiChat.sendMessage(text, Auth.user ? Auth.user.id : null, context).then(function(result) {
      typingEl.remove();
      appendMessage(result.reply, 'bot');
      updateAIStatus();
    }).catch(function() {
      typingEl.remove();
      appendMessage('抱歉，我暂时无法回复。请稍后再试。', 'bot');
    }).finally(function() {
      input.disabled = false; sendBtn.disabled = false;
      input.focus();
      scrollChatToBottom();
    });
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  initAIConfig();
}

function updateAIStatus() {
  var status = document.getElementById('aiStatus');
  if (!status) return;
  var aiStatus = aiChat.getStatus();
  if (aiStatus.useRealAPI) {
    status.innerHTML = '🟢 AI 在线 · ' + aiStatus.model;
    status.className = 'api-active';
  } else {
    status.innerHTML = '🔹 本地 AI 模式';
    status.className = '';
  }
}

function initAIConfig() {
  var configBtn = document.getElementById('aiConfigBtn');
  var closeBtn = document.getElementById('aiConfigClose');
  var saveBtn = document.getElementById('aiConfigSave');
  var disableBtn = document.getElementById('aiConfigDisable');
  var modal = document.getElementById('aiConfigModal');
  if (!configBtn || !modal) return;

  configBtn.addEventListener('click', function() {
    var status = aiChat.getStatus();
    var ep = document.getElementById('aiApiEndpoint'); if (ep) ep.value = status.useRealAPI ? aiChat.apiEndpoint : 'https://api.openai.com/v1/chat/completions';
    var key = document.getElementById('aiApiKey'); if (key) key.value = status.hasKey ? aiChat.apiKey : '';
    var model = document.getElementById('aiModel'); if (model) model.value = aiChat.model || 'gpt-3.5-turbo';
    var err = document.getElementById('aiConfigError'); if (err) err.style.display = 'none';
    modal.style.display = 'flex';
  });

  if (closeBtn) closeBtn.addEventListener('click', function() { modal.style.display = 'none'; });
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.style.display = 'none'; });

  if (saveBtn) saveBtn.addEventListener('click', function() {
    var endpoint = (document.getElementById('aiApiEndpoint') || {}).value || ''; endpoint = endpoint.trim();
    var apiKey = (document.getElementById('aiApiKey') || {}).value || ''; apiKey = apiKey.trim();
    var model = (document.getElementById('aiModel') || {}).value || ''; model = model.trim();

    if (!apiKey) { var e1 = document.getElementById('aiConfigError'); if (e1) { e1.textContent = '请输入 API Key'; e1.style.display = 'block'; } return; }
    if (!endpoint) { var e2 = document.getElementById('aiConfigError'); if (e2) { e2.textContent = '请输入 API Endpoint'; e2.style.display = 'block'; } return; }

    var success = aiChat.configureAPI(apiKey, endpoint, model || 'gpt-3.5-turbo');
    if (success) { UI.showToast('AI API 已配置！将使用 ' + (model || 'gpt-3.5-turbo') + ' 进行对话', 'success'); updateAIStatus(); }
    modal.style.display = 'none';
  });

  if (disableBtn) disableBtn.addEventListener('click', function() {
    aiChat.disableRealAPI();
    UI.showToast('已切换回本地 AI 模式', 'info');
    updateAIStatus();
    modal.style.display = 'none';
  });

  var apiKeyInput = document.getElementById('aiApiKey');
  if (apiKeyInput) apiKeyInput.addEventListener('keydown', function(e) { if (e.key === 'Enter' && saveBtn) saveBtn.click(); });
}

function appendMessage(text, sender) {
  var container = document.getElementById('chatMessages');
  if (!container) return;
  var msg = document.createElement('div');
  msg.className = 'chat-msg ' + sender;
  var avatar = sender === 'user' ? Auth.avatarChar : '🤖';
  msg.innerHTML = '<div class="msg-avatar">' + avatar + '</div><div class="msg-bubble">' + escapeHTML(text) + '</div>';
  container.appendChild(msg);
  scrollChatToBottom();
}

function addTypingIndicator() {
  var container = document.getElementById('chatMessages');
  var el = document.createElement('div');
  el.className = 'typing-indicator';
  el.innerHTML = '<div class="msg-avatar">🤖</div><div class="typing-dots"><span></span><span></span><span></span></div>';
  container.appendChild(el);
  scrollChatToBottom();
  return el;
}

function scrollChatToBottom() {
  var container = document.getElementById('chatMessages');
  if (container) setTimeout(function() { container.scrollTop = container.scrollHeight; }, 50);
}

// ═══ INIT ══════════════════════════════════════
function init() {
  // 1. Init Auth (non-blocking)
  Auth.init().then(function() {
    // continue
  }).catch(function(e) {
    console.warn('Auth init failed, continuing in offline mode:', e.message);
  }).finally(function() {
    // 2. Init Router — MUST succeed for navigation
    Router.init();

    // 3. Init UI
    UI.init();

    // 4. Init feature modules
    CloudTrial.init();
    Happiness.init();
    TalentPool.init();
    initChat();

    // 5. Route change listener
    Router.onChange(function(page) {
      if (page === 'dashboard') refreshDashboard();
      if (page === 'ai-chat') scrollChatToBottom();
      if (page === 'talent-pool') { if(TalentPool.filteredCandidates.length===0) TalentPool.filter(); else TalentPool._render(); }
    });

    // 6. Init dashboard if logged in or guest
    if (Auth.isLoggedIn || Auth.isGuest) {
      setTimeout(refreshDashboard, 100);
    }

    console.log('🚀 Azure Future — Ready (standalone mode)');
  });
}

// ═══ ERROR BOUNDARY ════════════════════════════
window.addEventListener('error', function(e) {
  console.error('Global error:', (e.error && e.error.message) || e.message);
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('Unhandled promise rejection:', (e.reason && e.reason.message) || e.reason);
  if (e.reason && e.reason.message && e.reason.message.indexOf('Failed to fetch') !== -1) {
    console.warn('Network request failed, using fallback...');
  }
});

// ═══ BOOT ═════════════════════════════════════
document.addEventListener('DOMContentLoaded', init);

})();
