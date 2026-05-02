'use strict';

// ocean_vector/js/answerCounter.js
//
// Pure helper for the answer-change counter used by assessment.html.
// Extracted here so it can be unit-tested without a browser environment.
//
// prevKey: null (no prior selection) | 'A'|'B'|'C'|'D' (concrete) | 'IDK'
// newKey:  'A'|'B'|'C'|'D' | 'IDK'
// prevCount: current numberOfChanges value (integer >= 0)
//
// Returns: updated numberOfChanges
//
// Rules:
//   First selection from null  → no-op (not a change from anything)
//   Same key re-selected       → no-op
//   Any genuine transition     → +1  (includes IDK↔concrete)

function countAnswerChange(prevKey, newKey, prevCount) {
  if (prevKey === null) return prevCount;
  if (prevKey === newKey) return prevCount;
  return prevCount + 1;
}

// UMD shim: available as window.countAnswerChange in the browser and as
// module.exports.countAnswerChange in Node (tests).
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { countAnswerChange: countAnswerChange };
}
