const dns = require('node:dns');
const net = require('node:net');
const http = require('node:http');
const https = require('node:https');

function publicIPv4(address) {
  if (net.isIP(address) !== 4) return false;
  const [a, b] = address.split('.').map(Number);
  return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && [0, 168].includes(b)) ||
    (a === 198 && [18, 19, 51].includes(b)) || (a === 203 && b === 0));
}
function validateWebUrl(value) {
  const url = new URL(value);
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      (url.port && !['80', '443'].includes(url.port)) ||
      host === 'localhost' || host.endsWith('.localhost') ||
      (net.isIP(host) && !publicIPv4(host))) {
    throw new Error('Please provide a public HTTP or HTTPS website.');
  }
  return url.href;
}
function lookup(host, options, callback) {
  dns.resolve4(host, (error, addresses) => {
    if (error) return callback(error);
    const address = addresses.find(publicIPv4);
    if (!address) return callback(new Error('Private network destinations are not allowed.'));
    callback(null, options?.all ? [{ address, family: 4 }] : address, 4);
  });
}
const publicWebOptions = {
  httpAgent: new http.Agent({ lookup }),
  httpsAgent: new https.Agent({ lookup }),
  proxy: false,
  maxRedirects: 4,
  maxContentLength: 2 * 1024 * 1024,
  beforeRedirect: options => validateWebUrl(`${options.protocol}//${options.hostname}:${options.port || (options.protocol === 'https:' ? 443 : 80)}${options.path}`),
};
module.exports = { validateWebUrl, publicWebOptions, publicIPv4 };
