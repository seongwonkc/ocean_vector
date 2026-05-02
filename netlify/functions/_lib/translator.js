'use strict';

const KNOWN_ATTEMPT_FIELDS = new Set([
  'questionId', 'isCorrect', 'timeSpentSeconds', 'wasFlagged',
  'numberOfChanges', 'positionInSession', 'skippedFirstTime',
  'confidence', 'sessionRef',
  'timeToFirstActionSeconds', 'answeredByIdk',
]);
const KNOWN_SESSION_FIELDS = new Set([
  'sessionRef', 'startedAt', 'endedAt', 'durationMinutes',
  'engagementScore', 'topics', 'performanceDelta', 'context',
  'anxietySignal', 'totalQuestionsAttempted', 'totalCorrect',
  'sectionsCompleted', 'completedFullSession',
  'firstQuartileAvgSeconds', 'lastQuartileAvgSeconds',
]);
const REQUIRED_ATTEMPT_FIELDS = [
  'questionId', 'isCorrect', 'timeSpentSeconds', 'wasFlagged',
  'numberOfChanges', 'positionInSession', 'skippedFirstTime',
];
const REQUIRED_SESSION_FIELDS = [
  'sessionRef', 'startedAt', 'endedAt', 'durationMinutes',
  'engagementScore', 'topics', 'performanceDelta', 'context',
];

function validationError(message) {
  const err = new Error(message);
  err.code = 'VALIDATION';
  return err;
}

function logUnknownFields(obj, knownSet, context) {
  const unknown = Object.keys(obj).filter(k => !knownSet.has(k));
  if (unknown.length > 0) {
    console.warn(JSON.stringify({
      event: 'unknown_fields_dropped',
      context,
      unknownFields: unknown,
    }));
  }
}

function translateQuestionAttempts(attempts, context) {
  if (!Array.isArray(attempts) || attempts.length === 0) {
    throw validationError('attempts must be non-empty array');
  }
  const sessionRef = context?.sessionRef;
  return attempts.map((attempt, idx) => {
    for (const field of REQUIRED_ATTEMPT_FIELDS) {
      if (attempt[field] === undefined || attempt[field] === null) {
        throw validationError(
          `attempts[${idx}].${field} is required`
        );
      }
    }
    logUnknownFields(attempt, KNOWN_ATTEMPT_FIELDS,
      `attempt[${idx}] questionId=${attempt.questionId}`);
    const questionData = {
      questionId: attempt.questionId,
      isCorrect: attempt.isCorrect,
      timeSpentSeconds: attempt.timeSpentSeconds,
      wasFlagged: attempt.wasFlagged,
      numberOfChanges: attempt.numberOfChanges,
      positionInSession: attempt.positionInSession,
      skippedFirstTime: attempt.skippedFirstTime,
    };
    // Feature 3 optional behavioral signals -- pass through only when present
    if (attempt.timeToFirstActionSeconds !== undefined) {
      questionData.timeToFirstActionSeconds = attempt.timeToFirstActionSeconds;
    }
    if (attempt.answeredByIdk !== undefined) {
      questionData.answeredByIdk = attempt.answeredByIdk;
    }
    return {
      observation: `Question attempt: ${attempt.questionId}`,
      category: 'performance',
      confidence: 0.6,
      sessionRef: attempt.sessionRef || sessionRef,
      questionData,
    };
  });
}

function translateAssessmentSession(sessionData, context) {
  if (!sessionData || typeof sessionData !== 'object') {
    throw validationError('sessionData must be object');
  }
  for (const field of REQUIRED_SESSION_FIELDS) {
    if (sessionData[field] === undefined || sessionData[field] === null) {
      throw validationError(`sessionData.${field} is required`);
    }
  }
  logUnknownFields(sessionData, KNOWN_SESSION_FIELDS,
    `session sessionRef=${sessionData.sessionRef}`);
  const output = {
    sessionRef: sessionData.sessionRef,
    startedAt: sessionData.startedAt,
    endedAt: sessionData.endedAt,
    durationMinutes: sessionData.durationMinutes,
    engagementScore: sessionData.engagementScore,
    topics: sessionData.topics,
    performanceDelta: sessionData.performanceDelta,
    context: sessionData.context,
  };
  // Pass through optional fields if present
  const optional = [
    'anxietySignal', 'totalQuestionsAttempted', 'totalCorrect',
    'sectionsCompleted', 'completedFullSession',
    'firstQuartileAvgSeconds', 'lastQuartileAvgSeconds',
  ];
  for (const field of optional) {
    if (sessionData[field] !== undefined) {
      output[field] = sessionData[field];
    }
  }
  return output;
}

module.exports = {
  translateQuestionAttempts,
  translateAssessmentSession,
};
