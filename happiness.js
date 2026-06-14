// ═══════════════════════════════════════════════
// Happiness Index Engine — Assessment & Report
// ═══════════════════════════════════════════════
import { DataService } from './data-service.js';
import { Auth } from './auth.js';
import { UI } from './ui.js';

// Literary works database
const LITERARY_DB = {
  adventurous: {
    mood: '探索者',
    moodEmoji: '⛵',
    items: [
      { type: 'book', title: '《海底两万里》', author: '儒勒·凡尔纳', quote: '海洋就是一切。它覆盖了地球的十分之七。它的呼吸是纯净和健康的。', source: '法国经典科幻小说' },
      { type: 'poem', title: '《未选择的路》', author: '罗伯特·弗罗斯特', quote: '一片树林里分出两条路——而我选择了人迹更少的一条，从此决定了我一生的道路。', source: '美国现代主义诗歌' },
      { type: 'movie', title: '《白日梦想家》', author: '本·斯蒂勒 导演', quote: '去感受世界，去冒险，去突破自己。生活不是坐在那里等待，而是走出去寻找。', source: '2013年美国电影' },
      { type: 'music', title: '《Viva La Vida》', author: 'Coldplay', quote: 'I used to rule the world, seas would rise when I gave the word. Now in the morning I sleep alone, sweep the streets I used to own.', source: '2008年英国摇滚' },
      { type: 'quote', title: '名言', author: '马克·吐温', quote: '二十年后，让你失望的不是你做过的事，而是你没做过的事。所以解开帆索，驶出安全的港湾，让信风鼓起你的帆。', source: '美国文学巨匠' },
    ],
  },
  peaceful: {
    mood: '守望者',
    moodEmoji: '🌿',
    items: [
      { type: 'book', title: '《瓦尔登湖》', author: '梭罗', quote: '我到林中去，因为我希望谨慎地生活，只面对生活的基本事实，看看我是否能学到它要教给我的东西。', source: '美国自然文学经典' },
      { type: 'poem', title: '《饮酒·其五》', author: '陶渊明', quote: '采菊东篱下，悠然见南山。山气日夕佳，飞鸟相与还。', source: '东晋田园诗' },
      { type: 'movie', title: '《小森林》', author: '森淳一 导演', quote: '在那些静得只听得见呼吸的日子里，你明白孤独即生活。', source: '2014年日本电影' },
      { type: 'music', title: '《风の诗》', author: '押尾光太郎', quote: '（纯音乐）—— 风穿过树叶的声音，就是最好的旋律。', source: '日本指弹吉他' },
      { type: 'quote', title: '名言', author: '老子', quote: '上善若水。水善利万物而不争，处众人之所恶，故几于道。', source: '《道德经》' },
    ],
  },
  ambitious: {
    mood: '攀登者',
    moodEmoji: '🏔️',
    items: [
      { type: 'book', title: '《人类群星闪耀时》', author: '茨威格', quote: '一个人生命中最大的幸运，莫过于在他的人生中途，即在他年富力强的时候发现了自己的使命。', source: '奥地利传记文学经典' },
      { type: 'poem', title: '《行路难》', author: '李白', quote: '长风破浪会有时，直挂云帆济沧海。', source: '唐代浪漫主义诗歌' },
      { type: 'movie', title: '《当幸福来敲门》', author: '加布里尔·穆奇诺 导演', quote: '别让别人告诉你，你成不了才。如果你有梦想，就要去捍卫它。', source: '2006年美国励志电影' },
      { type: 'music', title: '《Hall of Fame》', author: 'The Script', quote: 'You can be the greatest, you can be the best. You can be the King Kong banging on your chest.', source: '2012年爱尔兰流行摇滚' },
      { type: 'quote', title: '名言', author: '尼采', quote: '凡不能毁灭我的，必将使我更强大。', source: '德国哲学经典' },
    ],
  },
  meaningful: {
    mood: '燃灯者',
    moodEmoji: '🕯️',
    items: [
      { type: 'book', title: '《活着》', author: '余华', quote: '人是为了活着本身而活着，而不是为了活着之外的任何事物而活着。', source: '中国当代文学经典' },
      { type: 'poem', title: '《假如生活欺骗了你》', author: '普希金', quote: '假如生活欺骗了你，不要悲伤，不要心急！忧郁的日子里须要镇静：相信吧，快乐的日子将会来临！', source: '俄国浪漫主义诗歌' },
      { type: 'movie', title: '《死亡诗社》', author: '彼得·威尔 导演', quote: '我们读诗写诗，并不是因为它们好玩，而是因为我们是人类的一分子，而人类是充满激情的。', source: '1989年美国电影' },
      { type: 'music', title: '《Imagine》', author: 'John Lennon', quote: 'You may say I\'m a dreamer, but I\'m not the only one. I hope someday you\'ll join us, and the world will live as one.', source: '1971年经典歌曲' },
      { type: 'quote', title: '名言', author: '罗曼·罗兰', quote: '世界上只有一种真正的英雄主义，那就是在认清生活的真相后依然热爱生活。', source: '《米开朗基罗传》' },
    ],
  },
  growing: {
    mood: '播种者',
    moodEmoji: '🌱',
    items: [
      { type: 'book', title: '《小王子》', author: '圣埃克苏佩里', quote: '正是你为你的玫瑰花费的时间，才使你的玫瑰变得如此重要。', source: '法国经典童话' },
      { type: 'poem', title: '《春江花月夜》', author: '张若虚', quote: '江畔何人初见月？江月何年初照人？人生代代无穷已，江月年年望相似。', source: '唐代孤篇压全唐' },
      { type: 'movie', title: '《千与千寻》', author: '宫崎骏 导演', quote: '不管前方的路有多苦，只要走的方向正确，不管多么崎岖不平，都比站在原地更接近幸福。', source: '2001年日本动画电影' },
      { type: 'music', title: '《Try Everything》', author: 'Shakira', quote: 'I won\'t give up, no I won\'t give in, till I reach the end and then I\'ll start again.', source: '《疯狂动物城》主题曲' },
      { type: 'quote', title: '名言', author: '孔子', quote: '譬如为山，未成一篑，止，吾止也。譬如平地，虽覆一篑，进，吾往也。', source: '《论语·子罕》' },
    ],
  },
};

export const Happiness = {
  data: {},
  currentStep: 1,
  presentation: 'score',

  init() {
    this._renderPanels();
    this._bindEvents();
  },

  _renderPanels() {
    const container = document.getElementById('happiness-panels');
    if (!container) return;
    // If panels already rendered as static HTML (fallback), skip
    if (container.children.length > 0) return;

    const elements = ['薪资', '成长空间', '工作氛围', '通勤时间', '行业前景', '团队文化', '弹性工作', '成就感', '社会价值', '人际关系', '学习机会', '稳定性', '自主权', '创造力'];

    container.innerHTML = `
      <div class="happiness-panel active" id="hstep-1">
        <div class="trial-card" style="text-align:center;">
          <div style="font-size:64px;margin-bottom:16px;">💭</div>
          <h3 style="font-size:24px;margin-bottom:12px;">什么让你在工作中感到幸福？</h3>
          <p style="color:var(--text-dim);font-size:16px;line-height:1.8;">
            在开始测评之前，请静下心来想一想——<br>
            对你而言，<strong style="color:var(--accent);">工作幸福</strong>意味着什么？<br><br>
            是每天的期待与热情？<br>
            还是被认可的价值感？<br>
            是同事间的默契与支持？<br>
            还是工作与生活的平衡？<br><br>
            <span style="color:var(--text-muted);">接下来，让我们一步步探索你的幸福密码。</span>
          </p>
        </div>
        <button class="btn btn-primary" id="hnext-1">开始探索 →</button>
      </div>

      <div class="happiness-panel" id="hstep-2">
        <div class="trial-card">
          <h3 style="margin-bottom:12px;">工作时你会考虑到什么元素？（多选）</h3>
          <p style="color:var(--text-dim);font-size:13px;margin-bottom:16px;">点击选择你在意的工作元素</p>
          <div class="happiness-elements" id="happiness-elements">
            ${elements.map(el => `<span class="h-element" data-element="${el}" onclick="this.classList.toggle('selected')">${el}</span>`).join('')}
          </div>
        </div>
        <button class="btn btn-primary" id="hnext-2">下一步 →</button>
      </div>

      <div class="happiness-panel" id="hstep-3">
        <div class="trial-card">
          <h3 style="margin-bottom:12px;">输入你的关键词（不限字数）</h3>
          <p style="color:var(--text-dim);font-size:13px;margin-bottom:16px;">描述你理想的工作状态或感受，AI 将为你分析心境并赠送文艺作品</p>
          <textarea class="form-textarea" id="happiness-keywords" placeholder="例如：我希望工作能让我感到充实和成长，同时也有时间陪伴家人。我渴望创造性的工作…" style="min-height:150px;"></textarea>
        </div>
        <button class="btn btn-primary" id="hnext-3">AI 分析关键词 →</button>
      </div>

      <div class="happiness-panel" id="hstep-4">
        <div id="literary-gift-container"></div>
        <button class="btn btn-primary" id="hnext-4" style="margin-top:24px;">开始测评 →</button>
      </div>

      <div class="happiness-panel" id="hstep-5">
        <div class="trial-card">
          <h3 style="margin-bottom:16px;">工作幸福指数测评（1-5分）</h3>
          ${this._renderQuestions()}
        </div>
        <button class="btn btn-primary" id="hnext-5">选择呈现形式 →</button>
      </div>

      <div class="happiness-panel" id="hstep-6">
        <div class="trial-card">
          <h3 style="margin-bottom:16px;text-align:center;">选择你的幸福画像呈现形式</h3>
          <div class="presentation-options" id="pres-options">
            <div class="pres-option selected" data-pres="score">
              <span class="pres-icon">🔢</span>
              <div class="pres-name">分数画像</div>
              <div class="pres-desc">数值 + 雷达图</div>
            </div>
            <div class="pres-option" data-pres="animal">
              <span class="pres-icon">🐬</span>
              <div class="pres-name">动物画像</div>
              <div class="pres-desc">你像哪种动物？</div>
            </div>
            <div class="pres-option" data-pres="plant">
              <span class="pres-icon">🌻</span>
              <div class="pres-name">植物画像</div>
              <div class="pres-desc">你像哪种植物？</div>
            </div>
            <div class="pres-option" data-pres="food">
              <span class="pres-icon">🍲</span>
              <div class="pres-name">食物画像</div>
              <div class="pres-desc">你像哪种食物？</div>
            </div>
          </div>
        </div>
        <button class="btn btn-primary" id="hnext-6">生成幸福画像 →</button>
      </div>

      <div class="happiness-panel" id="hstep-7">
        <div id="happiness-report"></div>
        <div style="display:flex;gap:12px;margin-top:24px;">
          <button class="btn btn-outline" id="happiness-retry">🔄 重新测评</button>
          <button class="btn btn-primary" id="happiness-save">💾 保存结果</button>
        </div>
      </div>
    `;
  },

  _renderQuestions() {
    const questions = [
      ['兴趣与热忱', 'q1', '我对目前（或理想）的工作内容充满热情'],
      ['', 'q2', '我在工作中经常进入"心流"状态'],
      ['', 'q3', '我对行业动态保持持续的好奇心'],
      ['城市与生活', 'q4', '我满意当前所在城市的生活质量'],
      ['', 'q5', '通勤和工作地点不会影响我的幸福感'],
      ['', 'q6', '我在工作之外有丰富的社交和爱好'],
      ['成长与回报', 'q7', '我的工作提供了清晰的成长路径'],
      ['', 'q8', '我认为自己的付出得到了公平的回报'],
      ['', 'q9', '我对未来的职业发展充满信心'],
      ['节奏与平衡', 'q10', '我能较好地平衡工作与生活'],
      ['', 'q11', '工作压力在可承受范围内'],
      ['', 'q12', '我每天有足够的精力投入工作'],
    ];

    let html = '';
    let currentDim = '';
    questions.forEach(([dim, id, text]) => {
      if (dim) {
        html += `<h4 style="margin-top:24px;margin-bottom:12px;color:var(--accent);">📌 ${dim}</h4>`;
        currentDim = dim;
      }
      html += `
        <div class="slider-row">
          <label style="width:auto;flex:1;">${text}</label>
          <input type="range" min="1" max="5" value="3" id="h-${id}" oninput="document.getElementById('hv-${id}').textContent=this.value">
          <span class="slider-val" id="hv-${id}">3</span>
        </div>
      `;
    });
    return html;
  },

  _bindEvents() {
    for (let i = 1; i <= 5; i++) {
      document.getElementById('hnext-' + i)?.addEventListener('click', () => {
        if (i === 3) this._analyzeKeywords();
        else this.goToStep(i + 1);
      });
    }

    document.getElementById('hnext-6')?.addEventListener('click', () => this.generateReport());
    document.getElementById('happiness-retry')?.addEventListener('click', () => this.reset());
    document.getElementById('happiness-save')?.addEventListener('click', () => this._saveReport());

    // Presentation selector
    document.querySelectorAll('#pres-options .pres-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('#pres-options .pres-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        this.presentation = opt.getAttribute('data-pres');
      });
    });
  },

  goToStep(step) {
    this.currentStep = step;
    document.querySelectorAll('.happiness-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('hstep-' + step)?.classList.add('active');

    document.querySelectorAll('.hstep').forEach((s, i) => {
      s.classList.remove('active', 'done');
      if (i + 1 < step) s.classList.add('done');
      if (i + 1 === step) s.classList.add('active');
    });

    window.scrollTo({ top: document.querySelector('#page-happiness .section')?.offsetTop - 100 || 0, behavior: 'smooth' });
  },

  _analyzeKeywords() {
    const keywords = document.getElementById('happiness-keywords')?.value.trim();
    if (!keywords) {
      UI.showToast('请输入你的关键词', 'error');
      return;
    }

    // Show loading
    document.getElementById('literary-gift-container').innerHTML = `
      <div style="text-align:center;padding:40px;">
        <div class="spinner" style="margin:0 auto 16px;"></div>
        <p style="color:var(--text-dim);">AI 正在分析你的心境…</p>
      </div>
    `;
    this.goToStep(4);

    // Simulate AI analysis delay
    setTimeout(() => {
      const mood = this._detectMood(keywords);
      const result = LITERARY_DB[mood];
      this.data.keywords = keywords;
      this.data.literaryGift = { mood, result };

      const typeLabels = { book: '📚 著作', poem: '📜 诗歌', movie: '🎬 影视', music: '🎵 音乐', quote: '💬 名言' };

      document.getElementById('literary-gift-container').innerHTML = `
        <div class="trial-card" style="text-align:center;margin-bottom:16px;">
          <div style="font-size:48px;">${result.moodEmoji}</div>
          <h3 style="margin-top:8px;">你的心境：<span style="color:var(--accent);">${result.mood}</span></h3>
          <p style="color:var(--text-dim);font-size:14px;margin-top:4px;">AI 从你的关键词中感受到了探索与成长的渴望</p>
        </div>
        <h3 style="margin-bottom:16px;">🎁 AI 为你精选的文艺赠礼</h3>
        ${result.items.map(item => `
          <div class="literary-item">
            <span class="literary-type ${item.type}">${typeLabels[item.type] || item.type}</span>
            <div class="literary-title">${item.title}</div>
            <div class="literary-author">${item.author} · ${item.source}</div>
            <div class="literary-quote">"${item.quote}"</div>
          </div>
        `).join('')}
      `;
    }, 1500 + Math.random() * 1000);
  },

  _detectMood(text) {
    const t = text.toLowerCase();
    if (/冒险|探索|远方|未知|挑战|出发|新|勇敢|闯|飞|跑/i.test(t)) return 'adventurous';
    if (/平静|安|慢|淡|简单|自然|田园|宁|静|佛|禅|治愈/i.test(t)) return 'peaceful';
    if (/成功|目标|第一|赢|巅|梦想|野心|超越|登|攀|峰|顶|强/i.test(t)) return 'ambitious';
    if (/意义|价值|使命|贡献|改变|世界|帮助|爱|善良|温暖|人|光/i.test(t)) return 'meaningful';
    return 'growing';
  },

  generateReport() {
    // Collect 12 question scores
    const scores = {};
    for (let i = 1; i <= 12; i++) {
      scores['q' + i] = parseInt(document.getElementById('h-q' + i)?.value) || 3;
    }

    const interest = Math.round((scores.q1 + scores.q2 + scores.q3) / 3 * 20);
    const life = Math.round((scores.q4 + scores.q5 + scores.q6) / 3 * 20);
    const growth = Math.round((scores.q7 + scores.q8 + scores.q9) / 3 * 20);
    const balance = Math.round((scores.q10 + scores.q11 + scores.q12) / 3 * 20);
    const total = Math.round((interest + life + growth + balance) / 4);

    const elements = Array.from(document.querySelectorAll('#happiness-elements .h-element.selected')).map(el => el.getAttribute('data-element'));

    this.data = {
      ...this.data,
      elements,
      ...scores,
      scores: { interest, life, growth, balance, total },
      presentation: this.presentation,
      name: Auth.displayName || '探索者',
    };

    // Generate report based on presentation
    let reportHTML;
    switch (this.presentation) {
      case 'animal': reportHTML = this._animalReport(interest, life, growth, balance, total); break;
      case 'plant': reportHTML = this._plantReport(interest, life, growth, balance, total); break;
      case 'food': reportHTML = this._foodReport(interest, life, growth, balance, total); break;
      default: reportHTML = this._scoreReport(interest, life, growth, balance, total);
    }

    document.getElementById('happiness-report').innerHTML = reportHTML;
    this.data.reportHTML = reportHTML;
    this.goToStep(7);
  },

  _scoreReport(interest, life, growth, balance, total) {
    const dims = [
      ['兴趣与热忱', interest],
      ['城市与生活', life],
      ['成长与回报', growth],
      ['节奏与平衡', balance],
    ];
    return `
      <div class="result-card" style="text-align:center;">
        <div class="happiness-score-circle">
          <span class="score-num">${total}</span>
          <span class="score-label">幸福指数</span>
        </div>
        <div class="happiness-meta">
          ${dims.map(([label, val]) => `
            <div class="happiness-meta-item">
              <div class="meta-val">${val}</div>
              <div class="meta-label">${label}</div>
            </div>
          `).join('')}
        </div>
        ${dims.map(([label, val]) => `
          <div class="bar-group">
            <div class="bar-label"><span>${label}</span><span>${val}分</span></div>
            <div class="bar-track"><div class="bar-fill ${val >= 70 ? 'high' : val >= 45 ? 'mid' : 'low'}" style="width:${val}%"></div></div>
          </div>
        `).join('')}
        <div class="recommendation-box">
          <h4>💡 幸福建议</h4>
          <p style="font-size:14px;line-height:1.8;color:rgba(255,255,255,.8);">${this._getAdvice(total, interest, life, growth, balance)}</p>
        </div>
      </div>
    `;
  },

  _animalReport(interest, life, growth, balance, total) {
    const animals = [
      { name: '海豚', emoji: '🐬', min: 80, desc: '你像海豚一样充满智慧与活力，在工作中游刃有余，享受每一刻。你的热情感染着身边的人，团队因你而闪耀。' },
      { name: '鹰', emoji: '🦅', min: 65, desc: '你像鹰一样目光敏锐、志向高远。你看得清方向，敢于飞向更高的天空。独立而自信是你的底色。' },
      { name: '猫', emoji: '🐱', min: 50, desc: '你像猫一样优雅从容，懂得在忙碌中保持自己的节奏。你重视生活品质，工作只是你精彩人生的一部分。' },
      { name: '鹿', emoji: '🦌', min: 35, desc: '你像鹿一样温和而敏感，对周围环境有细腻的感知。你正在寻找属于自己的森林，慢一点也没关系。' },
      { name: '海龟', emoji: '🐢', min: 0, desc: '你像海龟一样坚韧而沉稳。虽然步伐不快，但每一步都踏实有力。长途跋涉需要耐心，你拥有这份力量。' },
    ];
    const animal = animals.find(a => total >= a.min) || animals[animals.length - 1];
    this.data.animal = animal.name;
    return `
      <div class="result-card" style="text-align:center;">
        <div style="font-size:80px;">${animal.emoji}</div>
        <h2 style="margin-top:8px;">你是 <span style="color:var(--accent);">${animal.name}</span> 型工作者</h2>
        <div class="happiness-score-circle" style="margin-top:24px;">
          <span class="score-num">${total}</span>
          <span class="score-label">幸福指数</span>
        </div>
        <p style="font-size:16px;line-height:2;color:rgba(255,255,255,.85);margin-top:20px;">${animal.desc}</p>
        <div class="recommendation-box">
          <h4>💡 幸福建议</h4>
          <p style="font-size:14px;line-height:1.8;color:rgba(255,255,255,.8);">${this._getAdvice(total, interest, life, growth, balance)}</p>
        </div>
      </div>
    `;
  },

  _plantReport(interest, life, growth, balance, total) {
    const plants = [
      { name: '向日葵', emoji: '🌻', min: 80, desc: '你像向日葵一样永远面向阳光。积极乐观是你的天性，无论在哪里都能给团队带来温暖和能量。' },
      { name: '竹子', emoji: '🎋', min: 65, desc: '你像竹子一样厚积薄发。表面平静，地下却在疯狂扎根。当机会来临时，你会以惊人的速度成长。' },
      { name: '薰衣草', emoji: '💜', min: 50, desc: '你像薰衣草一样散发着让人安心的气息。你追求内心的平静与美好，懂得用温柔化解压力。' },
      { name: '多肉', emoji: '🪴', min: 35, desc: '你像多肉植物一样生命力顽强。不需要太多资源也能活得很好，在逆境中反而更加坚韧。' },
      { name: '苔藓', emoji: '🌿', min: 0, desc: '你像苔藓一样安静而持久。也许不引人注目，但你在自己的角落里默默生长，终会铺满整片森林。' },
    ];
    const plant = plants.find(p => total >= p.min) || plants[plants.length - 1];
    this.data.plant = plant.name;
    return `
      <div class="result-card" style="text-align:center;">
        <div style="font-size:80px;">${plant.emoji}</div>
        <h2 style="margin-top:8px;">你是 <span style="color:#34d399;">${plant.name}</span> 型工作者</h2>
        <div class="happiness-score-circle" style="margin-top:24px;border-color:#34d399;box-shadow:0 0 40px rgba(52,211,153,.15);">
          <span class="score-num">${total}</span>
          <span class="score-label">幸福指数</span>
        </div>
        <p style="font-size:16px;line-height:2;color:rgba(255,255,255,.85);margin-top:20px;">${plant.desc}</p>
        <div class="recommendation-box">
          <h4>💡 幸福建议</h4>
          <p style="font-size:14px;line-height:1.8;color:rgba(255,255,255,.8);">${this._getAdvice(total, interest, life, growth, balance)}</p>
        </div>
      </div>
    `;
  },

  _foodReport(interest, life, growth, balance, total) {
    const foods = [
      { name: '火锅', emoji: '🍲', min: 80, desc: '你像火锅一样热气腾腾、包容万象。和你在一起的人都会被你感染，你是团队中的核心凝聚点。' },
      { name: '寿司', emoji: '🍣', min: 65, desc: '你像寿司一样精致而有内涵。每一份努力都经过精心打磨，追求品质而非数量。简约但不简单。' },
      { name: '咖啡', emoji: '☕', min: 50, desc: '你像咖啡一样先苦后甜。工作对你来说是种品味，你享受思考的深度和解决问题的成就感。' },
      { name: '面包', emoji: '🍞', min: 35, desc: '你像面包一样朴实而温暖。虽然不张扬，但你是团队中最可靠的基石。稳定输出，持续贡献。' },
      { name: '苦瓜', emoji: '🥒', min: 0, desc: '你像苦瓜一样，懂得"吃得苦中苦"的道理。虽然当下辛苦，但你在积蓄力量，甜美的收获即将到来。' },
    ];
    const food = foods.find(f => total >= f.min) || foods[foods.length - 1];
    this.data.food = food.name;
    return `
      <div class="result-card" style="text-align:center;">
        <div style="font-size:80px;">${food.emoji}</div>
        <h2 style="margin-top:8px;">你是 <span style="color:#fbbf24;">${food.name}</span> 型工作者</h2>
        <div class="happiness-score-circle" style="margin-top:24px;border-color:#fbbf24;box-shadow:0 0 40px rgba(251,191,36,.15);">
          <span class="score-num">${total}</span>
          <span class="score-label">幸福指数</span>
        </div>
        <p style="font-size:16px;line-height:2;color:rgba(255,255,255,.85);margin-top:20px;">${food.desc}</p>
        <div class="recommendation-box">
          <h4>💡 幸福建议</h4>
          <p style="font-size:14px;line-height:1.8;color:rgba(255,255,255,.8);">${this._getAdvice(total, interest, life, growth, balance)}</p>
        </div>
      </div>
    `;
  },

  _getAdvice(total, interest, life, growth, balance) {
    const parts = [];
    const dims = [
      { score: interest, label: '兴趣与热忱' },
      { score: life, label: '城市与生活' },
      { score: growth, label: '成长与回报' },
      { score: balance, label: '节奏与平衡' },
    ];
    const sortedAsc = [...dims].sort((a, b) => a.score - b.score);
    const lowest = sortedAsc[0];
    const highest = sortedAsc[sortedAsc.length - 1];

    parts.push(`你的最强维度是「${highest.label}」(${highest.score}分)，这是你的幸福支柱，请继续保持！`);
    parts.push(`值得关注的是「${lowest.label}」(${lowest.score}分)，建议在这方面多加投入。`);

    if (total >= 70) parts.push('整体幸福指数较高，你已找到工作的意义和乐趣。');
    else if (total >= 45) parts.push('幸福指数处于中等水平，在忙碌中别忘了照顾自己的内心需求。');
    else parts.push('当前幸福指数偏低，也许是时候重新审视工作与生活的关系了。');

    return parts.join(' ');
  },

  async _saveReport() {
    if (!this.data.scores) {
      UI.showToast('请先生成幸福画像', 'error');
      return;
    }
    try {
      await DataService.saveHappiness(Auth.user?.id, this.data);
      UI.showToast('幸福画像已保存！', 'success');
    } catch (err) {
      DataService._saveLocal('azure_happinessHistory', this.data);
      UI.showToast('已保存到本地（登录后可同步到云端）', 'info');
    }
  },

  reset() {
    this.data = {};
    this.presentation = 'score';
    this.goToStep(1);
    document.getElementById('happiness-keywords').value = '';
    document.querySelectorAll('#happiness-elements .h-element.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('#pres-options .pres-option').forEach(o => o.classList.remove('selected'));
    document.querySelector('#pres-options .pres-option[data-pres="score"]')?.classList.add('selected');
    for (let i = 1; i <= 12; i++) {
      const slider = document.getElementById('h-q' + i);
      if (slider) { slider.value = 3; document.getElementById('hv-q' + i).textContent = '3'; }
    }
  },
};
