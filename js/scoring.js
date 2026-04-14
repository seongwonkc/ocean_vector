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

  // ── O-signal: inference vs procedural accuracy ──
  const inferenceQuestions = RW1_QUESTIONS.filter(q => q.type === 'inference' || q.type === 'dual_text');
  const inferenceCorrect = inferenceQuestions.filter(q => {
    const g = rw1Responses[q.id];
    return g && g.toUpperCase() === q.answer;
  }).length;
  const inferenceTotal = inferenceQuestions.length;
  const inferenceRate  = inferenceTotal > 0 ? inferenceCorrect / inferenceTotal : null;
  const overallRw1Rate = rw1Score / 20;

  // ── Data-derived observations (always rendered, use real numbers) ──
  const dataObservations = [];

  // 1. Module comparison
  const rw1Rate  = rw1Score / 20;
  const rw2Rate  = rw2Score / 20;
  const modDiff  = rw2Rate - rw1Rate;
  if (Math.abs(modDiff) >= 0.2) {
    if (modDiff > 0) {
      dataObservations.push(`Reading performance improved from Module 1 (${rw1Score}/20) to Module 2 (${rw2Score}/20). This warm-up pattern — stronger performance once settled into the sitting — is worth testing in practice mocks to confirm it's consistent.`);
    } else {
      dataObservations.push(`Reading performance dropped from Module 1 (${rw1Score}/20) to Module 2 (${rw2Score}/20 ${moduleType === 'hard' ? '— advanced module' : ''}). This pattern suggests fatigue or attention drop-off across the sitting, which is a pacing and stamina target.`);
    }
  }

  // 2. Inference vs procedural gap (O-signal, threshold 10pp)
  if (inferenceRate !== null && overallRw1Rate !== null) {
    const diff = inferenceRate - overallRw1Rate;
    if (diff >= 0.10) {
      dataObservations.push(`Inference and dual-text accuracy (${inferenceCorrect}/${inferenceTotal}) ran ${Math.round(diff * 100)} percentage points above overall Module 1 performance. The reasoning is working. The score gap lives in timed mechanical execution, not comprehension.`);
    } else if (diff <= -0.10) {
      dataObservations.push(`Inference and dual-text accuracy (${inferenceCorrect}/${inferenceTotal}) ran ${Math.round(Math.abs(diff) * 100)} percentage points below overall Module 1 performance. These question types are the primary RW content target — they require a specific step-by-step approach, not just stronger reading.`);
    }
  }

  // 3. Dominant RW domain gap (combined RW1 + RW2)
  const domainRates = {
    'Craft & Structure':            { c: (rw1Domains.craft_structure?.correct||0) + (rw2Domains.craft_structure?.correct||0), t: 16 },
    'Information & Ideas':          { c: (rw1Domains.info_ideas?.correct||0)       + (rw2Domains.info_ideas?.correct||0),       t: 14 },
    'Standard English Conventions': { c: (rw1Domains.sec?.correct||0)              + (rw2Domains.sec?.correct||0),              t: 4  },
    'Expression of Ideas':          { c: (rw1Domains.eoi?.correct||0)              + (rw2Domains.eoi?.correct||0),              t: 6  },
  };
  const domainRateArr = Object.entries(domainRates)
    .filter(([, v]) => v.t > 0)
    .map(([name, v]) => ({ name, rate: v.c / v.t, c: v.c, t: v.t }));
  if (domainRateArr.length >= 2) {
    const best  = domainRateArr.reduce((a, b) => a.rate > b.rate ? a : b);
    const worst = domainRateArr.reduce((a, b) => a.rate < b.rate ? a : b);
    if (best.name !== worst.name && (best.rate - worst.rate) >= 0.25) {
      dataObservations.push(`${best.name} was the strongest domain (${best.c}/${best.t}). ${worst.name} showed the largest gap (${worst.c}/${worst.t}). That gap is the primary content focus for RW — not a reading problem, a question-type strategy problem.`);
    }
  }

  // 4. Math pattern — find weakest domain
  const mathDomainArr = [
    { name: 'Algebra',               d: mathDomains.algebra       },
    { name: 'Advanced Math',         d: mathDomains.advanced_math },
    { name: 'Problem Solving & Data',d: mathDomains.psda          },
    { name: 'Geometry',              d: mathDomains.geometry      },
  ].filter(x => x.d.t > 0).map(x => ({ name: x.name, rate: x.d.c / x.d.t, c: x.d.c, t: x.d.t }));
  if (mathDomainArr.length >= 2 && mathScore < 14) {
    const weakMath = mathDomainArr.reduce((a, b) => a.rate < b.rate ? a : b);
    dataObservations.push(`Math: ${weakMath.name} was the weakest domain (${weakMath.c}/${weakMath.t}). This is the highest-leverage content target — improving one domain in math has an outsized effect on the scaled score.`);
  }

  // ── Behavioral signal strings ──
  let behavioralInsights = '';

  // N-signal (threshold lowered to 0.3)
  if (signals.nSpikeRate !== null && signals.nSpikeRate >= 0.3) {
    const pct = Math.round(signals.nSpikeRate * 100);
    behavioralInsights += `<p class="behavioral-insight"><span class="signal-tag N">N-SIGNAL</span> Response time spiked on questions immediately following high-difficulty items in ${pct}% of measured transitions — consistent with difficulty-sensitivity affecting subsequent questions. This is not a content gap; it is a recovery pattern.`;
    if (pct >= 60) behavioralInsights += ` The signal is strong and should be the first focus of session work.`;
    behavioralInsights += `</p>`;
  }

  // C-signal
  if (signals.cPacingRatio !== null) {
    const pacingDesc = signals.cPacingRatio < 0.6
      ? `significantly faster than early-module pacing (ratio: ${signals.cPacingRatio.toFixed(2)}) — late-module rushing is a careless-error risk`
      : signals.cPacingRatio > 1.4
      ? `slower than early-module pacing (ratio: ${signals.cPacingRatio.toFixed(2)}) — focus held through the module`
      : `consistent with early-module pacing (ratio: ${signals.cPacingRatio.toFixed(2)}) — stable execution`;
    behavioralInsights += `<p class="behavioral-insight"><span class="signal-tag C">C-SIGNAL</span> Late-module math pacing was ${pacingDesc}.</p>`;
  }

  // O-signal (behavioral dwell version, in addition to accuracy version above)
  if (signals.oEngagement !== null) {
    if (signals.oEngagement > 1.6) {
      behavioralInsights += `<p class="behavioral-insight"><span class="signal-tag O">O-SIGNAL</span> Dwell time on inference and dual-text questions was ${Math.round(signals.oEngagement * 10) / 10}× the dwell time on procedural questions — deep engagement with reasoning items is confirmed.</p>`;
    } else if (signals.oEngagement < 0.7) {
      behavioralInsights += `<p class="behavioral-insight"><span class="signal-tag O">O-SIGNAL</span> Dwell time on inference questions was lower than on procedural questions — these items are being processed quickly, which may explain accuracy gaps on reasoning question types.</p>`;
    }
  }

  // ── Profile context (supplementary, present tense) ──
  const profileContext = profile.sectionThree.patterns.map(p =>
    `<li>${p}</li>`
  ).join('');

  const s3 = `
  <section class="report-section" id="section-3">
    <div class="section-header">
      <span class="section-num">03</span>
      <h2>Where Personality Meets Performance</h2>
    </div>

    ${dataObservations.length > 0
      ? `<div class="insight-list">
          ${dataObservations.map(o => `<div class="insight-item"><span class="insight-bullet">→</span><p>${o}</p></div>`).join('')}
        </div>`
      : `<p style="font-size:14px;color:var(--text-muted);margin-bottom:24px;">Score patterns from this session did not produce sufficient differentiation for data-derived insights. The profile context below reflects what students with this OCEAN signature typically show.</p>`
    }

    ${behavioralInsights
      ? `<div class="behavioral-insights"><h3>Behavioral Signals from This Session</h3>${behavioralInsights}</div>`
      : ''}

    <div class="behavioral-insights" style="margin-top:16px;">
      <h3>What This Profile Typically Shows</h3>
      <ul style="padding-left:18px;margin:0;display:flex;flex-direction:column;gap:8px;">
        ${profileContext}
      </ul>
    </div>

    <div class="primary-gap-box">
      <span class="gap-label">Primary Gap</span>
      <p>${profile.sectionThree.primaryGap}</p>
    </div>
  </section>`;

  // ── SECTION 5: Priority Targets ───────────────────────────────────────────

  // Build ranked domain list by performance rate (combined RW + Math)

  const rwDomainRates = [
    { key: 'craft_structure', correct: csTotal,  total: 16, rate: csTotal / 16 },
    { key: 'info_ideas',      correct: iiTotal,  total: 14, rate: iiTotal / 14 },
    { key: 'sec',             correct: secTotal, total: 4,  rate: secTotal / 4  },
    { key: 'eoi',             correct: eoiTotal, total: 6,  rate: eoiTotal / 6  },
  ];

  const mathDomainRates = [
    { key: 'algebra',       correct: mathDomains.algebra.c,       total: mathDomains.algebra.t,       rate: mathDomains.algebra.t > 0       ? mathDomains.algebra.c / mathDomains.algebra.t             : 1 },
    { key: 'advanced_math', correct: mathDomains.advanced_math.c, total: mathDomains.advanced_math.t, rate: mathDomains.advanced_math.t > 0 ? mathDomains.advanced_math.c / mathDomains.advanced_math.t : 1 },
    { key: 'psda',          correct: mathDomains.psda.c,          total: mathDomains.psda.t,          rate: mathDomains.psda.t > 0          ? mathDomains.psda.c / mathDomains.psda.t                   : 1 },
    { key: 'geometry',      correct: mathDomains.geometry.c,      total: mathDomains.geometry.t,      rate: mathDomains.geometry.t > 0      ? mathDomains.geometry.c / mathDomains.geometry.t           : 1 },
  ];

  // Sort each section worst-first, pick top 2 RW + top 1 Math
  const sortedRW   = [...rwDomainRates].sort((a, b) => a.rate - b.rate);
  const sortedMath = [...mathDomainRates].sort((a, b) => a.rate - b.rate);

  // Pick targets: worst 2 RW + worst math domain (if below 70%)
  const targets = [];
  sortedRW.slice(0, 2).forEach(d => targets.push({ ...d, section: 'RW' }));
  if (sortedMath[0].rate < 0.7) targets.push({ ...sortedMath[0], section: 'Math' });

  function buildOceanModifier(domainKey, oceanScores) {
    const presc = DOMAIN_PRESCRIPTIONS[domainKey];
    if (!presc || !presc.oceanModifiers) return null;
    const mods = presc.oceanModifiers;

    // Check profile traits in priority order
    const checks = [
      { key: 'N_high', applies: classifyTrait(oceanScores.N, 'N') === 'high' || moderateToExtreme(oceanScores.N, 'N') === 'high' },
      { key: 'O_high', applies: classifyTrait(oceanScores.O, 'O') === 'high' || moderateToExtreme(oceanScores.O, 'O') === 'high' },
      { key: 'C_low',  applies: classifyTrait(oceanScores.C, 'C') === 'low'  || moderateToExtreme(oceanScores.C, 'C') === 'low'  },
      { key: 'C_high', applies: classifyTrait(oceanScores.C, 'C') === 'high' || moderateToExtreme(oceanScores.C, 'C') === 'high' },
      { key: 'O_low',  applies: classifyTrait(oceanScores.O, 'O') === 'low'  || moderateToExtreme(oceanScores.O, 'O') === 'low'  },
    ];
    for (const c of checks) {
      if (c.applies && mods[c.key]) return mods[c.key];
    }
    return null;
  }

  function renderTarget(target, rank) {
    const presc  = DOMAIN_PRESCRIPTIONS[target.key];
    if (!presc) return '';
    const pct    = Math.round(target.rate * 100);
    const missed = target.total - target.correct;
    const modifier = buildOceanModifier(target.key, oceanScores);
    const rankLabel = ['#1 Priority', '#2 Priority', '#3 Priority'][rank] || `#${rank+1} Priority`;
    const urgencyColor = pct < 40 ? 'var(--danger-light)' : pct < 65 ? '#E8A030' : 'var(--blue-light)';

    const drillItems = presc.base.drills.map(d =>
      `<li style="padding:6px 0 6px 16px;position:relative;font-size:13.5px;color:var(--text-muted);line-height:1.6;border-bottom:1px solid var(--border);"><span style="position:absolute;left:0;color:var(--gold);">›</span>${d}</li>`
    ).join('');

    const readingItems = presc.base.reading.length > 0
      ? `<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);">
           <div style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:8px;">Recommended Reading</div>
           <div style="display:flex;flex-wrap:wrap;gap:6px;">
             ${presc.base.reading.map(r => `<span style="font-size:12px;padding:3px 10px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:4px;color:var(--text-muted);">${r}</span>`).join('')}
           </div>
         </div>`
      : '';

    const modifierHtml = modifier
      ? `<div style="margin-top:14px;padding:12px 14px;background:rgba(201,165,90,0.08);border:1px solid var(--gold-dim);border-radius:4px;">
           <div style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold);margin-bottom:6px;">Your Profile — ${profileCode}</div>
           <p style="font-size:13px;color:var(--text-muted);line-height:1.6;margin:0;">${modifier}</p>
         </div>`
      : '';

    return `
  <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px 28px;margin-bottom:16px;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;gap:12px;">
      <div>
        <div style="font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--gold);margin-bottom:6px;">${rankLabel} · ${target.section}</div>
        <div style="font-family:var(--font-display);font-size:20px;font-weight:600;color:var(--text);">${presc.label}</div>
        <div style="font-size:12px;color:var(--text-dim);margin-top:3px;">${presc.questionCount}</div>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-family:var(--font-display);font-size:32px;font-weight:600;color:${urgencyColor};line-height:1;">${target.correct}/${target.total}</div>
        <div style="font-size:11px;color:var(--text-dim);margin-top:2px;">${pct}% · ${missed} missed</div>
      </div>
    </div>

    <p style="font-size:14px;color:var(--text);line-height:1.65;margin-bottom:8px;"><strong>The gap:</strong> ${presc.base.what}</p>
    <p style="font-size:13.5px;color:var(--text-muted);line-height:1.65;margin-bottom:16px;">${presc.base.why}</p>

    <div style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim);margin-bottom:8px;">Practice Targets</div>
    <ul style="list-style:none;padding:0;margin:0 0 4px;">${drillItems}</ul>

    ${readingItems}
    ${modifierHtml}

    <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border);font-size:12px;color:var(--text-dim);font-style:italic;">${presc.base.impact}</div>
  </div>`;
  }

  const targetBlocks = targets.map((t, i) => renderTarget(t, i)).join('');

  const s5 = `
  <section class="report-section" id="section-5">
    <div class="section-header">
      <span class="section-num">05</span>
      <h2>Priority Targets</h2>
    </div>
    <p style="font-size:14px;color:var(--text-muted);margin-bottom:24px;line-height:1.7;">
      Ranked by a combination of score gap and recoverability. Each target includes a practice prescription calibrated to your OCEAN profile — not generic advice, but the specific approach that works for how you study.
    </p>
    ${targetBlocks || '<p style="color:var(--text-dim);font-size:14px;">Strong performance across all domains — no critical gaps identified. Focus on consistency and full-length mock practice.</p>'}
  </section>`;
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
    ${s1}${s2}${s3}${s4}${s5}
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