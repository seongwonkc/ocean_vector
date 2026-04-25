'use strict';

const assert = require('node:assert/strict');
const { describe, it, beforeEach, afterEach } = require('node:test');

// ── Module setup ───────────────────────────────────────────────────────────────
// linkFlow.js is a browser IIFE. We prime the globals it reads at load time,
// then require once. checkBridgeStatus() references sessionStorage, VectorApp,
// and fetch dynamically at call time, so per-test globals work without re-requiring.

global.window = { location: { hostname: 'localhost' } };
global.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };
global.VectorApp     = { getSession: async () => null };
global.fetch         = async () => ({ ok: false, status: 500, json: async () => ({}) });

require('../../js/linkFlow.js');   // sets global.window.VectorLinkFlow
const { checkBridgeStatus } = global.window.VectorLinkFlow;

// ── sessionStorage mock pattern ────────────────────────────────────────────────
// First test file in this repo to mock sessionStorage. Future limb-side
// tests should follow this pattern, or refactor into a shared helper if
// duplication grows. The stub tracks setItem calls so tests can assert
// whether the cache was written.

let setItemCalls;

function makeMockStorage() {
  const store = {};
  return {
    getItem:    (key) => (key in store) ? store[key] : null,
    setItem:    (key, value) => {
      setItemCalls.push({ key, value: String(value) });
      store[key] = String(value);
    },
    removeItem: (key) => { delete store[key]; },
    clear:      () => { for (const k of Object.keys(store)) delete store[k]; },
  };
}

let mockStorage;

beforeEach(() => {
  setItemCalls = [];
  mockStorage  = makeMockStorage();
  global.sessionStorage = mockStorage;
  // Default: valid session, no cache, failing fetch — each test overrides as needed
  global.VectorApp = { getSession: async () => ({ access_token: 'test-token' }) };
  global.fetch     = async () => ({ ok: false, status: 500, json: async () => ({}) });
});

afterEach(() => {
  global.fetch = undefined;
});

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('checkBridgeStatus — cached value short-circuits fetch', () => {
  it('returns true and skips fetch when vector_bridge_status is cached as "true"', async () => {
    mockStorage.setItem('vector_bridge_status', 'true');
    setItemCalls = [];   // reset: pre-seed doesn't count as a call under test

    let fetchCalled = false;
    global.fetch = async () => { fetchCalled = true; return { ok: false }; };

    const result = await checkBridgeStatus();
    assert.strictEqual(result, true, 'cached "true" must convert to boolean true');
    assert.ok(!fetchCalled, 'fetch must not be called on cache hit');
  });

  it('returns false and skips fetch when vector_bridge_status is cached as "false"', async () => {
    mockStorage.setItem('vector_bridge_status', 'false');
    setItemCalls = [];   // reset: pre-seed doesn't count as a call under test

    let fetchCalled = false;
    global.fetch = async () => { fetchCalled = true; return { ok: false }; };

    const result = await checkBridgeStatus();
    assert.strictEqual(result, false, 'cached "false" must convert to boolean false');
    assert.ok(!fetchCalled, 'fetch must not be called on cache hit');
  });
});

describe('checkBridgeStatus — no session returns null', () => {
  it('returns null without calling fetch when VectorApp.getSession() returns falsy', async () => {
    global.VectorApp = { getSession: async () => null };

    let fetchCalled = false;
    global.fetch = async () => { fetchCalled = true; return { ok: false }; };

    const result = await checkBridgeStatus();
    assert.strictEqual(result, null, 'must return null when session is falsy');
    assert.ok(!fetchCalled, 'fetch must not be called when no session exists');
  });
});

describe('checkBridgeStatus — non-ok fetch response', () => {
  it('returns null and does not write to sessionStorage when fetch response is not ok', async () => {
    global.fetch = async () => ({ ok: false, status: 500, json: async () => ({}) });

    const result = await checkBridgeStatus();
    assert.strictEqual(result, null, 'must return null on non-ok response');
    assert.strictEqual(setItemCalls.length, 0, 'sessionStorage must not be written on non-ok response');
  });
});

describe('checkBridgeStatus — successful fetch caches and returns hasBridge', () => {
  it('returns true and caches "true" when fetch returns hasBridge: true', async () => {
    global.fetch = async () => ({ ok: true, json: async () => ({ hasBridge: true }) });

    const result = await checkBridgeStatus();
    assert.strictEqual(result, true, 'must return boolean true from hasBridge');
    assert.strictEqual(setItemCalls.length, 1, 'sessionStorage.setItem must be called once');
    assert.strictEqual(setItemCalls[0]?.key,   'vector_bridge_status', 'must write to correct key');
    assert.strictEqual(setItemCalls[0]?.value, 'true',                 'must store string "true"');
  });

  it('returns false and caches "false" when fetch returns hasBridge: false', async () => {
    global.fetch = async () => ({ ok: true, json: async () => ({ hasBridge: false }) });

    const result = await checkBridgeStatus();
    assert.strictEqual(result, false, 'must return boolean false from hasBridge');
    assert.strictEqual(setItemCalls.length, 1, 'sessionStorage.setItem must be called once');
    assert.strictEqual(setItemCalls[0]?.key,   'vector_bridge_status', 'must write to correct key');
    assert.strictEqual(setItemCalls[0]?.value, 'false',                'must store string "false"');
  });
});
