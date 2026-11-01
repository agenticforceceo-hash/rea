export const DAILY_WINDOW_HOURS = 24;
export const FALLBACK_WINDOW_HOURS = 72;
export const MAGAZINE_WINDOW_HOURS = 24 * 30;

/**
 * Calculate the RAVE value using the supplied agency formulas.
 * Online: screen/article measurement in cm × 6 × 95.
 * Print: measurement in cm × columns × 115.
 */
export function calculateRave({ medium, measurementCm, columns = 1 } = {}) {
  const centimetres = Number(measurementCm);
  if (!Number.isFinite(centimetres) || centimetres <= 0) return 0;

  if (medium === 'online') return centimetres * 6 * 95;
  if (medium === 'print') {
    const columnCount = Number(columns);
    if (!Number.isFinite(columnCount) || columnCount <= 0) return 0;
    return centimetres * columnCount * 115;
  }
  return 0;
}

/** Return an absolute rolling time window for the active monitoring mode. */
export function getMonitoringWindow(mode = 'daily', extended = false, now = new Date()) {
  const hours = mode === 'magazine'
    ? MAGAZINE_WINDOW_HOURS
    : extended
      ? FALLBACK_WINDOW_HOURS
      : DAILY_WINDOW_HOURS;
  const end = new Date(now);
  const start = new Date(end.getTime() - hours * 60 * 60 * 1000);
  return { start, end, hours };
}

/** Build the exact-title query or the instructed client + key-terms fallback. */
export function buildSearchQuery({ title = '', clientName = '', keyTerms = '', fallback = false } = {}) {
  const cleanTitle = String(title).trim();
  const cleanClient = String(clientName).trim();
  const cleanTerms = String(keyTerms).trim();
  if (!fallback) return cleanTitle ? `"${cleanTitle}"` : '';
  return [cleanClient, cleanTerms].filter(Boolean).join(' ');
}

/** Build a search-engine query restricted to one outlet's registered domain. */
export function buildOutletQuery({ query = '', url = '' } = {}) {
  let hostname = '';
  try {
    hostname = new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return String(query).trim();
  }
  const cleanQuery = String(query).trim();
  return [hostname ? `site:${hostname}` : '', cleanQuery].filter(Boolean).join(' ');
}

/** Return missing fields that prevent an item from entering an approved report. */
export function getCoverageCompleteness(article = {}) {
  const missing = [];
  if (!String(article.title ?? '').trim()) missing.push('content title');
  if (!String(article.publishedAt ?? '').trim()) missing.push('publication date');
  if (!String(article.outletName ?? '').trim()) missing.push('media platform');
  if (!['online', 'print'].includes(article.medium)) missing.push('platform type');
  if (!isHttpUrl(article.link)) missing.push('working article link');
  if (!['positive', 'neutral', 'negative'].includes(article.tone)) missing.push('tone');
  if (!Number.isFinite(Number(article.measurementCm)) || Number(article.measurementCm) <= 0) {
    missing.push('size measurement in cm');
  }
  if (article.medium === 'print' && (!Number.isFinite(Number(article.columns)) || Number(article.columns) <= 0)) {
    missing.push('print column count');
  }
  if (!isScreenshot(article.screenshotDataUrl)) missing.push('article screenshot');
  return missing;
}

/** The final report may only contain complete, executive-verified items. */
export function getReportReadiness(articles = []) {
  if (!articles.length) return { ready: false, reasons: ['Add coverage before compiling a report.'] };

  const reasons = [];
  const unverified = articles.filter((article) => article.verificationStatus !== 'approved');
  if (unverified.length) {
    reasons.push(`${unverified.length} coverage ${unverified.length === 1 ? 'item needs' : 'items need'} executive verification.`);
  }

  const incomplete = articles.flatMap((article) => {
    const fields = getCoverageCompleteness(article);
    return fields.length ? [{ title: String(article.title ?? 'Untitled coverage'), fields }] : [];
  });
  if (incomplete.length) {
    const first = incomplete[0];
    reasons.push(`${incomplete.length} ${incomplete.length === 1 ? 'item is' : 'items are'} missing report details (first: ${first.fields.join(', ')}).`);
  }

  return { ready: reasons.length === 0, reasons };
}

export function isHttpUrl(value) {
  try {
    const url = new URL(String(value));
    return (url.protocol === 'https:' || url.protocol === 'http:') && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function isScreenshot(value) {
  return typeof value === 'string' && /^data:image\/(?:jpeg|png|webp);base64,/i.test(value);
}

export function countByTone(articles = []) {
  return articles.reduce((counts, article) => {
    if (Object.hasOwn(counts, article.tone)) counts[article.tone] += 1;
    return counts;
  }, { positive: 0, neutral: 0, negative: 0 });
}
