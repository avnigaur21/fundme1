// Founder input always wins over URLs inferred from page text or the model.
function profileWebsite(supplied, inferred, context = '') {
  const explicit = String(supplied || '').trim();
  const candidate = explicit || String(inferred || '').trim();
  if (!candidate) return '';
  try {
    const url = new URL(candidate);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return '';
    if (explicit) return explicit;
    // Without an explicit URL, accept only domains present in the materials.
    return String(context).toLowerCase().includes(url.hostname.toLowerCase()) ? candidate : '';
  } catch { return ''; }
}
module.exports = { profileWebsite };
