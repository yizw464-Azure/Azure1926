// ═══════════════════════════════════════════════
// Data Service — Supabase CRUD Operations
// ═══════════════════════════════════════════════
import { supabase } from './supabase.js';

const MAX_RECORDS = 50;

export const DataService = {
  // ─── Cloud Trial ─────────────────────────
  async saveTrial(userId, trialData) {
    if (!userId) {
      // Guest mode: save to localStorage
      return this._saveLocal('azure_trialHistory', trialData);
    }
    const { data, error } = await supabase
      .from('trials')
      .insert({
        user_id: userId,
        name: trialData.name,
        exp: trialData.exp,
        location: trialData.location,
        mode: trialData.mode,
        birthplace: trialData.birthplace,
        dream_city: trialData.dreamCity,
        hobbies: trialData.hobbies,
        mbti: trialData.mbti,
        industry: trialData.industry,
        last_role: trialData.lastRole,
        skills: trialData.skills,
        description: trialData.desc,
        target_industry: trialData.targetIndustry,
        target_role: trialData.targetRole,
        target_skills: trialData.targetSkills,
        self_learn: trialData.selfLearn,
        self_logic: trialData.selfLogic,
        self_comm: trialData.selfComm,
        self_drive: trialData.selfDrive,
        self_stress: trialData.selfStress,
        match_score: trialData.matchScore,
        cost_score: trialData.costScore,
        potential_score: trialData.potentialScore,
        happiness_score: trialData.happinessScore,
        report_html: trialData.reportHTML,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getTrials(userId) {
    if (!userId) return this._getLocal('azure_trialHistory') || [];
    const { data } = await supabase
      .from('trials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(MAX_RECORDS);
    return (data || []).map(r => ({
      id: r.id,
      name: r.name,
      exp: r.exp,
      location: r.location,
      mode: r.mode,
      birthplace: r.birthplace,
      dreamCity: r.dream_city,
      hobbies: r.hobbies,
      mbti: r.mbti,
      industry: r.industry,
      lastRole: r.last_role,
      skills: r.skills,
      desc: r.description,
      targetIndustry: r.target_industry,
      targetRole: r.target_role,
      targetSkills: r.target_skills,
      selfLearn: r.self_learn,
      selfLogic: r.self_logic,
      selfComm: r.self_comm,
      selfDrive: r.self_drive,
      selfStress: r.self_stress,
      matchScore: r.match_score,
      costScore: r.cost_score,
      potentialScore: r.potential_score,
      happinessScore: r.happiness_score,
      reportHTML: r.report_html,
      timestamp: new Date(r.created_at).getTime(),
      type: 'cloud-trial',
      typeLabel: '云试工',
    }));
  },

  // ─── Happiness ───────────────────────────
  async saveHappiness(userId, data) {
    if (!userId) return this._saveLocal('azure_happinessHistory', data);
    const { data: result, error } = await supabase
      .from('happiness_assessments')
      .insert({
        user_id: userId,
        name: data.name,
        elements: data.elements,
        keywords: data.keywords,
        literary_gift: data.literaryGift,
        q1: data.q1, q2: data.q2, q3: data.q3, q4: data.q4,
        q5: data.q5, q6: data.q6, q7: data.q7, q8: data.q8,
        q9: data.q9, q10: data.q10, q11: data.q11, q12: data.q12,
        score_interest: data.scores?.interest,
        score_life: data.scores?.life,
        score_growth: data.scores?.growth,
        score_balance: data.scores?.balance,
        score_total: data.scores?.total,
        presentation: data.presentation,
        animal: data.animal,
        plant: data.plant,
        food: data.food,
        report_html: data.reportHTML,
      })
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async getHappiness(userId) {
    if (!userId) return this._getLocal('azure_happinessHistory') || [];
    const { data } = await supabase
      .from('happiness_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(MAX_RECORDS);
    return (data || []).map(r => ({
      id: r.id,
      name: r.name,
      elements: r.elements,
      keywords: r.keywords,
      literaryGift: r.literary_gift,
      q1: r.q1, q2: r.q2, q3: r.q3, q4: r.q4,
      q5: r.q5, q6: r.q6, q7: r.q7, q8: r.q8,
      q9: r.q9, q10: r.q10, q11: r.q11, q12: r.q12,
      scores: {
        interest: r.score_interest,
        life: r.score_life,
        growth: r.score_growth,
        balance: r.score_balance,
        total: r.score_total,
      },
      presentation: r.presentation,
      animal: r.animal,
      plant: r.plant,
      food: r.food,
      reportHTML: r.report_html,
      timestamp: new Date(r.created_at).getTime(),
      type: 'happiness',
      typeLabel: '幸福指数',
    }));
  },

  // ─── Dashboard Stats ─────────────────────
  async getDashboardStats(userId) {
    if (!userId) {
      const trials = this._getLocal('azure_trialHistory') || [];
      const happiness = this._getLocal('azure_happinessHistory') || [];
      return {
        trialCount: trials.length,
        happinessCount: happiness.length,
        avgScore: trials.length > 0
          ? Math.round(trials.reduce((a, b) => a + (b.matchScore || 0), 0) / trials.length)
          : 0,
      };
    }

    const [trialsResult, happinessResult] = await Promise.all([
      supabase.from('trials').select('match_score').eq('user_id', userId),
      supabase.from('happiness_assessments').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    ]);

    const trialScores = (trialsResult.data || []).map(r => r.match_score).filter(Boolean);
    return {
      trialCount: trialsResult.data?.length || 0,
      happinessCount: happinessResult.count || 0,
      avgScore: trialScores.length > 0
        ? Math.round(trialScores.reduce((a, b) => a + b, 0) / trialScores.length)
        : 0,
    };
  },

  // ─── Local fallback ──────────────────────
  _saveLocal(key, data) {
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.unshift({ ...data, timestamp: Date.now() });
    if (list.length > MAX_RECORDS) list.length = MAX_RECORDS;
    localStorage.setItem(key, JSON.stringify(list));
    return list[0];
  },

  _getLocal(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  },
};
