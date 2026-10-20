const crypto = require('node:crypto');
const secret = process.env.SESSION_SECRET || crypto.randomBytes(48).toString('hex');
const sign = value => crypto.createHmac('sha256', secret).update(value).digest('base64url');
function issueSession(userId) {
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Date.now() + 12 * 60 * 60 * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}
function verifySession(token = '') {
  try {
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra) return null;
    const expected = Buffer.from(sign(payload));
    const received = Buffer.from(signature);
    if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) return null;
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof claims.sub === 'string' && claims.exp > Date.now() ? claims.sub : null;
  } catch { return null; }
}
module.exports = { issueSession, verifySession };
