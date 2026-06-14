// ═══════════════════════════════════════════════
// Azure Future — Main Application Entry
// ═══════════════════════════════════════════════
import { Router } from './router.js';
import { Auth } from './auth.js';
import { UI } from './ui.js';
import { CloudTrial } from './cloud-trial.js';
import { Happiness } from './happiness.js';
import { aiChat } from './ai-chat.js';
import { DataService } from './data-service.js';

// ═══ INIT ═══════════════════════════════════
async function init() {
  // 1. Init Auth (check session) — non-blocking, app works without it
  try {
    await Auth.init();
  } catch (e) {
    console.warn('⚠️ Auth init failed, continuing in offline mode:', e.message);
  }

  // 2. Init Router — MUST succeed for navigation to work
  Router.init();

  // 3. Init UI
  UI.init();

  // 4. Init feature modules
  CloudTrial.init();
  Happiness.init();
  initChat();

  // 5. Route change listener — init modules on demand
  Router.onChange((page) => {
    if (page === 'dashboard') refreshDashboard();
    if (page === 'ai-chat') scrollChatToBottom();
  });

  // 6. Init dashboard if logged in
  if (Auth.isLoggedIn || Auth.isGuest) {
    setTimeout(refreshDashboard, 100);
  }

  console.log('🚀 Azure Future — Product Ready');
}

// ═══ AI CHAT ═════════════════════════════════
function initChat() {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');

  if (!input || !sendBtn) return;

  // Update AI status bar
  updateAIStatus();

  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text) return;

    // Disable input
    input.disabled = true;
    sendBtn.disabled = true;

    // Add user message
    appendMessage(text, 'user');
    input.value = '';

    // Show typing
    const typingEl = addTypingIndicator();

    // Get AI reply
    try {
      const context = {
        role: UI.getRole(),
        trialData: null,
      };
      const result = await aiChat.sendMessage(text, Auth.user?.id, context);

      // Remove typing, add reply
      typingEl.remove();
      appendMessage(result.reply, 'bot');
      // Update status after first API call
      updateAIStatus();
    } catch (err) {
      typingEl.remove();
      appendMessage('抱歉，我暂时无法回复。请稍后再试。', 'bot');
    }

    // Re-enable input
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
    scrollChatToBottom();
  };

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // AI Config Modal
  initAIConfig();
}

function updateAIStatus() {
  const status = document.getElementById('aiStatus');
  if (!status) return;
  const aiStatus = aiChat.getStatus();
  if (aiStatus.useRealAPI) {
    status.innerHTML = '🟢 AI 在线 · ' + aiStatus.model;
    status.className = 'api-active';
  } else {
    status.innerHTML = '🔹 本地 AI 模式';
    status.className = '';
  }
}

function initAIConfig() {
  const configBtn = document.getElementById('aiConfigBtn');
  const closeBtn = document.getElementById('aiConfigClose');
  const saveBtn = document.getElementById('aiConfigSave');
  const disableBtn = document.getElementById('aiConfigDisable');
  const modal = document.getElementById('aiConfigModal');

  if (!configBtn || !modal) return;

  configBtn.addEventListener('click', () => {
    // Pre-fill existing config
    const status = aiChat.getStatus();
    document.getElementById('aiApiEndpoint').value = status.useRealAPI ? aiChat.apiEndpoint : 'https://api.openai.com/v1/chat/completions';
    document.getElementById('aiApiKey').value = status.hasKey ? aiChat.apiKey : '';
    document.getElementById('aiModel').value = aiChat.model || 'gpt-3.5-turbo';
    document.getElementById('aiConfigError').style.display = 'none';
    modal.style.display = 'flex';
  });

  closeBtn?.addEventListener('click', () => { modal.style.display = 'none'; });
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  saveBtn?.addEventListener('click', () => {
    const endpoint = document.getElementById('aiApiEndpoint').value.trim();
    const apiKey = document.getElementById('aiApiKey').value.trim();
    const model = document.getElementById('aiModel').value.trim();

    if (!apiKey) {
      document.getElementById('aiConfigError').textContent = '请输入 API Key';
      document.getElementById('aiConfigError').style.display = 'block';
      return;
    }
    if (!endpoint) {
      document.getElementById('aiConfigError').textContent = '请输入 API Endpoint';
      document.getElementById('aiConfigError').style.display = 'block';
      return;
    }

    const success = aiChat.configureAPI(apiKey, endpoint, model || 'gpt-3.5-turbo');
    if (success) {
      UI.showToast('AI API 已配置！将使用 ' + (model || 'gpt-3.5-turbo') + ' 进行对话', 'success');
      updateAIStatus();
    }
    modal.style.display = 'none';
  });

  disableBtn?.addEventListener('click', () => {
    aiChat.disableRealAPI();
    UI.showToast('已切换回本地 AI 模式', 'info');
    updateAIStatus();
    modal.style.display = 'none';
  });

  // Enter key in API Key field
  document.getElementById('aiApiKey')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveBtn?.click();
  });
}

function appendMessage(text, sender) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const msg = document.createElement('div');
  msg.className = 'chat-msg ' + sender;
  const avatar = sender === 'user' ? Auth.avatarChar : '🤖';
  msg.innerHTML = `<div class="msg-avatar">${avatar}</div><div class="msg-bubble">${escapeHTML(text)}</div>`;
  container.appendChild(msg);
  scrollChatToBottom();
}

function addTypingIndicator() {
  const container = document.getElementById('chatMessages');
  const el = document.createElement('div');
  el.className = 'typing-indicator';
  el.innerHTML = '<div class="msg-avatar">🤖</div><div class="typing-dots"><span></span><span></span><span></span></div>';
  container.appendChild(el);
  scrollChatToBottom();
  return el;
}

function scrollChatToBottom() {
  const container = document.getElementById('chatMessages');
  if (container) {
    setTimeout(() => { container.scrollTop = container.scrollHeight; }, 50);
  }
}

// ═══ DASHBOARD ════════════════════════════════
export async function refreshDashboard() {
  const userId = Auth.user?.id;

  // Show loading skeleton
  const listEl = document.getElementById('history-list');
  if (listEl) {
    listEl.innerHTML = '<div class="skeleton" style="height:80px;margin-bottom:12px;"></div><div class="skeleton" style="height:80px;margin-bottom:12px;"></div><div class="skeleton" style="height:80px;"></div>';
  }

  try {
    // Fetch data
    const [trials, happiness, stats] = await Promise.all([
      DataService.getTrials(userId),
      DataService.getHappiness(userId),
      DataService.getDashboardStats(userId),
    ]);

    const chatCount = Auth.isLoggedIn
      ? await aiChat.getChatCount(userId)
      : (aiChat.messages.filter(m => m.role === 'user').length || parseInt(localStorage.getItem('azure_chatCount') || '0'));

    // Update stats
    document.getElementById('dash-trials').textContent = stats.trialCount;
    document.getElementById('dash-avg').textContent = stats.avgScore || '--';
    document.getElementById('dash-chats').textContent = chatCount;

    // Update auth status
    if (Auth.isGuest) {
      document.getElementById('dashWelcome').textContent = '游客控制台 · 预览模式';
      document.getElementById('dashSub').textContent = '登录后可保存记录，解锁完整控制台功能';
      document.getElementById('guestBanner').style.display = 'block';
      document.getElementById('dash-status').innerHTML = '🟡 游客';
      document.getElementById('dash-auth-status').textContent = '未认证';
    } else if (Auth.isLoggedIn) {
      document.getElementById('dashWelcome').textContent = Auth.displayName + ' 的控制台';
      document.getElementById('dashSub').textContent = '欢迎回来，管理你的云试工记录与个人数据';
      document.getElementById('guestBanner').style.display = 'none';
      document.getElementById('dash-status').innerHTML = '🟢 在线';
      document.getElementById('dash-auth-status').textContent = '已认证';
    }

    // Render history
    const allHistory = [...trials, ...happiness];
    allHistory.sort((a, b) => b.timestamp - a.timestamp);

    if (allHistory.length === 0) {
      listEl.innerHTML = '<p style="color:var(--text-muted);font-size:14px;padding:20px;text-align:center;">暂无评估记录，去试试「云试工」或「幸福指数」吧！</p>';
      return;
    }

    listEl.innerHTML = allHistory.slice(0, 20).map((r, i) => `
      <div style="background:var(--glass);border:1px solid var(--glass-border);border-radius:var(--radius);padding:20px;display:flex;justify-content:space-between;align-items:center;animation:slideUp .4s ease;animation-delay:${i * 0.05}s;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;">
            <strong>${r.type === 'happiness' ? (r.name || '探索者') : (r.lastRole || '?')} ${r.type === 'happiness' ? '· 幸福测评' : ('→ ' + (r.targetRole || '?'))}</strong>
            <span style="padding:2px 8px;border-radius:999px;font-size:11px;background:${r.type === 'happiness' ? 'rgba(167,139,250,.15)' : 'rgba(110,168,255,.15)'};color:${r.type === 'happiness' ? '#a78bfa' : 'var(--accent)'};">${r.typeLabel}</span>
          </div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">${new Date(r.timestamp).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        ${r.type === 'happiness' ? `
          <div style="font-size:28px;font-weight:800;color:var(--accent3);">${r.scores?.total || '--'}<span style="font-size:12px;color:var(--text-dim);">分</span></div>
        ` : `
          <div style="font-size:28px;font-weight:800;color:${r.matchScore >= 70 ? '#34d399' : r.matchScore >= 40 ? '#fbbf24' : '#f87171'};">${r.matchScore || '--'}<span style="font-size:12px;color:var(--text-dim);">分</span></div>
        `}
      </div>
    `).join('');
  } catch (err) {
    console.error('Dashboard load error:', err);
    if (listEl) listEl.innerHTML = '<p style="color:var(--text-muted);font-size:14px;padding:20px;text-align:center;">加载失败，请刷新页面重试</p>';
  }
}

// ═══ HELPERS ═════════════════════════════════
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ═══ ERROR BOUNDARY ═══════════════════════════
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error?.message || e.message);
  // Prevent app from showing blank screen on non-critical errors
  const toastContainer = document.getElementById('toastContainer');
  if (toastContainer && !e.error?.message?.includes('supabase')) {
    // Don't show toast for every error to avoid spam
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason?.message || e.reason);
  // Suppress non-critical rejections from showing in console as errors
  if (e.reason?.message?.includes('Failed to fetch')) {
    console.warn('Network request failed, using fallback...');
  }
});

// ═══ BOOT ════════════════════════════════════
document.addEventListener('DOMContentLoaded', init);
