(function () {
  const NTFY_TOPIC = 'aljon-portfolio-trk-k7m3x9fp2q';
  const NTFY_URL = 'https://ntfy.sh/' + NTFY_TOPIC;
  const STORAGE_KEY = 'fp_visitor_id';
  const SESSION_KEY = 'fp_session_notified';
  const SECTION_KEY = 'fp_sections_seen';
  const OPTOUT_KEY = 'fp_optout';
  const CLICK_DEDUPE_MS = 1500;

  let lastClick = { key: '', ts: 0 };
  let visitorId = null;

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
    if (!href) return { kind: 'button', title: 'Portfolio click', tags: 'point_up', priority: 2 };
    if (href.indexOf('mailto:') === 0) return { kind: 'email', title: 'Email click', tags: 'email', priority: 3 };
    if (href.indexOf('tel:') === 0) return { kind: 'tel', title: 'Phone click', tags: 'phone', priority: 3 };
    if (/^https?:\/\//i.test(href) && href.indexOf(location.host) === -1) {
      return { kind: 'external', title: 'External link', tags: 'link,arrow_upper_right', priority: 3 };
    }
    if (href.indexOf('#') === 0) return { kind: 'anchor', title: 'Nav click', tags: 'compass', priority: 1 };
    return { kind: 'internal', title: 'Portfolio click', tags: 'point_up', priority: 2 };
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
    const short = visitorId ? visitorId.slice(0, 8) : 'anon';
    const message = '[' + short + '] ' + label + (href ? '\n→ ' + href : '');
    send(message, { title: cls.title + ': ' + label, tags: cls.tags, priority: cls.priority });
  }

  function trackSections() {
    if (!('IntersectionObserver' in window)) return;
    let seen = {};
    try { seen = JSON.parse(sessionStorage.getItem(SECTION_KEY) || '{}'); } catch (e) {}

    const sections = document.querySelectorAll('section[id]');
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        if (seen[id]) return;
        seen[id] = 1;
        try { sessionStorage.setItem(SECTION_KEY, JSON.stringify(seen)); } catch (e) {}

        const heading = entry.target.querySelector('h1, h2, h3');
        const name = heading ? (heading.textContent || '').trim().replace(/\s+/g, ' ') : id;
        const short = visitorId ? visitorId.slice(0, 8) : 'anon';
        send('[' + short + '] viewed #' + id, { title: 'Section viewed: ' + name, tags: 'eyes', priority: 1 });
      });
    }, { threshold: 0.35 });

    sections.forEach(function (s) { io.observe(s); });
  }

  function notifyVisitor(isNew) {
    const short = visitorId ? visitorId.slice(0, 8) : 'anon';
    const ref = document.referrer || '(direct)';
    const ua = summarizeUA();
    const path = location.pathname + location.search;
    if (isNew) {
      const msg = 'New visitor ' + short + '\nUA: ' + ua + '\nRef: ' + ref + '\nPath: ' + path;
      send(msg, { title: 'New portfolio visitor', tags: 'wave', priority: 4 });
    } else {
      const msg = 'Return visitor ' + short + '\nUA: ' + ua + '\nRef: ' + ref;
      send(msg, { title: 'Return visitor', tags: 'eyes', priority: 3 });
    }
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
      const fp = await FingerprintJS.load();
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
