// ═══════════════════════════════════════════════
// Cloud Trial Engine — Assessment & Report
// ═══════════════════════════════════════════════
import { DataService } from './data-service.js';
import { Auth } from './auth.js';
import { UI } from './ui.js';

export const CloudTrial = {
  trialData: {},
  currentStep: 1,

  init() {
    this._renderPanels();
    this._bindEvents();
  },

  _renderPanels() {
    const container = document.getElementById('trial-panels');
    if (!container) return;
    container.innerHTML = `
      <div class="trial-panel active" id="trial-step-1">
        <div class="trial-card">
          <h3 style="margin-bottom:16px;">📋 基本信息</h3>
          <div class="form-row">
            <div class="form-group" style="flex:1;"><label>你的名字</label><input class="form-input" id="trial-name" placeholder="如何称呼你？"></div>
            <div class="form-group" style="flex:1;"><label>所在城市</label><input class="form-input" id="trial-location" placeholder="如：北京"></div>
          </div>
          <div class="form-row">
            <div class="form-group" style="flex:1;"><label>出生地</label><input class="form-input" id="trial-birthplace" placeholder="如：成都"></div>
            <div class="form-group" style="flex:1;"><label>梦想城市</label><input class="form-input" id="trial-dreamcity" placeholder="你想去哪里？"></div>
          </div>
          <div class="form-row">
            <div class="form-group" style="flex:1;"><label>工作经验</label><select class="form-select" id="trial-exp"><option value="0-1">0-1年</option><option value="1-3">1-3年</option><option value="3-5">3-5年</option><option value="5-10">5-10年</option><option value="10+">10年以上</option></select></div>
            <div class="form-group" style="flex:1;"><label>工作模式偏好</label><select class="form-select" id="trial-mode"><option value="remote">远程</option><option value="hybrid">混合</option><option value="onsite">线下</option><option value="any">不限</option></select></div>
          </div>
          <div class="form-row">
            <div class="form-group" style="flex:1;"><label>兴趣爱好</label><input class="form-input" id="trial-hobbies" placeholder="如：摄影、编程、旅行"></div>
            <div class="form-group" style="flex:1;"><label>MBTI（选填）</label><select class="form-select" id="trial-mbti"><option value="">不限</option><option>INTJ</option><option>INTP</option><option>ENTJ</option><option>ENTP</option><option>INFJ</option><option>INFP</option><option>ENFJ</option><option>ENFP</option><option>ISTJ</option><option>ISFJ</option><option>ESTJ</option><option>ESFJ</option><option>ISTP</option><option>ISFP</option><option>ESTP</option><option>ESFP</option></select></div>
          </div>
        </div>
        <button class="btn btn-primary" id="trial-next-1">下一步 →</button>
      </div>

      <div class="trial-panel" id="trial-step-2">
        <div class="trial-card">
          <h3 style="margin-bottom:16px;">💼 过往经历</h3>
          <div class="form-group"><label>所在行业</label><input class="form-input" id="trial-industry" placeholder="如：互联网、金融、教育"></div>
          <div class="form-group"><label>最近职位</label><input class="form-input" id="trial-last-role" placeholder="如：产品经理"></div>
          <div class="form-group">
            <label>已有技能（点击选择或输入自定义）</label>
            <div class="skill-tags" id="trial-skills-tags">
              <span class="skill-tag" onclick="this.classList.toggle('selected')">Python</span>
              <span class="skill-tag" onclick="this.classList.toggle('selected')">数据分析</span>
              <span class="skill-tag" onclick="this.classList.toggle('selected')">项目管理</span>
              <span class="skill-tag" onclick="this.classList.toggle('selected')">沟通协调</span>
              <span class="skill-tag" onclick="this.classList.toggle('selected')">UI设计</span>
              <span class="skill-tag" onclick="this.classList.toggle('selected')">Java</span>
              <span class="skill-tag" onclick="this.classList.toggle('selected')">SQL</span>
              <span class="skill-tag" onclick="this.classList.toggle('selected')">英语</span>
              <span class="skill-tag" onclick="this.classList.toggle('selected')">团队管理</span>
              <span class="skill-tag" onclick="this.classList.toggle('selected')">市场营销</span>
            </div>
            <div style="display:flex;gap:8px;margin-top:8px;">
              <input class="form-input" id="trial-custom-skill" placeholder="添加自定义技能">
              <button class="btn btn-outline btn-sm" id="trial-add-skill">添加</button>
            </div>
          </div>
          <div class="form-group"><label>自我描述（选填）</label><textarea class="form-textarea" id="trial-desc" placeholder="简单描述你的职业经历和特点…"></textarea></div>
        </div>
        <button class="btn btn-primary" id="trial-next-2">下一步 →</button>
      </div>

      <div class="trial-panel" id="trial-step-3">
        <div class="trial-card">
          <h3 style="margin-bottom:16px;">🎯 目标岗位</h3>
          <div class="form-group"><label>目标行业</label><input class="form-input" id="trial-target-industry" placeholder="如：AI、云计算"></div>
          <div class="form-group"><label>目标职位</label><input class="form-input" id="trial-target-role" placeholder="如：AI产品经理"></div>
          <div class="form-group">
            <label>目标技能（点击选择或输入自定义）</label>
            <div class="skill-tags" id="trial-target-skills-tags">
              <span class="skill-tag" onclick="this.classList.toggle('selected')">机器学习</span>
              <span class="skill-tag" onclick="this.classList.toggle('selected')">深度学习</span>
              <span class="skill-tag" onclick="this.classList.toggle('selected')">NLP</span>
              <span class="skill-tag" onclick="this.classList.toggle('selected')">云计算</span>
              <span class="skill-tag" onclick="this.classList.toggle('selected')">产品设计</span>
              <span class="skill-tag" onclick="this.classList.toggle('selected')">敏捷开发</span>
              <span class="skill-tag" onclick="this.classList.toggle('selected')">数据分析</span>
              <span class="skill-tag" onclick="this.classList.toggle('selected')">战略规划</span>
              <span class="skill-tag" onclick="this.classList.toggle('selected')">用户研究</span>
              <span class="skill-tag" onclick="this.classList.toggle('selected')">商业分析</span>
            </div>
            <div style="display:flex;gap:8px;margin-top:8px;">
              <input class="form-input" id="trial-target-custom-skill" placeholder="添加自定义技能">
              <button class="btn btn-outline btn-sm" id="trial-add-target-skill">添加</button>
            </div>
          </div>
        </div>
        <button class="btn btn-primary" id="trial-next-3">下一步 →</button>
      </div>

      <div class="trial-panel" id="trial-step-4">
        <div class="trial-card">
          <h3 style="margin-bottom:16px;">📊 能力自评（1-10分）</h3>
          <div class="slider-row"><label>学习能力</label><input type="range" min="1" max="10" value="5" id="trial-self-learn" oninput="document.getElementById('trial-self-learn-val').textContent=this.value"><span class="slider-val" id="trial-self-learn-val">5</span></div>
          <div class="slider-row"><label>逻辑思维</label><input type="range" min="1" max="10" value="5" id="trial-self-logic" oninput="document.getElementById('trial-self-logic-val').textContent=this.value"><span class="slider-val" id="trial-self-logic-val">5</span></div>
          <div class="slider-row"><label>沟通表达</label><input type="range" min="1" max="10" value="5" id="trial-self-comm" oninput="document.getElementById('trial-self-comm-val').textContent=this.value"><span class="slider-val" id="trial-self-comm-val">5</span></div>
          <div class="slider-row"><label>自驱力</label><input type="range" min="1" max="10" value="5" id="trial-self-drive" oninput="document.getElementById('trial-self-drive-val').textContent=this.value"><span class="slider-val" id="trial-self-drive-val">5</span></div>
          <div class="slider-row"><label>抗压能力</label><input type="range" min="1" max="10" value="5" id="trial-self-stress" oninput="document.getElementById('trial-self-stress-val').textContent=this.value"><span class="slider-val" id="trial-self-stress-val">5</span></div>
        </div>
        <button class="btn btn-primary" id="trial-generate">🚀 生成评估报告</button>
      </div>

      <div class="trial-panel" id="trial-step-5">
        <div id="trial-report"></div>
        <div style="display:flex;gap:12px;margin-top:24px;">
          <button class="btn btn-outline" id="trial-retry">🔄 重新评估</button>
          <button class="btn btn-primary" id="trial-save">💾 保存到控制台</button>
        </div>
      </div>
    `;
  },

  _bindEvents() {
    // Step navigation
    document.getElementById('trial-next-1')?.addEventListener('click', () => this.goToStep(2));
    document.getElementById('trial-next-2')?.addEventListener('click', () => this.goToStep(3));
    document.getElementById('trial-next-3')?.addEventListener('click', () => this.goToStep(4));
    document.getElementById('trial-generate')?.addEventListener('click', () => this.generateReport());
    document.getElementById('trial-retry')?.addEventListener('click', () => this.reset());
    document.getElementById('trial-save')?.addEventListener('click', () => this.saveReport());

    // Add custom skill
    document.getElementById('trial-add-skill')?.addEventListener('click', () => this._addCustomSkill('trial-custom-skill', 'trial-skills-tags'));
    document.getElementById('trial-add-target-skill')?.addEventListener('click', () => this._addCustomSkill('trial-target-custom-skill', 'trial-target-skills-tags'));

    // Enter key for custom skills
    ['trial-custom-skill', 'trial-target-custom-skill'].forEach(id => {
      document.getElementById(id)?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const targetId = id === 'trial-custom-skill' ? 'trial-skills-tags' : 'trial-target-skills-tags';
          this._addCustomSkill(id, targetId);
        }
      });
    });
  },

  goToStep(step) {
    this.currentStep = step;
    document.querySelectorAll('.trial-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('trial-step-' + step)?.classList.add('active');

    document.querySelectorAll('.trial-step').forEach((s, i) => {
      s.classList.remove('active', 'done');
      if (i + 1 < step) s.classList.add('done');
      if (i + 1 === step) s.classList.add('active');
    });

    const container = document.querySelector('.trial-container');
    if (container) window.scrollTo({ top: container.offsetTop - 100, behavior: 'smooth' });
  },

  _addCustomSkill(inputId, containerId) {
    const input = document.getElementById(inputId);
    const val = input.value.trim();
    if (!val) return;
    const container = document.getElementById(containerId);
    const tag = document.createElement('span');
    tag.className = 'skill-tag selected';
    tag.textContent = val;
    tag.onclick = function () { this.classList.toggle('selected'); };
    container.appendChild(tag);
    input.value = '';
  },

  _getSelectedSkills(containerId) {
    return Array.from(document.querySelectorAll('#' + containerId + ' .skill-tag.selected')).map(t => t.textContent);
  },

  _getData() {
    return {
      name: document.getElementById('trial-name')?.value.trim() || '未填写',
      exp: document.getElementById('trial-exp')?.value || '0-1',
      location: document.getElementById('trial-location')?.value.trim() || '',
      mode: document.getElementById('trial-mode')?.value || 'any',
      birthplace: document.getElementById('trial-birthplace')?.value.trim() || '',
      dreamCity: document.getElementById('trial-dreamcity')?.value.trim() || '',
      hobbies: document.getElementById('trial-hobbies')?.value.trim() || '',
      mbti: document.getElementById('trial-mbti')?.value || '',
      industry: document.getElementById('trial-industry')?.value.trim() || '',
      lastRole: document.getElementById('trial-last-role')?.value.trim() || '',
      skills: this._getSelectedSkills('trial-skills-tags'),
      desc: document.getElementById('trial-desc')?.value.trim() || '',
      targetIndustry: document.getElementById('trial-target-industry')?.value.trim() || '',
      targetRole: document.getElementById('trial-target-role')?.value.trim() || '',
      targetSkills: this._getSelectedSkills('trial-target-skills-tags'),
      selfLearn: parseInt(document.getElementById('trial-self-learn')?.value) || 5,
      selfLogic: parseInt(document.getElementById('trial-self-logic')?.value) || 5,
      selfComm: parseInt(document.getElementById('trial-self-comm')?.value) || 5,
      selfDrive: parseInt(document.getElementById('trial-self-drive')?.value) || 5,
      selfStress: parseInt(document.getElementById('trial-self-stress')?.value) || 5,
    };
  },

  generateReport() {
    const data = this._getData();
    const role = UI.getRole();
    const isHR = role === 'hr';

    // Cost analysis (35%)
    const industryPairs = [
      ['互联网', '科技', 'IT', '软件', 'SaaS', 'AI', '云计算', '数据'],
      ['金融', '银行', '保险', '证券', '投资', '风控'],
      ['教育', '培训', '在线教育', '知识付费'],
      ['制造业', '工业', '供应链', '物流', '硬件'],
      ['医疗', '健康', '医药', '生物', '器械'],
      ['零售', '电商', '消费', '跨境电商', '新零售'],
      ['媒体', '广告', '营销', '公关', '内容'],
    ];

    let industryMatch = false;
    const srcIndustry = data.industry;
    const tgtIndustry = data.targetIndustry;
    for (const group of industryPairs) {
      const srcInGroup = group.some(k => srcIndustry.includes(k));
      const tgtInGroup = group.some(k => tgtIndustry.includes(k));
      if (srcInGroup && tgtInGroup) { industryMatch = true; break; }
    }

    let costScore = industryMatch ? 70 : 40;
    costScore += Math.min(data.skills.filter(s => data.targetSkills.includes(s)).length * 5, 25);
    if (data.exp === '10+' || data.exp === '5-10') costScore += 5;
    costScore = Math.min(100, Math.max(10, costScore));

    // Potential analysis (40%)
    const selfScores = [data.selfLearn, data.selfLogic, data.selfComm, data.selfDrive, data.selfStress];
    const selfAvg = selfScores.reduce((a, b) => a + b, 0) / selfScores.length;
    let potentialScore = Math.round(selfAvg * 10);
    const skillOverlap = data.skills.filter(s => data.targetSkills.includes(s)).length;
    potentialScore += skillOverlap * 3;
    if (data.hobbies && data.hobbies.length > 0) potentialScore += 5;
    potentialScore = Math.min(100, Math.max(10, potentialScore));

    // Happiness integration (25%)
    let happinessScore = 50;
    try {
      const hh = JSON.parse(localStorage.getItem('azure_happinessHistory') || '[]');
      if (hh.length > 0) {
        happinessScore = hh[0].scores?.total || hh[0].happinessScore || 50;
      }
    } catch { /* ignore */ }

    // Final score
    const matchScore = Math.round(costScore * 0.35 + potentialScore * 0.40 + happinessScore * 0.25);

    this.trialData = {
      ...data,
      costScore,
      potentialScore,
      happinessScore,
      matchScore,
      timestamp: Date.now(),
    };

    // Render report
    const scoreClass = matchScore >= 70 ? 'score-high' : matchScore >= 40 ? 'score-mid' : 'score-low';
    const level = matchScore >= 70 ? '高度匹配' : matchScore >= 40 ? '中等匹配' : '需要提升';
    const levelEmoji = matchScore >= 70 ? '🌟' : matchScore >= 40 ? '📈' : '💪';

    const reportHTML = `
      <div class="result-card">
        <div class="result-header">
          <div class="result-score ${scoreClass}">
            <span style="font-size:14px;font-weight:400;">匹配度</span>
            <span>${matchScore}</span>
          </div>
          <h3>${levelEmoji} ${level}</h3>
          <p style="color:var(--text-dim);margin-top:8px;">${data.name} → ${data.targetRole || '目标岗位'}</p>
        </div>

        <div class="bar-group">
          <div class="bar-label"><span>${isHR ? '用人成本' : '生存成本'}</span><span>${costScore}分</span></div>
          <div class="bar-track"><div class="bar-fill ${costScore >= 60 ? 'high' : costScore >= 35 ? 'mid' : 'low'}" style="width:${costScore}%"></div></div>
        </div>
        <div class="bar-group">
          <div class="bar-label"><span>成长潜质</span><span>${potentialScore}分</span></div>
          <div class="bar-track"><div class="bar-fill ${potentialScore >= 60 ? 'high' : potentialScore >= 35 ? 'mid' : 'low'}" style="width:${potentialScore}%"></div></div>
        </div>
        <div class="bar-group">
          <div class="bar-label"><span>幸福指数</span><span>${happinessScore}分</span></div>
          <div class="bar-track"><div class="bar-fill ${happinessScore >= 60 ? 'high' : happinessScore >= 35 ? 'mid' : 'low'}" style="width:${happinessScore}%"></div></div>
        </div>

        <div class="recommendation-box">
          <h4>💡 AI 建议</h4>
          <p style="font-size:14px;line-height:1.8;color:rgba(255,255,255,.8);">
            ${this._getRecommendation(matchScore, costScore, potentialScore, data, isHR)}
          </p>
        </div>
      </div>
    `;

    document.getElementById('trial-report').innerHTML = reportHTML;
    this.trialData.reportHTML = reportHTML;

    // Animate bars (proper reflow)
    requestAnimationFrame(() => {
      document.querySelectorAll('.bar-fill').forEach(bar => {
        const targetWidth = bar.style.width;
        bar.style.width = '0%';
        // Force reflow
        void bar.offsetWidth;
        bar.style.transition = 'width 0.8s cubic-bezier(.25,.46,.45,.94)';
        bar.style.width = targetWidth;
      });
    });

    this.goToStep(5);
  },

  _getRecommendation(matchScore, costScore, potentialScore, data, isHR) {
    const parts = [];
    if (matchScore >= 70) {
      parts.push('你的综合匹配度较高，说明你具备较强的可迁移能力和行业适配性。');
      parts.push('建议在面试中突出你的跨行业经验和快速学习能力。');
    } else if (matchScore >= 40) {
      parts.push('你具备一定的基础匹配度，但仍有提升空间。');
      parts.push(`建议重点补强${data.targetSkills.slice(0, 3).join('、')}等目标技能。`);
    } else {
      parts.push('当前匹配度偏低，但这不代表你不适合——只是需要更多准备。');
      parts.push('建议从基础技能入手，通过项目实践积累经验，逐步靠近目标。');
    }
    if (potentialScore >= 70) {
      parts.push('你的成长潜质突出，学习能力和自驱力是你的核心竞争力。');
    }
    return parts.join(' ');
  },

  async saveReport() {
    if (!this.trialData.matchScore) {
      UI.showToast('请先生成评估报告', 'error');
      return;
    }
    try {
      await DataService.saveTrial(Auth.user?.id, this.trialData);
      UI.showToast('报告已保存到控制台！', 'success');
    } catch (err) {
      // Fallback to localStorage
      DataService._saveLocal('azure_trialHistory', this.trialData);
      UI.showToast('已保存到本地（登录后可同步到云端）', 'info');
    }
  },

  reset() {
    this.trialData = {};
    this.goToStep(1);
    // Reset form fields
    ['trial-name', 'trial-location', 'trial-birthplace', 'trial-dreamcity', 'trial-hobbies',
      'trial-industry', 'trial-last-role', 'trial-desc', 'trial-target-industry', 'trial-target-role'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.querySelectorAll('#trial-skills-tags .skill-tag, #trial-target-skills-tags .skill-tag').forEach(t => t.classList.remove('selected'));
    document.querySelectorAll('#trial-skills-tags .skill-tag, #trial-target-skills-tags .skill-tag').forEach(t => {
      if (!['Python', '数据分析', '项目管理', '沟通协调', 'UI设计', 'Java', 'SQL', '英语', '团队管理', '市场营销',
        '机器学习', '深度学习', 'NLP', '云计算', '产品设计', '敏捷开发', '战略规划', '用户研究', '商业分析'].includes(t.textContent)) {
        t.remove();
      }
    });
  },
};
