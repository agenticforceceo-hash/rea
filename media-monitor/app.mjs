import {
  buildOutletQuery,
  buildSearchQuery,
  calculateRave,
  countByTone,
  getCoverageCompleteness,
  getMonitoringWindow,
  getReportReadiness,
  isHttpUrl,
  isScreenshot,
} from './core.mjs';

const STORAGE_KEY = 'signal-desk.workspace.v1';
const PREFERENCES_KEY = 'signal-desk.preferences.v1';
const SAMPLE_OUTLETS = [
  { id: 'outlet-aletihad', name: 'Aletihad', url: 'https://en.aletihad.ae/', language: 'EN', category: 'News' },
  { id: 'outlet-wam', name: 'WAM · Emirates News Agency', url: 'https://www.wam.ae/', language: 'EN', category: 'News agency' },
  { id: 'outlet-gulf-today', name: 'Gulf Today', url: 'https://www.gulftoday.ae/', language: 'EN', category: 'News' },
  { id: 'outlet-gulf-news', name: 'Gulf News', url: 'https://gulfnews.com/', language: 'EN', category: 'News' },
  { id: 'outlet-khaleej-times', name: 'Khaleej Times', url: 'https://www.khaleejtimes.com/', language: 'EN', category: 'News' },
  { id: 'outlet-dmo', name: 'Dubai Media Office', url: 'https://www.mediaoffice.ae/', language: 'EN', category: 'Government' },
  { id: 'outlet-national', name: 'The National', url: 'https://www.thenationalnews.com/news/', language: 'EN', category: 'News' },
  { id: 'outlet-gulf-time', name: 'The Gulf Time', url: 'https://gulftime.ae/', language: 'EN', category: 'News' },
  { id: 'outlet-zawya', name: 'Zawya', url: 'https://www.zawya.com/en/', language: 'EN', category: 'Business' },
  { id: 'outlet-arabian-business', name: 'Arabian Business', url: 'https://www.arabianbusiness.com/', language: 'EN', category: 'Business' },
  { id: 'outlet-riyadh-daily', name: 'Riyadh Daily', url: 'https://alriyadhdaily.com/', language: 'EN', category: 'News' },
  { id: 'outlet-emirati-times', name: 'Emirati Times', url: 'https://emiratitimes.com/', language: 'EN', category: 'News' },
  { id: 'outlet-uae-news', name: 'UAE News 24/7', url: 'https://uaenews247.com/', language: 'EN', category: 'News' },
  { id: 'outlet-spa', name: 'Saudi Press Agency', url: 'https://www.spa.gov.sa/en', language: 'EN', category: 'News agency' },
  { id: 'outlet-construction-week', name: 'Construction Week', url: 'https://www.constructionweekonline.com/', language: 'EN', category: 'Trade' },
  { id: 'outlet-asharq', name: 'Asharq Al-Awsat', url: 'https://aawsat.com/', language: 'AR', category: 'News' },
  { id: 'outlet-alarabiya', name: 'Al Arabiya', url: 'https://www.alarabiya.net/', language: 'AR', category: 'News' },
  { id: 'outlet-ahram', name: 'Al Ahram', url: 'https://gate.ahram.org.eg/', language: 'AR', category: 'News' },
  { id: 'outlet-alkhaleej', name: 'Al Khaleej', url: 'https://www.alkhaleej.ae/', language: 'AR', category: 'News' },
  { id: 'outlet-albayan', name: 'Al Bayan', url: 'https://www.albayan.ae/', language: 'AR', category: 'News' },
  { id: 'outlet-alittihad', name: 'Al Ittihad', url: 'https://www.alittihad.ae/', language: 'AR', category: 'News' },
  { id: 'outlet-alriyadh', name: 'Al Riyadh', url: 'https://www.alriyadh.com/', language: 'AR', category: 'News' },
  { id: 'outlet-okaz', name: 'Okaz', url: 'https://www.okaz.com.sa/', language: 'AR', category: 'News' },
  { id: 'outlet-alwatan', name: 'Al Watan', url: 'https://www.alwatan.com.sa/', language: 'AR', category: 'News' },
  { id: 'outlet-aljazirah', name: 'Al Jazirah', url: 'https://www.al-jazirah.com/', language: 'AR', category: 'News' },
];

const ICONS = {
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  radar: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v8.5l6.2 3.5M7 18.5l2.1-2.1M12 7v1"/>',
  layers: '<path d="m12 3.5 8.5 4.7-8.5 4.7-8.5-4.7L12 3.5Z"/><path d="m4.2 12.2 7.8 4.3 7.8-4.3M4.2 16.2l7.8 4.3 7.8-4.3"/>',
  check: '<path d="M20 11.2v.8a8 8 0 1 1-4.8-7.3"/><path d="m8.6 11.8 3 3L21 5.5"/>',
  file: '<path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4M9 12h6M9 16h6"/>',
  sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h9M17 18h3"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="15" cy="18" r="2"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h13M13 6l6 6-6 6"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1.5 1.5 0 0 0-1.5-1.5h-9A1.5 1.5 0 0 0 4 5v9A1.5 1.5 0 0 0 5.5 15.5H8"/>',
  download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 18v2h16v-2"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.8 12h16.4M12 3.5c2.4 2.4 3.5 5.2 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.2-3.5-8.5s1.1-6.1 3.5-8.5Z"/>',
  alert: '<path d="m12 4 9 16H3l9-16Z"/><path d="M12 9v5m0 3h.01"/>',
};

function icon(name, extraClass = '') {
  return `<svg class="${extraClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] ?? ICONS.grid}</svg>`;
}

function uid(prefix = 'id') {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  return `${prefix}-${random}`;
}

function localDateISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysAgoISO(days, now = new Date()) {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return localDateISO(date);
}

function demoDateTime(daysAgo = 0, hour = 9) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 20, 0, 0);
  return date.toISOString();
}

function makeSeedState() {
  const today = localDateISO();
  const yesterday = daysAgoISO(1);
  const outlets = SAMPLE_OUTLETS.map((outlet) => ({ ...outlet }));
  const clients = [
    {
      id: 'client-blue-dune', name: 'Blue Dune Logistics', executiveName: 'Mariam Al Khatri', executiveEmail: 'mariam@blue-dune.example', contactName: 'Communications desk', contactEmail: 'press@blue-dune.example', keyTerms: 'low-emission delivery, logistics hub, electric fleet', createdAt: demoDateTime(12),
      pressReleases: [{ id: 'release-blue-dune-hub', title: 'Blue Dune Logistics opens a low-emission delivery hub in Dubai', issuedAt: yesterday, monitoringType: 'daily' }],
    },
    {
      id: 'client-cedarline', name: 'Cedarline Energy', executiveName: 'Omar Rahal', executiveEmail: 'omar@cedarline.example', contactName: 'Media relations', contactEmail: 'media@cedarline.example', keyTerms: 'solar storage, clean energy, regional investment', createdAt: demoDateTime(9),
      pressReleases: [{ id: 'release-cedarline-storage', title: 'Cedarline Energy announces a regional battery storage partnership', issuedAt: daysAgoISO(4), monitoringType: 'magazine' }],
    },
    {
      id: 'client-wadi-urban', name: 'Wadi Urban Living', executiveName: 'Leila Haddad', executiveEmail: 'leila@wadi-urban.example', contactName: 'Corporate affairs', contactEmail: 'hello@wadi-urban.example', keyTerms: 'urban design, community housing, sustainable development', createdAt: demoDateTime(5),
      pressReleases: [{ id: 'release-wadi-quarter', title: 'Wadi Urban Living reveals plans for a walkable community district', issuedAt: today, monitoringType: 'daily' }],
    },
  ];
  const runs = [
    { id: 'run-blue-dune-hub', clientId: 'client-blue-dune', releaseId: 'release-blue-dune-hub', mode: 'daily', extended: false, fallback: false, searchEngines: { google: true, bing: false }, searchedOutlets: ['outlet-gulf-news', 'outlet-wam', 'outlet-khaleej-times', 'outlet-national', 'outlet-dmo', 'outlet-zawya', 'outlet-arabian-business', 'outlet-aletihad'], createdAt: demoDateTime(0, 8), updatedAt: demoDateTime(0, 9) },
    { id: 'run-cedarline-storage', clientId: 'client-cedarline', releaseId: 'release-cedarline-storage', mode: 'magazine', extended: false, fallback: false, searchEngines: { google: true, bing: true }, searchedOutlets: ['outlet-zawya', 'outlet-arabian-business', 'outlet-construction-week', 'outlet-gulf-news', 'outlet-asharq', 'outlet-alarabiya', 'outlet-spa', 'outlet-dmo', 'outlet-albayan', 'outlet-alriyadh', 'outlet-alittihad', 'outlet-national'], createdAt: demoDateTime(1, 8), updatedAt: demoDateTime(0, 10) },
  ];
  const coverage = [
    { id: 'coverage-blue-gulf-news', clientId: 'client-blue-dune', releaseId: 'release-blue-dune-hub', runId: 'run-blue-dune-hub', outletId: 'outlet-gulf-news', outletName: 'Gulf News', title: 'Blue Dune opens a cleaner last-mile hub in Dubai', publishedAt: today, medium: 'online', link: 'https://example.com/demo/blue-dune/gulf-news', tone: 'positive', measurementCm: 4.2, columns: 1, wordCount: 640, screenshotDataUrl: '', verificationStatus: 'approved', verificationNote: '', verifiedBy: 'Mariam Al Khatri', createdAt: demoDateTime(0, 9) },
    { id: 'coverage-blue-wam', clientId: 'client-blue-dune', releaseId: 'release-blue-dune-hub', runId: 'run-blue-dune-hub', outletId: 'outlet-wam', outletName: 'WAM · Emirates News Agency', title: 'New logistics hub supports lower-emission delivery goals', publishedAt: today, medium: 'online', link: 'https://example.com/demo/blue-dune/wam', tone: 'neutral', measurementCm: 3.1, columns: 1, wordCount: 410, screenshotDataUrl: '', verificationStatus: 'pending', verificationNote: '', verifiedBy: '', createdAt: demoDateTime(0, 9) },
    { id: 'coverage-blue-gulf-today', clientId: 'client-blue-dune', releaseId: 'release-blue-dune-hub', runId: 'run-blue-dune-hub', outletId: 'outlet-gulf-today', outletName: 'Gulf Today', title: 'Residents seek clarity on delivery traffic near new hub', publishedAt: yesterday, medium: 'online', link: 'https://example.com/demo/blue-dune/gulf-today', tone: 'negative', measurementCm: 3.7, columns: 1, wordCount: 522, screenshotDataUrl: '', verificationStatus: 'pending', verificationNote: 'Please verify the context and the headline before reporting.', verifiedBy: '', createdAt: demoDateTime(1, 13) },
    { id: 'coverage-blue-khaleej', clientId: 'client-blue-dune', releaseId: 'release-blue-dune-hub', runId: 'run-blue-dune-hub', outletId: 'outlet-khaleej-times', outletName: 'Khaleej Times', title: 'Blue Dune joins UAE clean transport push with new hub', publishedAt: yesterday, medium: 'print', link: 'https://example.com/demo/blue-dune/khaleej-times', tone: 'positive', measurementCm: 2.8, columns: 3, wordCount: 0, screenshotDataUrl: '', verificationStatus: 'unreviewed', verificationNote: '', verifiedBy: '', createdAt: demoDateTime(1, 15) },
    { id: 'coverage-cedarline-zawya', clientId: 'client-cedarline', releaseId: 'release-cedarline-storage', runId: 'run-cedarline-storage', outletId: 'outlet-zawya', outletName: 'Zawya', title: 'Cedarline sets out a new route for regional battery storage', publishedAt: yesterday, medium: 'online', link: 'https://example.com/demo/cedarline/zawya', tone: 'positive', measurementCm: 4.4, columns: 1, wordCount: 710, screenshotDataUrl: '', verificationStatus: 'pending', verificationNote: '', verifiedBy: '', createdAt: demoDateTime(1, 10) },
    { id: 'coverage-cedarline-construction', clientId: 'client-cedarline', releaseId: 'release-cedarline-storage', runId: 'run-cedarline-storage', outletId: 'outlet-construction-week', outletName: 'Construction Week', title: 'Storage partnership puts grid timelines under the spotlight', publishedAt: daysAgoISO(3), medium: 'print', link: 'https://example.com/demo/cedarline/construction-week', tone: 'neutral', measurementCm: 2.2, columns: 2, wordCount: 0, screenshotDataUrl: '', verificationStatus: 'unreviewed', verificationNote: '', verifiedBy: '', createdAt: demoDateTime(3, 11) },
    { id: 'coverage-wadi-national', clientId: 'client-wadi-urban', releaseId: 'release-wadi-quarter', runId: '', outletId: 'outlet-national', outletName: 'The National', title: 'A new walkable district aims to put daily needs within reach', publishedAt: today, medium: 'online', link: 'https://example.com/demo/wadi-urban/national', tone: 'positive', measurementCm: 3.8, columns: 1, wordCount: 590, screenshotDataUrl: '', verificationStatus: 'unreviewed', verificationNote: '', verifiedBy: '', createdAt: demoDateTime(0, 11) },
  ];
  return {
    schemaVersion: 1, clients, outlets, runs, coverage,
    reviewRequests: [{ id: 'review-blue-dune-initial', clientId: 'client-blue-dune', coverageIds: ['coverage-blue-gulf-news', 'coverage-blue-wam', 'coverage-blue-gulf-today', 'coverage-blue-khaleej'], status: 'sent', requestedAt: demoDateTime(0, 9), requestedBy: 'Monitoring team' }],
    reports: [],
    activity: [
      { id: uid('activity'), clientId: 'client-blue-dune', text: 'A negative mention was flagged for executive review.', createdAt: demoDateTime(0, 9), type: 'attention' },
      { id: uid('activity'), clientId: 'client-blue-dune', text: 'Eight outlet checks logged for the current monitoring run.', createdAt: demoDateTime(0, 8), type: 'search' },
    ],
  };
}

function isRecord(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function asString(value) { return typeof value === 'string' ? value : ''; }

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return makeSeedState();
    const parsed = JSON.parse(raw);
    if (parsed?.schemaVersion !== 1 || !Array.isArray(parsed.clients) || !Array.isArray(parsed.outlets) || !Array.isArray(parsed.coverage)) return makeSeedState();

    const clients = parsed.clients.filter((client) => isRecord(client) && asString(client.id).trim() && asString(client.name).trim()).map((client) => ({
      ...client,
      id: client.id,
      name: client.name,
      keyTerms: asString(client.keyTerms),
      pressReleases: (Array.isArray(client.pressReleases) ? client.pressReleases : [])
        .filter((release) => isRecord(release) && asString(release.id).trim() && asString(release.title).trim())
        .map((release) => ({ ...release, monitoringType: release.monitoringType === 'magazine' ? 'magazine' : 'daily' })),
    }));
    const clientIds = new Set(clients.map((client) => client.id));
    const releaseOwners = new Map(clients.flatMap((client) => client.pressReleases.map((release) => [release.id, client.id])));
    const outlets = parsed.outlets.filter((outlet) => isRecord(outlet) && asString(outlet.id).trim() && asString(outlet.name).trim()).map((outlet) => ({
      ...outlet, id: outlet.id, name: outlet.name, url: asString(outlet.url), language: asString(outlet.language), category: asString(outlet.category),
    }));
    const runs = (Array.isArray(parsed.runs) ? parsed.runs : []).filter((run) => isRecord(run) && asString(run.id).trim() && clientIds.has(run.clientId) && releaseOwners.get(run.releaseId) === run.clientId).map((run) => ({
      ...run,
      mode: run.mode === 'magazine' ? 'magazine' : 'daily',
      extended: run.extended === true,
      fallback: run.fallback === true,
      searchEngines: isRecord(run.searchEngines) ? { google: run.searchEngines.google === true, bing: run.searchEngines.bing === true } : { google: false, bing: false },
      searchedOutlets: Array.isArray(run.searchedOutlets) ? run.searchedOutlets.filter((id) => typeof id === 'string') : [],
    }));
    const coverage = parsed.coverage.filter((article) => isRecord(article) && asString(article.id).trim() && clientIds.has(article.clientId) && releaseOwners.get(article.releaseId) === article.clientId).map((article) => ({
      ...article,
      title: asString(article.title),
      outletName: asString(article.outletName),
      publishedAt: asString(article.publishedAt),
      link: asString(article.link),
      screenshotDataUrl: asString(article.screenshotDataUrl),
    }));
    const reviewRequests = (Array.isArray(parsed.reviewRequests) ? parsed.reviewRequests : []).filter((request) => isRecord(request) && asString(request.id).trim() && clientIds.has(request.clientId)).map((request) => ({
      ...request, coverageIds: Array.isArray(request.coverageIds) ? request.coverageIds.filter((id) => typeof id === 'string') : [],
    }));
    const reports = (Array.isArray(parsed.reports) ? parsed.reports : []).filter((report) => isRecord(report) && asString(report.id).trim() && clientIds.has(report.clientId) && Array.isArray(report.items)).map((report) => {
      const normalized = {
        ...report,
        clientName: asString(report.clientName),
        finalApprovalRequestedAt: asString(report.finalApprovalRequestedAt),
        status: ['draft', 'pending-final', 'approved', 'changes', 'sent'].includes(report.status) ? report.status : 'draft',
        coverageIds: Array.isArray(report.coverageIds) ? report.coverageIds.filter((id) => typeof id === 'string') : [],
        items: report.items.filter(isRecord),
      };
      // Before explicit email handoff was added, compilation incorrectly set pending-final.
      if (normalized.status === 'pending-final' && !normalized.finalApprovalRequestedAt) normalized.status = 'draft';
      return normalized;
    });
    const activity = (Array.isArray(parsed.activity) ? parsed.activity : []).filter((item) => isRecord(item) && clientIds.has(item.clientId)).map((item) => ({
      ...item, id: asString(item.id), text: asString(item.text), createdAt: asString(item.createdAt),
    }));
    return { schemaVersion: 1, clients, outlets, runs, coverage, reviewRequests, reports, activity };
  } catch { /* Ignore malformed browser storage and use the local demo workspace. */ }
  return makeSeedState();
}

function loadPreferences() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}');
    return isRecord(parsed) ? parsed : {};
  } catch { return {}; }
}

let state = loadState();
let preferences = loadPreferences();
let currentView = 'overview';
let selectedClientId = state.clients.some((client) => client.id === preferences.clientId) ? preferences.clientId : state.clients[0]?.id ?? '';
let selectedReleaseId = '';
let activeRole = ['monitor', 'executive', 'head'].includes(preferences.role) ? preferences.role : 'monitor';
let coverageToneFilter = 'all';
let coverageSearchTerm = '';
let outletSearchTerm = '';
let showDismissedBanner = preferences.bannerDismissed === true;
let activeScreenshotData = '';
let screenshotPending = false;
let screenshotToken = 0;
let toastTimer = 0;

const pageContent = document.querySelector('#pageContent');
const dialog = document.querySelector('#appDialog');
const dialogTitle = document.querySelector('#dialogTitle');
const dialogEyebrow = document.querySelector('#dialogEyebrow');
const dialogBody = document.querySelector('#dialogBody');

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
function safeUrl(value) { if (!isHttpUrl(value)) return ''; try { return new URL(value).href; } catch { return ''; } }
function safeEmail(value) { const email = String(value ?? '').trim(); return /^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/.test(email) ? email : ''; }
function nowISO() { return new Date().toISOString(); }
function getClient(clientId = selectedClientId) { return state.clients.find((client) => client.id === clientId) ?? null; }
function getRelease(client = getClient(), releaseId = selectedReleaseId) { return client?.pressReleases?.find((release) => release.id === releaseId) ?? client?.pressReleases?.[0] ?? null; }
function getOutlet(outletId) { return state.outlets.find((outlet) => outlet.id === outletId) ?? null; }
function getRun(clientId, releaseId) { return state.runs.filter((run) => run.clientId === clientId && run.releaseId === releaseId).sort((a, b) => String(b.updatedAt ?? b.createdAt).localeCompare(String(a.updatedAt ?? a.createdAt)))[0] ?? null; }
function latestRunForClient(clientId) { return state.runs.filter((run) => run.clientId === clientId).sort((a, b) => String(b.updatedAt ?? b.createdAt).localeCompare(String(a.updatedAt ?? a.createdAt)))[0] ?? null; }
function articlesForClient(clientId = selectedClientId) { return state.coverage.filter((article) => article.clientId === clientId); }
function articleRave(article) { return calculateRave({ medium: article.medium, measurementCm: article.measurementCm, columns: article.columns }); }
function dateValue(value) { if (!value) return null; const date = new Date(/^\d{4}-\d\d-\d\d$/.test(value) ? `${value}T12:00:00` : value); return Number.isNaN(date.getTime()) ? null : date; }
function formatDate(value, options = { month: 'short', day: 'numeric', year: 'numeric' }) { const date = dateValue(value); return date ? new Intl.DateTimeFormat('en', options).format(date) : '—'; }
function formatDateTime(value) { const date = dateValue(value); return date ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date) : '—'; }
function formatNumber(value) { return new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format(Number(value) || 0); }
function formatRave(value) { return new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(Number(value) || 0); }
function shortName(value = '') { return String(value).split(/[\s·-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '—'; }
function platformLabel(medium) { return medium === 'print' ? 'Print' : 'Online'; }
function toneLabel(tone) { return ({ positive: 'Positive', neutral: 'Neutral', negative: 'Negative' })[tone] ?? 'Unclassified'; }
function statusLabel(status) { return ({ unreviewed: 'Not reviewed', pending: 'Awaiting review', approved: 'Verified', changes: 'Changes requested', 'pending-final': 'Awaiting final approval', sent: 'Sent to client', rejected: 'Changes requested', draft: 'Draft · unsent' })[status] ?? 'Draft'; }
function reportStatusLabel(status) { return ({ draft: 'Draft · unsent', 'pending-final': 'Awaiting final approval', approved: 'Final approval complete', changes: 'Changes requested', sent: 'Sent to client' })[status] ?? 'Draft'; }
function toneBadge(tone) { return `<span class="tone-badge tone-${esc(tone)}">${esc(toneLabel(tone))}</span>`; }
function statusBadge(status, context = 'coverage') { const style = status === 'approved' ? 'approved' : status === 'sent' ? 'sent' : status === 'changes' || status === 'rejected' ? 'changes' : status === 'pending' || status === 'pending-final' ? 'pending' : 'draft'; const label = context === 'report' ? reportStatusLabel(status) : statusLabel(status); return `<span class="status-badge status-${style}">${esc(label)}</span>`; }
function platformBadge(medium) { return `<span class="platform-badge">${esc(platformLabel(medium))}</span>`; }
function safeImage(value) { return isScreenshot(value) ? value : ''; }
function currentRun() { return getRun(selectedClientId, selectedReleaseId); }
function currentArticles() { return articlesForClient(selectedClientId); }
function latestReport(clientId = selectedClientId) { return state.reports.filter((report) => report.clientId === clientId).sort((a, b) => String(b.compiledAt).localeCompare(String(a.compiledAt)))[0] ?? null; }
function hasCoverageChangedSinceReport(report, articles) {
  const reportCoverageIds = Array.isArray(report?.coverageIds) ? report.coverageIds : [];
  if (reportCoverageIds.length !== articles.length) return true;
  const snapshots = new Map((Array.isArray(report?.items) ? report.items : []).filter(isRecord).map((item) => [item.id, item]));
  const trackedFields = ['clientId', 'releaseId', 'outletId', 'outletName', 'title', 'publishedAt', 'medium', 'link', 'tone', 'measurementCm', 'columns', 'wordCount', 'screenshotDataUrl', 'source', 'notes', 'verificationStatus', 'verificationNote', 'verifiedBy', 'verifiedAt'];
  return articles.some((article) => {
    if (!reportCoverageIds.includes(article.id)) return true;
    const snapshot = snapshots.get(article.id);
    if (!snapshot || String(article.updatedAt ?? article.createdAt) > String(report.compiledAt)) return true;
    return trackedFields.some((field) => article[field] !== snapshot[field]);
  });
}
function getSearchProgress(run) {
  if (!run) return { done: 0, total: state.outlets.length + 2, percent: 0, outletCount: 0, engineCount: 0 };
  const outletCount = (run.searchedOutlets ?? []).filter((id) => state.outlets.some((outlet) => outlet.id === id)).length;
  const engineCount = Number(run.searchEngines?.google === true) + Number(run.searchEngines?.bing === true);
  const total = state.outlets.length + 2; const done = outletCount + engineCount;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0, outletCount, engineCount };
}
function getWindowForRun(run, release = getRelease()) {
  const anchor = dateValue(run?.windowEndAt ?? run?.createdAt) ?? new Date();
  return getMonitoringWindow(run?.mode ?? release?.monitoringType ?? 'daily', run?.extended === true, anchor);
}
function timeWindowLabel(run, release = getRelease()) { const mode = run?.mode ?? release?.monitoringType ?? 'daily'; if (mode === 'magazine') return 'Up to 1 month · magazine monitoring'; return run?.extended ? 'Extended search · last 3 days' : 'Initial search · rolling 24 hours'; }
function timeWindowDateLabel(run, release = getRelease()) { const window = getWindowForRun(run, release); const format = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric' }); return `${format.format(window.start)} – ${format.format(window.end)}`; }
function searchTerm(client, release, run) { return buildSearchQuery({ title: release?.title ?? '', clientName: client?.name ?? '', keyTerms: client?.keyTerms ?? '', fallback: run?.fallback === true }); }
function createRun(client, release, { fresh = false } = {}) {
  if (!client || !release) return null;
  const current = getRun(client.id, release.id);
  if (current && !fresh) return current;
  const startedAt = nowISO();
  const run = { id: uid('run'), clientId: client.id, releaseId: release.id, mode: release.monitoringType === 'magazine' ? 'magazine' : 'daily', extended: false, fallback: false, searchEngines: { google: false, bing: false }, searchedOutlets: [], windowEndAt: startedAt, createdAt: startedAt, updatedAt: startedAt };
  state.runs.push(run); return run;
}
function addActivity(clientId, text, type = 'note') { state.activity.unshift({ id: uid('activity'), clientId, text, createdAt: nowISO(), type }); state.activity = state.activity.slice(0, 50); }
function persist({ rerender = false } = {}) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    preferences = { ...preferences, clientId: selectedClientId, role: activeRole, bannerDismissed: showDismissedBanner };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch { toast('Your changes are visible in this tab, but the browser could not save them. Remove large screenshots or export your workspace.', 'warning'); }
  renderSidebar();
  if (rerender) renderPage();
}
function toast(message, kind = 'success') {
  const region = document.querySelector('#toastRegion'); const node = document.createElement('div');
  node.className = `toast ${kind === 'warning' ? 'toast--warning' : kind === 'error' ? 'toast--error' : ''}`; node.textContent = message; region.replaceChildren(node);
  window.clearTimeout(toastTimer); toastTimer = window.setTimeout(() => node.remove(), 4300);
}
function showDialog(title, eyebrow, html) { dialogTitle.textContent = title; dialogEyebrow.textContent = eyebrow; dialogBody.innerHTML = html; dialog.showModal(); }
function cancelScreenshotCompression() { screenshotToken += 1; screenshotPending = false; }
function closeDialog() { cancelScreenshotCompression(); if (dialog.open) dialog.close(); dialogBody.innerHTML = ''; activeScreenshotData = ''; }
function navigate(view) {
  if (!['overview', 'search', 'coverage', 'approvals', 'reports', 'setup'].includes(view)) return;
  currentView = view; document.querySelector('#sidebar').classList.remove('is-open'); document.querySelector('#mobileMenu').setAttribute('aria-expanded', 'false');
  document.querySelectorAll('.nav-link[data-view]').forEach((button) => button.classList.toggle('is-active', button.dataset.view === view));
  const label = ({ overview: 'Overview', search: 'Search plan', coverage: 'Coverage', approvals: 'Approvals', reports: 'Reports', setup: 'Clients & outlets' })[view];
  document.querySelector('#breadcrumbCurrent').textContent = label; renderPage(); pageContent.focus({ preventScroll: true });
}
function renderSidebar() {
  const select = document.querySelector('#clientSelector'); const current = selectedClientId;
  select.innerHTML = state.clients.length ? state.clients.map((client) => `<option value="${esc(client.id)}">${esc(client.name)}</option>`).join('') : '<option value="">No clients yet</option>';
  select.disabled = state.clients.length === 0;
  if (state.clients.some((client) => client.id === current)) select.value = current;
  else if (state.clients[0]) { selectedClientId = state.clients[0].id; select.value = selectedClientId; }
  document.querySelector('#roleSelector').value = activeRole;
  const roleNames = { monitor: 'Monitoring team', executive: 'Executive reviewer', head: 'Monitoring Head' }; const initials = { monitor: 'MT', executive: 'ER', head: 'MH' };
  document.querySelector('#roleName').textContent = roleNames[activeRole]; document.querySelector('#roleCaption').textContent = 'Workspace role'; document.querySelector('#avatarInitials').textContent = initials[activeRole];
  const clientCoverage = currentArticles(); document.querySelector('#coverageNavCount').textContent = String(clientCoverage.length);
  const pendingCount = clientCoverage.filter((article) => ['unreviewed', 'pending', 'changes'].includes(article.verificationStatus)).length;
  const finalPending = ['draft', 'pending-final'].includes(latestReport()?.status) ? 1 : 0; const attentionCount = pendingCount + finalPending;
  const approvalCount = document.querySelector('#approvalNavCount'); approvalCount.textContent = String(attentionCount); approvalCount.hidden = attentionCount === 0;
  const run = latestRunForClient(selectedClientId); document.querySelector('#workspaceStatus').textContent = run ? `${getSearchProgress(run).outletCount}/${state.outlets.length} outlet checks logged` : 'No active search';
  document.querySelector('.mini-status-dot').classList.toggle('is-live', Boolean(run));
  document.querySelector('#currentDate').textContent = new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());
  document.querySelector('#demoBanner').classList.toggle('is-dismissed', showDismissedBanner);
}
function renderPage() {
  if (!selectedClientId && state.clients[0]) selectedClientId = state.clients[0].id;
  if (!selectedReleaseId || !getClient()?.pressReleases?.some((release) => release.id === selectedReleaseId)) selectedReleaseId = getClient()?.pressReleases?.[0]?.id ?? '';
  renderSidebar();
  const views = { overview: renderOverview, search: renderSearchPlan, coverage: renderCoverage, approvals: renderApprovals, reports: renderReports, setup: renderSetup };
  pageContent.innerHTML = views[currentView]();
  if (currentView === 'search') applySearchFilter('outletSearch', '.outlet-row[data-outlet-name]', 'data-outlet-name');
  if (currentView === 'setup') applySearchFilter('manageOutletSearch', '.outlet-manage-row[data-outlet-name]', 'data-outlet-name');
}
function pageHeading(eyebrow, title, description, actions = '') { return `<div class="page-heading"><div class="page-heading-copy"><div class="eyebrow">${esc(eyebrow)}</div><h1>${title}</h1><p>${description}</p></div>${actions ? `<div class="heading-actions">${actions}</div>` : ''}</div>`; }
function metricCard(label, value, foot, iconName, iconClass = '') { return `<article class="metric-card"><div class="metric-top"><span>${esc(label)}</span><span class="metric-icon ${iconClass}">${icon(iconName)}</span></div><div class="metric-value">${value}</div><div class="metric-foot">${foot}</div></article>`; }
function renderCoveragePreviewRow(article) {
  const outlet = getOutlet(article.outletId);
  return `<div class="coverage-row ${article.tone === 'negative' ? 'is-negative' : ''}"><div class="article-title-cell"><span class="article-title" title="${esc(article.title)}">${esc(article.title)}</span><div class="article-meta"><span>${esc(formatDate(article.publishedAt, { month: 'short', day: 'numeric' }))}</span><span class="meta-dot"></span><span>${esc(article.wordCount ? `${formatNumber(article.wordCount)} words` : `${Number(article.measurementCm || 0).toFixed(1)} cm`)}</span></div></div><div class="outlet-cell"><span class="outlet-monogram">${esc(shortName(article.outletName))}</span><span class="outlet-name" title="${esc(article.outletName)}">${esc(outlet?.name ?? article.outletName)}</span></div><div class="tone-cell">${toneBadge(article.tone)}</div><div class="row-rave">${formatRave(articleRave(article))}<small>RAVE</small></div></div>`;
}
function renderRunCard(client) {
  const run = latestRunForClient(client?.id);
  if (!run) return `<section class="card monitor-card"><div class="card-header"><div><h2 class="card-title">Monitoring pulse</h2><p class="card-subtitle">Start a search for this client’s press release.</p></div>${icon('radar')}</div><div class="monitor-card-body"><div class="monitor-date-line"><div><strong>Ready to set the scope</strong><small>Exact PR title · Google · Bing · ${state.outlets.length} outlets</small></div><span class="window-badge">24 hours</span></div><div class="monitor-cta"><button class="button button-primary" data-action="go-search">Open search plan ${icon('arrow')}</button></div></div></section>`;
  const progress = getSearchProgress(run); const release = client?.pressReleases?.find((item) => item.id === run.releaseId);
  return `<section class="card monitor-card"><div class="card-header"><div><h2 class="card-title">Monitoring pulse</h2><p class="card-subtitle">${esc(release?.title ?? 'Current press release')}</p></div><span class="window-badge">${run.mode === 'magazine' ? '30 days' : run.extended ? '3 days' : '24 hours'}</span></div><div class="monitor-card-body"><div class="monitor-date-line"><div><strong>${esc(timeWindowDateLabel(run, release))}</strong><small>${esc(timeWindowLabel(run, release))}</small></div><span class="subtle-label">${state.outlets.length} outlets</span></div><div class="monitor-progress-head"><span>Checks completed</span><strong>${progress.done} / ${progress.total}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${progress.percent}%"></div></div><div class="search-engine-checks"><div class="engine-pill ${run.searchEngines?.google ? 'is-done' : ''}"><span>Google</span><span class="engine-check">${run.searchEngines?.google ? '✓' : ''}</span></div><div class="engine-pill ${run.searchEngines?.bing ? 'is-done' : ''}"><span>Bing</span><span class="engine-check">${run.searchEngines?.bing ? '✓' : ''}</span></div></div><div class="monitor-cta"><button class="button button-primary" data-action="go-search">Continue search ${icon('arrow')}</button><button class="button button-secondary" data-action="add-coverage">Add coverage</button></div></div></section>`;
}
function renderDistribution() {
  const counts = state.clients.map((client) => ({ client, count: articlesForClient(client.id).length })); const max = Math.max(1, ...counts.map((item) => item.count));
  return `<section class="card distribution-card"><div class="card-header"><div><h2 class="card-title">Coverage by client</h2><p class="card-subtitle">Across this demo workspace</p></div><button class="text-button" data-action="go-setup">Manage clients</button></div><div class="distribution-list">${counts.map(({ client, count }) => `<div class="distribution-item"><span class="distribution-client" title="${esc(client.name)}">${esc(client.name)}</span><div class="distribution-track"><div class="distribution-fill" style="width:${Math.max(count ? 7 : 0, Math.round((count / max) * 100))}%"></div></div><span class="distribution-count">${count}</span></div>`).join('')}</div></section>`;
}
function renderActivityCard(clientId) {
  const events = state.activity.filter((item) => item.clientId === clientId).slice(0, 5);
  return `<section class="card activity-card"><div class="card-header"><div><h2 class="card-title">Recent activity</h2><p class="card-subtitle">Monitoring and approval trail</p></div><span class="subtle-label">LOCAL</span></div><div class="activity-list">${events.length ? events.map((item) => `<div class="activity-row"><span class="activity-dot activity-dot--${esc(item.type)}"></span><div><strong>${esc(item.text)}</strong><small>${esc(formatDateTime(item.createdAt))}</small></div></div>`).join('') : '<div class="empty-inline">No activity recorded yet.</div>'}</div></section>`;
}

function renderOverview() {
  const client = getClient(); const articles = currentArticles().slice().sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)) || String(b.createdAt).localeCompare(String(a.createdAt)));
  const negative = articles.filter((article) => article.tone === 'negative'); const awaiting = articles.filter((article) => ['unreviewed', 'pending', 'changes'].includes(article.verificationStatus)); const totalRave = articles.reduce((sum, article) => sum + articleRave(article), 0); const latest = articles.slice(0, 5);
  const name = client?.name ?? 'your clients'; const hour = new Date().getHours(); const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const actions = `${activeRole === 'monitor' ? '<button class="button button-secondary" data-action="add-coverage"><span class="button-icon">＋</span>Add coverage</button>' : ''}<button class="button button-primary" data-action="go-search">Start monitoring ${icon('arrow')}</button>`;
  return `${pageHeading('Monitoring workspace', `${greeting}, team.`, `Here’s the latest on <strong>${esc(name)}</strong>. Keep the signal clear: verify every reference, surface negative coverage, then send only an approved report.`, actions)}<div class="metrics-grid">${metricCard('Coverage items', formatNumber(articles.length), `<strong>${articles.length ? 'Tracked' : 'Ready'}</strong><span>for this client</span>`, 'layers')}${metricCard('Negative coverage', formatNumber(negative.length), `<span class="negative-copy">${negative.length ? 'Priority review' : 'No negative items'}</span><span>highlighted separately</span>`, 'alert', 'metric-icon--negative')}${metricCard('Awaiting verification', formatNumber(awaiting.length), `<span>${awaiting.length ? 'Executive action' : 'All clear'}</span><span>first review stage</span>`, 'clock', 'metric-icon--gold')}${metricCard('Estimated RAVE', formatRave(totalRave), `<span>Based on recorded size</span><span>not an audited media value</span>`, 'file', 'metric-icon--blue')}</div><div class="dashboard-grid"><div class="dashboard-main"><section class="card coverage-preview"><div class="card-header"><div><h2 class="card-title">Latest coverage</h2><p class="card-subtitle">${esc(name)} · ${articles.length} tracked references</p></div><div class="card-header-actions"><button class="text-button" data-action="go-coverage">View all ${icon('arrow')}</button></div></div><div class="coverage-head coverage-row"><span>CONTENT</span><span>PUBLICATION</span><span>TONE</span><span style="text-align:right">RAVE</span></div>${latest.length ? latest.map(renderCoveragePreviewRow).join('') : '<div class="empty-inline">No coverage yet. Start the search plan or add a reference you have already found.</div>'}</section>${negative.length ? `<div class="negative-strip"><span class="negative-strip-icon">!</span><div class="negative-strip-copy"><strong>${negative.length} negative ${negative.length === 1 ? 'mention needs' : 'mentions need'} careful review</strong><span>Negative coverage is called out separately in the approval and report stages.</span></div><button class="text-button" data-action="go-approvals">Review now ${icon('arrow')}</button></div>` : ''}</div><aside class="dashboard-rail">${renderRunCard(client)}${renderDistribution()}${renderActivityCard(client?.id)}</aside></div>`;
}

function renderRunHistory(client, release, activeRun) {
  const earlierRuns = state.runs.filter((run) => run.clientId === client.id && run.releaseId === release.id && run.id !== activeRun?.id).sort((a, b) => String(b.updatedAt ?? b.createdAt).localeCompare(String(a.updatedAt ?? a.createdAt))).slice(0, 4);
  if (!earlierRuns.length) return '';
  return `<section class="card run-history-card"><div class="card-header"><div><h2 class="card-title">Earlier search phases</h2><p class="card-subtitle">Progress retained when the query or window changes.</p></div></div><div class="run-history-list">${earlierRuns.map((run) => {
    const progress = getSearchProgress(run);
    const resultCount = state.coverage.filter((article) => article.runId === run.id).length;
    return `<div class="run-history-row"><div><strong>${run.fallback ? 'Client + key terms' : 'Exact release title'}</strong><small>${esc(run.mode === 'magazine' ? '30-day magazine' : run.extended ? '3-day window' : '24-hour window')} · ${esc(formatDateTime(run.createdAt))}</small></div><span>${progress.done}/${progress.total} checks</span><small>${resultCount} found</small></div>`;
  }).join('')}</div></section>`;
}

function renderSearchSource(engine, query, run) {
  const isGoogle = engine === 'google'; const googleWindow = run?.mode === 'magazine' ? 'qdr:m' : run?.extended ? 'qdr:d3' : 'qdr:d';
  const target = isGoogle ? `https://www.google.com/search?q=${encodeURIComponent(query)}&tbs=${googleWindow}` : `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
  const checked = Boolean(run?.searchEngines?.[engine]); const brand = isGoogle ? 'G' : 'b';
  return `<article class="source-card"><div class="source-card-top"><div class="source-brand"><span class="source-logo ${isGoogle ? '' : 'source-logo--bing'}">${brand}</span>${isGoogle ? 'Google Search' : 'Bing Search'}</div>${checked ? '<span class="status-badge status-approved">Checked</span>' : ''}</div><div class="source-query" title="${esc(query)}">${esc(query)}</div><a class="button button-secondary" href="${esc(target)}" target="_blank" rel="noopener noreferrer">Open ${isGoogle ? 'Google' : 'Bing'} ${icon('external')}</a><button class="text-button" style="margin-top:9px" data-action="mark-engine" data-engine="${engine}">${checked ? 'Mark as not completed' : 'Mark search complete'}</button></article>`;
}
function renderReleaseOptions(client, selectedId) { return (client?.pressReleases ?? []).map((release) => `<option value="${esc(release.id)}" ${release.id === selectedId ? 'selected' : ''}>${esc(release.title)}</option>`).join(''); }

function renderSearchPlan() {
  const client = getClient();
  if (!client) return renderNoClient('Set up at least one client and press release before building a search plan.');
  if (!client.pressReleases?.length) return `${pageHeading('Collection · Phase 1', 'Build your search plan', `Add a press release for ${esc(client.name)} to prepare exact-title searches across Google, Bing and the designated outlet list.`, `<button class="button button-primary" data-action="add-release">Add press release ${icon('arrow')}</button>`)}<div class="card report-empty-state"><strong>No press releases in scope</strong>Add the press release title exactly as issued. It becomes the first search keyword.</div>`;
  if (!client.pressReleases.some((release) => release.id === selectedReleaseId)) selectedReleaseId = client.pressReleases[0].id;
  const release = getRelease(client, selectedReleaseId); const run = getRun(client.id, release.id); const query = searchTerm(client, release, run); const exactQuery = buildSearchQuery({ title: release.title }); const progress = getSearchProgress(run);
  const inRun = run ? state.coverage.filter((article) => article.runId === run.id) : []; const allChecked = progress.outletCount === state.outlets.length && progress.engineCount === 2;
  const canExtend = run?.mode !== 'magazine' && !run?.extended && inRun.length === 0 && allChecked; const window = getWindowForRun(run, release); const exactFallbackText = exactQuery;
  const outlets = state.outlets.slice().sort((a, b) => a.name.localeCompare(b.name));
  const actions = `${run ? `<button class="button button-secondary" data-action="new-search-run">New monitoring run</button>` : ''}${activeRole === 'monitor' ? '<button class="button button-secondary" data-action="add-coverage"><span class="button-icon">＋</span>Log coverage</button>' : ''}${run ? '' : `<button class="button button-primary" data-action="start-search">Start this search ${icon('arrow')}</button>`}`;
  return `${pageHeading('Collection · Phase 1', 'Search plan', 'Search the exact release title first. If it returns nothing, switch to the client name and key terms. Then check every designated outlet directly and log what you searched.', actions)}<div class="search-layout"><div class="search-main">
    <section class="card campaign-card"><div class="campaign-card-heading"><div><h2>Monitoring scope</h2><p>One search plan per press release. Search progress is saved in this browser.</p></div>${run ? `<span class="window-badge">${esc(run.mode === 'magazine' ? 'Magazine · 30 days' : run.extended ? 'Fallback · 3 days' : 'Default · 24 hours')}</span>` : '<span class="status-badge status-draft">Not started</span>'}</div><div class="form-grid">
      <div class="form-field form-field--full"><label class="form-label" for="releaseSelect">Press release title · keyword 1</label><select class="select" id="releaseSelect">${renderReleaseOptions(client, release.id)}</select><span class="form-hint">Use the title exactly as it appeared in the issued release.</span></div>
      <div class="form-field form-field--full"><span class="form-label">Exact-title search query</span><div class="query-box"><span class="query-kind">Exact</span><code>${esc(exactFallbackText)}</code><button class="icon-button" type="button" title="Copy exact query" data-action="copy-query" data-query="${esc(exactFallbackText)}">${icon('copy')}</button></div></div>
      <div class="form-field form-field--full"><label class="fallback-toggle"><input type="checkbox" id="fallbackToggle" ${run?.fallback ? 'checked' : ''} ${run ? '' : 'disabled'} /><span><strong>No exact-title result? Use the fallback query.</strong><span>Switches search to <b>${esc(client.name)}</b> plus key terms: ${esc(client.keyTerms || 'add keywords in Clients & outlets')}.</span></span></label></div>
      <div class="form-field form-field--full"><span class="form-label">Active query · Google and Bing</span><div class="query-box"><span class="query-kind">${run?.fallback ? 'Fallback' : 'Exact title'}</span><code>${esc(query || 'Start a search and add a release title')}</code><button class="icon-button" type="button" title="Copy active query" data-action="copy-query" data-query="${esc(query)}">${icon('copy')}</button></div></div>
      <div class="form-field form-field--full"><span class="form-label">Search window</span><div class="window-choice"><label class="window-option ${run?.mode !== 'magazine' && !run?.extended ? 'is-selected' : ''}"><input type="radio" disabled ${run?.mode !== 'magazine' && !run?.extended ? 'checked' : ''} /><strong>Initial · 24 hours</strong><span>Default rolling window from yesterday into today.</span></label>${run?.mode === 'magazine' ? '<label class="window-option is-selected"><input type="radio" disabled checked /><strong>Magazine · 30 days</strong><span>Extended publication lead time.</span></label><label class="window-option" aria-disabled="true"><input type="radio" disabled /><strong>Fallback · 3 days</strong><span>Daily campaigns only; magazine range stays at 30 days.</span></label>' : `<label class="window-option ${run?.extended ? 'is-selected' : ''}"><input type="radio" disabled ${run?.extended ? 'checked' : ''} /><strong>Fallback · 3 days</strong><span>Use only after a completed 24-hour search finds nothing.</span></label><label class="window-option" aria-disabled="true"><input type="radio" disabled /><strong>Magazine · 30 days</strong><span>Choose “Magazine” when adding the press release.</span></label>`}</div></div>
      <div class="form-field form-field--full"><div class="period-note"><span aria-hidden="true">◷</span><span><strong>Current range:</strong> ${esc(timeWindowLabel(run, release))} · ${esc(new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(window.start))} to ${esc(new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(window.end))}. Search engines may need their date filter checked manually.</span></div></div>
    </div>${run ? '' : '<div class="dialog-help" style="margin-top:15px">Start this search to enable engine and outlet progress tracking. No media is scraped automatically.</div>'}</section>
    <section class="card campaign-card"><div class="campaign-card-heading"><div><h2>Search engines</h2><p>Run the ${run?.fallback ? 'client name + key-terms fallback' : 'exact release title'} on both engines. Google has a quick date filter; confirm Bing’s range manually where available.</p></div></div><div class="search-source-grid">${renderSearchSource('google', query, run)}${renderSearchSource('bing', query, run)}</div></section>
    <section class="card outlet-list-card"><div class="card-header"><div><h2 class="card-title">Designated media list</h2><p class="card-subtitle">${state.outlets.length} outlets · ${state.outlets.filter((outlet) => outlet.language === 'AR').length} Arabic · site-scoped search plus a direct visit</p></div><div class="outlet-list-tools"><input class="input outlet-filter" type="search" id="outletSearch" placeholder="Filter outlets…" value="${esc(outletSearchTerm)}" aria-label="Filter outlets" /><button class="button button-quiet" data-action="go-setup">Manage list</button></div></div><div class="outlet-list">${outlets.map((outlet) => {
      const searched = run?.searchedOutlets?.includes(outlet.id) ?? false; const siteQuery = buildOutletQuery({ query, url: outlet.url });
      const target = `https://www.google.com/search?q=${encodeURIComponent(siteQuery)}&tbs=${run?.mode === 'magazine' ? 'qdr:m' : run?.extended ? 'qdr:d3' : 'qdr:d'}`;
      return `<div class="outlet-row" data-outlet-name="${esc(`${outlet.name} ${outlet.language} ${outlet.category}`.toLowerCase())}"><div class="outlet-row-main"><span class="outlet-monogram">${esc(shortName(outlet.name))}</span><span class="outlet-row-name" title="${esc(outlet.name)}">${esc(outlet.name)}</span></div><span class="language-badge">${esc(outlet.language)}</span><span class="outlet-domain">${esc(new URL(outlet.url).hostname.replace(/^www\./, ''))}</span><div class="outlet-actions"><a class="button button-quiet" href="${esc(target)}" target="_blank" rel="noopener noreferrer">Site search ${icon('external')}</a><a class="button button-quiet" href="${esc(safeUrl(outlet.url))}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${esc(outlet.name)}">Visit</a>${run ? `<button class="button ${searched ? 'button-quiet' : 'button-secondary'}" data-action="mark-outlet" data-outlet="${esc(outlet.id)}">${searched ? '✓ Searched' : 'Mark done'}</button>` : ''}</div></div>`;
    }).join('')}</div></section></div>
    <aside class="search-rail"><section class="card"><div class="card-header"><div><h2 class="card-title">Run progress</h2><p class="card-subtitle">Search and log each source</p></div>${icon('radar')}</div><div class="window-summary"><div class="subtle-label">CURRENT TIME WINDOW</div><div class="window-number">${run?.mode === 'magazine' ? '30 days' : run?.extended ? '3 days' : '24 hours'}</div><div class="window-details">${esc(timeWindowDateLabel(run, release))}</div><div class="window-progress"><span>Checks logged</span><strong>${progress.done} / ${progress.total}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${progress.percent}%"></div></div></div><div class="checklist"><div class="checklist-item ${run?.searchEngines?.google ? 'is-done' : ''}"><span class="checklist-mark">${run?.searchEngines?.google ? '✓' : ''}</span><span>Exact title on Google</span><strong>${run?.searchEngines?.google ? 'Done' : 'To do'}</strong></div><div class="checklist-item ${run?.searchEngines?.bing ? 'is-done' : ''}"><span class="checklist-mark">${run?.searchEngines?.bing ? '✓' : ''}</span><span>Exact title on Bing</span><strong>${run?.searchEngines?.bing ? 'Done' : 'To do'}</strong></div><div class="checklist-item ${progress.outletCount ? 'is-current' : ''} ${progress.outletCount === state.outlets.length ? 'is-done' : ''}"><span class="checklist-mark">${progress.outletCount === state.outlets.length ? '✓' : ''}</span><span>Direct outlet checks</span><strong>${progress.outletCount}/${state.outlets.length}</strong></div><div class="checklist-item ${run?.fallback ? 'is-current' : ''}"><span class="checklist-mark">${run?.fallback ? '↻' : ''}</span><span>Client + key-terms fallback</span><strong>${run?.fallback ? 'Active' : 'If no result'}</strong></div></div><div class="note-box"><strong>Search coverage:</strong> opening a query sends its terms to Google or Bing. Check that this is permitted for the client, then visit the outlet itself. Mark a source complete only after checking it; results are not automatically collected.</div>${run ? '' : `<div style="padding:14px 17px 0"><button class="button button-primary" style="width:100%" data-action="start-search">Start monitoring ${icon('arrow')}</button></div>`}${canExtend ? `<div style="padding:13px 17px 0"><button class="button button-secondary" style="width:100%" data-action="extend-window">No results · extend to 3 days</button></div>` : run?.mode !== 'magazine' && !run?.extended && inRun.length === 0 ? '<div style="padding:12px 17px 0;color:#98a5a4;font-size:8px;line-height:1.55">To extend to 3 days, complete the 24-hour Google, Bing and outlet checks with no coverage found.</div>' : ''}</section>${renderRunHistory(client, release, run)}<section class="card status-panel"><div class="status-panel-header"><div><h3>What to log</h3><p>Coverage entry details needed for the final approved report.</p></div></div><ul class="status-list"><li>Article title, publication date and outlet</li><li>Article link and screenshot</li><li>Tone: positive, neutral or negative</li><li>Measurement in cm and print columns</li><li>Executive first verification</li></ul></section></aside></div>`;
}
function renderNoClient(message) { return `${pageHeading('Workspace setup', 'Start with a client', message, `<button class="button button-primary" data-action="add-client">Add a client ${icon('arrow')}</button>`)}<section class="card report-empty-state"><strong>No client configured</strong>Add the client, executive contact and press release title to begin.</section>`; }
function renderCoverageTableRow(article) {
  const outlet = getOutlet(article.outletId); const link = safeUrl(article.link); const incomplete = getCoverageCompleteness(article);
  const searchText = `${article.title} ${article.outletName} ${article.tone}`.toLowerCase();
  const rowActions = activeRole === 'monitor'
    ? `<div class="table-actions"><button class="icon-button" title="Edit coverage" aria-label="Edit ${esc(article.title)}" data-action="edit-coverage" data-id="${esc(article.id)}">✎</button><button class="icon-button" title="Delete coverage" aria-label="Delete ${esc(article.title)}" data-action="delete-coverage" data-id="${esc(article.id)}">×</button></div>`
    : '<span class="table-sub">Monitoring team maintains coverage</span>';
  return `<tr class="${article.tone === 'negative' ? 'is-negative' : ''}" data-coverage-search="${esc(searchText)}"><td><div class="table-title">${esc(article.title)}</div><div class="table-sub">${esc(getClient(article.clientId)?.name ?? '')} · ${esc(outlet?.category ?? 'Media')}</div></td><td><div class="outlet-cell"><span class="outlet-monogram">${esc(shortName(article.outletName))}</span><span class="outlet-name">${esc(article.outletName)}</span></div></td><td>${esc(formatDate(article.publishedAt, { month: 'short', day: 'numeric', year: 'numeric' }))}</td><td>${toneBadge(article.tone)}</td><td>${platformBadge(article.medium)}<div class="table-sub">${Number(article.measurementCm || 0).toFixed(1)} cm${article.medium === 'print' ? ` · ${esc(article.columns)} col` : article.wordCount ? ` · ${formatNumber(article.wordCount)} words` : ''}</div></td><td><span class="table-rave">${formatRave(articleRave(article))}</span></td><td>${statusBadge(article.verificationStatus)}${incomplete.includes('article screenshot') ? '<div class="table-sub">Screenshot needed</div>' : ''}</td><td>${link ? `<a class="table-link" href="${esc(link)}" target="_blank" rel="noopener noreferrer">Open link ${icon('external')}</a>` : '<span class="table-sub">No link</span>'}</td><td>${rowActions}</td></tr>`;
}
function renderCoverage() {
  const client = getClient(); if (!client) return renderNoClient('Add a client and release to organize discovered coverage.');
  const articles = currentArticles().slice().sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)) || String(b.createdAt).localeCompare(String(a.createdAt)));
  const filtered = articles.filter((article) => (coverageToneFilter === 'all' || article.tone === coverageToneFilter) && `${article.title} ${article.outletName} ${article.tone}`.toLowerCase().includes(coverageSearchTerm.toLowerCase()));
  const actions = activeRole === 'monitor' ? `<button class="button button-primary" data-action="add-coverage"><span class="button-icon">＋</span>Add coverage</button>` : '';
  return `${pageHeading('Sorting & analysis · Phase 2', 'Coverage library', `All identified references for <strong>${esc(client.name)}</strong>, grouped by tone. Negative items are highlighted and RAVE is calculated from the recorded measurement.`, actions)}<div class="filter-toolbar"><div class="filter-tabs" role="tablist" aria-label="Filter coverage by tone">${[['all', 'All'], ['positive', 'Positive'], ['neutral', 'Neutral'], ['negative', 'Negative']].map(([key, label]) => `<button class="filter-tab ${coverageToneFilter === key ? 'is-active' : ''}" role="tab" aria-selected="${coverageToneFilter === key}" data-tone-filter="${key}">${label}<span style="margin-left:4px;color:#9ba9a8">${key === 'all' ? articles.length : articles.filter((article) => article.tone === key).length}</span></button>`).join('')}</div><div class="filter-tools-right"><input class="coverage-search" type="search" id="coverageSearch" placeholder="Search title or outlet…" value="${esc(coverageSearchTerm)}" aria-label="Search coverage"/><button class="button button-quiet" data-action="go-approvals">Review queue ${icon('arrow')}</button></div></div>${articles.some((article) => article.tone === 'negative') ? `<div class="negative-strip coverage-alert"><span class="negative-strip-icon">!</span><div class="negative-strip-copy"><strong>Negative coverage is separated for executive attention.</strong><span>Confirm context, accuracy and tone during first verification.</span></div><button class="text-button" data-action="filter-negative">View negative ${icon('arrow')}</button></div>` : ''}<section class="card coverage-table-card"><table class="coverage-table"><thead><tr><th>Content</th><th>Publication</th><th>Date</th><th>Tone</th><th>Format &amp; size</th><th>RAVE</th><th>Verification</th><th>Reference</th><th></th></tr></thead><tbody>${filtered.length ? filtered.map(renderCoverageTableRow).join('') : `<tr><td colspan="9"><div class="table-empty"><strong>${articles.length ? 'No matching coverage' : 'No coverage found yet'}</strong>${articles.length ? 'Change the tone filter or search term.' : 'Run the search plan or add a reference already identified by your team.'}</div></td></tr>`}</tbody></table></section>`;
}

function latestReviewRequest(clientId = selectedClientId) {
  return state.reviewRequests.filter((request) => request.clientId === clientId).sort((a, b) => String(b.requestedAt).localeCompare(String(a.requestedAt)))[0] ?? null;
}

function renderReviewItem(article) {
  const status = article.verificationStatus ?? 'unreviewed';
  const canReview = activeRole === 'executive' && status === 'pending';
  const completeness = getCoverageCompleteness(article);
  return `<article class="review-item ${article.tone === 'negative' ? 'is-negative' : ''}"><div class="review-item-top"><div><h4>${esc(article.title)}</h4><div class="review-item-meta"><span>${esc(article.outletName)}</span><span>·</span><span>${esc(formatDate(article.publishedAt, { month: 'short', day: 'numeric', year: 'numeric' }))}</span><span>·</span>${toneBadge(article.tone)}</div></div>${statusBadge(status)}</div>${article.tone === 'negative' ? '<div class="negative-priority" style="margin-top:8px">Priority attention · negative item</div>' : ''}${article.verificationNote ? `<p class="review-item-description">${esc(article.verificationNote)}</p>` : ''}${completeness.length ? `<p class="review-item-description">Report gaps: ${esc(completeness.join(', '))}.</p>` : ''}${canReview ? `<div class="review-item-actions"><button class="button button-primary button-small" data-action="approve-coverage" data-id="${esc(article.id)}">Approve reference</button><button class="button button-danger button-small" data-action="request-coverage-changes" data-id="${esc(article.id)}">Request correction</button></div>` : status === 'pending' && activeRole !== 'executive' ? '<p class="review-item-description">Switch to the Executive reviewer role to record this verification.</p>' : ''}</article>`;
}

function renderReadinessList(articles) {
  const readiness = getReportReadiness(articles);
  const items = [
    { label: 'Coverage references added', ok: articles.length > 0 },
    { label: 'Executive first verification', ok: articles.length > 0 && articles.every((article) => article.verificationStatus === 'approved') },
    { label: 'Title, date, outlet, tone and size', ok: articles.length > 0 && articles.every((article) => !getCoverageCompleteness(article).some((field) => ['content title', 'publication date', 'media platform', 'platform type', 'tone', 'size measurement in cm', 'print column count'].includes(field))) },
    { label: 'Article links and screenshots', ok: articles.length > 0 && articles.every((article) => !getCoverageCompleteness(article).some((field) => ['working article link', 'article screenshot'].includes(field))) },
  ];
  return `<ul class="status-list">${items.map((item) => `<li class="${item.ok ? 'is-complete' : 'is-blocked'}">${esc(item.label)}${item.ok ? '' : '<span style="margin-left:auto;color:#a0abaa;font-size:8px">Required</span>'}</li>`).join('')}</ul>${readiness.reasons.length ? `<div class="note-box"><strong>Still needed:</strong> ${esc(readiness.reasons.join(' '))}</div>` : '<div class="note-box"><strong>Ready:</strong> all references are verified and report fields are complete.</div>'}`;
}

function renderWorkflowReportCard(articles, report) {
  const readiness = getReportReadiness(articles);
  const canPrepare = activeRole === 'monitor';
  if (!report) {
    const roleHint = canPrepare ? '' : '<p class="form-hint" style="margin-top:8px">Switch to Monitoring team to compile a report after all references are verified.</p>';
    return `<section class="card status-panel"><div class="status-panel-header"><div><h3>Final report approval</h3><p>Compile the verified coverage, prepare the final-approval email and confirm after sending it.</p></div><span class="status-badge status-draft">Not compiled</span></div>${renderReadinessList(articles)}<button class="button button-primary" style="width:100%;margin-top:14px" data-action="compile-report" ${readiness.ready && canPrepare ? '' : 'disabled'}>Compile report ${icon('arrow')}</button>${roleHint}</section>`;
  }
  const isDraft = report.status === 'draft';
  const isPending = report.status === 'pending-final';
  const isApproved = report.status === 'approved';
  const isSent = report.status === 'sent';
  const isChanges = report.status === 'changes';
  const hasCoverageChanges = hasCoverageChangedSinceReport(report, articles);
  const prepareFinalAction = isDraft && canPrepare && !hasCoverageChanges
    ? `<button class="button button-primary" style="width:100%;margin-top:13px" data-action="prepare-final-approval" data-id="${esc(report.id)}">Prepare final-approval email ${icon('arrow')}</button>`
    : '';
  const refreshDraftAction = isDraft && canPrepare && hasCoverageChanges
    ? `<button class="button button-primary" style="width:100%;margin-top:13px" data-action="compile-report">Compile updated report snapshot</button>`
    : '';
  const draftRoleHint = isDraft && !canPrepare
    ? '<div class="note-box"><strong>Report compiled.</strong> The Monitoring team must prepare the final-approval request.</div>'
    : '';
  const revisedReportAction = isChanges && canPrepare
    ? `<button class="button button-primary" style="width:100%;margin-top:13px" data-action="compile-report" ${readiness.ready && hasCoverageChanges ? '' : 'disabled'}>Compile revised report</button>${!hasCoverageChanges ? '<p class="form-hint" style="margin-top:8px">Update a reference or screenshot in response to the executive note before compiling a new snapshot.</p>' : ''}`
    : '';
  const followOnReportAction = (isApproved || isSent) && canPrepare && hasCoverageChanges
    ? `<button class="button button-secondary" style="width:100%;margin-top:13px" data-action="compile-report" ${readiness.ready ? '' : 'disabled'}>Compile a new report</button>`
    : '';
  return `<section class="card status-panel"><div class="status-panel-header"><div><h3>Final report approval</h3><p>Report compiled ${esc(formatDateTime(report.compiledAt))} · ${report.items.length} verified references.</p></div>${statusBadge(report.status, 'report')}</div><div class="approval-report-summary"><div class="summary-mini"><strong>${formatNumber(report.items.length)}</strong><span>REFERENCES</span></div><div class="summary-mini"><strong>${formatNumber(report.items.filter((item) => item.tone === 'negative').length)}</strong><span>NEGATIVE</span></div><div class="summary-mini"><strong>${formatRave(report.items.reduce((sum, item) => sum + articleRave(item), 0))}</strong><span>RAVE</span></div></div>${refreshDraftAction}${prepareFinalAction}${draftRoleHint}${isPending && activeRole === 'executive' ? `<div class="review-item-actions" style="margin-top:13px"><button class="button button-primary button-small" data-action="approve-report" data-id="${esc(report.id)}">Approve final report</button><button class="button button-danger button-small" data-action="request-report-changes" data-id="${esc(report.id)}">Request changes</button></div>` : ''}${isPending && activeRole !== 'executive' ? '<div class="note-box"><strong>Waiting for the executive:</strong> switch to Executive reviewer to record final approval.</div>' : ''}${isApproved && activeRole === 'head' ? `<button class="button button-primary" style="width:100%;margin-top:14px" data-action="deliver-report" data-id="${esc(report.id)}">Prepare client delivery ${icon('arrow')}</button>` : ''}${isApproved && activeRole !== 'head' ? '<div class="note-box"><strong>Final approval complete.</strong> The Monitoring Head can prepare client delivery.</div>' : ''}${isSent ? `<div class="approval-seal" style="margin-top:13px"><span class="approval-seal-icon">✓</span><div><strong>Delivered to client</strong><span>${esc(formatDateTime(report.sentAt))}</span></div></div>` : ''}${isChanges ? `<div class="note-box"><strong>Changes requested:</strong> ${esc(report.reviewNote || 'Review the executive note, update coverage, then compile a new report.')}</div>${revisedReportAction}` : followOnReportAction}<button class="button button-secondary" style="width:100%;margin-top:11px" data-action="go-reports">Open report preview ${icon('arrow')}</button></section>`;
}

function renderApprovals() {
  const client = getClient();
  if (!client) return renderNoClient('Approval routing starts with an executive and client contact. Add them in the workspace setup.');
  const articles = currentArticles().slice().sort((a, b) => Number(b.tone === 'negative') - Number(a.tone === 'negative') || String(b.publishedAt).localeCompare(String(a.publishedAt)));
  const pending = articles.filter((article) => article.verificationStatus === 'pending').length;
  const approved = articles.filter((article) => article.verificationStatus === 'approved').length;
  const request = latestReviewRequest(client.id);
  const report = latestReport(client.id);
  const executive = client.executiveName || 'Executive reviewer';
  const execEmail = safeEmail(client.executiveEmail);
  const stageStatus = articles.length && articles.every((article) => article.verificationStatus === 'approved') ? 'approved' : request ? 'pending' : 'draft';
  const prepareDisabled = !articles.length;
  const reviewTitle = activeRole === 'executive' ? 'Executive first verification' : 'First verification';
  const firstAction = activeRole === 'monitor'
    ? `<button class="button button-primary button-small" data-action="prepare-review" ${prepareDisabled ? 'disabled' : ''}>Prepare verification packet ${icon('arrow')}</button>`
    : activeRole === 'executive'
      ? `<span class="subtle-label">${pending ? `${pending} reference${pending === 1 ? '' : 's'} awaiting you` : 'Review queue'}</span>`
      : '<span class="subtle-label">Review queue</span>';
  const workflowText = request
    ? `Request marked sent ${formatDateTime(request.requestedAt)}${request.requestedBy ? ` by ${request.requestedBy}` : ''}. The email itself is handled outside this local app.`
    : 'No verification request has been recorded yet. Prepare the reference packet, then confirm after sending it through your approved channel.';
  return `${pageHeading('Approval & reporting · Phase 3', 'Approval desk', `Route coverage to ${esc(executive)} for first verification. Once each reference is checked and the report is complete, request final approval before the Monitoring Head sends it to the client.`, `<button class="button button-secondary" data-action="go-coverage">Review coverage</button>`)}
    <div class="approval-grid">
      <div class="approval-main">
        <section class="card workflow-card"><div class="card-header"><div><h2 class="card-title">Approval workflow</h2><p class="card-subtitle">${esc(client.name)} · two executive checks before delivery</p></div><span class="language-badge">${articles.length} items</span></div>
          <div class="workflow-step"><span class="step-index ${request ? 'is-done' : ''}">${request ? '✓' : '1'}</span><div class="step-content"><h3>Send identified coverage for first verification</h3><p>${esc(workflowText)}${execEmail ? ` Executive contact: ${esc(execEmail)}.` : ' Add the executive email in Clients & outlets before preparing an email draft.'}</p></div><div class="step-action">${firstAction}</div></div>
          <div class="workflow-step"><span class="step-index ${stageStatus === 'approved' ? 'is-done' : request ? 'is-waiting' : ''}">${stageStatus === 'approved' ? '✓' : '2'}</span><div class="step-content"><h3>${esc(reviewTitle)} · approve or request changes</h3><p>${approved} of ${articles.length} references verified; ${pending} awaiting review. Negative coverage is highlighted for priority attention.</p></div><div class="step-action">${stageStatus === 'approved' ? statusBadge('approved') : statusBadge(stageStatus)}</div></div>
          <div class="review-list">${articles.length ? articles.map(renderReviewItem).join('') : '<div class="review-empty">No references to verify. Add coverage first.</div>'}</div>
        </section>
      </div>
      <aside class="approval-rail">
        <section class="card status-panel"><div class="status-panel-header"><div><h3>Review routing</h3><p>Executive verification contact</p></div>${icon('check')}</div><div class="approval-seal" style="margin-top:14px"><span class="approval-seal-icon">${esc(shortName(executive))}</span><div><strong>${esc(executive)}</strong><span>${execEmail ? esc(execEmail) : 'Email not configured'}</span></div></div><ul class="status-list"><li class="${request ? 'is-complete' : ''}">Reference packet prepared and sent</li><li class="${stageStatus === 'approved' ? 'is-complete' : ''}">Each reference verified</li><li class="${report ? 'is-complete' : ''}">Final report compiled</li><li class="${report?.status === 'approved' || report?.status === 'sent' ? 'is-complete' : ''}">Final executive approval</li></ul><div class="dialog-help" style="margin-top:14px">The role switcher is for workflow demonstration only. It does not provide authentication or access control.</div></section>
        ${renderWorkflowReportCard(articles, report)}
        <section class="card status-panel"><div class="status-panel-header"><div><h3>Negative coverage</h3><p>Separate, highlighted list for fast review.</p></div><span class="tone-badge tone-negative">${articles.filter((article) => article.tone === 'negative').length} priority</span></div>${articles.filter((article) => article.tone === 'negative').length ? `<ul class="status-list">${articles.filter((article) => article.tone === 'negative').map((article) => `<li class="is-blocked">${esc(article.outletName)} · ${esc(article.title)}</li>`).join('')}</ul>` : '<div class="dialog-help" style="margin-top:13px">No negative coverage currently logged.</div>'}</section>
      </aside>
    </div>`;
}

function reportToneSummary(report) {
  return countByTone(report.items ?? []);
}

function reportActionButtons(report) {
  if (report.status === 'draft' && activeRole === 'monitor') {
    if (hasCoverageChangedSinceReport(report, currentArticles())) return `<button class="button button-primary button-small" data-action="compile-report">Compile updated report snapshot</button>`;
    return `<button class="button button-primary button-small" data-action="prepare-final-approval" data-id="${esc(report.id)}">Prepare final-approval email ${icon('arrow')}</button>`;
  }
  if (report.status === 'pending-final' && activeRole === 'executive') {
    return `<button class="button button-primary button-small" data-action="approve-report" data-id="${esc(report.id)}">Approve final report</button><button class="button button-danger button-small" data-action="request-report-changes" data-id="${esc(report.id)}">Request changes</button>`;
  }
  if (report.status === 'approved' && activeRole === 'head') {
    return `<button class="button button-primary button-small" data-action="deliver-report" data-id="${esc(report.id)}">Prepare client delivery ${icon('arrow')}</button>`;
  }
  return '';
}

function reportSuccessorAction(report, articles = currentArticles()) {
  if (activeRole !== 'monitor' || !['changes', 'approved', 'sent'].includes(report.status)) return '';
  const hasCoverageChanges = hasCoverageChangedSinceReport(report, articles);
  if (!hasCoverageChanges) return '';
  const readiness = getReportReadiness(articles);
  const label = report.status === 'changes' ? 'Compile revised report' : 'Compile a new report';
  return `<button class="button button-secondary button-small" data-action="compile-report" ${readiness.ready ? '' : 'disabled'}>${label}</button>`;
}

function renderReportDocument(report) {
  const clientName = report.clientName || getClient(report.clientId)?.name || 'Client';
  const counts = reportToneSummary(report);
  const totalRave = report.items.reduce((sum, item) => sum + articleRave(item), 0);
  const positiveNeutral = report.items.filter((item) => item.tone !== 'negative');
  const negatives = report.items.filter((item) => item.tone === 'negative');
  const article = (item, index) => {
    const image = safeImage(item.screenshotDataUrl);
    const url = safeUrl(item.link);
    return `<article class="report-article ${item.tone === 'negative' ? 'is-negative' : ''}"><span class="report-article-index">${String(index + 1).padStart(2, '0')}</span><div class="report-article-main"><h4>${esc(item.title)}</h4><p>${esc(item.outletName)} · ${esc(formatDate(item.publishedAt, { month: 'short', day: 'numeric', year: 'numeric' }))} · ${esc(platformLabel(item.medium))} · ${Number(item.measurementCm || 0).toFixed(1)} cm${item.medium === 'print' ? ` × ${esc(item.columns)} columns` : item.wordCount ? ` · ${formatNumber(item.wordCount)} words` : ''}</p><p>${toneBadge(item.tone)} ${url ? `<a class="report-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(url)}</a>` : ''}</p>${image ? `<img class="report-image" src="${esc(image)}" alt="Screenshot of ${esc(item.title)}">` : ''}</div><div class="report-article-rave">${formatRave(articleRave(item))}<small>RAVE</small></div></article>`;
  };
  const formatItems = (items) => items.map((item, index) => article(item, index)).join('');
  return `<section class="card report-preview"><div class="report-cover"><div class="eyebrow">MEDIA COVERAGE REPORT</div><h2>${esc(clientName)}</h2><p>Prepared ${esc(formatDate(report.compiledAt))} · ${report.items.length} executive-verified references</p><div class="report-cover-meta"><span>Report ID <strong>${esc(report.id.slice(-8).toUpperCase())}</strong></span><span>Approval <strong>${esc(reportStatusLabel(report.status))}</strong></span><span>References <strong>${report.items.length}</strong></span></div></div><div class="report-summary-row"><div class="report-summary-cell"><strong>${formatNumber(report.items.length)}</strong><span>CLIPPINGS</span></div><div class="report-summary-cell"><strong>${counts.positive}</strong><span>POSITIVE</span></div><div class="report-summary-cell"><strong>${counts.neutral}</strong><span>NEUTRAL</span></div><div class="report-summary-cell"><strong>${counts.negative}</strong><span>NEGATIVE</span></div></div><div class="report-summary-row" style="grid-template-columns:1fr"><div class="report-summary-cell" style="border:0"><strong>${formatRave(totalRave)}</strong><span>TOTAL RAVE · CALCULATED FROM RECORDED MEASUREMENTS</span></div></div><div class="report-section-heading"><h3>Positive &amp; neutral coverage</h3><span>${positiveNeutral.length} references</span></div>${positiveNeutral.length ? formatItems(positiveNeutral) : '<div class="report-empty-state">No positive or neutral references in this report.</div>'}<div class="report-section-negative"><div class="report-section-heading"><h3 style="color:#a64c43">Negative coverage · priority</h3><span>${negatives.length} references</span></div>${negatives.length ? formatItems(negatives) : '<div class="report-empty-state">No negative references in this report.</div>'}</div><div style="padding:12px 18px 17px;color:#93a19f;font-size:8px;line-height:1.6">RAVE is calculated as online measurement in cm × 6 × 95, or print measurement in cm × columns × 115. It is an estimate based on the entered measurements; the source data and classification should be checked before external use.</div></section>`;
}

function renderReports() {
  const client = getClient();
  if (!client) return renderNoClient('Reports are prepared separately for each client. Set up a client to continue.');
  const report = latestReport(client.id);
  const reports = state.reports.filter((item) => item.clientId === client.id).sort((a, b) => String(b.compiledAt).localeCompare(String(a.compiledAt)));
  const actions = report
    ? `<button class="button button-secondary" data-action="download-report" data-id="${esc(report.id)}">${icon('download')} Download HTML</button>${reportSuccessorAction(report)}${reportActionButtons(report)}`
    : `<button class="button button-secondary" data-action="go-approvals">Open approval desk ${icon('arrow')}</button>`;
  return `${pageHeading('Approval & reporting · Phase 3', 'Client reports', `${esc(client.name)} · Reports contain the approved title, date, media platform, link, screenshot, tone and calculated RAVE for every reference.`, actions)}
    ${report ? `<div class="report-layout"><div class="report-main">${renderReportDocument(report)}</div><aside class="report-side"><section class="card delivery-card"><h3>Report status</h3><p>${statusBadge(report.status, 'report')}<br><br>Compiled ${esc(formatDateTime(report.compiledAt))}${report.finalApprovalRequestedAt ? `<br>Approval request sent ${esc(formatDateTime(report.finalApprovalRequestedAt))}` : ''}${report.approvedAt ? `<br>Approved ${esc(formatDateTime(report.approvedAt))}` : ''}${report.sentAt ? `<br>Sent ${esc(formatDateTime(report.sentAt))}` : ''}</p>${report.status === 'draft' && activeRole === 'monitor' ? hasCoverageChangedSinceReport(report, currentArticles()) ? `<button class="button button-primary" data-action="compile-report">Compile updated report snapshot</button>` : `<button class="button button-primary" data-action="prepare-final-approval" data-id="${esc(report.id)}">Prepare final-approval email ${icon('arrow')}</button>` : ''}${report.status === 'draft' && activeRole !== 'monitor' ? '<div class="dialog-help" style="margin-top:12px">The Monitoring team must prepare the final-approval request.</div>' : ''}${report.status === 'pending-final' && activeRole === 'executive' ? `<button class="button button-primary" data-action="approve-report" data-id="${esc(report.id)}">Approve final report</button><button class="button button-danger" style="width:100%;margin-top:8px" data-action="request-report-changes" data-id="${esc(report.id)}">Request changes</button>` : ''}${report.status === 'pending-final' && activeRole !== 'executive' ? '<div class="dialog-help" style="margin-top:12px">Waiting for final executive approval. Switch to Executive reviewer to record a decision.</div>' : ''}${report.status === 'approved' && activeRole === 'head' ? `<button class="button button-primary" data-action="deliver-report" data-id="${esc(report.id)}">Prepare client delivery ${icon('arrow')}</button>` : ''}${report.status === 'approved' && activeRole !== 'head' ? '<div class="dialog-help" style="margin-top:12px">Final approval is recorded. The Monitoring Head handles client delivery.</div>' : ''}${report.status === 'sent' ? '<div class="approval-seal" style="margin-top:12px"><span class="approval-seal-icon">✓</span><div><strong>Sent to client</strong><span>Delivery recorded in this workspace</span></div></div>' : ''}${report.status === 'changes' && report.reviewNote ? `<div class="dialog-alert" style="margin-top:12px">Executive note: ${esc(report.reviewNote)}</div>` : ''}${reportSuccessorAction(report)}<button class="button button-secondary" data-action="download-report" data-id="${esc(report.id)}">${icon('download')} Download print-ready HTML</button></section><section class="card delivery-card"><h3>Delivery sequence</h3><ul class="status-list"><li class="is-complete">Coverage verified by executive</li><li class="${report.status === 'approved' || report.status === 'sent' ? 'is-complete' : ''}">Final report approved</li><li class="${report.status === 'sent' ? 'is-complete' : ''}">Monitoring Head sends to client</li></ul><p>This app prepares a local report and email draft. Your team sends it through its approved email channel.</p></section></aside></div>` : `<div class="report-layout"><div class="report-main"><section class="card report-empty-state"><strong>No report compiled for ${esc(client.name)} yet</strong>Complete first verification, add screenshots of every article and compile the report for final approval.<div style="margin-top:16px"><button class="button button-primary" data-action="go-approvals">Continue in approval desk ${icon('arrow')}</button></div></section></div><aside class="report-side"><section class="card status-panel"><div class="status-panel-header"><div><h3>Readiness checklist</h3><p>Required before a final report can be compiled.</p></div>${icon('file')}</div>${renderReadinessList(currentArticles())}</section></aside></div>`}
    ${reports.length > 1 ? `<section class="card" style="margin-top:16px"><div class="card-header"><div><h2 class="card-title">Report history</h2><p class="card-subtitle">Previously compiled snapshots</p></div></div>${reports.slice(1).map((item) => `<div class="report-history-row"><div><div class="report-history-name">${esc(client.name)} · ${esc(formatDate(item.compiledAt))}</div><div class="report-history-meta">${item.items.length} references · ${esc(item.id.slice(-8).toUpperCase())}</div></div>${statusBadge(item.status, 'report')}<button class="button button-quiet" data-action="download-report" data-id="${esc(item.id)}">Download</button></div>`).join('')}</section>` : ''}`;
}

function renderClientCard(client) {
  const articles = articlesForClient(client.id);
  const releases = client.pressReleases ?? [];
  return `<article class="client-card"><div class="client-card-row"><span class="client-logo">${esc(shortName(client.name))}</span><div class="client-card-main"><div class="client-card-name">${esc(client.name)}</div><div class="client-card-contact">Executive: ${esc(client.executiveName || 'Not set')} · ${esc(client.executiveEmail || 'email missing')} · Client contact: ${esc(client.contactName || 'Not set')}</div><div class="client-card-contact">${articles.length} coverage items · ${releases.length} press release${releases.length === 1 ? '' : 's'}</div>${releases.map((release) => `<div class="client-card-pr"><span>${esc(release.title)} · ${release.monitoringType === 'magazine' ? 'Magazine / 30-day window' : 'Daily / 24-hour window'}</span><button class="text-button" data-action="edit-release" data-client="${esc(client.id)}" data-id="${esc(release.id)}">Edit title</button></div>`).join('')}</div><div class="client-card-actions"><button class="button button-quiet" data-action="edit-client" data-id="${esc(client.id)}">Edit client</button><button class="button button-quiet" data-action="add-release" data-client="${esc(client.id)}">＋ PR title</button></div></div></article>`;
}

function renderOutletManageRow(outlet) {
  const host = safeUrl(outlet.url) ? new URL(outlet.url).hostname.replace(/^www\./, '') : 'Invalid URL';
  return `<div class="outlet-manage-row" data-outlet-name="${esc(`${outlet.name} ${outlet.url} ${outlet.language} ${outlet.category}`.toLowerCase())}"><div><strong>${esc(outlet.name)}</strong><small>${esc(host)} · ${esc(outlet.category)} · ${outlet.language === 'AR' ? 'Arabic' : 'English'}</small></div><span class="language-badge">${esc(outlet.language)}</span><button class="icon-button" title="Edit outlet" aria-label="Edit ${esc(outlet.name)}" data-action="edit-outlet" data-id="${esc(outlet.id)}">✎</button></div>`;
}

function renderSetup() {
  const filteredOutlets = state.outlets.filter((outlet) => `${outlet.name} ${outlet.url} ${outlet.language} ${outlet.category}`.toLowerCase().includes(outletSearchTerm.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
  const actions = `<button class="button button-secondary" data-action="export-workspace">${icon('download')} Export workspace</button><button class="button button-primary" data-action="add-client"><span class="button-icon">＋</span>Add client</button>`;
  return `${pageHeading('Workspace configuration', 'Clients & outlets', 'Keep the client list, press release titles, executive routing and designated publication list current. The seeded workspace is illustrative only.', actions)}
    <div class="setup-layout"><div class="setup-main"><section class="card"><div class="card-header"><div><h2 class="card-title">Client scope</h2><p class="card-subtitle">${state.clients.length} client${state.clients.length === 1 ? '' : 's'} · add each issued press release title as a search keyword</p></div><button class="text-button" data-action="add-client">＋ Add client</button></div>${state.clients.length ? state.clients.map(renderClientCard).join('') : '<div class="table-empty"><strong>No clients configured</strong>Add a client and executive contact.</div>'}</section>
      <section class="card outlet-list-card"><div class="card-header"><div><h2 class="card-title">Designated media list</h2><p class="card-subtitle">${state.outlets.length} outlets configured · ${state.outlets.filter((outlet) => outlet.language === 'AR').length} Arabic titles</p></div><div class="outlet-list-tools"><input class="input outlet-filter" id="manageOutletSearch" type="search" placeholder="Find a publication…" value="${esc(outletSearchTerm)}" aria-label="Find a publication"/><button class="button button-quiet" data-action="add-outlet">＋ Add</button></div></div>${filteredOutlets.length ? filteredOutlets.map(renderOutletManageRow).join('') : '<div class="table-empty">No outlets match this filter.</div>'}</section></div>
      <aside class="setup-side"><section class="card status-panel"><div class="status-panel-header"><div><h3>Monitoring rules</h3><p>Default collection and analysis setup</p></div>${icon('sliders')}</div><ul class="status-list"><li class="is-complete">Google and Bing exact-title searches</li><li class="is-complete">Client + key terms fallback</li><li class="is-complete">${state.outlets.length} designated websites</li><li class="is-complete">24 hours by default; 3-day fallback</li><li class="is-complete">Up to 30 days for magazine coverage</li><li class="is-complete">Separate negative-coverage review</li><li class="is-complete">RAVE formulas for online and print</li></ul><div class="scope-callout" style="margin-top:14px"><strong>RAVE formulas:</strong><br>Online · measurement cm × 6 × 95<br>Print · measurement cm × columns × 115</div></section>
      <section class="card status-panel"><div class="status-panel-header"><div><h3>Local prototype limits</h3><p>Be explicit about what this workspace does.</p></div></div><div class="scope-callout"><strong>Search, email and permissions are not automated.</strong> Search links open external services; an operator checks and logs results. Tone is human-entered. Email drafts are prepared locally and sent by your team. The role switcher is not authentication.</div><div class="backup-actions" style="margin-top:13px"><button class="button button-secondary" data-action="export-workspace">${icon('download')} Download workspace JSON</button><button class="button button-danger" data-action="reset-demo">Reset to demo data</button></div></section></aside></div>`;
}

function formField(label, id, control, hint = '', full = false) {
  return `<div class="form-field ${full ? 'form-field--full' : ''}"><label class="form-label" for="${esc(id)}">${esc(label)}</label>${control}${hint ? `<span class="form-hint">${hint}</span>` : ''}</div>`;
}

function showFormError(form, message) {
  const error = form.querySelector('.form-error');
  if (!error) return;
  error.textContent = message;
  error.classList.add('is-visible');
}

function hideFormError(form) {
  const error = form.querySelector('.form-error');
  if (error) error.classList.remove('is-visible');
}

function openClientDialog(clientId = '') {
  const client = clientId ? getClient(clientId) : null;
  const title = client ? 'Edit client details' : 'Add a client';
  const action = client ? 'Save client details' : 'Add client';
  showDialog(title, 'CLIENT SCOPE', `<form class="dialog-form" id="clientForm" data-id="${esc(client?.id ?? '')}">
    <div class="form-grid">
      ${formField('Client name', 'clientName', `<input class="input" id="clientName" name="name" required maxlength="100" placeholder="e.g. Example Mobility" value="${esc(client?.name ?? '')}" />`)}
      ${formField('Executive name', 'executiveName', `<input class="input" id="executiveName" name="executiveName" required maxlength="100" placeholder="Executive approver" value="${esc(client?.executiveName ?? '')}" />`)}
      ${formField('Executive email', 'executiveEmail', `<input class="input" type="email" id="executiveEmail" name="executiveEmail" required maxlength="160" placeholder="executive@company.com" value="${esc(client?.executiveEmail ?? '')}" />`, 'Used to prepare a verification and final-approval email draft.')}
      ${formField('Client contact name', 'contactName', `<input class="input" id="contactName" name="contactName" maxlength="100" placeholder="Client communications contact" value="${esc(client?.contactName ?? '')}" />`)}
      ${formField('Client contact email', 'contactEmail', `<input class="input" type="email" id="contactEmail" name="contactEmail" maxlength="160" placeholder="communications@client.com" value="${esc(client?.contactEmail ?? '')}" />`, 'Used to prepare the final delivery email.')}
      ${formField('Fallback key terms', 'keyTerms', `<input class="input" id="keyTerms" name="keyTerms" maxlength="240" placeholder="client name, campaign themes, key terms" value="${esc(client?.keyTerms ?? '')}" />`, 'Used only if the exact press release title returns no coverage.', true)}
    </div>
    <div class="form-error" role="alert"></div><div class="dialog-actions"><button type="button" class="button button-secondary" data-dialog-close>Cancel</button><button type="submit" class="button button-primary">${action}</button></div>
  </form>`);
}

function openReleaseDialog(clientId = selectedClientId, releaseId = '') {
  const client = getClient(clientId);
  if (!client) { toast('Add a client before adding a press release.', 'warning'); return; }
  const release = client.pressReleases?.find((item) => item.id === releaseId) ?? null;
  const title = release ? 'Edit press release' : 'Add a press release';
  showDialog(title, 'MONITORING SCOPE', `<form class="dialog-form" id="releaseForm" data-client="${esc(client.id)}" data-id="${esc(release?.id ?? '')}">
    <div class="form-grid">
      ${formField('Client', 'releaseClientName', `<input class="input" id="releaseClientName" readonly value="${esc(client.name)}" />`)}
      ${formField('Issued date', 'releaseIssuedAt', `<input class="input" type="date" id="releaseIssuedAt" name="issuedAt" value="${esc(release?.issuedAt ?? localDateISO())}" />`)}
      ${formField('Press release title · exact search keyword', 'releaseTitle', `<textarea class="textarea" id="releaseTitle" name="title" required maxlength="300" placeholder="Copy the title exactly as issued">${esc(release?.title ?? '')}</textarea>`, 'This title is the first Google and Bing query.', true)}
      ${formField('Monitoring type', 'monitoringType', `<select class="select" id="monitoringType" name="monitoringType"><option value="daily" ${release?.monitoringType !== 'magazine' ? 'selected' : ''}>Daily coverage · 24 hours, extend to 3 days if empty</option><option value="magazine" ${release?.monitoringType === 'magazine' ? 'selected' : ''}>Magazine coverage · up to 30 days</option></select>`, 'Choose the magazine window for periodicals with longer publication lead times.', true)}
    </div>
    <div class="form-error" role="alert"></div><div class="dialog-actions"><button type="button" class="button button-secondary" data-dialog-close>Cancel</button><button type="submit" class="button button-primary">${release ? 'Save press release' : 'Add press release'}</button></div>
  </form>`);
}

function openOutletDialog(outletId = '') {
  const outlet = outletId ? getOutlet(outletId) : null;
  showDialog(outlet ? 'Edit media outlet' : 'Add media outlet', 'DESIGNATED MEDIA LIST', `<form class="dialog-form" id="outletForm" data-id="${esc(outlet?.id ?? '')}">
    <div class="form-grid">
      ${formField('Publication name', 'outletName', `<input class="input" id="outletName" name="name" required maxlength="100" placeholder="Publication or agency name" value="${esc(outlet?.name ?? '')}" />`)}
      ${formField('Language', 'outletLanguage', `<select class="select" id="outletLanguage" name="language"><option value="EN" ${outlet?.language !== 'AR' ? 'selected' : ''}>English</option><option value="AR" ${outlet?.language === 'AR' ? 'selected' : ''}>Arabic</option></select>`)}
      ${formField('Website', 'outletUrl', `<input class="input" type="url" id="outletUrl" name="url" required placeholder="https://example.com" value="${esc(outlet?.url ?? '')}" />`, 'Enter a direct website URL beginning with http:// or https://', true)}
      ${formField('Category', 'outletCategory', `<select class="select" id="outletCategory" name="category">${['News', 'Business', 'News agency', 'Government', 'Trade', 'Magazine', 'Other'].map((category) => `<option ${outlet?.category === category ? 'selected' : ''}>${esc(category)}</option>`).join('')}</select>`)}
    </div>
    <div class="form-error" role="alert"></div><div class="dialog-actions"><button type="button" class="button button-secondary" data-dialog-close>Cancel</button><button type="submit" class="button button-primary">${outlet ? 'Save outlet' : 'Add outlet'}</button></div>
  </form>`);
}

function coverageOutletOptions(selectedId = '') {
  const options = state.outlets.slice().sort((a, b) => a.name.localeCompare(b.name)).map((outlet) => `<option value="${esc(outlet.id)}" ${outlet.id === selectedId ? 'selected' : ''}>${esc(outlet.name)} · ${esc(outlet.language)}</option>`).join('');
  return `<option value="">Select an outlet…</option>${options}<option value="custom" ${selectedId === 'custom' ? 'selected' : ''}>Other / custom outlet</option>`;
}

function openCoverageDialog(articleId = '') {
  if (activeRole !== 'monitor') { toast('Switch to Monitoring team to add or edit coverage.', 'warning'); return; }
  const client = getClient();
  if (!client) { openClientDialog(); return; }
  cancelScreenshotCompression();
  const article = articleId ? state.coverage.find((item) => item.id === articleId) : null;
  const pendingFinal = latestReport(client.id);
  if (article && pendingFinal?.status === 'pending-final' && pendingFinal.coverageIds?.includes(article.id)) {
    toast('This reference is part of a report awaiting final approval. Ask the executive to request changes before editing it.', 'warning');
    return;
  }
  const outlets = article?.outletId ? getOutlet(article.outletId) : null;
  const customOutlet = Boolean(article && !outlets);
  activeScreenshotData = safeImage(article?.screenshotDataUrl) || '';
  const clientReleases = client.pressReleases ?? [];
  const selectedRelease = article?.releaseId ?? selectedReleaseId ?? clientReleases[0]?.id ?? '';
  const releaseSelect = clientReleases.length
    ? `<select class="select" id="coverageReleaseId" name="releaseId" required>${clientReleases.map((release) => `<option value="${esc(release.id)}" ${release.id === selectedRelease ? 'selected' : ''}>${esc(release.title)}</option>`).join('')}</select>`
    : '<input class="input" id="coverageReleaseId" type="text" value="No press release configured" readonly />';
  const screenshotPreview = activeScreenshotData ? `<img class="screenshot-preview" id="screenshotPreview" src="${esc(activeScreenshotData)}" alt="Attached article screenshot preview" />` : '<img class="screenshot-preview" id="screenshotPreview" alt="Screenshot preview" hidden />';
  showDialog(article ? 'Edit coverage reference' : 'Add a coverage reference', 'COVERAGE ITEM', `<form class="dialog-form" id="coverageForm" data-id="${esc(article?.id ?? '')}" data-client="${esc(client.id)}">
    <div class="dialog-help">For ${esc(client.name)}. The tone, measurement and executive verification are entered by your team; search results are not automatically ingested.</div>
    <div class="form-grid">
      ${formField('Press release / monitoring keyword', 'coverageReleaseId', releaseSelect, '', true)}
      ${formField('Content title', 'coverageTitle', `<input class="input" id="coverageTitle" name="title" required maxlength="240" placeholder="Headline as published" value="${esc(article?.title ?? '')}" />`, '', true)}
      ${formField('Publication date', 'coveragePublishedAt', `<input class="input" type="date" id="coveragePublishedAt" name="publishedAt" required value="${esc(article?.publishedAt ?? localDateISO())}" />`)}
      ${formField('Publication / media outlet', 'coverageOutletId', `<select class="select" id="coverageOutletId" name="outletId" required>${coverageOutletOptions(article?.outletId ?? (customOutlet ? 'custom' : ''))}</select>`)}
      <div class="form-field form-field--full" id="customOutletField" ${customOutlet ? '' : 'hidden'}><label class="form-label" for="coverageCustomOutlet">Custom publication name</label><input class="input" id="coverageCustomOutlet" name="customOutlet" maxlength="100" placeholder="Publication name" value="${esc(customOutlet ? article?.outletName ?? '' : '')}" /></div>
      ${formField('Media platform', 'coverageMedium', `<select class="select" id="coverageMedium" name="medium"><option value="online" ${article?.medium !== 'print' ? 'selected' : ''}>Online</option><option value="print" ${article?.medium === 'print' ? 'selected' : ''}>Print</option></select>`)}
      ${formField('Tone', 'coverageTone', `<select class="select" id="coverageTone" name="tone"><option value="positive" ${article?.tone === 'positive' ? 'selected' : ''}>Positive</option><option value="neutral" ${!article || article.tone === 'neutral' ? 'selected' : ''}>Neutral</option><option value="negative" ${article?.tone === 'negative' ? 'selected' : ''}>Negative · highlight</option></select>`)}
      ${formField('Article link', 'coverageLink', `<input class="input" type="url" id="coverageLink" name="link" required placeholder="https://…" value="${esc(article?.link ?? '')}" />`, 'The final report will include a clickable article reference.', true)}
      ${formField('Measurement in cm', 'measurementCm', `<input class="input" type="number" id="measurementCm" name="measurementCm" min="0.1" step="0.1" required value="${esc(article?.measurementCm ?? '')}" placeholder="e.g. 4.2" />`, 'Online: measured article/screen space. Print: measured article length.')}
      <div class="form-field" id="columnsField" ${article?.medium === 'print' ? '' : 'hidden'}><label class="form-label" for="coverageColumns">Number of print columns</label><input class="input" type="number" id="coverageColumns" name="columns" min="1" max="20" step="1" value="${esc(article?.columns ?? 1)}" /></div>
      <div class="form-field" id="wordCountField" ${article?.medium === 'print' ? 'hidden' : ''}><label class="form-label" for="coverageWordCount">Word count · optional</label><input class="input" type="number" id="coverageWordCount" name="wordCount" min="0" max="100000" step="1" value="${esc(article?.wordCount || '')}" placeholder="Optional" /><span class="form-hint">Recorded alongside cm; RAVE uses the cm formula.</span></div>
      <div class="form-field form-field--full"><span class="form-label">Calculated RAVE preview</span><div class="query-box"><span class="query-kind" id="raveFormulaLabel">${article?.medium === 'print' ? 'Print formula' : 'Online formula'}</span><code id="ravePreview">${formatRave(article ? articleRave(article) : 0)} RAVE</code></div></div>
      <div class="form-field form-field--full"><label class="form-label" for="coverageScreenshot">Published article screenshot</label><div class="screenshot-upload"><input type="file" id="coverageScreenshot" name="screenshot" accept="image/jpeg,image/png,image/webp" aria-describedby="screenshotHelp" /></div>${screenshotPreview}<span class="form-hint" id="screenshotHelp">Required before final report approval. Image is compressed and stored in this browser; do not upload confidential material.</span></div>
      ${formField('How it was found · optional', 'coverageSource', `<select class="select" id="coverageSource" name="source"><option value="exact-title" ${article?.source === 'exact-title' ? 'selected' : ''}>Exact PR title</option><option value="client-keywords" ${article?.source === 'client-keywords' ? 'selected' : ''}>Client name + key terms</option><option value="google" ${article?.source === 'google' ? 'selected' : ''}>Google</option><option value="bing" ${article?.source === 'bing' ? 'selected' : ''}>Bing</option><option value="outlet" ${article?.source === 'outlet' ? 'selected' : ''}>Direct outlet check</option><option value="other" ${article?.source === 'other' ? 'selected' : ''}>Other</option></select>`)}
      ${formField('Monitoring notes · optional', 'coverageNotes', `<input class="input" id="coverageNotes" name="notes" maxlength="240" placeholder="Context for the reviewer" value="${esc(article?.notes ?? '')}" />`)}
    </div>
    <div class="form-error" role="alert"></div><div class="dialog-actions"><button type="button" class="button button-secondary" data-dialog-close>Cancel</button><button type="submit" class="button button-primary">${article ? 'Save changes' : 'Add coverage'}</button></div>
  </form>`);
  updateCoverageFormPreview();
}

function openVerificationDialog() {
  if (activeRole !== 'monitor') { toast('Switch to Monitoring team to prepare the verification packet.', 'warning'); return; }
  const client = getClient(); const articles = currentArticles();
  if (!client || !articles.length) { toast('Add coverage references before preparing a verification packet.', 'warning'); return; }
  const name = client.executiveName || 'Executive reviewer';
  const subject = `Media coverage for verification — ${client.name}`;
  const lines = articles.map((article, index) => `${index + 1}. [${toneLabel(article.tone).toUpperCase()}] ${article.title}\n   ${article.outletName} · ${formatDate(article.publishedAt)}\n   ${article.link}`).join('\n\n');
  const body = `Hi ${name},\n\nPlease verify the following identified media references for ${client.name}. Negative coverage is marked for priority review.\n\n${lines}\n\nPlease confirm each reference and flag any corrections before the monitoring report is prepared.\n\nThank you`;
  const mailto = safeEmail(client.executiveEmail) ? `mailto:${client.executiveEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : '';
  showDialog('Prepare first-verification packet', 'EXECUTIVE REVIEW · STEP 1', `<div class="dialog-alert">This local workspace does not send email. Review the draft, copy it or open it in your mail app, then confirm only after you have sent the request.</div><div class="form-field" style="margin-top:13px"><span class="form-label">To · ${esc(name)}</span><div class="query-box"><code>${esc(client.executiveEmail || 'Add an executive email in Clients & outlets')}</code></div></div><div class="form-field" style="margin-top:11px"><label class="form-label" for="verificationDraft">Message draft · ${articles.length} references</label><textarea class="textarea" id="verificationDraft" readonly style="min-height:210px">${esc(`Subject: ${subject}\n\n${body}`)}</textarea></div><div class="dialog-actions" style="justify-content:space-between"><div style="display:flex;gap:8px"><button class="button button-secondary" type="button" data-action="copy-text" data-target="verificationDraft">${icon('copy')} Copy draft</button>${mailto ? `<a class="button button-secondary" href="${esc(mailto)}">Open email app ${icon('external')}</a>` : ''}</div><button class="button button-primary" type="button" data-action="confirm-review-request">I’ve sent the request</button></div>`);
}

function openFinalApprovalDialog(reportId) {
  const report = state.reports.find((item) => item.id === reportId);
  const client = report ? getClient(report.clientId) : null;
  if (!report || !client || activeRole !== 'monitor') { toast('Switch to Monitoring team to prepare final approval.', 'warning'); return; }
  if (report.status !== 'draft') { toast('Only a compiled draft can be sent for final approval.', 'warning'); return; }
  const articles = state.coverage.filter((article) => article.clientId === client.id);
  if (hasCoverageChangedSinceReport(report, articles)) { toast('Coverage changed after this snapshot. Compile the updated report before requesting approval.', 'warning'); return; }
  const readiness = getReportReadiness(report.items);
  if (!readiness.ready) { toast(readiness.reasons.join(' '), 'warning'); return; }
  const name = client.executiveName || 'Executive reviewer';
  const clientName = report.clientName || client.name;
  const subject = `Final approval: Media coverage report — ${clientName}`;
  const negatives = report.items.filter((item) => item.tone === 'negative').length;
  const body = `Hi ${name},\n\nPlease review the attached final media coverage report for ${clientName}. It contains ${report.items.length} verified references, including ${negatives} negative item${negatives === 1 ? '' : 's'}.\n\nPlease approve the report or send back any changes before it is delivered to the client.\n\nThank you`;
  const email = safeEmail(client.executiveEmail);
  const mailto = email ? `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : '';
  showDialog('Prepare final-approval request', 'EXECUTIVE REVIEW · FINAL APPROVAL', `<div class="dialog-alert">This report is compiled but not yet sent. Download and attach the report, then send the draft through your approved email channel. This local app does not send email.</div><div class="form-field" style="margin-top:13px"><span class="form-label">To · ${esc(name)}</span><div class="query-box"><code>${esc(email || 'Add an executive email in Clients & outlets')}</code></div></div><div class="form-field" style="margin-top:11px"><label class="form-label" for="finalApprovalDraft">Message draft · ${report.items.length} references</label><textarea class="textarea" id="finalApprovalDraft" readonly style="min-height:190px">${esc(`Subject: ${subject}\n\n${body}`)}</textarea></div><div class="dialog-actions" style="justify-content:space-between"><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="button button-secondary" type="button" data-action="copy-text" data-target="finalApprovalDraft">${icon('copy')} Copy draft</button><button class="button button-secondary" type="button" data-action="download-report" data-id="${esc(report.id)}">${icon('download')} Download report</button>${mailto ? `<a class="button button-secondary" href="${esc(mailto)}">Open email app ${icon('external')}</a>` : ''}</div><button class="button button-primary" type="button" data-action="confirm-final-approval" data-id="${esc(report.id)}">I’ve sent the request</button></div>`);
}

function openCoverageChangeDialog(articleId) {
  const article = state.coverage.find((item) => item.id === articleId);
  if (!article || activeRole !== 'executive' || article.verificationStatus !== 'pending') { toast('Only the Executive reviewer can request changes on a pending reference.', 'warning'); return; }
  showDialog('Request a correction', 'FIRST VERIFICATION', `<form class="dialog-form" id="coverageChangeForm" data-id="${esc(article.id)}"><p class="form-hint" style="font-size:9px;color:#6f8384">${esc(article.outletName)} · ${esc(article.title)}</p><div class="form-field"><label class="form-label" for="coverageReviewNote">Executive note</label><textarea class="textarea" id="coverageReviewNote" name="note" required maxlength="600" placeholder="What needs to be corrected or verified?">${esc(article.verificationNote ?? '')}</textarea></div><div class="form-error" role="alert"></div><div class="dialog-actions"><button type="button" class="button button-secondary" data-dialog-close>Cancel</button><button type="submit" class="button button-danger">Request correction</button></div></form>`);
}

function openReportChangeDialog(reportId) {
  const report = state.reports.find((item) => item.id === reportId);
  if (!report || activeRole !== 'executive' || report.status !== 'pending-final') { toast('Only the Executive reviewer can request changes on a pending final report.', 'warning'); return; }
  showDialog('Request report changes', 'FINAL APPROVAL', `<form class="dialog-form" id="reportChangeForm" data-id="${esc(report.id)}"><div class="form-field"><label class="form-label" for="reportReviewNote">Executive note</label><textarea class="textarea" id="reportReviewNote" name="note" required maxlength="600" placeholder="Describe what needs to change before approval."></textarea></div><div class="form-error" role="alert"></div><div class="dialog-actions"><button type="button" class="button button-secondary" data-dialog-close>Cancel</button><button type="submit" class="button button-danger">Request changes</button></div></form>`);
}

function openDeliveryDialog(reportId) {
  const report = state.reports.find((item) => item.id === reportId); const client = report ? getClient(report.clientId) : null;
  if (!report || !client || activeRole !== 'head' || report.status !== 'approved') { toast('Only the Monitoring Head can prepare delivery after final approval.', 'warning'); return; }
  const contact = client.contactName || 'Communications team'; const clientName = report.clientName || client.name; const subject = `Approved media coverage report — ${clientName}`;
  const body = `Hello ${contact},\n\nPlease find attached the approved media coverage report for ${clientName}. It includes verified coverage references, screenshots, tone classification and RAVE estimates.\n\nRegards,\n${state.clients.length ? 'Monitoring Head' : 'Media Monitoring'}`;
  const email = safeEmail(client.contactEmail);
  const mailto = email ? `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : '';
  showDialog('Prepare client delivery', 'MONITORING HEAD · STEP 3', `<div class="dialog-alert">The report has final executive approval. Download the HTML report, attach it to the email and send through your approved channel. This prototype does not send email itself.</div><div class="form-field" style="margin-top:13px"><span class="form-label">To · ${esc(contact)}</span><div class="query-box"><code>${esc(email || 'Add the client email in Clients & outlets')}</code></div></div><div class="form-field" style="margin-top:11px"><label class="form-label" for="deliveryDraft">Email draft</label><textarea class="textarea" id="deliveryDraft" readonly style="min-height:120px">${esc(`Subject: ${subject}\n\n${body}`)}</textarea></div><div class="dialog-actions" style="justify-content:space-between"><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="button button-secondary" type="button" data-action="download-report" data-id="${esc(report.id)}">${icon('download')} Download report</button>${mailto ? `<a class="button button-secondary" href="${esc(mailto)}">Open email app ${icon('external')}</a>` : ''}</div><button class="button button-primary" type="button" data-action="confirm-delivery" data-id="${esc(report.id)}">I’ve sent it to the client</button></div>`);
}

function updateCoverageFormPreview() {
  const form = document.querySelector('#coverageForm');
  if (!form) return;
  const medium = form.querySelector('#coverageMedium').value;
  const cm = Number(form.querySelector('#measurementCm').value);
  const columns = Number(form.querySelector('#coverageColumns').value);
  form.querySelector('#columnsField').hidden = medium !== 'print';
  form.querySelector('#wordCountField').hidden = medium === 'print';
  form.querySelector('#coverageColumns').required = medium === 'print';
  const value = calculateRave({ medium, measurementCm: cm, columns });
  form.querySelector('#raveFormulaLabel').textContent = medium === 'print' ? 'Print formula' : 'Online formula';
  form.querySelector('#ravePreview').textContent = `${formatNumber(value)} RAVE`;
  form.querySelector('#customOutletField').hidden = form.querySelector('#coverageOutletId').value !== 'custom';
  form.querySelector('#coverageCustomOutlet').required = form.querySelector('#coverageOutletId').value === 'custom';
}

async function compressScreenshot(file) {
  if (!file || !/^image\/(jpeg|png|webp)$/i.test(file.type)) throw new Error('Choose a JPG, PNG or WebP screenshot.');
  if (file.size > 15 * 1024 * 1024) throw new Error('Screenshot must be smaller than 15 MB before compression.');
  if (typeof createImageBitmap !== 'function') throw new Error('This browser cannot compress images. Use a smaller JPG or PNG screenshot.');
  const bitmap = await createImageBitmap(file);
  try {
    const maxDimension = 1440;
    const ratio = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not read the screenshot.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.78);
  } finally {
    bitmap.close?.();
  }
}

function handleClientSubmit(form) {
  const fields = new FormData(form);
  const name = String(fields.get('name') ?? '').trim();
  const executiveName = String(fields.get('executiveName') ?? '').trim();
  const executiveEmail = safeEmail(fields.get('executiveEmail'));
  const contactEmailValue = String(fields.get('contactEmail') ?? '').trim();
  const contactEmail = contactEmailValue ? safeEmail(contactEmailValue) : '';
  if (!name || !executiveName || !executiveEmail) return showFormError(form, 'Enter the client name, executive name and a valid executive email.');
  if (contactEmailValue && !contactEmail) return showFormError(form, 'Enter a valid client contact email or leave it blank.');
  const clientId = form.dataset.id;
  const client = clientId ? getClient(clientId) : null;
  if (client) {
    const fallbackChanged = client.name !== name || client.keyTerms !== String(fields.get('keyTerms') ?? '').trim();
    Object.assign(client, { name, executiveName, executiveEmail, contactName: String(fields.get('contactName') ?? '').trim(), contactEmail, keyTerms: String(fields.get('keyTerms') ?? '').trim() });
    if (fallbackChanged) {
      (client.pressReleases ?? []).forEach((release) => {
        if (getRun(client.id, release.id)?.fallback) createRun(client, release, { fresh: true });
      });
    }
    addActivity(client.id, `Client details updated for ${client.name}.`, 'setup');
  } else {
    const created = { id: uid('client'), name, executiveName, executiveEmail, contactName: String(fields.get('contactName') ?? '').trim(), contactEmail, keyTerms: String(fields.get('keyTerms') ?? '').trim(), createdAt: nowISO(), pressReleases: [] };
    state.clients.push(created); selectedClientId = created.id; selectedReleaseId = ''; addActivity(created.id, `Client ${created.name} added to the monitoring scope.`, 'setup');
  }
  closeDialog(); persist({ rerender: true }); toast('Client details saved.');
}

function handleReleaseSubmit(form) {
  const fields = new FormData(form); const client = getClient(form.dataset.client);
  if (!client) return showFormError(form, 'Select a valid client.');
  const title = String(fields.get('title') ?? '').trim();
  if (!title) return showFormError(form, 'Copy the press release title exactly as issued.');
  if (!Array.isArray(client.pressReleases)) client.pressReleases = [];
  const releaseId = form.dataset.id;
  const existing = client.pressReleases.find((release) => release.id === releaseId);
  const release = { id: existing?.id ?? uid('release'), title, issuedAt: String(fields.get('issuedAt') ?? ''), monitoringType: fields.get('monitoringType') === 'magazine' ? 'magazine' : 'daily' };
  if (existing) {
    const searchScopeChanged = existing.title !== release.title || existing.monitoringType !== release.monitoringType;
    Object.assign(existing, release);
    if (searchScopeChanged) createRun(client, existing, { fresh: true });
  } else client.pressReleases.push(release);
  selectedClientId = client.id; selectedReleaseId = release.id;
  addActivity(client.id, `${existing ? 'Press release updated' : 'Press release added'}: ${title}`, 'setup');
  closeDialog(); persist({ rerender: true }); toast(existing ? 'Press release updated.' : 'Press release added to the search scope.');
}

function handleOutletSubmit(form) {
  const fields = new FormData(form); const name = String(fields.get('name') ?? '').trim(); const rawUrl = String(fields.get('url') ?? '').trim();
  if (!name) return showFormError(form, 'Enter a publication name.');
  if (!isHttpUrl(rawUrl)) return showFormError(form, 'Enter a valid http:// or https:// website.');
  const outlet = { id: form.dataset.id || uid('outlet'), name, url: new URL(rawUrl).href, language: fields.get('language') === 'AR' ? 'AR' : 'EN', category: String(fields.get('category') ?? 'Other') };
  const index = state.outlets.findIndex((item) => item.id === outlet.id);
  const previous = index >= 0 ? state.outlets[index] : null;
  if (previous && (previous.name !== outlet.name || previous.url !== outlet.url)) {
    const currentRunIds = new Set(state.runs.filter((run) => getRun(run.clientId, run.releaseId)?.id === run.id).map((run) => run.id));
    state.runs.filter((run) => currentRunIds.has(run.id)).forEach((run) => {
      run.searchedOutlets = (run.searchedOutlets ?? []).filter((searchedOutletId) => searchedOutletId !== outlet.id);
      run.updatedAt = nowISO();
    });
  }
  if (index >= 0) state.outlets[index] = outlet;
  else state.outlets.push(outlet);
  closeDialog(); persist({ rerender: true }); toast(index >= 0 ? 'Outlet updated.' : 'Outlet added to the designated media list.');
}

function handleCoverageSubmit(form) {
  if (activeRole !== 'monitor') return showFormError(form, 'Switch to Monitoring team to edit coverage.');
  const fields = new FormData(form);
  const client = getClient(form.dataset.client);
  if (!client) return showFormError(form, 'Choose a valid client.');
  const releaseId = String(fields.get('releaseId') ?? '');
  const release = client.pressReleases?.find((item) => item.id === releaseId);
  if (!release) return showFormError(form, 'Add or select a press release before recording coverage.');
  const title = String(fields.get('title') ?? '').trim();
  const link = String(fields.get('link') ?? '').trim();
  if (!title) return showFormError(form, 'Enter the content title as published.');
  if (!isHttpUrl(link)) return showFormError(form, 'Enter a working article URL beginning with http:// or https://.');
  const outletId = String(fields.get('outletId') ?? '');
  const customOutletName = String(fields.get('customOutlet') ?? '').trim();
  const outlet = outletId && outletId !== 'custom' ? getOutlet(outletId) : null;
  const outletName = outlet?.name ?? (outletId === 'custom' ? customOutletName : '');
  if (!outletName) return showFormError(form, 'Choose an outlet or enter a custom publication name.');
  const medium = fields.get('medium') === 'print' ? 'print' : 'online';
  const measurementCm = Number(fields.get('measurementCm'));
  const columns = medium === 'print' ? Number(fields.get('columns')) : 1;
  if (!Number.isFinite(measurementCm) || measurementCm <= 0) return showFormError(form, 'Enter the article measurement in cm.');
  if (medium === 'print' && (!Number.isInteger(columns) || columns < 1)) return showFormError(form, 'Enter the number of print columns.');
  let run = getRun(client.id, release.id);
  if (!run) run = createRun(client, release);
  const id = form.dataset.id;
  const existing = state.coverage.find((article) => article.id === id);
  const article = {
    id: existing?.id ?? uid('coverage'), clientId: client.id, releaseId, runId: run?.id ?? '',
    outletId: outlet?.id ?? '', outletName, title, publishedAt: String(fields.get('publishedAt') ?? ''), medium,
    link: new URL(link).href, tone: ['positive', 'neutral', 'negative'].includes(fields.get('tone')) ? fields.get('tone') : 'neutral',
    measurementCm, columns, wordCount: medium === 'online' ? Number(fields.get('wordCount')) || 0 : 0,
    screenshotDataUrl: activeScreenshotData || '', source: String(fields.get('source') ?? 'other'), notes: String(fields.get('notes') ?? '').trim(),
    verificationStatus: 'unreviewed', verificationNote: '', verifiedBy: '',
    createdAt: existing?.createdAt ?? nowISO(), updatedAt: nowISO(),
  };
  if (existing) Object.assign(existing, article);
  else state.coverage.unshift(article);
  run.updatedAt = nowISO();
  addActivity(client.id, `${existing ? 'Coverage updated' : 'Coverage added'}: ${article.title}`, article.tone === 'negative' ? 'attention' : 'coverage');
  closeDialog(); persist({ rerender: true }); toast(existing ? 'Coverage updated; executive verification has been reset.' : 'Coverage logged and ready for first verification.');
}

function handleCoverageChangeSubmit(form) {
  const article = state.coverage.find((item) => item.id === form.dataset.id);
  if (!article) return closeDialog();
  if (activeRole !== 'executive') return showFormError(form, 'Switch to Executive reviewer before recording a decision.');
  if (article.verificationStatus !== 'pending') return showFormError(form, 'This reference is no longer awaiting a first-verification decision.');
  const note = String(new FormData(form).get('note') ?? '').trim();
  if (!note) return showFormError(form, 'Explain what needs correction.');
  article.verificationStatus = 'changes'; article.verificationNote = note; article.verifiedBy = getClient(article.clientId)?.executiveName ?? 'Executive reviewer'; article.verifiedAt = nowISO();
  addActivity(article.clientId, `Executive requested a correction: ${article.title}`, 'attention');
  closeDialog(); persist({ rerender: true }); toast('Correction request recorded.');
}

function handleReportChangeSubmit(form) {
  const report = state.reports.find((item) => item.id === form.dataset.id);
  if (!report) return closeDialog();
  if (activeRole !== 'executive') return showFormError(form, 'Switch to Executive reviewer before recording a decision.');
  if (report.status !== 'pending-final') return showFormError(form, 'This report is no longer awaiting final executive approval.');
  const note = String(new FormData(form).get('note') ?? '').trim();
  if (!note) return showFormError(form, 'Explain what needs to change.');
  report.status = 'changes'; report.reviewNote = note; report.requestedChangesAt = nowISO(); report.reviewedBy = getClient(report.clientId)?.executiveName ?? 'Executive reviewer';
  addActivity(report.clientId, 'Executive requested changes to the final report.', 'attention');
  closeDialog(); persist({ rerender: true }); toast('Report changes requested.');
}

function markVerificationRequestSent() {
  if (activeRole !== 'monitor') { toast('Switch to Monitoring team to record the verification handoff.', 'warning'); return; }
  const client = getClient(); const articles = currentArticles();
  if (!client || !articles.length) return;
  articles.forEach((article) => {
    if (article.verificationStatus !== 'approved') {
      article.verificationStatus = 'pending'; article.verificationRequestedAt = nowISO();
    }
  });
  state.reviewRequests.unshift({ id: uid('review'), clientId: client.id, coverageIds: articles.map((article) => article.id), status: 'sent', requestedAt: nowISO(), requestedBy: 'Monitoring team' });
  addActivity(client.id, `First-verification packet sent to ${client.executiveName || 'the executive'}.`, 'approval');
  closeDialog(); persist({ rerender: true }); toast('Verification request recorded. The executive can now review each reference.');
}

function markFinalApprovalRequestSent(reportId) {
  const report = state.reports.find((item) => item.id === reportId);
  const client = report ? getClient(report.clientId) : null;
  if (!report || !client || activeRole !== 'monitor' || report.status !== 'draft') return;
  const articles = state.coverage.filter((article) => article.clientId === client.id);
  if (hasCoverageChangedSinceReport(report, articles)) {
    toast('Coverage changed after this snapshot. Compile the updated report before sending it for approval.', 'warning');
    return;
  }
  const readiness = getReportReadiness(report.items);
  if (!readiness.ready) { toast(readiness.reasons.join(' '), 'warning'); return; }
  report.status = 'pending-final';
  report.finalApprovalRequestedAt = nowISO();
  report.requestedBy = 'Monitoring team';
  addActivity(client.id, `Monitoring team confirmed sending the final-approval report to ${client.executiveName || 'the executive'}.`, 'approval');
  closeDialog(); persist({ rerender: true }); toast('Final-approval request recorded. The executive can now approve the report or request changes.');
}

function compileReport() {
  const client = getClient(); const articles = currentArticles();
  if (!client) return;
  if (activeRole !== 'monitor') { toast('Switch to Monitoring team to compile the report.', 'warning'); return; }
  const previousReport = latestReport(client.id);
  if (previousReport?.status === 'pending-final') { toast('A report is already awaiting final approval. Wait for the executive decision first.', 'warning'); return; }
  if (previousReport && !hasCoverageChangedSinceReport(previousReport, articles)) { toast('Update coverage or add new references before compiling another report.', 'warning'); return; }
  const readiness = getReportReadiness(articles);
  if (!readiness.ready) { toast(readiness.reasons.join(' '), 'warning'); return; }
  const report = {
    id: uid('report'), clientId: client.id, clientName: client.name, coverageIds: articles.map((article) => article.id),
    items: articles.map((article) => ({ ...article })), status: 'draft', compiledAt: nowISO(),
    approvedAt: '', sentAt: '', reviewNote: '', approver: client.executiveName || 'Executive reviewer',
  };
  state.reports.unshift(report);
  addActivity(client.id, `Coverage report compiled for ${client.name}; the final-approval email has not been sent.`, 'approval');
  persist({ rerender: true }); toast('Report compiled as a draft. Prepare the final-approval email and confirm after sending it.');
}

function approveCoverage(articleId) {
  const article = state.coverage.find((item) => item.id === articleId);
  if (!article || activeRole !== 'executive' || article.verificationStatus !== 'pending') return;
  article.verificationStatus = 'approved'; article.verificationNote = ''; article.verifiedBy = getClient(article.clientId)?.executiveName ?? 'Executive reviewer'; article.verifiedAt = nowISO();
  addActivity(article.clientId, `Executive verified: ${article.title}`, 'approval');
  persist({ rerender: true }); toast('Coverage reference verified.');
}

function approveReport(reportId) {
  const report = state.reports.find((item) => item.id === reportId);
  if (!report || activeRole !== 'executive' || report.status !== 'pending-final') return;
  report.status = 'approved'; report.approvedAt = nowISO(); report.reviewedBy = getClient(report.clientId)?.executiveName ?? 'Executive reviewer'; report.reviewNote = '';
  addActivity(report.clientId, 'Executive approved the final coverage report.', 'approval');
  persist({ rerender: true }); toast('Final report approved. The Monitoring Head can prepare client delivery.');
}

function markReportSent(reportId) {
  const report = state.reports.find((item) => item.id === reportId);
  if (!report || activeRole !== 'head' || report.status !== 'approved') return;
  report.status = 'sent'; report.sentAt = nowISO(); report.sentBy = 'Monitoring Head';
  addActivity(report.clientId, 'Monitoring Head confirmed delivery of the approved report to the client.', 'delivery');
  closeDialog(); persist({ rerender: true }); toast('Client delivery recorded.');
}

function googleDateFilter(run) {
  if (run?.mode === 'magazine') return 'qdr:m';
  return run?.extended ? 'qdr:d3' : 'qdr:d';
}

function googleSearchUrl(query, run) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}&tbs=${googleDateFilter(run)}`;
}

function createPrintableReport(report) {
  const title = `Media coverage report — ${report.clientName || getClient(report.clientId)?.name || 'Client'}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><style>
    *{box-sizing:border-box}body{margin:0;padding:34px;color:#183037;background:#f4f7f5;font:14px/1.55 Arial,sans-serif}.print-toolbar{display:flex;max-width:930px;justify-content:flex-end;margin:0 auto 13px}.print-toolbar button{padding:9px 15px;border:0;border-radius:7px;color:#fff;background:#087f73;font-weight:700;cursor:pointer}.report-preview{max-width:930px;margin:0 auto;overflow:hidden;border:1px solid #dfe8e4;border-radius:14px;background:#fff;box-shadow:0 12px 35px rgba(20,50,50,.08)}.report-cover{padding:28px;color:#eef8f3;background:linear-gradient(125deg,#15373b,#19474a)}.eyebrow{margin-bottom:8px;color:#b5d383;font-size:10px;font-weight:700;letter-spacing:1.5px}.report-cover h2{margin:0;font-size:27px}.report-cover p{color:#d0dfd8;font-size:12px}.report-cover-meta{display:flex;gap:20px;margin-top:17px;color:#d0dfd8;font-size:10px}.report-summary-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:15px 20px;border-bottom:1px solid #e9efec}.report-summary-cell strong{display:block;color:#29494a;font-size:18px}.report-summary-cell span{color:#839493;font-size:9px}.report-section-heading{display:flex;justify-content:space-between;padding:16px 20px 9px;border-top:1px solid #eee}.report-section-heading h3{margin:0;font-size:12px}.report-section-heading span{color:#889999;font-size:10px}.report-article{display:grid;grid-template-columns:38px 1fr 100px;gap:12px;padding:13px 20px;border-top:1px solid #edf1ef}.report-article.is-negative{border-left:4px solid #d47a68;background:#fffaf8}.report-article-index{display:grid;width:31px;height:31px;place-items:center;border-radius:8px;color:#47706b;background:#edf5f0;font-size:9px;font-weight:bold}.report-article-main h4{margin:0;color:#29464b;font-size:12px}.report-article-main p{margin:5px 0;color:#718385;font-size:10px;word-break:break-word}.tone-badge{display:inline-block;margin-right:7px;padding:3px 7px;border-radius:16px;font-size:9px;font-weight:bold}.tone-positive{color:#25826d;background:#e5f5ed}.tone-neutral{color:#6f7e83;background:#eff2f1}.tone-negative{color:#b74f49;background:#fff0ed}.report-link{color:#087f73}.report-article-rave{text-align:right;color:#315a56;font-size:12px;font-weight:bold}.report-article-rave small{display:block;color:#839493;font-size:9px;font-weight:normal}.report-image{display:block;max-width:100%;max-height:340px;margin-top:8px;border:1px solid #e3ebe7;border-radius:6px;object-fit:contain}.report-section-negative{border-top:1px solid #f2e2de;background:#fffcfb}.report-empty-state{padding:25px;color:#829392;text-align:center}.report-preview>div:last-child{padding:14px 20px;color:#82908f;font-size:9px}.report-cover-meta strong{color:#fff}.report-preview .report-summary-row:nth-of-type(3){grid-template-columns:1fr}.report-summary-cell{padding:4px}.report-preview .report-article{break-inside:avoid}.report-preview .report-section-heading{break-after:avoid}@media(max-width:650px){body{padding:10px}.report-article{grid-template-columns:30px 1fr}.report-article-rave{grid-column:2;text-align:left}.report-summary-row{grid-template-columns:repeat(2,1fr)}.report-cover-meta{flex-direction:column;gap:5px}}@media print{body{padding:0;background:#fff}.print-toolbar{display:none}.report-preview{max-width:none;border:0;border-radius:0;box-shadow:none}.report-cover{-webkit-print-color-adjust:exact;print-color-adjust:exact}.report-article.is-negative,.tone-badge,.report-section-negative{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body><div class="print-toolbar"><button onclick="window.print()">Print / Save as PDF</button></div>${renderReportDocument(report)}</body></html>`;
}

function downloadReport(reportId) {
  const report = state.reports.find((item) => item.id === reportId);
  if (!report) { toast('Report not found.', 'error'); return; }
  const blob = new Blob([createPrintableReport(report)], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
  const client = getClient(report.clientId);
  anchor.href = url; anchor.download = `media-coverage-${(client?.name ?? 'client').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${localDateISO()}.html`;
  document.body.append(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function exportWorkspace() {
  const payload = { ...state, exportedAt: nowISO(), exportNote: 'Local Signal Desk workspace backup. Keep this file private; it may contain client details and embedded article screenshots.' };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
  anchor.href = url; anchor.download = `signal-desk-workspace-${localDateISO()}.json`; document.body.append(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  toast('Workspace JSON downloaded. Store it securely; this export does not include an in-app restore flow.');
}

async function copyText(value) {
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
    else {
      const temporary = document.createElement('textarea'); temporary.value = value; temporary.style.position = 'fixed'; temporary.style.opacity = '0'; document.body.append(temporary); temporary.select(); document.execCommand('copy'); temporary.remove();
    }
    toast('Copied to clipboard.');
  } catch { toast('Copy failed. Select the draft text and copy it manually.', 'warning'); }
}

function confirmDeleteCoverage(articleId) {
  if (activeRole !== 'monitor') { toast('Switch to Monitoring team to remove coverage.', 'warning'); return; }
  const article = state.coverage.find((item) => item.id === articleId);
  if (!article) return;
  const report = latestReport(article.clientId);
  if (report?.status === 'pending-final' && report.coverageIds?.includes(article.id)) {
    toast('This reference is in a report awaiting final approval. Ask the executive to request changes before removing it.', 'warning');
    return;
  }
  showDialog('Remove this coverage item?', 'COVERAGE LIBRARY', `<div class="dialog-alert">This will remove “${esc(article.title)}” from the current workspace. Previously compiled reports keep their frozen snapshot.</div><div class="dialog-actions"><button type="button" class="button button-secondary" data-dialog-close>Keep item</button><button type="button" class="button button-danger" data-action="confirm-delete-coverage" data-id="${esc(article.id)}">Remove coverage</button></div>`);
}

function confirmResetDialog() {
  showDialog('Reset the demo workspace?', 'RESET LOCAL DATA', `<div class="dialog-alert">This replaces all current browser workspace data, clients, articles, screenshots, search progress, approvals and reports with the illustrative demo set. Download the workspace JSON first if you need to keep anything.</div><div class="dialog-actions"><button class="button button-secondary" type="button" data-dialog-close>Cancel</button><button class="button button-danger" type="button" data-action="confirm-reset">Reset demo workspace</button></div>`);
}

function dispatchAction(action, trigger) {
  const id = trigger.dataset.id;
  switch (action) {
    case 'go-search': navigate('search'); return;
    case 'go-coverage': navigate('coverage'); return;
    case 'go-approvals': navigate('approvals'); return;
    case 'go-reports': navigate('reports'); return;
    case 'go-setup': navigate('setup'); return;
    case 'add-client': openClientDialog(); return;
    case 'edit-client': openClientDialog(id); return;
    case 'add-release': openReleaseDialog(trigger.dataset.client || selectedClientId); return;
    case 'edit-release': openReleaseDialog(trigger.dataset.client || selectedClientId, id); return;
    case 'add-outlet': openOutletDialog(); return;
    case 'edit-outlet': openOutletDialog(id); return;
    case 'add-coverage': openCoverageDialog(); return;
    case 'edit-coverage': openCoverageDialog(id); return;
    case 'delete-coverage': confirmDeleteCoverage(id); return;
    case 'confirm-delete-coverage': {
      if (activeRole !== 'monitor') { closeDialog(); toast('Switch to Monitoring team to remove coverage.', 'warning'); return; }
      const article = state.coverage.find((item) => item.id === id);
      const report = article ? latestReport(article.clientId) : null;
      if (report?.status === 'pending-final' && report.coverageIds?.includes(id)) { closeDialog(); toast('This reference is in a report awaiting final approval.', 'warning'); return; }
      state.coverage = state.coverage.filter((item) => item.id !== id);
      state.reviewRequests.forEach((request) => { request.coverageIds = (request.coverageIds ?? []).filter((coverageId) => coverageId !== id); });
      addActivity(article?.clientId ?? selectedClientId, 'A coverage reference was removed from the current workspace.', 'coverage'); closeDialog(); persist({ rerender: true }); toast('Coverage removed.'); return;
    }
    case 'start-search': {
      const client = getClient(); const release = getRelease(client);
      if (!client || !release) { openReleaseDialog(); return; }
      const run = createRun(client, release); run.updatedAt = nowISO(); addActivity(client.id, `Search started for “${release.title}”.`, 'search'); persist({ rerender: true }); toast('Search plan started. Begin with the exact title on Google and Bing.'); return;
    }
    case 'new-search-run': {
      const client = getClient(); const release = getRelease(client);
      if (!client || !release) return toast('Add a press release before starting a monitoring run.', 'warning');
      const run = createRun(client, release, { fresh: true }); run.updatedAt = nowISO();
      addActivity(client.id, `New ${run.mode === 'magazine' ? '30-day magazine' : '24-hour'} search run started for “${release.title}”.`, 'search');
      persist({ rerender: true }); toast('Fresh monitoring run started with an empty search checklist.'); return;
    }
    case 'mark-engine': {
      const client = getClient(); const release = getRelease(client); const run = getRun(client?.id, release?.id);
      if (!run) { toast('Start the search before marking engine checks.', 'warning'); return; }
      run.searchEngines ??= { google: false, bing: false }; run.searchEngines[trigger.dataset.engine] = !run.searchEngines[trigger.dataset.engine]; run.updatedAt = nowISO();
      addActivity(client.id, `${trigger.dataset.engine === 'google' ? 'Google' : 'Bing'} check ${run.searchEngines[trigger.dataset.engine] ? 'logged' : 'reopened'}.`, 'search'); persist({ rerender: true }); return;
    }
    case 'mark-outlet': {
      const client = getClient(); const release = getRelease(client); const run = getRun(client?.id, release?.id);
      if (!run) return toast('Start the search before marking outlet checks.', 'warning');
      const outletId = trigger.dataset.outlet; run.searchedOutlets ??= [];
      run.searchedOutlets = run.searchedOutlets.includes(outletId) ? run.searchedOutlets.filter((item) => item !== outletId) : [...run.searchedOutlets, outletId];
      run.updatedAt = nowISO(); persist({ rerender: true }); return;
    }
    case 'extend-window': {
      const run = currentRun(); const resultCount = run ? state.coverage.filter((article) => article.runId === run.id).length : 0;
      const progress = getSearchProgress(run);
      if (!run || run.mode === 'magazine' || run.extended || resultCount || progress.done !== progress.total) return toast('Complete the 24-hour checks with no results before extending the window.', 'warning');
      const client = getClient(); const release = getRelease(client);
      const extendedRun = createRun(client, release, { fresh: true });
      extendedRun.mode = 'daily'; extendedRun.extended = true; extendedRun.fallback = run.fallback;
      extendedRun.windowEndAt = run.windowEndAt ?? run.createdAt; extendedRun.updatedAt = nowISO();
      addActivity(selectedClientId, `Search window extended from 24 hours to 3 days after no coverage was found; earlier checks were retained.`, 'search');
      persist({ rerender: true }); toast('Search window extended to the last three days. Re-run and log the searches for the wider range.'); return;
    }
    case 'prepare-review': openVerificationDialog(); return;
    case 'confirm-review-request': markVerificationRequestSent(); return;
    case 'approve-coverage': approveCoverage(id); return;
    case 'request-coverage-changes': openCoverageChangeDialog(id); return;
    case 'compile-report': compileReport(); return;
    case 'prepare-final-approval': openFinalApprovalDialog(id); return;
    case 'confirm-final-approval': markFinalApprovalRequestSent(id); return;
    case 'approve-report': approveReport(id); return;
    case 'request-report-changes': openReportChangeDialog(id); return;
    case 'deliver-report': openDeliveryDialog(id); return;
    case 'confirm-delivery': markReportSent(id); return;
    case 'download-report': downloadReport(id); return;
    case 'export-workspace': exportWorkspace(); return;
    case 'reset-demo': confirmResetDialog(); return;
    case 'confirm-reset':
      state = makeSeedState(); selectedClientId = state.clients[0]?.id ?? ''; selectedReleaseId = state.clients[0]?.pressReleases?.[0]?.id ?? ''; coverageToneFilter = 'all'; coverageSearchTerm = ''; outletSearchTerm = ''; closeDialog(); persist({ rerender: true }); toast('Demo workspace restored.'); return;
    case 'copy-query': copyText(trigger.dataset.query ?? ''); return;
    case 'copy-text': {
      const field = dialogBody.querySelector(`#${CSS.escape(trigger.dataset.target)}`);
      if (field) copyText(field.value); return;
    }
    case 'filter-negative': coverageToneFilter = 'negative'; navigate('coverage'); return;
    default: return;
  }
}

function applySearchFilter(inputId, rowsSelector, attribute) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const query = input.value.trim().toLowerCase();
  document.querySelectorAll(rowsSelector).forEach((row) => {
    const text = row.getAttribute(attribute) ?? '';
    row.classList.toggle('hidden-by-filter', Boolean(query) && !text.includes(query));
  });
}

function handlePageInput(event) {
  if (event.target.id === 'coverageSearch') {
    coverageSearchTerm = event.target.value; applySearchFilter('coverageSearch', '.coverage-table tbody tr[data-coverage-search]', 'data-coverage-search');
  }
  if (event.target.id === 'outletSearch') {
    outletSearchTerm = event.target.value; applySearchFilter('outletSearch', '.outlet-row[data-outlet-name]', 'data-outlet-name');
  }
  if (event.target.id === 'manageOutletSearch') {
    outletSearchTerm = event.target.value; applySearchFilter('manageOutletSearch', '.outlet-manage-row[data-outlet-name]', 'data-outlet-name');
  }
}

function handlePageChange(event) {
  const target = event.target;
  if (target.id === 'releaseSelect') {
    selectedReleaseId = target.value; renderPage(); return;
  }
  if (target.id === 'fallbackToggle') {
    const previousRun = currentRun();
    const client = getClient(); const release = getRelease(client);
    if (!previousRun || !client || !release || previousRun.fallback === target.checked) return;
    const run = createRun(client, release, { fresh: true });
    run.mode = previousRun.mode; run.extended = previousRun.extended; run.windowEndAt = previousRun.windowEndAt ?? previousRun.createdAt;
    run.fallback = target.checked; run.updatedAt = nowISO();
    addActivity(selectedClientId, `A new ${run.fallback ? 'client + key-terms fallback' : 'exact-title'} search phase started; the previous checks were retained.`, 'search');
    persist({ rerender: true });
    return;
  }
  if (target.id === 'coverageMedium' || target.id === 'coverageOutletId' || target.id === 'measurementCm' || target.id === 'coverageColumns') {
    updateCoverageFormPreview(); return;
  }
  if (target.id === 'coverageScreenshot') {
    const file = target.files?.[0];
    if (!file) return;
    const token = ++screenshotToken;
    screenshotPending = true;
    activeScreenshotData = '';
    const form = target.form;
    const submit = form?.querySelector('button[type="submit"]');
    if (submit) {
      submit.dataset.readyText ??= submit.textContent;
      submit.textContent = 'Compressing screenshot…';
      submit.disabled = true;
    }
    const preview = dialogBody.querySelector('#screenshotPreview');
    if (preview) { preview.removeAttribute('src'); preview.hidden = true; }
    compressScreenshot(file).then((image) => {
      if (token !== screenshotToken) return;
      activeScreenshotData = image;
      screenshotPending = false;
      if (submit) { submit.textContent = submit.dataset.readyText; submit.disabled = false; }
      const currentPreview = dialogBody.querySelector('#screenshotPreview');
      if (currentPreview) { currentPreview.src = image; currentPreview.hidden = false; }
      toast('Screenshot compressed and attached to this coverage item.');
    }).catch((error) => {
      if (token !== screenshotToken) return;
      screenshotPending = false;
      if (submit) { submit.textContent = submit.dataset.readyText; submit.disabled = false; }
      toast(error.message || 'Could not read this screenshot.', 'error');
    });
  }
}

function handleDialogSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  if (form.id === 'coverageForm' && screenshotPending) {
    event.preventDefault();
    showFormError(form, 'Wait for the screenshot to finish compressing before saving this coverage item.');
    return;
  }
  const handlers = {
    clientForm: handleClientSubmit,
    releaseForm: handleReleaseSubmit,
    outletForm: handleOutletSubmit,
    coverageForm: handleCoverageSubmit,
    coverageChangeForm: handleCoverageChangeSubmit,
    reportChangeForm: handleReportChangeSubmit,
  };
  const handler = handlers[form.id];
  if (!handler) return;
  event.preventDefault(); hideFormError(form); handler(form);
}

function boot() {
  document.querySelectorAll('.nav-icon[data-icon]').forEach((node) => { node.innerHTML = icon(node.dataset.icon); });
  renderSidebar();
  document.querySelectorAll('.nav-link[data-view]').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.view)));
  document.querySelectorAll('[data-nav]').forEach((button) => button.addEventListener('click', (event) => { event.preventDefault(); navigate(button.dataset.nav); }));
  document.querySelector('#clientSelector').addEventListener('change', (event) => {
    selectedClientId = event.target.value; selectedReleaseId = getClient()?.pressReleases?.[0]?.id ?? ''; coverageToneFilter = 'all'; coverageSearchTerm = ''; outletSearchTerm = ''; persist({ rerender: true });
  });
  document.querySelector('#roleSelector').addEventListener('change', (event) => {
    activeRole = event.target.value; persist({ rerender: true });
    toast(`Workspace role changed to ${activeRole === 'executive' ? 'Executive reviewer' : activeRole === 'head' ? 'Monitoring Head' : 'Monitoring team'}. This is a prototype role switch, not authentication.`);
  });
  document.querySelector('#mobileMenu').addEventListener('click', () => {
    const sidebar = document.querySelector('#sidebar'); const isOpen = sidebar.classList.toggle('is-open');
    document.querySelector('#mobileMenu').setAttribute('aria-expanded', String(isOpen));
  });
  document.querySelector('#dismissBanner').addEventListener('click', () => { showDismissedBanner = true; persist(); });
  pageContent.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-tone-filter]');
    if (tab) { coverageToneFilter = tab.dataset.toneFilter; renderPage(); return; }
    const trigger = event.target.closest('[data-action]');
    if (trigger) { event.preventDefault(); dispatchAction(trigger.dataset.action, trigger); }
  });
  pageContent.addEventListener('input', handlePageInput);
  pageContent.addEventListener('change', handlePageChange);
  dialogBody.addEventListener('click', (event) => {
    const close = event.target.closest('[data-dialog-close]');
    if (close) { event.preventDefault(); closeDialog(); return; }
    const actionButton = event.target.closest('[data-action]');
    if (actionButton) { event.preventDefault(); dispatchAction(actionButton.dataset.action, actionButton); }
  });
  dialogBody.addEventListener('input', (event) => {
    if (['measurementCm', 'coverageColumns'].includes(event.target.id)) updateCoverageFormPreview();
  });
  dialogBody.addEventListener('change', handlePageChange);
  dialogBody.addEventListener('submit', handleDialogSubmit);
  dialog.querySelector('[data-dialog-close]').addEventListener('click', (event) => { event.preventDefault(); closeDialog(); });
  dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(); });
  dialog.addEventListener('cancel', () => { cancelScreenshotCompression(); activeScreenshotData = ''; });
  if (!state.clients.length) currentView = 'setup';
  renderPage();
}

boot();
