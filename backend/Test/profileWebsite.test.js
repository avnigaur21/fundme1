const { test } = require('node:test');
const assert = require('node:assert/strict');
const { profileWebsite } = require('../utils/profileWebsite');
test('explicit website overrides a plausible but incorrect AI URL', () => {
  assert.equal(profileWebsite(' https://www.maker.co/ ', 'https://www.mybrand.com', 'mybrand.com'), 'https://www.maker.co/');
});
test('website path is preserved and inferred URLs need source evidence', () => {
  assert.equal(profileWebsite('https://example.com/startup', 'https://other.com'), 'https://example.com/startup');
  assert.equal(profileWebsite('', 'https://mybrand.com', 'Maker builds websites'), '');
  assert.equal(profileWebsite('', 'https://maker.co', 'Visit maker.co'), 'https://maker.co');
  assert.equal(profileWebsite('', 'javascript:alert(1)', 'javascript:alert(1)'), '');
});
