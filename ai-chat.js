// ═══════════════════════════════════════════════
// AI Chat Module — Real API + Smart Fallback
// ═══════════════════════════════════════════════
import { supabase } from './supabase.js';

// System prompt for career advisor
const SYSTEM_PROMPT = `你是 Azure Future 的 AI 职业顾问。你的职责是帮助用户解决职业发展问题。
你需要：
1. 用专业但友好的语气回复
2. 结合用户的背景给出个性化建议
3. 在合适的时候引导用户使用云试工和幸福指数功能
4. 回答关于求职、转行、简历、面试、职业规划等问题
5. 回复简洁有力，控制在200字以内
请用中文回复。`;

// Rich local knowledge base
const FALLBACK_KB = {
  '面试': '关于面试准备，我建议先从云试工评估开始，了解自己的优劣势。然后针对性补强短板。模拟面试也很重要，可以找朋友或对着镜子练习常见问题。记得准备STAR法则回答行为面试题！',
  '求职': '求职的核心是匹配度。试试云试工功能，我们会帮你量化分析你与目标岗位的匹配度。同时建议优化简历，突出「成果」而非「职责」，用数据说话更有说服力。',
  '转行': '转行并不可怕！关键在于挖掘你的可迁移技能。试试云试工功能，我们会帮你量化分析你在新行业中的匹配度与成长空间。建议先从小项目或副业开始积累新领域经验。',
  '简历': '好简历的核心是突出「成果」而非「职责」。云试工报告中的技能维度和匹配分析可以作为你简历优化的数据支撑。建议用STAR法则（情境-任务-行动-结果）来组织经历描述。',
  '薪资': '薪资受行业、城市、经验等多因素影响。建议在完成云试工评估后，结合你的匹配分和行业基准来做薪资预期。同时关注隐形福利（培训、股票、弹性工作等）。',
  '你好': '你好呀！👋 我是 Azure AI 职业顾问。有什么求职或职业发展的问题，尽管问我！你可以试试云试工评估自己的岗位匹配度，或者做幸福指数测评了解什么工作最适合你。',
  '谢谢': '不客气！能帮到你我很开心。随时来找我聊天，祝你求职顺利！✨',
  '帮助': '我可以帮你：\n1. 🔍 分析岗位匹配度（云试工）\n2. 💡 解答职业规划问题\n3. 😊 幸福指数测评\n4. 📝 求职建议与简历优化\n\n直接问我吧！或者去「云试工」页面体验完整评估流程。',
  '职业规划': '职业规划建议从三个维度来思考：1）你擅长什么（能力）；2）你喜欢什么（兴趣）；3）市场需要什么（需求）。三者的交集就是你的甜蜜点。试试云试工和幸福指数，帮你更清晰地认识自己！',
  '技能': '在AI时代，建议关注三类技能：1）硬技能（编程、数据分析等）；2）软技能（沟通、领导力）；3）元技能（学习能力、批判性思维）。云试工评估可以帮助你发现技能缺口！',
  'AI': 'AI行业正在快速发展，机会很多！无论你的背景是什么，都可以找到切入点。建议关注：1）AI产品经理（需要懂业务+AI）；2）提示工程师（新兴岗位）；3）AI应用开发。试试云试工评估你的AI行业匹配度吧！',
};

const DEFAULT_REPLY = '这是一个很好的问题！作为 AI 职业顾问，我建议你从几个方面来思考：首先，明确你的职业目标；其次，评估现有技能与目标的差距；最后，制定可执行的成长计划。你也可以试试云试工功能，我会帮你量化分析匹配度。需要我帮你更具体地分析吗？';

// Greeting pattern for first-time chat
const GREETING_PATTERNS = ['你好', 'hi', 'hello', '嗨', '在吗', '在么', 'hey'];

export class AIChat {
  constructor() {
    this.messages = [];
    this.apiEndpoint = '';
    this.useRealAPI = false;
    this.apiKey = '';
    this.model = 'gpt-3.5-turbo';
    this._loadConfig();
  }

  // Load saved API config
  _loadConfig() {
    try {
      const config = JSON.parse(localStorage.getItem('azure_aiConfig') || '{}');
      if (config.apiKey && config.apiEndpoint) {
        this.apiKey = config.apiKey;
        this.apiEndpoint = config.apiEndpoint;
        this.model = config.model || 'gpt-3.5-turbo';
        this.useRealAPI = true;
      }
    } catch { /* ignore */ }
  }

  // Save API config
  _saveConfig() {
    localStorage.setItem('azure_aiConfig', JSON.stringify({
      apiKey: this.apiKey,
      apiEndpoint: this.apiEndpoint,
      model: this.model,
    }));
  }

  // Configure real API
  configureAPI(apiKey, apiEndpoint, model = 'gpt-3.5-turbo') {
    this.apiKey = apiKey;
    this.apiEndpoint = apiEndpoint || 'https://api.openai.com/v1/chat/completions';
    this.model = model;
    this.useRealAPI = !!(apiKey && this.apiEndpoint);
    this._saveConfig();
    return this.useRealAPI;
  }

  // Disable real API (fallback to local)
  disableRealAPI() {
    this.apiKey = '';
    this.apiEndpoint = '';
    this.useRealAPI = false;
    localStorage.removeItem('azure_aiConfig');
  }

  // Get current API status
  getStatus() {
    return {
      useRealAPI: this.useRealAPI,
      model: this.model,
      hasKey: !!this.apiKey,
    };
  }

  // Get chat history from DB
  async loadHistory(userId) {
    if (!userId) return [];
    const { data } = await supabase
      .from('chat_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(50);
    return data || [];
  }

  // Save message to DB
  async saveMessage(userId, role, content) {
    if (!userId) return;
    await supabase.from('chat_logs').insert({
      user_id: userId,
      role,
      content,
    });
  }

  // Send message and get reply
  async sendMessage(userMessage, userId = null, context = {}) {
    // Save user message
    this.messages.push({ role: 'user', content: userMessage });
    if (userId) await this.saveMessage(userId, 'user', userMessage);

    // Trim message history to last 20 messages to prevent memory bloat
    if (this.messages.length > 40) {
      this.messages = this.messages.slice(-40);
    }

    let reply;
    const startTime = performance.now();

    if (this.useRealAPI && this.apiKey) {
      try {
        reply = await this._callRealAPI(userMessage, context);
      } catch (err) {
        console.warn('AI API failed, using local fallback:', err.message);
        reply = this._callLocalAI(userMessage, context);
      }
    } else {
      reply = this._callLocalAI(userMessage, context);
    }

    const latency = Math.round(performance.now() - startTime);

    // Save assistant message
    this.messages.push({ role: 'assistant', content: reply });
    if (userId) await this.saveMessage(userId, 'assistant', reply);

    return { reply, latency, source: this.useRealAPI ? 'AI' : 'local' };
  }

  // Real API call (OpenAI-compatible)
  async _callRealAPI(userMessage, context) {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add user context if available
    if (context.role || context.trialData) {
      let ctxMsg = '用户身份：';
      ctxMsg += context.role === 'hr' ? 'HR/雇主' : '求职者';
      if (context.trialData) {
        ctxMsg += '。最近评估数据：' + JSON.stringify(context.trialData);
      }
      messages.push({ role: 'system', content: ctxMsg });
    }

    // Add recent conversation history (last 10 messages)
    const recentMessages = this.messages.slice(-10);
    messages.push(...recentMessages);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`API error ${response.status}: ${errText.slice(0, 100)}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || DEFAULT_REPLY;
    } finally {
      clearTimeout(timeout);
    }
  }

  // Local AI fallback (smart keyword matching with context)
  _callLocalAI(query, context = {}) {
    const q = query.toLowerCase();

    // Check knowledge base for keyword matches
    for (const [key, reply] of Object.entries(FALLBACK_KB)) {
      if (q.includes(key)) {
        return reply;
      }
    }

    // Context-aware reply
    const role = context.role;
    if (role === 'hr') {
      if (q.includes('筛选') || q.includes('人才') || q.includes('招聘')) {
        return '作为HR，高效筛选人才的关键是明确岗位画像。建议先确定核心能力要求，然后用云试工让候选人完成评估，AI会帮你量化匹配度。这样可以节省大量筛选时间！';
      }
      if (q.includes('评估') || q.includes('匹配')) {
        return '云试工评估可以从生存成本、成长潜质、幸福指数三个维度量化候选人与岗位的匹配度。作为HR，你可以更客观地做出招聘决策。';
      }
    } else {
      if (q.includes('迷茫') || q.includes('不知道') || q.includes('困惑') || q.includes('方向')) {
        return '感到迷茫很正常！建议先做两件事：1）试试幸福指数测评，了解什么样的工作让你快乐；2）做云试工评估，发现你的可迁移技能。方向往往是在探索中逐渐清晰的。';
      }
      if (q.includes('焦虑') || q.includes('压力') || q.includes('担心')) {
        return '求职过程中的焦虑是正常的。深呼吸，记住：每一次面试都是一次练习，每一次拒绝都让你更接近合适的机会。试试幸福指数测评，也许能帮你找到内心平静的方向。';
      }
    }

    return DEFAULT_REPLY;
  }

  // Get chat count
  async getChatCount(userId) {
    if (!userId) return 0;
    const { count } = await supabase
      .from('chat_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('role', 'user');
    return count || 0;
  }

  // Clear history
  clearHistory() {
    this.messages = [];
  }
}

export const aiChat = new AIChat();
