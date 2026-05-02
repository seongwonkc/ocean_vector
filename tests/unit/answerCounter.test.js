'use strict';

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const { countAnswerChange } = require('../../js/answerCounter');

describe('countAnswerChange — numberOfChanges edge cases', () => {

  it('first selection from null: no increment (not a change from anything)', () => {
    assert.equal(countAnswerChange(null, 'A', 0), 0);
  });

  it('same concrete key re-selected: no-op (A → A)', () => {
    assert.equal(countAnswerChange('A', 'A', 2), 2);
  });

  it('IDK selected twice: no-op (IDK → IDK)', () => {
    assert.equal(countAnswerChange('IDK', 'IDK', 1), 1);
  });

  it('concrete changes: increment (A → B)', () => {
    assert.equal(countAnswerChange('A', 'B', 0), 1);
  });

  it('concrete to IDK: increment (A → IDK)', () => {
    assert.equal(countAnswerChange('A', 'IDK', 0), 1);
  });

  it('IDK to concrete: increment (IDK → A)', () => {
    assert.equal(countAnswerChange('IDK', 'A', 0), 1);
  });

  it('accumulates across multiple genuine changes', () => {
    // A → B → C → B: three changes
    var c = countAnswerChange(null,  'A', 0); // 0 (first)
    c     = countAnswerChange('A',   'B', c); // 1
    c     = countAnswerChange('B',   'C', c); // 2
    c     = countAnswerChange('C',   'B', c); // 3
    assert.equal(c, 3);
  });

});
