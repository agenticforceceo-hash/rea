import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOutletQuery,
  buildSearchQuery,
  calculateRave,
  countByTone,
  getCoverageCompleteness,
  getMonitoringWindow,
  getReportReadiness,
} from './core.mjs';

test('RAVE uses the online and print formulas exactly', () => {
  assert.equal(calculateRave({ medium: 'online', measurementCm: 4 }), 2280);
  assert.equal(calculateRave({ medium: 'print', measurementCm: 4, columns: 3 }), 1380);
});

test('RAVE rejects missing, negative and non-numeric measurements', () => {
  assert.equal(calculateRave({ medium: 'online', measurementCm: 0 }), 0);
  assert.equal(calculateRave({ medium: 'online', measurementCm: 'not-a-number' }), 0);
  assert.equal(calculateRave({ medium: 'print', measurementCm: 4, columns: 0 }), 0);
  assert.equal(calculateRave({ medium: 'video', measurementCm: 4 }), 0);
});

test('daily search begins at a rolling 24 hours and can extend to three days', () => {
  const now = new Date('2026-11-01T12:00:00.000Z');
  assert.equal(getMonitoringWindow('daily', false, now).hours, 24);
  assert.equal(getMonitoringWindow('daily', true, now).hours, 72);
  assert.equal(getMonitoringWindow('daily', false, now).start.toISOString(), '2026-10-31T12:00:00.000Z');
});

test('magazine monitoring uses a 30-day window, even if daily fallback is selected', () => {
  const now = new Date('2026-11-01T12:00:00.000Z');
  const window = getMonitoringWindow('magazine', true, now);
  assert.equal(window.hours, 24 * 30);
  assert.equal(window.start.toISOString(), '2026-10-02T12:00:00.000Z');
});

test('search queries use exact release titles first and client key terms as fallback', () => {
  assert.equal(buildSearchQuery({ title: 'New fleet partnership' }), '"New fleet partnership"');
  assert.equal(buildSearchQuery({ title: 'New fleet partnership', clientName: 'Saffron', keyTerms: 'electric fleet', fallback: true }), 'Saffron electric fleet');
  assert.equal(buildSearchQuery({ clientName: 'Saffron', fallback: true }), 'Saffron');
});

test('outlet query is scoped to the requested outlet domain', () => {
  assert.equal(buildOutletQuery({ query: '"New fleet partnership"', url: 'https://www.gulfnews.com/news' }), 'site:gulfnews.com "New fleet partnership"');
  assert.equal(buildOutletQuery({ query: 'Saffron electric fleet', url: 'not a URL' }), 'Saffron electric fleet');
});

test('report readiness requires verification and a screenshot plus all report fields', () => {
  const article = {
    title: 'Saffron launches a new fleet',
    publishedAt: '2026-11-01',
    outletName: 'Gulf News',
    medium: 'online',
    link: 'https://gulfnews.com/example',
    tone: 'positive',
    measurementCm: 3,
    screenshotDataUrl: 'data:image/jpeg;base64,Zm9v',
    verificationStatus: 'approved',
  };
  assert.deepEqual(getCoverageCompleteness(article), []);
  assert.deepEqual(getReportReadiness([article]), { ready: true, reasons: [] });
  assert.equal(getReportReadiness([{ ...article, screenshotDataUrl: '' }]).ready, false);
  assert.equal(getReportReadiness([{ ...article, verificationStatus: 'pending' }]).ready, false);
});

test('report links reject non-web schemes and credential-bearing URLs', () => {
  assert.deepEqual(getCoverageCompleteness({
    title: 'Reference', publishedAt: '2026-11-01', outletName: 'Aletihad', medium: 'online',
    link: 'https://user:secret@example.com/article', tone: 'positive', measurementCm: 1,
    screenshotDataUrl: 'data:image/jpeg;base64,Zm9v', verificationStatus: 'approved',
  }).includes('working article link'), true);
});

test('tone totals preserve positive, neutral and negative categories', () => {
  assert.deepEqual(countByTone([
    { tone: 'positive' },
    { tone: 'neutral' },
    { tone: 'negative' },
    { tone: 'negative' },
  ]), { positive: 1, neutral: 1, negative: 2 });
});
