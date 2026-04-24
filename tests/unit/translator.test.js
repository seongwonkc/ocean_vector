'use strict';

const assert = require('node:assert/strict');
const { describe, it, mock } = require('node:test');

// Load translator directly (pure functions, no deps to mock)
const { translateQuestionAttempts, translateAssessmentSession } =
  require('../../netlify/functions/_lib/translator');

// ── Helpers ────────────────────────────────────────────────────────────────────
function makeAttempt(overrides = {}) {
  return {
    questionId:        'rw1_001',
    isCorrect:         true,
    timeSpentSeconds:  45,
    wasFlagged:        false,
    numberOfChanges:   0,
    positionInSession: 1,
    skippedFirstTime:  false,
    ...overrides,
  };
}

function makeSession(overrides = {}) {
  return {
    sessionRef:       'sess-uuid-0001',
    startedAt:        '2026-04-24T10:00:00.000Z',
    endedAt:          '2026-04-24T11:30:00.000Z',
    durationMinutes:  90,
    engagementScore:  0.85,
    topics:           ['rw1', 'rw2', 'math'],
    performanceDelta: 50,
    context:          'vector_assessment',
    ...overrides,
  };
}

// ── translateQuestionAttempts ─────────────────────────────────────────────────
describe('translateQuestionAttempts', () => {
  it('happy path: valid attempts produce correct observation array', () => {
    const attempts = [makeAttempt({ questionId: 'rw1_001', positionInSession: 1 })];
    const result = translateQuestionAttempts(attempts, { sessionRef: 'sess-1' });

    assert.equal(result.length, 1);
    const obs = result[0];
    assert.equal(obs.category, 'performance');
    assert.equal(obs.confidence, 0.6);
    assert.equal(obs.sessionRef, 'sess-1');
    assert.ok(obs.observation.includes('rw1_001'));
    // questionData preserved
    assert.equal(obs.questionData.questionId, 'rw1_001');
    assert.equal(obs.questionData.isCorrect, true);
    assert.equal(obs.questionData.timeSpentSeconds, 45);
    assert.equal(obs.questionData.positionInSession, 1);
    assert.equal(obs.questionData.skippedFirstTime, false);
  });

  it('missing required field (isCorrect) throws VALIDATION', () => {
    const attempt = makeAttempt();
    delete attempt.isCorrect;
    let err; try { translateQuestionAttempts([attempt], {}); } catch(e) { err = e; }
    assert.ok(err, "expected to throw");
    assert.equal(err.code, 'VALIDATION');
    assert.ok(err.message.includes('isCorrect'));
  });

  it('missing required field (questionId) throws VALIDATION', () => {
    const attempt = makeAttempt();
    delete attempt.questionId;
    let err; try { translateQuestionAttempts([attempt], {}); } catch(e) { err = e; }
    assert.ok(err, "expected to throw");
    assert.equal(err.code, 'VALIDATION');
  });

  it('missing required field (timeSpentSeconds) throws VALIDATION', () => {
    const attempt = makeAttempt();
    delete attempt.timeSpentSeconds;
    let err; try { translateQuestionAttempts([attempt], {}); } catch(e) { err = e; }
    assert.ok(err, "expected to throw");
    assert.equal(err.code, 'VALIDATION');
    assert.ok(err.message.includes('timeSpentSeconds'));
  });

  it('empty attempts array throws VALIDATION', () => {
    let err; try { translateQuestionAttempts([], {}); } catch(e) { err = e; }
    assert.ok(err, "expected to throw");
    assert.equal(err.code, 'VALIDATION');
    assert.ok(err.message.includes('non-empty'));
  });

  it('non-array attempts throws VALIDATION', () => {
    let err; try { translateQuestionAttempts('bad', {}); } catch(e) { err = e; }
    assert.ok(err, "expected to throw");
    assert.equal(err.code, 'VALIDATION');
  });

  it('sessionRef from context applied when attempt has none', () => {
    const attempt = makeAttempt();
    delete attempt.sessionRef;
    const result = translateQuestionAttempts([attempt], { sessionRef: 'ctx-ref' });
    assert.equal(result[0].sessionRef, 'ctx-ref');
  });

  it('per-attempt sessionRef takes precedence over context', () => {
    const attempt = makeAttempt({ sessionRef: 'attempt-ref' });
    const result = translateQuestionAttempts([attempt], { sessionRef: 'ctx-ref' });
    assert.equal(result[0].sessionRef, 'attempt-ref');
  });

  it('unknown field in attempt is not passed to output questionData', () => {
    const attempt = makeAttempt({ extraField: 'should-be-dropped' });
    const result = translateQuestionAttempts([attempt], {});
    assert.ok(!('extraField' in result[0].questionData));
    assert.ok(!('extraField' in result[0]));
  });

  it('multiple attempts all produce observations', () => {
    const attempts = [
      makeAttempt({ questionId: 'rw1_001', positionInSession: 1 }),
      makeAttempt({ questionId: 'rw1_002', positionInSession: 2, isCorrect: false }),
      makeAttempt({ questionId: 'math_001', positionInSession: 3, wasFlagged: true }),
    ];
    const result = translateQuestionAttempts(attempts, {});
    assert.equal(result.length, 3);
    assert.equal(result[1].questionData.isCorrect, false);
    assert.equal(result[2].questionData.wasFlagged, true);
  });
});

// ── translateAssessmentSession ────────────────────────────────────────────────
describe('translateAssessmentSession', () => {
  it('happy path: valid sessionData produces correct session object', () => {
    const session = makeSession();
    const result = translateAssessmentSession(session, {});

    assert.equal(result.sessionRef, 'sess-uuid-0001');
    assert.equal(result.durationMinutes, 90);
    assert.equal(result.engagementScore, 0.85);
    assert.deepEqual(result.topics, ['rw1', 'rw2', 'math']);
    assert.equal(result.context, 'vector_assessment');
  });

  it('missing required field (sessionRef) throws VALIDATION', () => {
    const session = makeSession();
    delete session.sessionRef;
    let err; try { translateAssessmentSession(session, {}); } catch(e) { err = e; }
    assert.ok(err, "expected to throw");
    assert.equal(err.code, 'VALIDATION');
    assert.ok(err.message.includes('sessionRef'));
  });

  it('missing required field (durationMinutes) throws VALIDATION', () => {
    const session = makeSession();
    delete session.durationMinutes;
    let err; try { translateAssessmentSession(session, {}); } catch(e) { err = e; }
    assert.ok(err, "expected to throw");
    assert.equal(err.code, 'VALIDATION');
    assert.ok(err.message.includes('durationMinutes'));
  });

  it('missing required field (engagementScore) throws VALIDATION', () => {
    const session = makeSession();
    delete session.engagementScore;
    let err; try { translateAssessmentSession(session, {}); } catch(e) { err = e; }
    assert.ok(err, "expected to throw");
    assert.equal(err.code, 'VALIDATION');
  });

  it('optional fields pass through when present', () => {
    const session = makeSession({
      totalQuestionsAttempted: 82,
      totalCorrect: 55,
      completedFullSession: true,
      firstQuartileAvgSeconds: 38,
      lastQuartileAvgSeconds: 52,
    });
    const result = translateAssessmentSession(session, {});
    assert.equal(result.totalQuestionsAttempted, 82);
    assert.equal(result.totalCorrect, 55);
    assert.equal(result.completedFullSession, true);
    assert.equal(result.firstQuartileAvgSeconds, 38);
    assert.equal(result.lastQuartileAvgSeconds, 52);
  });

  it('optional fields absent do not appear in output', () => {
    const session = makeSession(); // no optional fields
    const result = translateAssessmentSession(session, {});
    assert.ok(!('totalQuestionsAttempted' in result));
    assert.ok(!('totalCorrect' in result));
    assert.ok(!('anxietySignal' in result));
  });

  it('unknown field in sessionData is not passed to output', () => {
    const session = makeSession({ unknownMetric: 'surprise' });
    const result = translateAssessmentSession(session, {});
    assert.ok(!('unknownMetric' in result));
  });

  it('non-object sessionData throws VALIDATION', () => {
    let err; try { translateAssessmentSession(null, {}); } catch(e) { err = e; }
    assert.ok(err, "expected to throw");
    assert.equal(err.code, 'VALIDATION');
  });
});
