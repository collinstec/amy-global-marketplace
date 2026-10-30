/* Meridian — a local-first organizer for projects and goals.
 * No build step and no dependencies: state lives in localStorage and the UI
 * is re-rendered from it after every change. */
(() => {
  'use strict';

  const STORAGE_KEY = 'meridian.v1';
  const DAY = 86400000;

  const STATUSES = [
    { id: 'planning', label: 'Planning', tone: 'blue' },
    { id: 'active', label: 'In progress', tone: 'accent' },
    { id: 'hold', label: 'On hold', tone: 'amber' },
    { id: 'done', label: 'Completed', tone: 'green' },
  ];
  const PRIORITIES = [
    { id: 1, label: 'Low' },
    { id: 2, label: 'Medium' },
    { id: 3, label: 'High' },
  ];
  const COLORS = ['#6366f1', '#0ea5e9', '#14b8a6', '#22c55e', '#eab308', '#f97316', '#ef4444', '#ec4899', '#a855f7', '#64748b'];
  const CATEGORIES = ['Business', 'Career', 'Product', 'Health', 'Finance', 'Learning', 'Personal'];
  const GOAL_STATES = {
    achieved: { label: 'Achieved', tone: 'green' },
    ontrack: { label: 'On track', tone: 'accent' },
    risk: { label: 'At risk', tone: 'amber' },
    behind: { label: 'Behind', tone: 'red' },
  };

  /* ------------------------------------------------------------------------
     Icons (Lucide-style strokes)
     ------------------------------------------------------------------------ */
  const ICONS = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    edit: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    board: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="14" rx="1.5"/><rect width="7" height="7" x="3" y="14" rx="1.5"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    trend: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    signal: '<path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/>',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/>',
    sparkle: '<path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2Z"/>',
  };
  const icon = (name) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  /* ------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pct = (n) => `${Math.round(n * 100)}%`;
  const fmtNum = (n) => (Number.isInteger(n) ? n.toLocaleString() : (+n).toLocaleString(undefined, { maximumFractionDigits: 1 }));

  const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const isoDay = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
  const parseDay = (s) => { if (!s) return null; const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const daysUntil = (s) => { const d = parseDay(s); return d ? Math.round((d - startOfToday()) / DAY) : null; };
  const fmtDate = (s, opts = { month: 'short', day: 'numeric' }) => {
    const d = parseDay(s); if (!d) return '';
    if (d.getFullYear() !== new Date().getFullYear()) opts = { ...opts, year: 'numeric' };
    return d.toLocaleDateString(undefined, opts);
  };
  const relDue = (s) => {
    const n = daysUntil(s);
    if (n === null) return '';
    if (n === 0) return 'Due today';
    if (n === 1) return 'Due tomorrow';
    if (n === -1) return '1 day overdue';
    if (n < 0) return `${-n} days overdue`;
    if (n < 14) return `${n} days left`;
    return fmtDate(s);
  };
  const targetCountdown = (s) => {
    const n = daysUntil(s);
    if (n < 0) return `The target date passed ${-n} day${n === -1 ? '' : 's'} ago.`;
    if (n === 0) return 'The target date is today.';
    return `${n} day${n === 1 ? '' : 's'} until the target date.`;
  };
  const dueClass = (s, done) => {
    if (done) return '';
    const n = daysUntil(s);
    if (n === null) return '';
    if (n < 0) return 'overdue';
    if (n <= 7) return 'soon';
    return '';
  };

  /* ------------------------------------------------------------------------
     State
     ------------------------------------------------------------------------ */
  let state = load();
  const ui = {
    view: 'dashboard',
    projectLayout: 'board',
    projectFilter: 'all',
    goalFilter: 'all',
    query: '',
    drawer: null, // { type: 'project'|'goal', id }
    modal: null, // { type, id? }
    focusAfterRender: null,
    draggingId: null,
  };
  try { Object.assign(ui, JSON.parse(localStorage.getItem(STORAGE_KEY + '.ui') || '{}'), { drawer: null, modal: null, query: '' }); } catch (_) { /* ignore */ }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.projects) && Array.isArray(data.goals)) return normalize(data);
      }
    } catch (_) { /* fall through to seed */ }
    return seed();
  }

  function normalize(data) {
    return {
      settings: { theme: 'system', ...(data.settings || {}) },
      projects: data.projects.map((p) => ({
        id: p.id || uid(), name: p.name || 'Untitled project', description: p.description || '',
        color: p.color || COLORS[0], status: STATUSES.some((s) => s.id === p.status) ? p.status : 'planning',
        priority: clamp(+p.priority || 2, 1, 3), dueDate: p.dueDate || '', tags: Array.isArray(p.tags) ? p.tags : [],
        tasks: Array.isArray(p.tasks) ? p.tasks.map((t) => ({ id: t.id || uid(), title: t.title || '', done: !!t.done })) : [],
        createdAt: p.createdAt || Date.now(),
      })),
      goals: data.goals.map((g) => ({
        id: g.id || uid(), title: g.title || 'Untitled goal', description: g.description || '',
        category: g.category || 'Personal', targetDate: g.targetDate || '',
        startDate: g.startDate || isoDay(g.createdAt || Date.now()),
        metric: { current: +(g.metric?.current) || 0, target: +(g.metric?.target) || 0, unit: g.metric?.unit || '' },
        milestones: Array.isArray(g.milestones) ? g.milestones.map((m) => ({ id: m.id || uid(), title: m.title || '', done: !!m.done })) : [],
        projectIds: Array.isArray(g.projectIds) ? g.projectIds : [],
        createdAt: g.createdAt || Date.now(),
      })),
    };
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem(STORAGE_KEY + '.ui', JSON.stringify({ view: ui.view, projectLayout: ui.projectLayout, projectFilter: ui.projectFilter, goalFilter: ui.goalFilter }));
    } catch (_) { /* storage unavailable — keep working in memory */ }
  }

  let undoSnapshot = null;
  function commit(mutator, message, { undoable = false } = {}) {
    if (undoable) undoSnapshot = JSON.stringify(state);
    mutator(state);
    save();
    render();
    if (message) toast(message, undoable);
  }

  function seed() {
    const t = startOfToday();
    const day = (n) => isoDay(new Date(t.getTime() + n * DAY));
    const task = (title, done = false) => ({ id: uid(), title, done });
    const p1 = uid(), p2 = uid(), p3 = uid(), p4 = uid(), p5 = uid(), p6 = uid();
    const now = Date.now();
    return normalize({
      settings: { theme: 'system' },
      projects: [
        { id: p1, name: 'Brand identity refresh', description: 'New logo system, typography and a refreshed colour palette rolled out across every customer touchpoint.', color: '#6366f1', status: 'active', priority: 3, dueDate: day(9), tags: ['Design'],
          tasks: [task('Audit current brand assets', true), task('Moodboards and creative direction', true), task('Logo concepts — round 1', true), task('Typography pairing'), task('Colour system + accessibility check'), task('Brand guidelines document')] },
        { id: p2, name: 'Marketplace v2 launch', description: 'Ship the redesigned storefront with faster checkout and seller dashboards.', color: '#0ea5e9', status: 'active', priority: 3, dueDate: day(24), tags: ['Product', 'Engineering'],
          tasks: [task('Finalize product requirements', true), task('Checkout flow prototype', true), task('Seller dashboard MVP'), task('Payments integration'), task('Beta with 20 sellers'), task('Launch announcement')] },
        { id: p3, name: 'Q4 content calendar', description: 'Plan and schedule a quarter of blog posts, newsletters and social campaigns.', color: '#ec4899', status: 'planning', priority: 2, dueDate: day(5), tags: ['Marketing'],
          tasks: [task('Define content pillars'), task('Outline 12 blog posts'), task('Newsletter template')] },
        { id: p4, name: 'Supplier partnerships', description: 'Onboard three new regional suppliers to broaden the catalogue.', color: '#14b8a6', status: 'planning', priority: 2, dueDate: day(40), tags: ['Operations'],
          tasks: [task('Shortlist suppliers', true), task('Intro calls'), task('Negotiate terms')] },
        { id: p5, name: 'Customer research sprint', description: 'Twelve interviews to understand why buyers churn after their first order.', color: '#f97316', status: 'hold', priority: 1, dueDate: day(-3), tags: ['Research'],
          tasks: [task('Recruit participants', true), task('Interview guide', true), task('Run interviews'), task('Synthesis workshop')] },
        { id: p6, name: 'Website performance pass', description: 'Bring Largest Contentful Paint under 2 seconds on mobile.', color: '#22c55e', status: 'done', priority: 2, dueDate: day(-12), tags: ['Engineering'],
          tasks: [task('Image optimisation', true), task('Lazy-load below the fold', true), task('Cut unused JavaScript', true)] },
      ].map((p, i) => ({ ...p, createdAt: now - (30 - i) * DAY })),
      goals: [
        { title: 'Reach $250k annual revenue', description: 'Grow marketplace GMV through new sellers and repeat buyers.', category: 'Business', startDate: day(-120), targetDate: day(65),
          metric: { current: 168000, target: 250000, unit: 'USD' }, projectIds: [p2, p4],
          milestones: [{ title: '$100k', done: true }, { title: '$150k', done: true }, { title: '$200k' }, { title: '$250k' }] },
        { title: 'Launch a world-class brand', description: 'A brand people recognise and trust at first glance.', category: 'Product', startDate: day(-30), targetDate: day(20),
          metric: { current: 0, target: 0, unit: '' }, projectIds: [p1],
          milestones: [{ title: 'Creative direction approved', done: true }, { title: 'Logo finalized', done: true }, { title: 'Guidelines published' }, { title: 'Site + socials updated' }] },
        { title: 'Grow newsletter to 10k subscribers', description: '', category: 'Business', startDate: day(-60), targetDate: day(120),
          metric: { current: 3400, target: 10000, unit: 'subscribers' }, projectIds: [p3], milestones: [] },
        { title: 'Run a half marathon', description: 'Train consistently and finish under 2 hours.', category: 'Health', startDate: day(-45), targetDate: day(75),
          metric: { current: 140, target: 300, unit: 'km trained' }, projectIds: [], milestones: [{ title: 'First 10k', done: true }, { title: 'First 15k' }, { title: 'Race day' }] },
        { title: 'Read 24 books this year', description: '', category: 'Learning', startDate: `${t.getFullYear()}-01-01`, targetDate: `${t.getFullYear()}-12-31`,
          metric: { current: 21, target: 24, unit: 'books' }, projectIds: [], milestones: [] },
      ].map((g) => ({ ...g, milestones: g.milestones.map((m) => ({ id: uid(), done: false, ...m })), createdAt: now })),
    });
  }

  /* ------------------------------------------------------------------------
     Derived data
     ------------------------------------------------------------------------ */
  const getProject = (id) => state.projects.find((p) => p.id === id);
  const getGoal = (id) => state.goals.find((g) => g.id === id);
  const statusOf = (id) => STATUSES.find((s) => s.id === id) || STATUSES[0];

  function projectProgress(p) {
    if (p.status === 'done') return 1;
    if (!p.tasks.length) return 0;
    return p.tasks.filter((t) => t.done).length / p.tasks.length;
  }

  function goalProgress(g) {
    if (g.metric.target > 0) return clamp(g.metric.current / g.metric.target, 0, 1);
    if (g.milestones.length) return g.milestones.filter((m) => m.done).length / g.milestones.length;
    if (g.projectIds.length) {
      const ps = g.projectIds.map(getProject).filter(Boolean);
      if (ps.length) return ps.reduce((a, p) => a + projectProgress(p), 0) / ps.length;
    }
    return 0;
  }

  /** How far along the goal *should* be, given its start and target dates. */
  function expectedProgress(g) {
    const start = parseDay(g.startDate), end = parseDay(g.targetDate);
    if (!start || !end || end <= start) return null;
    return clamp((startOfToday() - start) / (end - start), 0, 1);
  }

  function goalState(g) {
    const p = goalProgress(g);
    if (p >= 1) return 'achieved';
    const e = expectedProgress(g);
    if (e === null) return 'ontrack';
    if (p >= e - 0.08) return 'ontrack';
    if (p >= e - 0.22) return 'risk';
    return 'behind';
  }

  function matchesQuery(...fields) {
    const q = ui.query.trim().toLowerCase();
    if (!q) return true;
    return fields.some((f) => String(f || '').toLowerCase().includes(q));
  }

  const visibleProjects = () => state.projects.filter((p) =>
    matchesQuery(p.name, p.description, p.tags.join(' '), p.tasks.map((t) => t.title).join(' ')) &&
    (ui.projectFilter === 'all' || String(p.priority) === ui.projectFilter));

  const visibleGoals = () => state.goals.filter((g) =>
    matchesQuery(g.title, g.description, g.category, g.metric.unit) &&
    (ui.goalFilter === 'all' || goalState(g) === ui.goalFilter));

  /* ------------------------------------------------------------------------
     Small components
     ------------------------------------------------------------------------ */
  function ring(value, { size = 56, stroke = 5, color = 'var(--accent)', label = '' } = {}) {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - clamp(value, 0, 1));
    return `<div class="ring-wrap" style="width:${size}px;height:${size}px">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg)">
        <circle class="ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"/>
        <circle class="ring-val" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
          stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"/>
      </svg>
      <div class="ring-label">${label}</div>
    </div>`;
  }

  const bar = (value, color) => `<div class="bar" style="--c:${color || 'var(--accent)'}"><i style="width:${pct(clamp(value, 0, 1))}"></i></div>`;
  const statusPill = (id) => { const s = statusOf(id); return `<span class="pill ${s.tone}">${s.label}</span>`; };
  const goalPill = (g) => { const s = GOAL_STATES[goalState(g)]; return `<span class="pill ${s.tone}">${s.label}</span>`; };
  const prio = (n) => `<span class="prio p${n}" title="${PRIORITIES[n - 1].label} priority"><i></i><i></i><i></i></span>`;
  const dueChip = (s, done) => s ? `<span class="meta-chip ${dueClass(s, done)}">${icon('calendar')}${esc(done ? fmtDate(s) : relDue(s))}</span>` : '';

  function emptyState(art, title, text, action) {
    return `<div class="empty"><div class="art">${icon(art)}</div><h3>${esc(title)}</h3><p>${esc(text)}</p>${action || ''}</div>`;
  }

  /* ------------------------------------------------------------------------
     Views
     ------------------------------------------------------------------------ */
  function greeting() {
    const h = new Date().getHours();
    return h < 5 ? 'Working late' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }

  function renderDashboard() {
    const projects = state.projects;
    const active = projects.filter((p) => p.status === 'active');
    const tasks = projects.flatMap((p) => p.tasks);
    const doneTasks = tasks.filter((t) => t.done).length;
    const goals = state.goals;
    const healthy = goals.filter((g) => ['ontrack', 'achieved'].includes(goalState(g))).length;
    const dueSoon = projects.filter((p) => p.status !== 'done' && p.dueDate && daysUntil(p.dueDate) <= 7).length;
    const overdue = projects.filter((p) => p.status !== 'done' && p.dueDate && daysUntil(p.dueDate) < 0).length;

    const openProjects = projects.filter((p) => p.status !== 'done');
    const overall = projects.length ? projects.reduce((a, p) => a + projectProgress(p), 0) / projects.length : 0;

    const momentum = [...openProjects]
      .sort((a, b) => (a.status === 'active' ? 0 : 1) - (b.status === 'active' ? 0 : 1) || b.priority - a.priority)
      .slice(0, 6);

    const upcoming = [
      ...openProjects.filter((p) => p.dueDate).map((p) => ({ kind: 'project', id: p.id, date: p.dueDate, title: p.name, color: p.color })),
      ...goals.filter((g) => g.targetDate && goalState(g) !== 'achieved').map((g) => ({ kind: 'goal', id: g.id, date: g.targetDate, title: g.title })),
    ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);

    const focus = [...goals].filter((g) => goalState(g) !== 'achieved')
      .sort((a, b) => (a.targetDate || '9999').localeCompare(b.targetDate || '9999')).slice(0, 3);

    const statusCounts = STATUSES.map((s) => ({ ...s, n: projects.filter((p) => p.status === s.id).length }));
    const toneVar = { blue: 'var(--blue)', accent: 'var(--accent)', amber: 'var(--amber)', green: 'var(--green)' };

    const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

    return `
      <div class="page-head">
        <div>
          <div class="eyebrow">${esc(today)}</div>
          <h1 class="page-title">${greeting()}. <em>Let’s move things forward.</em></h1>
          <p class="page-sub">${active.length ? `You have ${active.length} project${active.length === 1 ? '' : 's'} in motion` : 'No projects in motion yet'}${dueSoon ? ` and ${dueSoon} deadline${dueSoon === 1 ? '' : 's'} within the week.` : '.'}</p>
        </div>
      </div>

      <div class="stats">
        <div class="panel stat">
          <div class="stat-top">Active projects <span class="stat-icon" style="background:var(--accent-soft);color:var(--accent)">${icon('folder')}</span></div>
          <div class="stat-value">${active.length}<small>/ ${projects.length}</small></div>
          <div class="stat-foot">${statusCounts[0].n} planning · ${statusCounts[3].n} completed</div>
        </div>
        <div class="panel stat">
          <div class="stat-top">Tasks completed <span class="stat-icon" style="background:var(--green-soft);color:var(--green)">${icon('checkCircle')}</span></div>
          <div class="stat-value">${doneTasks}<small>/ ${tasks.length}</small></div>
          ${bar(tasks.length ? doneTasks / tasks.length : 0, 'var(--green)')}
        </div>
        <div class="panel stat">
          <div class="stat-top">Goals on track <span class="stat-icon" style="background:var(--blue-soft);color:var(--blue)">${icon('target')}</span></div>
          <div class="stat-value">${healthy}<small>/ ${goals.length}</small></div>
          <div class="stat-foot">${goals.length - healthy ? `${goals.length - healthy} need${goals.length - healthy === 1 ? 's' : ''} attention` : 'Everything is on pace'}</div>
        </div>
        <div class="panel stat">
          <div class="stat-top">Due this week <span class="stat-icon" style="background:var(--amber-soft);color:var(--amber)">${icon('clock')}</span></div>
          <div class="stat-value">${dueSoon}</div>
          <div class="stat-foot" style="${overdue ? 'color:var(--red)' : ''}">${overdue ? `${overdue} overdue` : 'Nothing overdue'}</div>
        </div>
      </div>

      <div class="dash-grid">
        <div class="panel">
          <div class="panel-head">
            <div><h2 class="panel-title">Project momentum</h2><div class="panel-sub">Progress across open projects</div></div>
            <a class="link-btn" href="#projects">All projects ${icon('arrow')}</a>
          </div>
          <div class="panel-body momentum">
            ${momentum.length ? momentum.map((p) => {
              const v = projectProgress(p);
              const done = p.tasks.filter((t) => t.done).length;
              return `<button class="momentum-row" data-open-project="${p.id}">
                <div class="mr-name"><span class="dot" style="background:${p.color}"></span>
                  <div style="min-width:0"><strong>${esc(p.name)}</strong><div class="mr-meta">${statusOf(p.status).label} · ${done}/${p.tasks.length} tasks${p.dueDate ? ` · ${esc(relDue(p.dueDate))}` : ''}</div></div>
                </div>
                ${bar(v, p.color)}
                <div class="mr-pct">${pct(v)}</div>
              </button>`;
            }).join('') : `<p class="muted-note">Create a project to see its momentum here.</p>`}
          </div>
        </div>

        <div class="panel">
          <div class="panel-head"><div><h2 class="panel-title">Portfolio completion</h2><div class="panel-sub">Average progress of all projects</div></div></div>
          <div class="overall">
            ${ring(overall, { size: 168, stroke: 12, label: `<div><div class="ring-big">${Math.round(overall * 100)}<span style="font-size:22px">%</span></div><div class="ring-cap">complete</div></div>` })}
            <div class="legend">
              ${statusCounts.map((s) => `<div><span class="dot" style="background:${toneVar[s.tone]}"></span>${s.label}<b>${s.n}</b></div>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="dash-grid">
        <div>
          <div class="page-head" style="margin:8px 0 14px">
            <div><h2 class="panel-title" style="font-size:15px">Goals in focus</h2><div class="panel-sub">Nearest target dates</div></div>
            <a class="link-btn" href="#goals">All goals ${icon('arrow')}</a>
          </div>
          ${focus.length ? `<div class="focus-goals">${focus.map(goalCard).join('')}</div>`
            : emptyState('target', 'No goals yet', 'Goals give your projects direction. Set your first one.', `<button class="btn btn-primary" data-action="new-goal">${icon('plus')}New goal</button>`)}
        </div>
        <div class="panel" style="align-self:start">
          <div class="panel-head"><div><h2 class="panel-title">Upcoming</h2><div class="panel-sub">Deadlines and target dates</div></div></div>
          <div class="panel-body timeline">
            ${upcoming.length ? upcoming.map((u) => {
              const d = parseDay(u.date);
              return `<button class="tl-item" ${u.kind === 'project' ? `data-open-project="${u.id}"` : `data-open-goal="${u.id}"`}>
                <div class="tl-date"><div class="m">${d.toLocaleDateString(undefined, { month: 'short' })}</div><div class="d">${d.getDate()}</div></div>
                <div class="tl-body"><strong>${esc(u.title)}</strong>
                  <span>${u.kind === 'project' ? `<span class="dot" style="background:${u.color}"></span>Project` : `${icon('target')}Goal`} · <span class="${dueClass(u.date)}" style="${dueClass(u.date) === 'overdue' ? 'color:var(--red)' : ''}">${esc(relDue(u.date))}</span></span>
                </div>
              </button>`;
            }).join('') : `<p class="muted-note">Nothing scheduled. Add due dates to see them here.</p>`}
          </div>
        </div>
      </div>`;
  }

  function projectCard(p, { draggable = false } = {}) {
    const v = projectProgress(p);
    const done = p.tasks.filter((t) => t.done).length;
    return `<button class="pcard" style="--c:${p.color}" data-open-project="${p.id}" ${draggable ? `draggable="true" data-drag-id="${p.id}"` : ''}>
      <div class="pcard-top"><h3>${esc(p.name)}</h3>${prio(p.priority)}</div>
      ${p.description ? `<p>${esc(p.description)}</p>` : ''}
      <div class="pcard-progress">${bar(v, p.color)}<span>${pct(v)}</span></div>
      <div class="pcard-foot">
        <span class="meta-chip">${icon('checkCircle')}${done}/${p.tasks.length}</span>
        ${dueChip(p.dueDate, p.status === 'done')}
        <span class="grow"></span>
        ${p.tags.length ? `<span class="tags">${p.tags.slice(0, 2).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</span>` : ''}
      </div>
    </button>`;
  }

  function renderProjects() {
    const list = visibleProjects();
    const filters = [['all', 'All'], ['3', 'High'], ['2', 'Medium'], ['1', 'Low']];
    const head = `
      <div class="page-head">
        <div>
          <div class="eyebrow">Workspace</div>
          <h1 class="page-title">Projects</h1>
          <p class="page-sub">Drag cards between stages to update their status. Open a project to manage its tasks.</p>
        </div>
        <div class="toolbar">
          <div class="segmented" role="group" aria-label="Priority filter">
            ${filters.map(([id, label]) => `<button class="${ui.projectFilter === id ? 'on' : ''}" data-project-filter="${id}">${label}</button>`).join('')}
          </div>
          <div class="segmented" role="group" aria-label="Layout">
            <button class="${ui.projectLayout === 'board' ? 'on' : ''}" data-layout="board" title="Board">${icon('board')}Board</button>
            <button class="${ui.projectLayout === 'grid' ? 'on' : ''}" data-layout="grid" title="Grid">${icon('grid')}Grid</button>
          </div>
        </div>
      </div>`;

    if (!state.projects.length) {
      return head + emptyState('folder', 'Start your first project', 'Projects hold the tasks that move your goals forward.', `<button class="btn btn-primary" data-action="new-project">${icon('plus')}New project</button>`);
    }
    if (!list.length) return head + emptyState('search', 'No matching projects', 'Try a different search or filter.');

    if (ui.projectLayout === 'grid') {
      const order = { active: 0, planning: 1, hold: 2, done: 3 };
      return head + `<div class="cards-grid">${[...list].sort((a, b) => order[a.status] - order[b.status] || b.priority - a.priority).map((p) => projectCard(p)).join('')}</div>`;
    }

    return head + `<div class="board">${STATUSES.map((s) => {
      const items = list.filter((p) => p.status === s.id).sort((a, b) => b.priority - a.priority || (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
      return `<div class="column" data-drop-status="${s.id}">
        <div class="column-head"><span class="pill ${s.tone} no-dot" style="padding:0;background:none"><span class="dot" style="background:currentColor"></span></span>${s.label}<span class="n">${items.length}</span>
          <button class="icon-btn add" data-action="new-project" data-status="${s.id}" aria-label="Add project to ${s.label}">${icon('plus')}</button></div>
        ${items.length ? items.map((p) => projectCard(p, { draggable: true })).join('') : `<div class="column-empty">Drop projects here</div>`}
      </div>`;
    }).join('')}</div>`;
  }

  function goalCard(g) {
    const v = goalProgress(g);
    const st = goalState(g);
    const tone = { achieved: 'var(--green)', ontrack: 'var(--accent)', risk: 'var(--amber)', behind: 'var(--red)' }[st];
    const e = expectedProgress(g);
    const doneMs = g.milestones.filter((m) => m.done).length;
    const metric = g.metric.target > 0
      ? `<div class="goal-metric"><span class="cur">${fmtNum(g.metric.current)}</span><span class="of">of ${fmtNum(g.metric.target)} ${esc(g.metric.unit)}</span></div>`
      : g.milestones.length
        ? `<div class="goal-metric"><span class="cur">${doneMs}</span><span class="of">of ${g.milestones.length} milestones</span></div>`
        : `<div class="goal-metric"><span class="cur">${pct(v)}</span><span class="of">via linked projects</span></div>`;
    return `<button class="goal-card" data-open-goal="${g.id}">
      <div class="goal-top">
        ${ring(v, { size: 54, stroke: 5, color: tone, label: pct(v) })}
        <div class="goal-title"><div class="goal-cat">${esc(g.category)}</div><h3>${esc(g.title)}</h3></div>
      </div>
      ${metric}
      <div class="pace-track">${bar(v, tone)}${e !== null && st !== 'achieved' ? `<span class="marker" style="left:${pct(e)}" title="Expected by today: ${pct(e)}"></span>` : ''}</div>
      <div class="goal-foot">${goalPill(g)}${g.targetDate ? `<span class="meta-chip ${st === 'achieved' ? '' : dueClass(g.targetDate)}">${icon('flag')}${esc(fmtDate(g.targetDate))}</span>` : ''}</div>
    </button>`;
  }

  function renderGoals() {
    const list = visibleGoals();
    const counts = Object.fromEntries(Object.keys(GOAL_STATES).map((k) => [k, state.goals.filter((g) => goalState(g) === k).length]));
    const filters = [['all', 'All', state.goals.length], ['ontrack', 'On track', counts.ontrack], ['risk', 'At risk', counts.risk], ['behind', 'Behind', counts.behind], ['achieved', 'Achieved', counts.achieved]];
    const head = `
      <div class="page-head">
        <div>
          <div class="eyebrow">Direction</div>
          <h1 class="page-title">Goals</h1>
          <p class="page-sub">Measurable outcomes, paced against time. The marker on each bar shows where you should be today.</p>
        </div>
        <div class="toolbar">
          <div class="segmented" role="group" aria-label="Goal filter">
            ${filters.map(([id, label, n]) => `<button class="${ui.goalFilter === id ? 'on' : ''}" data-goal-filter="${id}">${label} <span class="n">${n}</span></button>`).join('')}
          </div>
        </div>
      </div>`;
    if (!state.goals.length) {
      return head + emptyState('target', 'Set your first goal', 'Track a number, a set of milestones, or the progress of linked projects.', `<button class="btn btn-primary" data-action="new-goal">${icon('plus')}New goal</button>`);
    }
    if (!list.length) return head + emptyState('search', 'No goals here', 'Nothing matches this filter right now.');
    const order = { behind: 0, risk: 1, ontrack: 2, achieved: 3 };
    return head + `<div class="cards-grid">${[...list].sort((a, b) => order[goalState(a)] - order[goalState(b)] || (a.targetDate || '9999').localeCompare(b.targetDate || '9999')).map(goalCard).join('')}</div>`;
  }

  /* ------------------------------------------------------------------------
     Drawer (detail views)
     ------------------------------------------------------------------------ */
  function checklist(items, kind, ownerId, placeholder) {
    return `<div class="checklist">
      ${items.map((it) => `<div class="check-row ${it.done ? 'done' : ''}">
        <button class="checkbox" data-toggle-item="${it.id}" data-kind="${kind}" data-owner="${ownerId}" aria-label="${it.done ? 'Mark incomplete' : 'Mark complete'}">${icon('check')}</button>
        <span class="label">${esc(it.title)}</span>
        <button class="icon-btn del" data-delete-item="${it.id}" data-kind="${kind}" data-owner="${ownerId}" aria-label="Delete">${icon('x')}</button>
      </div>`).join('')}
      <form class="check-add" data-add-item="${kind}" data-owner="${ownerId}">
        <span>${icon('plus')}</span><input name="title" id="add-${kind}" placeholder="${esc(placeholder)}" autocomplete="off" />
      </form>
    </div>`;
  }

  function renderProjectDrawer(p) {
    const v = projectProgress(p);
    const goals = state.goals.filter((g) => g.projectIds.includes(p.id));
    const done = p.tasks.filter((t) => t.done).length;
    return `
      <div class="drawer-head">
        <div class="crumb"><span class="dot" style="background:${p.color}"></span>Project</div>
        <span class="spacer"></span>
        <button class="btn btn-secondary btn-sm" data-action="edit-project" data-id="${p.id}">${icon('edit')}Edit</button>
        <button class="icon-btn" data-action="delete-project" data-id="${p.id}" aria-label="Delete project">${icon('trash')}</button>
        <button class="icon-btn" data-action="close-drawer" aria-label="Close">${icon('x')}</button>
      </div>
      <div class="drawer-body">
        <div class="drawer-hero">
          <h2>${esc(p.name)}</h2>
          ${p.description ? `<p>${esc(p.description)}</p>` : ''}
        </div>
        <dl class="props">
          <dt>${icon('signal')}Status</dt>
          <dd><select class="select" data-set-status="${p.id}">${STATUSES.map((s) => `<option value="${s.id}" ${s.id === p.status ? 'selected' : ''}>${s.label}</option>`).join('')}</select></dd>
          <dt>${icon('flag')}Priority</dt><dd>${prio(p.priority)} ${PRIORITIES[p.priority - 1].label}</dd>
          <dt>${icon('calendar')}Due</dt><dd>${p.dueDate ? `${esc(fmtDate(p.dueDate, { weekday: 'short', month: 'short', day: 'numeric' }))} ${dueChip(p.dueDate, p.status === 'done')}` : '<span class="muted-note">No due date</span>'}</dd>
          <dt>${icon('trend')}Progress</dt><dd style="flex-wrap:nowrap"><div style="flex:1;max-width:220px">${bar(v, p.color)}</div><b style="font-variant-numeric:tabular-nums">${pct(v)}</b></dd>
          ${p.tags.length ? `<dt>${icon('tag')}Tags</dt><dd>${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</dd>` : ''}
        </dl>
        <div>
          <div class="section-title">Tasks <span>${done} of ${p.tasks.length}</span></div>
          ${checklist(p.tasks, 'task', p.id, 'Add a task and press Enter')}
        </div>
        <div>
          <div class="section-title">Supports goals <span>${goals.length}</span></div>
          ${goals.length ? `<div class="linked">${goals.map((g) => `<button data-open-goal="${g.id}">${icon('target')}<span class="name">${esc(g.title)}</span>${bar(goalProgress(g))}<span class="pct">${pct(goalProgress(g))}</span></button>`).join('')}</div>`
            : `<p class="muted-note">Not linked to any goal yet. Link it from a goal’s settings.</p>`}
        </div>
      </div>`;
  }

  function renderGoalDrawer(g) {
    const v = goalProgress(g);
    const st = goalState(g);
    const e = expectedProgress(g);
    const projects = g.projectIds.map(getProject).filter(Boolean);
    const tone = { achieved: 'var(--green)', ontrack: 'var(--accent)', risk: 'var(--amber)', behind: 'var(--red)' }[st];
    const step = g.metric.target >= 1000 ? Math.pow(10, Math.floor(Math.log10(g.metric.target)) - 1) : 1;
    return `
      <div class="drawer-head">
        <div class="crumb">${icon('target')}Goal · ${esc(g.category)}</div>
        <span class="spacer"></span>
        <button class="btn btn-secondary btn-sm" data-action="edit-goal" data-id="${g.id}">${icon('edit')}Edit</button>
        <button class="icon-btn" data-action="delete-goal" data-id="${g.id}" aria-label="Delete goal">${icon('trash')}</button>
        <button class="icon-btn" data-action="close-drawer" aria-label="Close">${icon('x')}</button>
      </div>
      <div class="drawer-body">
        <div class="drawer-hero" style="display:flex;gap:20px;align-items:center">
          ${ring(v, { size: 92, stroke: 8, color: tone, label: `<b style="font-size:18px;font-variant-numeric:tabular-nums">${pct(v)}</b>` })}
          <div style="flex:1;min-width:0">
            <h2>${esc(g.title)}</h2>
            <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">${goalPill(g)}${g.targetDate ? `<span class="meta-chip">${icon('flag')}Target ${esc(fmtDate(g.targetDate, { month: 'long', day: 'numeric' }))}</span>` : ''}</div>
          </div>
        </div>
        ${g.description ? `<p style="margin:0;color:var(--ink-2);white-space:pre-wrap">${esc(g.description)}</p>` : ''}
        ${e !== null && st !== 'achieved' ? `<div>
          <div class="section-title">Pace <span>${pct(v)} done · ${pct(e)} of time elapsed</span></div>
          <div class="pace-track">${bar(v, tone)}<span class="marker" style="left:${pct(e)}"></span></div>
          <p class="pace" style="margin:8px 0 0">${st === 'ontrack' ? 'You’re keeping pace. Keep going.' : st === 'risk' ? 'Slightly behind pace — a focused push will get you back on track.' : 'Well behind pace. Consider re-scoping or extending the target date.'}${g.targetDate ? ` ${targetCountdown(g.targetDate)}` : ''}</p>
        </div>` : ''}
        ${g.metric.target > 0 ? `<div>
          <div class="section-title">Update progress</div>
          <div class="metric-editor">
            <div class="stepper">
              <button data-metric-step="-${step}" data-id="${g.id}" aria-label="Decrease">${icon('minus')}</button>
              <input type="number" value="${g.metric.current}" data-metric-input="${g.id}" aria-label="Current value" step="any" />
              <button data-metric-step="${step}" data-id="${g.id}" aria-label="Increase">${icon('plus')}</button>
            </div>
            <span class="of">of <b style="color:var(--ink)">${fmtNum(g.metric.target)}</b> ${esc(g.metric.unit)}</span>
          </div>
        </div>` : ''}
        <div>
          <div class="section-title">Milestones <span>${g.milestones.filter((m) => m.done).length} of ${g.milestones.length}</span></div>
          ${checklist(g.milestones, 'milestone', g.id, 'Add a milestone and press Enter')}
        </div>
        <div>
          <div class="section-title">Linked projects <span>${projects.length}</span></div>
          ${projects.length ? `<div class="linked">${projects.map((p) => `<button data-open-project="${p.id}"><span class="dot" style="background:${p.color}"></span><span class="name">${esc(p.name)}</span>${bar(projectProgress(p), p.color)}<span class="pct">${pct(projectProgress(p))}</span></button>`).join('')}</div>`
            : `<p class="muted-note">No linked projects. Use Edit to connect the projects that drive this goal.</p>`}
        </div>
      </div>`;
  }

  function renderDrawer() {
    const root = $('#drawer-root');
    const d = ui.drawer;
    const item = d && (d.type === 'project' ? getProject(d.id) : getGoal(d.id));
    if (!item) { ui.drawer = null; root.innerHTML = ''; return; }
    const prevScroll = $('.drawer-body', root)?.scrollTop || 0;
    const fresh = !root.firstChild || root.dataset.key !== `${d.type}:${d.id}`;
    root.dataset.key = `${d.type}:${d.id}`;
    root.innerHTML = `<div class="overlay" data-action="close-drawer" ${fresh ? '' : 'style="animation:none"'}></div>
      <aside class="drawer" role="dialog" aria-modal="true" ${fresh ? '' : 'style="animation:none"'}>${d.type === 'project' ? renderProjectDrawer(item) : renderGoalDrawer(item)}</aside>`;
    if (!fresh) $('.drawer-body', root).scrollTop = prevScroll;
  }

  /* ------------------------------------------------------------------------
     Modals (create / edit forms)
     ------------------------------------------------------------------------ */
  function projectForm(p) {
    const isNew = !p;
    p = p || { name: '', description: '', color: COLORS[state.projects.length % COLORS.length], status: ui.modal.status || 'planning', priority: 2, dueDate: '', tags: [] };
    return `
      <form class="modal" data-form="project" data-id="${isNew ? '' : p.id}">
        <div class="modal-head">
          <div><h2>${isNew ? 'New project' : 'Edit project'}</h2><p>${isNew ? 'Give it a name, a colour and a deadline.' : 'Update the details of this project.'}</p></div>
          <button type="button" class="icon-btn" data-action="close-modal" aria-label="Close">${icon('x')}</button>
        </div>
        <div class="modal-body">
          <label class="field"><span>Name</span><input class="input" name="name" required maxlength="120" value="${esc(p.name)}" placeholder="e.g. Website redesign" autofocus /></label>
          <label class="field"><span>Description</span><textarea class="textarea" name="description" maxlength="1000" placeholder="What does success look like?">${esc(p.description)}</textarea></label>
          <div class="field"><span>Colour</span>
            <div class="swatches">${COLORS.map((c) => `<button type="button" class="swatch ${c === p.color ? 'selected' : ''}" style="background:${c}" data-swatch="${c}" aria-label="Colour ${c}"></button>`).join('')}</div>
            <input type="hidden" name="color" value="${p.color}" />
          </div>
          <div class="grid-3">
            <label class="field"><span>Status</span><select class="select" name="status">${STATUSES.map((s) => `<option value="${s.id}" ${s.id === p.status ? 'selected' : ''}>${s.label}</option>`).join('')}</select></label>
            <label class="field"><span>Priority</span><select class="select" name="priority">${PRIORITIES.map((s) => `<option value="${s.id}" ${s.id === p.priority ? 'selected' : ''}>${s.label}</option>`).join('')}</select></label>
            <label class="field"><span>Due date</span><input class="input" type="date" name="dueDate" value="${esc(p.dueDate)}" /></label>
          </div>
          <label class="field"><span>Tags</span><input class="input" name="tags" value="${esc(p.tags.join(', '))}" placeholder="Design, Marketing" /><small>Separate with commas</small></label>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button>
          <button type="submit" class="btn btn-primary">${isNew ? 'Create project' : 'Save changes'}</button>
        </div>
      </form>`;
  }

  function goalForm(g) {
    const isNew = !g;
    g = g || { title: '', description: '', category: 'Business', startDate: isoDay(Date.now()), targetDate: '', metric: { current: 0, target: 0, unit: '' }, projectIds: [] };
    return `
      <form class="modal" data-form="goal" data-id="${isNew ? '' : g.id}">
        <div class="modal-head">
          <div><h2>${isNew ? 'New goal' : 'Edit goal'}</h2><p>Make it specific and measurable. Add milestones after creating it.</p></div>
          <button type="button" class="icon-btn" data-action="close-modal" aria-label="Close">${icon('x')}</button>
        </div>
        <div class="modal-body">
          <label class="field"><span>Goal</span><input class="input" name="title" required maxlength="140" value="${esc(g.title)}" placeholder="e.g. Reach 1,000 paying customers" autofocus /></label>
          <label class="field"><span>Why it matters</span><textarea class="textarea" name="description" maxlength="1000" placeholder="Optional context and motivation">${esc(g.description)}</textarea></label>
          <div class="grid-3">
            <label class="field"><span>Category</span><select class="select" name="category">${CATEGORIES.map((c) => `<option ${c === g.category ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
            <label class="field"><span>Start</span><input class="input" type="date" name="startDate" value="${esc(g.startDate)}" /></label>
            <label class="field"><span>Target date</span><input class="input" type="date" name="targetDate" value="${esc(g.targetDate)}" /></label>
          </div>
          <div class="grid-3">
            <label class="field"><span>Current value</span><input class="input" type="number" step="any" name="current" value="${g.metric.target > 0 || g.metric.current ? g.metric.current : ''}" placeholder="0" /></label>
            <label class="field"><span>Target value</span><input class="input" type="number" step="any" min="0" name="target" value="${g.metric.target || ''}" placeholder="Optional" /></label>
            <label class="field"><span>Unit</span><input class="input" name="unit" maxlength="24" value="${esc(g.metric.unit)}" placeholder="customers" /></label>
          </div>
          <div class="field"><span>Linked projects</span>
            ${state.projects.length ? `<div class="chips">${state.projects.map((p) => `<button type="button" class="chip-toggle ${g.projectIds.includes(p.id) ? 'on' : ''}" data-chip="${p.id}"><span class="dot" style="background:${p.color}"></span>${esc(p.name)}</button>`).join('')}</div>`
              : `<small>No projects yet.</small>`}
            <small>Without a target value or milestones, progress is the average of linked projects.</small>
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button>
          <button type="submit" class="btn btn-primary">${isNew ? 'Create goal' : 'Save changes'}</button>
        </div>
      </form>`;
  }

  function exportView() {
    return `
      <div class="modal">
        <div class="modal-head">
          <div><h2>Export backup</h2><p>Copy this text and keep it somewhere safe. Import it later to restore your projects and goals.</p></div>
          <button type="button" class="icon-btn" data-action="close-modal" aria-label="Close">${icon('x')}</button>
        </div>
        <div class="modal-body">
          <textarea id="export-json" class="textarea" readonly spellcheck="false" style="min-height:260px;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace">${esc(JSON.stringify(state, null, 2))}</textarea>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn btn-secondary left" data-action="download-json">${icon('download')}Download file</button>
          <button type="button" class="btn btn-primary" data-action="copy-json">Copy to clipboard</button>
        </div>
      </div>`;
  }

  function renderModal() {
    const root = $('#modal-root');
    const m = ui.modal;
    if (!m) { root.innerHTML = ''; return; }
    if (root.dataset.key === `${m.type}:${m.id || ''}` && root.firstChild) return; // keep in-progress form input
    root.dataset.key = `${m.type}:${m.id || ''}`;
    const body = m.type === 'export' ? exportView() : m.type === 'project' ? projectForm(m.id && getProject(m.id)) : goalForm(m.id && getGoal(m.id));
    root.innerHTML = `<div class="modal-wrap" role="dialog" aria-modal="true"><div class="overlay" data-action="close-modal"></div>${body}</div>`;
    $('[autofocus]', root)?.focus();
  }

  function openModal(type, extra = {}) { ui.modal = { type, ...extra }; $('#modal-root').dataset.key = ''; renderModal(); }
  function closeModal() { ui.modal = null; renderModal(); }

  function submitForm(form) {
    const fd = new FormData(form);
    const id = form.dataset.id;
    if (form.dataset.form === 'project') {
      const data = {
        name: fd.get('name').trim(), description: fd.get('description').trim(), color: fd.get('color'),
        status: fd.get('status'), priority: +fd.get('priority'), dueDate: fd.get('dueDate'),
        tags: fd.get('tags').split(',').map((t) => t.trim()).filter(Boolean).slice(0, 6),
      };
      if (!data.name) return;
      if (id) {
        commit((s) => Object.assign(s.projects.find((p) => p.id === id), data), 'Project updated');
      } else {
        const p = { id: uid(), tasks: [], createdAt: Date.now(), ...data };
        commit((s) => s.projects.push(p), 'Project created');
        ui.drawer = { type: 'project', id: p.id };
        ui.focusAfterRender = '#add-task';
      }
    } else {
      const target = Math.max(0, +fd.get('target') || 0);
      const data = {
        title: fd.get('title').trim(), description: fd.get('description').trim(), category: fd.get('category'),
        startDate: fd.get('startDate') || isoDay(Date.now()), targetDate: fd.get('targetDate'),
        metric: { current: +fd.get('current') || 0, target, unit: fd.get('unit').trim() },
        projectIds: $$('[data-chip].on', form).map((b) => b.dataset.chip),
      };
      if (!data.title) return;
      if (id) {
        commit((s) => Object.assign(s.goals.find((g) => g.id === id), data), 'Goal updated');
      } else {
        const g = { id: uid(), milestones: [], createdAt: Date.now(), ...data };
        commit((s) => s.goals.push(g), 'Goal created');
        ui.drawer = { type: 'goal', id: g.id };
        ui.focusAfterRender = '#add-milestone';
      }
    }
    closeModal();
    render();
  }

  /* ------------------------------------------------------------------------
     Shell + routing
     ------------------------------------------------------------------------ */
  function renderShell() {
    const nav = [
      ['dashboard', 'Overview', 'dashboard', ''],
      ['projects', 'Projects', 'folder', state.projects.length],
      ['goals', 'Goals', 'target', state.goals.length],
    ];
    $('#nav').innerHTML = nav.map(([id, label, ic, n]) =>
      `<a href="#${id}" class="${ui.view === id ? 'active' : ''}">${icon(ic)}${label}${n !== '' ? `<span class="count">${n}</span>` : ''}</a>`).join('');

    const active = state.projects.filter((p) => p.status === 'active');
    $('#sidebar-projects').innerHTML = active.length
      ? active.map((p) => `<button data-open-project="${p.id}"><span class="dot" style="background:${p.color}"></span><span class="name">${esc(p.name)}</span><span class="pct">${pct(projectProgress(p))}</span></button>`).join('')
      : '<div class="sidebar-empty">Nothing in progress</div>';

    const theme = state.settings.theme;
    const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    $('#theme-label').textContent = dark ? 'Light mode' : 'Dark mode';
    $('[data-icon="theme"]').innerHTML = icon(dark ? 'sun' : 'moon');
  }

  function applyTheme() {
    const t = state.settings.theme;
    if (t === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
  }

  let lastView = null;
  function render() {
    applyTheme();
    renderShell();
    const view = $('#view');
    const html = ui.view === 'projects' ? renderProjects() : ui.view === 'goals' ? renderGoals() : renderDashboard();
    if (lastView !== ui.view) { view.style.animation = 'none'; void view.offsetWidth; view.style.animation = ''; }
    lastView = ui.view;
    view.innerHTML = html;
    renderDrawer();
    renderModal();
    if (ui.focusAfterRender) { $(ui.focusAfterRender)?.focus(); ui.focusAfterRender = null; }
  }

  function route() {
    const v = (location.hash.match(/^#\/?(\w+)/) || [])[1];
    ui.view = ['dashboard', 'projects', 'goals'].includes(v) ? v : 'dashboard';
    document.title = `${{ dashboard: 'Overview', projects: 'Projects', goals: 'Goals' }[ui.view]} · Meridian`;
    $('.app').classList.remove('sidebar-open');
    save();
    render();
    window.scrollTo({ top: 0 });
  }

  /* ------------------------------------------------------------------------
     Toasts
     ------------------------------------------------------------------------ */
  function toast(message, undoable) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="ok">${icon('check')}</span>${esc(message)}${undoable ? '<button data-undo>Undo</button>' : ''}`;
    $('#toasts').appendChild(el);
    const kill = () => { el.classList.add('out'); setTimeout(() => el.remove(), 250); };
    const timer = setTimeout(kill, undoable ? 5000 : 2400);
    el.querySelector('[data-undo]')?.addEventListener('click', () => {
      clearTimeout(timer); kill();
      if (undoSnapshot) { state = normalize(JSON.parse(undoSnapshot)); undoSnapshot = null; save(); render(); toast('Restored'); }
    });
  }

  /* ------------------------------------------------------------------------
     Events
     ------------------------------------------------------------------------ */
  function mutateItem(kind, ownerId, fn) {
    commit((s) => {
      const owner = kind === 'task' ? s.projects.find((p) => p.id === ownerId) : s.goals.find((g) => g.id === ownerId);
      if (owner) fn(kind === 'task' ? owner.tasks : owner.milestones, owner);
    });
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('button, a, [data-action]');
    if (!t) return;

    if (t.dataset.openProject) { ui.drawer = { type: 'project', id: t.dataset.openProject }; $('.app').classList.remove('sidebar-open'); renderDrawer(); return; }
    if (t.dataset.openGoal) { ui.drawer = { type: 'goal', id: t.dataset.openGoal }; renderDrawer(); return; }
    if (t.dataset.layout) { ui.projectLayout = t.dataset.layout; save(); render(); return; }
    if (t.dataset.projectFilter) { ui.projectFilter = t.dataset.projectFilter; save(); render(); return; }
    if (t.dataset.goalFilter) { ui.goalFilter = t.dataset.goalFilter; save(); render(); return; }
    if (t.dataset.swatch) {
      const form = t.closest('form');
      $$('.swatch', form).forEach((s) => s.classList.toggle('selected', s === t));
      form.elements.color.value = t.dataset.swatch;
      return;
    }
    if (t.dataset.chip) { t.classList.toggle('on'); return; }
    if (t.dataset.toggleItem) {
      const id = t.dataset.toggleItem;
      mutateItem(t.dataset.kind, t.dataset.owner, (items, owner) => {
        const it = items.find((x) => x.id === id); if (!it) return;
        it.done = !it.done;
        // Finishing the last task of a project nudges it to "Completed"; reopening a task reopens it.
        if (t.dataset.kind === 'task') {
          if (it.done && items.every((x) => x.done) && owner.status !== 'done') { owner.status = 'done'; setTimeout(() => toast('All tasks done — project completed'), 0); }
          else if (!it.done && owner.status === 'done') owner.status = 'active';
        }
      });
      return;
    }
    if (t.dataset.deleteItem) {
      const id = t.dataset.deleteItem;
      mutateItem(t.dataset.kind, t.dataset.owner, (items) => { const i = items.findIndex((x) => x.id === id); if (i > -1) items.splice(i, 1); });
      return;
    }
    if (t.dataset.metricStep) {
      const id = t.dataset.id, step = +t.dataset.metricStep;
      commit((s) => { const g = s.goals.find((x) => x.id === id); g.metric.current = Math.max(0, Math.round((g.metric.current + step) * 100) / 100); });
      return;
    }

    switch (t.dataset.action) {
      case 'new-project': openModal('project', { status: t.dataset.status }); break;
      case 'new-goal': openModal('goal'); break;
      case 'edit-project': openModal('project', { id: t.dataset.id }); break;
      case 'edit-goal': openModal('goal', { id: t.dataset.id }); break;
      case 'close-modal': closeModal(); break;
      case 'close-drawer': ui.drawer = null; renderDrawer(); break;
      case 'delete-project': {
        const id = t.dataset.id; const p = getProject(id);
        ui.drawer = null;
        commit((s) => {
          s.projects = s.projects.filter((x) => x.id !== id);
          s.goals.forEach((g) => { g.projectIds = g.projectIds.filter((x) => x !== id); });
        }, `Deleted “${p.name}”`, { undoable: true });
        break;
      }
      case 'delete-goal': {
        const id = t.dataset.id; const g = getGoal(id);
        ui.drawer = null;
        commit((s) => { s.goals = s.goals.filter((x) => x.id !== id); }, `Deleted “${g.title}”`, { undoable: true });
        break;
      }
      case 'toggle-theme': {
        const dark = document.documentElement.getAttribute('data-theme') === 'dark' ||
          (!document.documentElement.hasAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
        commit((s) => { s.settings.theme = dark ? 'light' : 'dark'; });
        break;
      }
      case 'export': openModal('export'); break;
      case 'copy-json': {
        const ta = $('#export-json');
        navigator.clipboard.writeText(ta.value).then(() => toast('Backup copied to clipboard'))
          .catch(() => { ta.focus(); ta.select(); toast('Press Ctrl+C or ⌘C to copy'); });
        break;
      }
      case 'download-json': {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `meridian-backup-${isoDay(Date.now())}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        toast('Backup downloaded');
        break;
      }
      case 'import': $('#import-file').click(); break;
      case 'open-sidebar': $('.app').classList.add('sidebar-open'); break;
      case 'close-sidebar': $('.app').classList.remove('sidebar-open'); break;
    }
  });

  document.addEventListener('submit', (e) => {
    const form = e.target;
    e.preventDefault();
    if (form.dataset.form) { submitForm(form); return; }
    if (form.dataset.addItem) {
      const input = form.elements.title;
      const title = input.value.trim();
      if (!title) return;
      const kind = form.dataset.addItem;
      ui.focusAfterRender = `#add-${kind}`;
      mutateItem(kind, form.dataset.owner, (items, owner) => {
        items.push({ id: uid(), title, done: false });
        if (kind === 'task' && owner.status === 'done') owner.status = 'active';
      });
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.setStatus) {
      const id = t.dataset.setStatus;
      commit((s) => { s.projects.find((p) => p.id === id).status = t.value; }, `Moved to ${statusOf(t.value).label}`);
    } else if (t.dataset.metricInput) {
      const id = t.dataset.metricInput;
      commit((s) => { s.goals.find((g) => g.id === id).metric.current = Math.max(0, +t.value || 0); });
    } else if (t.id === 'import-file' && t.files[0]) {
      t.files[0].text().then((txt) => {
        const data = JSON.parse(txt);
        if (!data || !Array.isArray(data.projects) || !Array.isArray(data.goals)) throw new Error('bad file');
        undoSnapshot = JSON.stringify(state);
        state = normalize(data); ui.drawer = null; save(); render();
        toast(`Imported ${state.projects.length} projects and ${state.goals.length} goals`, true);
      }).catch(() => toast('That file isn’t a Meridian backup')).finally(() => { t.value = ''; });
    }
  });

  $('#search').addEventListener('input', (e) => {
    ui.query = e.target.value;
    if (ui.view === 'dashboard' && ui.query) { location.hash = '#projects'; return; }
    render();
  });

  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
    if (e.key === 'Escape') {
      if (ui.modal) closeModal();
      else if (ui.drawer) { ui.drawer = null; renderDrawer(); }
      else if (document.activeElement === $('#search')) { $('#search').value = ''; ui.query = ''; $('#search').blur(); render(); }
      return;
    }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '/') { e.preventDefault(); $('#search').focus(); }
    else if (e.key === 'n') { e.preventDefault(); openModal('project'); }
    else if (e.key === 'g') { e.preventDefault(); openModal('goal'); }
    else if (e.key === '1') location.hash = '#dashboard';
    else if (e.key === '2') location.hash = '#projects';
    else if (e.key === '3') location.hash = '#goals';
  });

  // Drag-and-drop on the project board
  document.addEventListener('dragstart', (e) => {
    const card = e.target.closest?.('[data-drag-id]');
    if (!card) return;
    ui.draggingId = card.dataset.dragId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ui.draggingId);
    requestAnimationFrame(() => card.classList.add('dragging'));
  });
  document.addEventListener('dragend', (e) => {
    e.target.closest?.('[data-drag-id]')?.classList.remove('dragging');
    $$('.column.drag-over').forEach((c) => c.classList.remove('drag-over'));
    ui.draggingId = null;
  });
  document.addEventListener('dragover', (e) => {
    const col = e.target.closest?.('[data-drop-status]');
    if (!col || !ui.draggingId) return;
    e.preventDefault();
    $$('.column.drag-over').forEach((c) => c !== col && c.classList.remove('drag-over'));
    col.classList.add('drag-over');
  });
  document.addEventListener('drop', (e) => {
    const col = e.target.closest?.('[data-drop-status]');
    if (!col || !ui.draggingId) return;
    e.preventDefault();
    const id = ui.draggingId, status = col.dataset.dropStatus;
    const p = getProject(id);
    if (p && p.status !== status) commit((s) => { s.projects.find((x) => x.id === id).status = status; }, `Moved to ${statusOf(status).label}`);
    else render();
  });

  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => state.settings.theme === 'system' && render());
  window.addEventListener('hashchange', route);

  // Static icons in the shell markup
  $$('[data-icon]').forEach((el) => { if (el.dataset.icon !== 'theme') el.innerHTML = icon(el.dataset.icon); });

  route();
})();
