const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateWebUrl, publicIPv4 } = require('../utils/publicWeb');
test('rejects loopback, private addresses, credentials, and non-web schemes', () => {
  for (const url of ['http://127.0.0.1', 'http://2130706433', 'http://10.0.0.1',
    'http://169.254.169.254', 'http://[::1]', 'http://localhost', 'file:///etc/passwd',
    'https://user:pass@example.com', 'http://example.com:5001']) {
    assert.throws(() => validateWebUrl(url), url);
  }
  assert.equal(validateWebUrl('https://www.maker.co/'), 'https://www.maker.co/');
});
test('DNS address screening excludes private ranges', () => {
  for (const ip of ['172.16.1.2', '192.168.1.1', '100.64.0.1', '::1', '127.0.0.1']) {
    assert.equal(publicIPv4(ip), false);
  }
  assert.equal(publicIPv4('1.1.1.1'), true);
});
