const { test } = require('node:test');
const assert = require('node:assert/strict');
const { issueSession, verifySession } = require('../utils/sessions');

test('signed sessions verify and reject changed identities', () => {
  const token = issueSession('founder-a');
  assert.equal(verifySession(token), 'founder-a');
  const [, signature] = token.split('.');
  const forged = Buffer.from(JSON.stringify({ sub: 'founder-b', exp: Date.now() + 999999 })).toString('base64url');
  assert.equal(verifySession(`${forged}.${signature}`), null);
  assert.equal(verifySession(''), null);
  assert.equal(verifySession(token + '.extra'), null);
});

test('expired signed sessions are rejected', () => {
  const original = Date.now;
  let token;
  try {
    Date.now = () => original() - 13 * 60 * 60 * 1000;
    token = issueSession('founder-a');
  } finally { Date.now = original; }
  assert.equal(verifySession(token), null);
});
