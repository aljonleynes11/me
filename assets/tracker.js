(function () {
  const NTFY_TOPIC = 'aljon-portfolio-trk-k7m3x9fp2q';
  const NTFY_URL = 'https://ntfy.sh/' + NTFY_TOPIC;
  const NTFY_JSON_URL = 'https://ntfy.sh/'; // JSON publish format (used by sendBeacon)
  const STORAGE_KEY = 'fp_visitor_id';
  const SESSION_KEY = 'fp_session_notified';
  const OPTOUT_KEY = 'fp_optout';
  const CLICK_DEDUPE_MS = 1500;

  let lastClick = { key: '', ts: 0 };
  let visitorId = null;
  let geo = { ip: '', country: '', city: '', region: '', org: '' };

  // Session aggregation (flushed on exit)
  const session = {
    startedAt: Date.now(),
    maxScrollPct: 0,
    sectionsSeen: {},    // id -> name
    clicks: [],          // { label, href, kind }
    exitSent: false,
  };

  function send(message, opts) {
    opts = opts || {};
    const headers = {};
    if (opts.title) headers.Title = opts.title;
    if (opts.tags) headers.Tags = opts.tags;
    if (opts.priority) headers.Priority = String(opts.priority);
    try {
      fetch(NTFY_URL, {
        method: 'POST',
        headers: headers,
        body: message,
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
  }

  // Send via sendBeacon (reliable on page unload). ntfy JSON publish accepts topic in body.
  function sendBeacon(payload) {
    try {
      const body = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      if (navigator.sendBeacon && navigator.sendBeacon(NTFY_JSON_URL, body)) return;
    } catch (e) {}
    // Fallback — may not deliver on unload, but worth trying.
    try {
      fetch(NTFY_JSON_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
  }

  async function fetchGeo() {
    // Primary: ipapi.co — free, no key, 1k/day, includes org/city.
    try {
      const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
      if (res.ok) {
        const d = await res.json();
        if (d && !d.error) {
          geo.ip = d.ip || '';
          geo.country = d.country_code || d.country || '';
          geo.city = d.city || '';
          geo.region = d.region || '';
          geo.org = d.org || d.asn || '';
          return;
        }
      }
    } catch (e) { /* fall through */ }

    // Fallback: Cloudflare trace (always works, but IP + country only).
    try {
      const res = await fetch('https://www.cloudflare.com/cdn-cgi/trace', { cache: 'no-store' });
      const text = await res.text();
      const ipMatch = text.match(/^ip=(.+)$/m);
      const locMatch = text.match(/^loc=(.+)$/m);
      if (ipMatch) geo.ip = ipMatch[1].trim();
      if (locMatch) geo.country = locMatch[1].trim();
    } catch (e) { /* no-op */ }
  }

  function geoLines() {
    const lines = [];
    if (geo.ip || geo.country) {
      lines.push('IP: ' + (geo.ip || '?') + ' · ' + (geo.country || '??'));
    }
    const place = [geo.city, geo.region].filter(Boolean).join(', ');
    if (place) lines.push('Loc: ' + place);
    if (geo.org) lines.push('Org: ' + geo.org);
    return lines;
  }

  function geoTitleSuffix() {
    if (geo.org) return ' — ' + geo.org;
    const place = [geo.city, geo.country].filter(Boolean).join(', ');
    if (place) return ' (' + place + ')';
    return '';
  }

  function summarizeUA() {
    const ua = navigator.userAgent;
    let os = 'Unknown OS';
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iOS/i.test(ua)) os = 'iOS';
    else if (/Mac OS X/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    let browser = 'Unknown';
    if (/Edg\//.test(ua)) browser = 'Edge';
    else if (/OPR\//.test(ua)) browser = 'Opera';
    else if (/Chrome\//.test(ua)) browser = 'Chrome';
    else if (/Firefox\//.test(ua)) browser = 'Firefox';
    else if (/Safari\//.test(ua)) browser = 'Safari';
    return browser + ' / ' + os;
  }

  function elementLabel(el) {
    if (!el) return 'unknown';
    const aria = el.getAttribute('aria-label');
    if (aria) return aria.trim();
    const text = (el.textContent || '').trim().replace(/\s+/g, ' ');
    if (text) return text.length > 60 ? text.slice(0, 57) + '…' : text;
    const href = el.getAttribute('href');
    if (href) return href;
    return el.tagName.toLowerCase();
  }

  function classifyLink(target, href) {
    if (!href) return { kind: 'button', title: 'Portfolio click', tags: 'point_up', priority: 2, realtime: false };
    if (href.indexOf('mailto:') === 0) return { kind: 'email', title: 'Email click', tags: 'email', priority: 4, realtime: true };
    if (href.indexOf('tel:') === 0) return { kind: 'tel', title: 'Phone click', tags: 'phone', priority: 4, realtime: true };
    if (/^https?:\/\//i.test(href) && href.indexOf(location.host) === -1) {
      return { kind: 'external', title: 'External link', tags: 'link,arrow_upper_right', priority: 3, realtime: true };
    }
    if (href.indexOf('#') === 0) return { kind: 'anchor', title: 'Nav click', tags: 'compass', priority: 1, realtime: false };
    return { kind: 'internal', title: 'Portfolio click', tags: 'point_up', priority: 2, realtime: false };
  }

  function onClick(e) {
    const target = e.target.closest('a, button');
    if (!target) return;
    const label = elementLabel(target);
    const href = target.getAttribute('href') || '';
    const key = label + '|' + href;
    const now = Date.now();
    if (key === lastClick.key && now - lastClick.ts < CLICK_DEDUPE_MS) return;
    lastClick = { key: key, ts: now };

    const cls = classifyLink(target, href);
    session.clicks.push({ label: label, href: href, kind: cls.kind });

    if (cls.realtime) {
      const short = visitorId ? visitorId.slice(0, 8) : 'anon';
      const message = '[' + short + '] ' + label + (href ? '\n→ ' + href : '') + (geo.country ? '\n' + geo.country + (geo.org ? ' · ' + geo.org : '') : '');
      send(message, { title: cls.title + ': ' + label, tags: cls.tags, priority: cls.priority });
    }
  }

  function trackSections() {
    if (!('IntersectionObserver' in window)) return;
    const sections = document.querySelectorAll('section[id]');
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        if (session.sectionsSeen[id]) return;
        const heading = entry.target.querySelector('h1, h2, h3');
        const name = heading ? (heading.textContent || '').trim().replace(/\s+/g, ' ') : id;
        session.sectionsSeen[id] = name;
      });
    }, { threshold: 0.35 });
    sections.forEach(function (s) { io.observe(s); });
  }

  function trackScroll() {
    const doc = document.documentElement;
    function update() {
      const scrolled = (window.scrollY || doc.scrollTop) + window.innerHeight;
      const total = Math.max(doc.scrollHeight, document.body.scrollHeight);
      if (!total) return;
      const pct = Math.min(100, Math.round((scrolled / total) * 100));
      if (pct > session.maxScrollPct) session.maxScrollPct = pct;
    }
    let ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });
    update();
  }

  function formatDuration(ms) {
    const s = Math.round(ms / 1000);
    if (s < 60) return s + 's';
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return m + 'm' + (rem ? ' ' + rem + 's' : '');
  }

  function notifyVisitor(isNew) {
    const short = visitorId ? visitorId.slice(0, 8) : 'anon';
    const ref = document.referrer || '(direct)';
    const ua = summarizeUA();
    const path = location.pathname + location.search;
    const lines = [];
    lines.push((isNew ? 'New' : 'Return') + ' visitor ' + short);
    geoLines().forEach(function (l) { lines.push(l); });
    lines.push('UA: ' + ua);
    lines.push('Ref: ' + ref);
    if (isNew) lines.push('Path: ' + path);
    const title = (isNew ? 'New portfolio visitor' : 'Return visitor') + geoTitleSuffix();
    send(lines.join('\n'), { title: title, tags: isNew ? 'wave' : 'eyes', priority: isNew ? 4 : 3 });
  }

  function sendExitSummary() {
    if (session.exitSent) return;
    session.exitSent = true;

    const duration = Date.now() - session.startedAt;
    const sectionNames = Object.values(session.sectionsSeen);
    const ctaClicks = session.clicks.filter(function (c) {
      return c.kind === 'external' || c.kind === 'email' || c.kind === 'tel';
    });
    const totalClicks = session.clicks.length;

    // Skip summary for drive-by bounces (<5s, no scroll beyond hero, no clicks).
    if (duration < 5000 && session.maxScrollPct < 25 && totalClicks === 0) return;

    const short = visitorId ? visitorId.slice(0, 8) : 'anon';
    const lines = [];
    lines.push('Visitor ' + short + ' left after ' + formatDuration(duration));
    lines.push('Scrolled: ' + session.maxScrollPct + '%');
    if (sectionNames.length) lines.push('Sections: ' + sectionNames.join(', '));
    if (totalClicks) {
      lines.push('Clicks: ' + totalClicks + (ctaClicks.length ? ' (' + ctaClicks.length + ' CTA)' : ''));
      if (ctaClicks.length) {
        ctaClicks.slice(0, 5).forEach(function (c) {
          lines.push('  → ' + c.label + (c.href ? ' [' + c.href + ']' : ''));
        });
      }
    }
    geoLines().forEach(function (l) { lines.push(l); });

    // Engagement tier: priority 4 if they engaged (>30s or clicked CTA or scrolled >75%), else 2.
    const engaged = duration > 30000 || ctaClicks.length > 0 || session.maxScrollPct >= 75;
    const title = 'Session end · ' + formatDuration(duration) + ' · ' + session.maxScrollPct + '%' + geoTitleSuffix();

    sendBeacon({
      topic: NTFY_TOPIC,
      title: title,
      message: lines.join('\n'),
      tags: engaged ? ['chart_with_upwards_trend'] : ['wave_goodbye'],
      priority: engaged ? 4 : 2,
    });
  }

  function wireExit() {
    // pagehide is most reliable (fires on bfcache + close + navigation on mobile).
    window.addEventListener('pagehide', sendExitSummary);
    // visibilitychange hidden catches mobile tab-switch / app background.
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') sendExitSummary();
    });
    // beforeunload as a final safety net for desktop.
    window.addEventListener('beforeunload', sendExitSummary);
  }

  async function init() {
    // Opt-out: visit with ?notrack=1 to disable tracking on this device permanently.
    try {
      if (location.search.indexOf('notrack=1') !== -1) localStorage.setItem(OPTOUT_KEY, '1');
      if (localStorage.getItem(OPTOUT_KEY) === '1') return;
    } catch (e) {}

    try {
      const mod = await import('https://openfpcdn.io/fingerprintjs/v4');
      const FingerprintJS = mod.default || mod;
      const [fp] = await Promise.all([FingerprintJS.load(), fetchGeo()]);
      const result = await fp.get();
      visitorId = result.visitorId;
    } catch (e) {
      visitorId = 'fp-err-' + Math.random().toString(36).slice(2, 10);
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const isNew = !stored || stored !== visitorId;
    if (isNew) localStorage.setItem(STORAGE_KEY, visitorId);

    const notifiedThisSession = sessionStorage.getItem(SESSION_KEY);
    if (isNew || !notifiedThisSession) {
      notifyVisitor(isNew);
      sessionStorage.setItem(SESSION_KEY, '1');
    }

    document.addEventListener('click', onClick, true);
    trackSections();
    trackScroll();
    wireExit();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
