// VECTOR Scoring Engine + Report Generator
// Powered by OCEAN | Internal Document

// ─── TRAIT SCORING ────────────────────────────────────────────────────────────
// personalityResponses: { 1: 'A', 2: 'B', ... }  (pair_id → 'A' or 'B')
function computeOceanScores(personalityResponses) {
  const scores = { O: 0, C: 0, N: 0, E: 0, A: 0 };

  PERSONALITY_PAIRS.forEach(pair => {
    const chosen = personalityResponses[pair.id];
    if (!chosen) return;
    const trait = chosen === 'A' ? pair.traitA : pair.traitB;
    scores[trait]++;
  });

  return scores;
}

// Returns 'high' | 'low' | 'moderate' for each trait
function classifyTrait(score, trait) {
  const max = TRAIT_MAX[trait];
  const highThreshold = max * 0.6;
  const lowThreshold  = max * 0.4;
  if (score >= highThreshold) return 'high';
  if (score <= lowThreshold)  return 'low';
  return 'moderate';
}

// For moderate: assign to the closer extreme
function moderateToExtreme(score, trait) {
  const max = TRAIT_MAX[trait];
  const mid = max / 2;
  return score >= mid ? 'high' : 'low';
}

// Returns profile code string e.g. 'OCN', 'Ocn', 'oCn' etc.
function assignProfile(oceanScores) {
  const classO = classifyTrait(oceanScores.O, 'O');
  const classC = classifyTrait(oceanScores.C, 'C');
  const classN = classifyTrait(oceanScores.N, 'N');

  const effO = classO === 'moderate' ? moderateToExtreme(oceanScores.O, 'O') : classO;
  const effC = classC === 'moderate' ? moderateToExtreme(oceanScores.C, 'C') : classC;
  const effN = classN === 'moderate' ? moderateToExtreme(oceanScores.N, 'N') : classN;

  const codeO = effO === 'high' ? 'O' : 'o';
  const codeC = effC === 'high' ? 'C' : 'c';
  const codeN = effN === 'high' ? 'N' : 'n';

  return codeO + codeC + codeN;
}

// ─── MODULE SCORING ───────────────────────────────────────────────────────────
function scoreRWModule(responses, questions) {
  let score = 0;
  questions.forEach(q => {
    if (q.isSPR) return; // no SPR in RW
    const given = responses[q.id];
    if (given && given.toUpperCase() === q.answer) score++;
  });
  return score;
}

function scoreMathModule(responses, questions) {
  let score = 0;
  questions.forEach(q => {
    const given = responses[q.id];
    if (!given) return;

    if (q.isSPR) {
      const cleaned = given.toString().trim().toLowerCase().replace(/\s/g, '');
      const expected = q.sprAnswer.toString().toLowerCase().replace(/\s/g, '');
      // Accept variants for π
      const variants = [expected, expected.replace('π', 'pi'), expected.replace('π', 'p')];
      // For numeric answers, allow float tolerance
      if (q.sprAnswerNum !== null && q.sprAnswerNum !== undefined) {
        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed) && Math.abs(parsed - q.sprAnswerNum) < 0.01) { score++; return; }
      }
      if (variants.includes(cleaned)) { score++; return; }
    } else {
      if (given.toUpperCase() === q.answer) score++;
    }
  });
  return score;
}

// Domain breakdown for RW module
function rwDomainBreakdown(responses, questions) {
  const domains = {
    craft_structure: { correct: 0, total: 0 },
    info_ideas:      { correct: 0, total: 0 },
    sec:             { correct: 0, total: 0 },
    eoi:             { correct: 0, total: 0 },
  };
  questions.forEach(q => {
    if (!domains[q.domain]) return;
    domains[q.domain].total++;
    const given = responses[q.id];
    if (given && given.toUpperCase() === q.answer) domains[q.domain].correct++;
  });
  return domains;
}

// Domain breakdown for Math module
function mathDomainBreakdown(responses) {
  const domains = { algebra: { c: 0, t: 0 }, advanced_math: { c: 0, t: 0 }, psda: { c: 0, t: 0 }, geometry: { c: 0, t: 0 } };
  MATH_QUESTIONS.forEach(q => {
    const dom = q.domain;
    if (!domains[dom]) return;
    domains[dom].t++;
    const given = responses[q.id];
    if (!given) return;
    if (q.isSPR) {
      const cleaned = given.toString().trim().toLowerCase().replace(/\s/g, '');
      const expected = q.sprAnswer.toString().toLowerCase().replace(/\s/g, '');
      if (q.sprAnswerNum !== null && q.sprAnswerNum !== undefined) {
        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed) && Math.abs(parsed - q.sprAnswerNum) < 0.01) { domains[dom].c++; return; }
      }
      const variants = [expected, expected.replace('π','pi'), expected.replace('π','p')];
      if (variants.includes(cleaned)) domains[dom].c++;
    } else {
      if (given.toUpperCase() === q.answer) domains[dom].c++;
    }
  });
  return domains;
}

// ─── BEHAVIORAL SIGNALS ───────────────────────────────────────────────────────
// behavioralData: { qId: { T0, T1, changes: [{from,to,ts}], T_final } }

function computeBehavioralSignals(behavioralData, rw1Questions, rw2Questions, mathQuestions, moduleType) {
  const signals = { O: null, C: null, N: null };

  // ── O-SIGNAL ──────────────────────────────────────────────────────────────
  // Performance differential: inference/dual-text vs. vocabulary/grammar, normalized against total score
  const rw1OQuestions  = rw1Questions.filter(q => q.signal === 'O' || q.highSignal);
  const rw1NonO        = rw1Questions.filter(q => !q.signal || q.signal !== 'O');

  // We can't recompute correctness from behavioral data alone — O-signal is computed separately
  // during scoring. Here we flag based on dwell-time pattern for inference questions.
  const inferenceDwells = [];
  const vocabDwells = [];

  rw1Questions.forEach(q => {
    const bd = behavioralData[q.id];
    if (!bd || !bd.T0 || !bd.T_final) return;
    const dwell = bd.T_final - bd.T0;
    if (q.type === 'inference' || q.type === 'dual_text') inferenceDwells.push(dwell);
    else if (q.type === 'vocabulary' || q.type === 'sec') vocabDwells.push(dwell);
  });

  const avgInference = mean(inferenceDwells);
  const avgVocab     = mean(vocabDwells);
  // If inference questions are dwelt on significantly longer → O engagement (or O anxiety)
  signals.oEngagement = avgInference && avgVocab ? (avgInference / avgVocab) : null;

  // ── C-SIGNAL ──────────────────────────────────────────────────────────────
  // Time distribution consistency across Math module.
  // Compare Q1–Q3 pacing vs Q16–Q18 pacing. Early submission = low C. Using time to review = high C.
  const mathEarlyDwells = ['math_q1','math_q2','math_q3'].map(id => {
    const bd = behavioralData[id];
    return bd && bd.T0 && bd.T_final ? bd.T_final - bd.T0 : null;
  }).filter(v => v !== null);

  const mathLateDwells = ['math_q16','math_q17','math_q18'].map(id => {
    const bd = behavioralData[id];
    return bd && bd.T0 && bd.T_final ? bd.T_final - bd.T0 : null;
  }).filter(v => v !== null);

  const avgEarlyMath = mean(mathEarlyDwells);
  const avgLateMath  = mean(mathLateDwells);

  // Also check unit conversion trap (Math Q2): wrong answer = careless flag
  const q2Trap = behavioralData['math_q2'];
  signals.unitTrapCorrect = null; // filled in by scoring pass

  // Time remaining at final submission of Math Q18 (C-signal)
  const q18bd = behavioralData['math_q18'];
  signals.mathQ18TimeRemaining = q18bd && q18bd.mathTimeRemaining != null ? q18bd.mathTimeRemaining : null;

  // Pacing consistency: ratio of late to early dwell times
  signals.cPacingRatio = avgEarlyMath && avgLateMath ? (avgLateMath / avgEarlyMath) : null;
  // High ratio = maintained focus. Low ratio = rushed late. Very low (<0.5) = low C signal.

  // ── N-SIGNAL ──────────────────────────────────────────────────────────────
  // Response time spike on questions immediately following a high-dwell-time question.
  // Threshold: dwell ≥ 150% of student's own module mean for that question type.
  // CRITICAL: Post-DIFFICULTY lag, NOT post-error lag.

  const allRwQuestions = [...rw1Questions, ...rw2Questions];
  const moduleMeansByType = {};

  // Compute per-type means
  allRwQuestions.forEach(q => {
    const bd = behavioralData[q.id];
    if (!bd || !bd.T0 || !bd.T_final) return;
    const dwell = bd.T_final - bd.T0;
    if (!moduleMeansByType[q.type]) moduleMeansByType[q.type] = [];
    moduleMeansByType[q.type].push(dwell);
  });

  const typeMeans = {};
  Object.keys(moduleMeansByType).forEach(t => {
    typeMeans[t] = mean(moduleMeansByType[t]);
  });

  // Find questions with dwell ≥ 150% of their type mean → flag as high-dwell
  const highDwellIds = new Set();
  allRwQuestions.forEach(q => {
    const bd = behavioralData[q.id];
    if (!bd || !bd.T0 || !bd.T_final) return;
    const dwell = bd.T_final - bd.T0;
    const typeMean = typeMeans[q.type];
    if (typeMean && dwell >= typeMean * 1.5) highDwellIds.add(q.id);
  });

  // Count how many questions immediately following high-dwell questions also show elevated dwell
  let nSpikeCount = 0;
  let nSpikePossible = 0;

  for (let i = 0; i < allRwQuestions.length - 1; i++) {
    const thisQ = allRwQuestions[i];
    const nextQ = allRwQuestions[i + 1];
    if (!highDwellIds.has(thisQ.id)) continue;
    nSpikePossible++;
    const nextBd = behavioralData[nextQ.id];
    if (!nextBd || !nextBd.T0 || !nextBd.T_final) continue;
    const nextDwell = nextBd.T_final - nextBd.T0;
    const nextMean  = typeMeans[nextQ.type];
    if (nextMean && nextDwell >= nextMean * 1.2) nSpikeCount++;
  }

  signals.nSpikeRate = nSpikePossible > 0 ? nSpikeCount / nSpikePossible : null;

  // Also: answer change rate in Hard RW Module Q11–Q20
  if (moduleType === 'hard') {
    const lateRw2Questions = rw2Questions.slice(10); // Q11–Q20
    let totalChanges = 0;
    let questionCount = 0;
    lateRw2Questions.forEach(q => {
      const bd = behavioralData[q.id];
      if (!bd || !bd.changes) return;
      totalChanges += bd.changes.length;
      questionCount++;
    });
    signals.hardRwLateChangeRate = questionCount > 0 ? totalChanges / questionCount : null;
  }

  return signals;
}

function mean(arr) {
  if (!arr || arr.length === 0) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// ─── BEHAVIORAL DATA SUMMARY (for Supabase storage) ──────────────────────────
function summarizeBehavioralData(behavioralData) {
  const summary = {};
  Object.keys(behavioralData).forEach(qId => {
    const bd = behavioralData[qId];
    summary[qId] = {
      T0: bd.T0,
      T1: bd.T1,
      changes: bd.changes || [],
      T_final: bd.T_final,
      dwell: bd.T0 && bd.T_final ? bd.T_final - bd.T0 : null,
      hesitation: bd.T0 && bd.T1 ? bd.T1 - bd.T0 : null,
      changeCount: (bd.changes || []).length,
      mathTimeRemaining: bd.mathTimeRemaining || null,
    };
  });
  return summary;
}

// ─── REPORT GENERATOR ────────────────────────────────────────────────────────
// Returns HTML string for the full 4-section report.

function generateReport(sessionData) {
  const {
    studentName, currentScore, targetScore, testDate, weeklyStudyHours,
    personalityResponses,
    rw1Responses, rw1Score,
    moduleType, rw2Responses, rw2Score,
    mathResponses, mathScore,
    behavioralData,
    oceanScores, profileCode,
    sessionDate,
  } = sessionData;

  const profile = PROFILES[profileCode];
  if (!profile) return '<p>Profile data unavailable.</p>';

  const rw2Questions = moduleType === 'hard' ? RW2_HARD_QUESTIONS : RW2_EASY_QUESTIONS;
  const totalScore = rw1Score + rw2Score + mathScore;

  // Trait classifications
  const traitClass = {};
  ['O','C','N','E','A'].forEach(t => {
    traitClass[t] = classifyTrait(oceanScores[t], t);
  });

  // RW domain breakdowns
  const rw1Domains = rwDomainBreakdown(rw1Responses, RW1_QUESTIONS);
  const rw2Domains = rwDomainBreakdown(rw2Responses, rw2Questions);
  const mathDomains = mathDomainBreakdown(mathResponses);

  // Behavioral signals
  const signals = computeBehavioralSignals(behavioralData, RW1_QUESTIONS, rw2Questions, MATH_QUESTIONS, moduleType);

  // E and A modifiers
  const eClass = classifyTrait(oceanScores.E, 'E');
  const aClass = classifyTrait(oceanScores.A, 'A');

  const eModifier = eClass === 'high' ? `<p class="modifier"><strong>Social learning:</strong> ${EA_MODIFIERS.highE}</p>` : '';
  const aModifier = aClass === 'high' ? `<p class="modifier"><strong>Feedback sensitivity:</strong> ${EA_MODIFIERS.highA}</p>` :
    (aClass === 'low' && (profile.traits.O === 'high') && (profile.traits.C === 'high'))
      ? `<p class="modifier"><strong>Independence:</strong> ${EA_MODIFIERS.lowA_highOC}</p>` : '';

  // ── SECTION 1: OCEAN Profile ──────────────────────────────────────────────
  const s1 = `
  <section class="report-section" id="section-1">
    <div class="section-header">
      <span class="section-num">01</span>
      <h2>Your OCEAN Profile</h2>
    </div>

    <div class="profile-badge">
      <span class="profile-code">${profileCode}</span>
      <span class="profile-label">${profile.label}</span>
    </div>
    <p class="profile-tagline">"${profile.tagline}"</p>

    <div class="traits-grid">
      ${renderTrait('O', 'Openness', oceanScores.O, TRAIT_MAX.O, traitClass.O, true)}
      ${renderTrait('C', 'Conscientiousness', oceanScores.C, TRAIT_MAX.C, traitClass.C, true)}
      ${renderTrait('N', 'Neuroticism', oceanScores.N, TRAIT_MAX.N, traitClass.N, true)}
      ${renderTrait('E', 'Extraversion', oceanScores.E, TRAIT_MAX.E, traitClass.E, false)}
      ${renderTrait('A', 'Agreeableness', oceanScores.A, TRAIT_MAX.A, traitClass.A, false)}
    </div>

    ${eModifier}${aModifier}
  </section>`;

  // ── SECTION 2: Score Summary + 유형 분석 ──────────────────────────────────
  const rwTotal = rw1Score + rw2Score;
  const rwTotalPossible = 40;

  const rw1CsCore  = rw1Domains.craft_structure.correct;
  const rw1IiScore = rw1Domains.info_ideas.correct;
  const rw1SecScore= rw1Domains.sec.correct;
  const rw1EoiScore= rw1Domains.eoi.correct;

  const rw2CsCore  = rw2Domains.craft_structure.correct;
  const rw2IiScore = rw2Domains.info_ideas.correct;
  const rw2SecScore= rw2Domains.sec.correct;
  const rw2EoiScore= rw2Domains.eoi.correct;

  // Combined RW domain scores
  const csTotal  = rw1CsCore + rw2CsCore;
  const iiTotal  = rw1IiScore + rw2IiScore;
  const secTotal = rw1SecScore + rw2SecScore;
  const eoiTotal = rw1EoiScore + rw2EoiScore;

  const moduleLabel = moduleType === 'hard' ? 'Hard' : 'Easy';

  const s2 = `
  <section class="report-section" id="section-2">
    <div class="section-header">
      <span class="section-num">02</span>
      <h2>Score Summary <span class="ko">유형 분석</span></h2>
    </div>

    <div class="score-overview">
      <div class="score-block primary">
        <div class="score-num">${totalScore}<span class="score-denom">/58</span></div>
        <div class="score-label">Total Score</div>
      </div>
      <div class="score-block">
        <div class="score-num">${rwTotal}<span class="score-denom">/40</span></div>
        <div class="score-label">Reading & Writing</div>
        <div class="score-sub">Module 2: ${moduleLabel}</div>
      </div>
      <div class="score-block">
        <div class="score-num">${mathScore}<span class="score-denom">/18</span></div>
        <div class="score-label">Math</div>
      </div>
    </div>

    <div class="domain-tables">
      <div class="domain-table-wrap">
        <h3>Reading & Writing Domains</h3>
        <table class="domain-table">
          <thead><tr><th>Domain</th><th>RW1</th><th>RW2</th><th>Combined</th></tr></thead>
          <tbody>
            <tr><td>Craft & Structure</td><td>${rw1CsCore}/8</td><td>${rw2CsCore}/8</td><td>${csTotal}/16</td></tr>
            <tr><td>Information & Ideas</td><td>${rw1IiScore}/7</td><td>${rw2IiScore}/7</td><td>${iiTotal}/14</td></tr>
            <tr><td>Standard English Conventions</td><td>${rw1SecScore}/2</td><td>${rw2SecScore}/2</td><td>${secTotal}/4</td></tr>
            <tr><td>Expression of Ideas</td><td>${rw1EoiScore}/3</td><td>${rw2EoiScore}/3</td><td>${eoiTotal}/6</td></tr>
          </tbody>
        </table>
      </div>
      <div class="domain-table-wrap">
        <h3>Math Domains</h3>
        <table class="domain-table">
          <thead><tr><th>Domain</th><th>Score</th></tr></thead>
          <tbody>
            <tr><td>Algebra</td><td>${mathDomains.algebra.c}/${mathDomains.algebra.t}</td></tr>
            <tr><td>Advanced Math</td><td>${mathDomains.advanced_math.c}/${mathDomains.advanced_math.t}</td></tr>
            <tr><td>Problem Solving & Data Analysis</td><td>${mathDomains.psda.c}/${mathDomains.psda.t}</td></tr>
            <tr><td>Geometry</td><td>${mathDomains.geometry.c}/${mathDomains.geometry.t}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="context-strip">
      <span>Current Score: <strong>${currentScore || '—'}</strong></span>
      <span>Target: <strong>${targetScore || '—'}</strong></span>
      <span>Test Date: <strong>${testDate || '—'}</strong></span>
      <span>Study Hours/Week: <strong>${weeklyStudyHours || '—'}</strong></span>
    </div>
  </section>`;

  // ── SECTION 3: Personality × Performance ──────────────────────────────────
  const perfInsights = profile.sectionThree.patterns;

  // Compute O-signal: compare inference/dual-text performance vs. total
  const inferenceQuestions = RW1_QUESTIONS.filter(q => q.type === 'inference' || q.type === 'dual_text');
  const inferenceCorrect = inferenceQuestions.filter(q => {
    const g = rw1Responses[q.id];
    return g && g.toUpperCase() === q.answer;
  }).length;
  const inferenceTotal = inferenceQuestions.length;
  const inferenceRate = inferenceTotal > 0 ? inferenceCorrect / inferenceTotal : null;
  const overallRw1Rate = rw1Score / 20;

  // Behavioral insight strings
  let behavioralInsights = '';
  if (signals.nSpikeRate !== null && signals.nSpikeRate > 0.5) {
    behavioralInsights += `<p class="behavioral-insight"><span class="signal-tag N">N-SIGNAL</span> Post-difficulty response time spikes detected in ${Math.round(signals.nSpikeRate * 100)}% of measured transitions — consistent with performance sensitivity to sustained difficulty.</p>`;
  }
  if (signals.cPacingRatio !== null) {
    const pacingDesc = signals.cPacingRatio < 0.6 ? 'significantly faster than early-module pacing — a careless-error risk late in timed sections'
      : signals.cPacingRatio > 1.4 ? 'slower than early-module pacing — sustained focus through the module'
      : 'consistent with early-module pacing — stable execution across the module';
    behavioralInsights += `<p class="behavioral-insight"><span class="signal-tag C">C-SIGNAL</span> Late-module pacing was ${pacingDesc}.</p>`;
  }
  if (inferenceRate !== null && overallRw1Rate !== null) {
    const diff = inferenceRate - overallRw1Rate;
    if (Math.abs(diff) > 0.15) {
      const dir = diff > 0 ? 'above' : 'below';
      behavioralInsights += `<p class="behavioral-insight"><span class="signal-tag O">O-SIGNAL</span> Inference and dual-text accuracy (${inferenceCorrect}/${inferenceTotal}) is ${Math.round(Math.abs(diff)*100)}pp ${dir} overall RW1 performance — ${diff > 0 ? 'verbal reasoning is a strength relative to mechanics' : 'inference questions are showing a gap relative to procedural question types'}.</p>`;
    }
  }

  const s3 = `
  <section class="report-section" id="section-3">
    <div class="section-header">
      <span class="section-num">03</span>
      <h2>Where Personality Meets Performance</h2>
    </div>

    <div class="insight-list">
      ${perfInsights.map(p => `<div class="insight-item"><span class="insight-bullet">→</span><p>${p}</p></div>`).join('')}
    </div>

    ${behavioralInsights ? `<div class="behavioral-insights"><h3>Behavioral Signals from This Session</h3>${behavioralInsights}</div>` : ''}

    <div class="primary-gap-box">
      <span class="gap-label">Primary Gap</span>
      <p>${profile.sectionThree.primaryGap}</p>
    </div>
  </section>`;

  // ── SECTION 4: Learning Blueprint ─────────────────────────────────────────
  const s4 = `
  <section class="report-section" id="section-4">
    <div class="section-header">
      <span class="section-num">04</span>
      <h2>Your Learning Blueprint</h2>
    </div>
    <p class="blueprint-intro">Students with your profile learn best when the program is structured around the following four dimensions.</p>

    <div class="blueprint-grid">
      <div class="blueprint-card">
        <div class="blueprint-icon">◈</div>
        <h3>Session Structure</h3>
        <p>${profile.sessionStructure}</p>
      </div>
      <div class="blueprint-card">
        <div class="blueprint-icon">◎</div>
        <h3>Feedback Style</h3>
        <p>${profile.feedbackStyle}</p>
      </div>
      <div class="blueprint-card">
        <div class="blueprint-icon">◉</div>
        <h3>Practice Format</h3>
        <p>${profile.practiceFormat}</p>
      </div>
      <div class="blueprint-card">
        <div class="blueprint-icon">◐</div>
        <h3>Pressure Management</h3>
        <p>${profile.pressureManagement}</p>
      </div>
    </div>
  </section>`;

  // Full report wrapper
  return `
  <div class="report-container">
    <div class="report-header">
      <div class="report-logo">VECTOR <span>Powered by OCEAN</span></div>
      <div class="report-meta">
        <strong>${studentName}</strong>
        <span>${sessionDate ? new Date(sessionDate).toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'}) : ''}</span>
      </div>
    </div>
    ${s1}${s2}${s3}${s4}
    <div class="report-footer">
      <p>VECTOR | Powered by OCEAN | Consultant Use Only — Do Not Share Before Session</p>
    </div>
  </div>`;
}

function renderTrait(code, name, score, max, level, isPrimary) {
  const pct = Math.round((score / max) * 100);
  const desc = TRAIT_DESCRIPTIONS[code][level] || TRAIT_DESCRIPTIONS[code]['moderate'];
  const levelLabel = level.charAt(0).toUpperCase() + level.slice(1);

  return `
  <div class="trait-block ${isPrimary ? 'primary' : 'secondary'}">
    <div class="trait-header">
      <span class="trait-code">${code}</span>
      <span class="trait-name">${name}</span>
      <span class="trait-level level-${level}">${levelLabel}</span>
    </div>
    <div class="trait-bar-wrap">
      <div class="trait-bar" style="width: ${pct}%"></div>
    </div>
    <p class="trait-desc">${desc}</p>
  </div>`;
}

// ─── SUPABASE SAVE ────────────────────────────────────────────────────────────
async function saveSession(sessionData) {
  const url = window.SUPABASE_URL;
  const key = window.SUPABASE_ANON_KEY;

  if (!url || url === 'YOUR_SUPABASE_URL') {
    console.warn('Supabase not configured — session not saved.');
    return { error: 'not_configured' };
  }

  const payload = {
    student_id:            sessionData.studentName,
    session_date:          new Date().toISOString(),
    test_date:             sessionData.testDate || null,
    current_score:         sessionData.currentScore || null,
    target_score:          sessionData.targetScore || null,
    weekly_study_hours:    sessionData.weeklyStudyHours || null,
    personality_responses: sessionData.personalityResponses,
    rw_module1_responses:  sessionData.rw1Responses,
    rw_module1_score:      sessionData.rw1Score,
    module2_type:          sessionData.moduleType,
    rw_module2_responses:  sessionData.rw2Responses,
    rw_module2_score:      sessionData.rw2Score,
    math_responses:        sessionData.mathResponses,
    math_score:            sessionData.mathScore,
    behavioral_data:       summarizeBehavioralData(sessionData.behavioralData),
    ocean_scores:          sessionData.oceanScores,
    profile_code:          sessionData.profileCode,
    profile_label:         PROFILES[sessionData.profileCode]?.label || null,
  };

  try {
    const res = await fetch(`${url}/rest/v1/vector_sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('Supabase error:', err);
      return { error: err };
    }
    return await res.json();
  } catch (e) {
    console.error('Save failed:', e);
    return { error: e.message };
  }
}

// ─── SUPABASE FETCH (for consultant view) ────────────────────────────────────
async function fetchAllSessions() {
  const url = window.SUPABASE_URL;
  const key = window.SUPABASE_ANON_KEY;

  if (!url || url === 'YOUR_SUPABASE_URL') {
    return { error: 'not_configured', data: [] };
  }

  try {
    const res = await fetch(`${url}/rest/v1/vector_sessions?select=*&order=session_date.desc`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      }
    });
    if (!res.ok) return { error: await res.text(), data: [] };
    const data = await res.json();
    return { data };
  } catch (e) {
    return { error: e.message, data: [] };
  }
}
