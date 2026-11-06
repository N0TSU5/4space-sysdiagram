(() => {
  'use strict';

  const SIZE = { pad: 20, head: 70, gapX: 48, gapY: 30, rootGapX: 110, moduleW: 300, boxW: 280, minH: 72, moduleMinH: 140 };
  const STATUSES = ['Not started', 'In progress', 'Blocked', 'Done'];
  const POLL_MS = 30000;
  const SVG = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (id) => document.getElementById(id);

  const nodes = new Map();
  const roots = [];
  const edges = [];
  const open = new Set();
  const problems = [];
  const rects = new Map();
  let visible = [];
  let targets = new Map();
  let selected = null; // { type: 'node' | 'edge' | 'about', ... }
  let cam = { x: 0, y: 0, k: 1 };
  let frame = 0;
  let overviewMd = '';
  const placedLabels = [];
  let editing = false;
  let boards = [];
  let board = null;
  const stages = [];

  /* ---------- Markdown ---------- */

  async function readText(path) {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`${path} (${res.status})`);
    return res.text();
  }

  function parseTable(md, heading) {
    const lines = md.split('\n');
    const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
    if (start < 0) return [];
    const rows = [];
    for (let i = start + 1; i < lines.length && !lines[i].startsWith('## '); i++) {
      const line = lines[i].trim();
      if (line.startsWith('|')) {
        rows.push(line.replace(/^\||\|$/g, '').split('|').map((c) => c.trim().replace(/^`|`$/g, '')));
      }
    }
    const head = (rows[0] || []).map((h) => h.toLowerCase());
    return rows.slice(2).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] || ''])));
  }

  const LIST_HEADING = /^##\s+(Steps|Datasets|Object types)\s*$/;

  // Top-level bullets under "## Steps" or "## Datasets", as written.
  function rawList(md) {
    const lines = md.split('\n');
    const start = lines.findIndex((l) => LIST_HEADING.test(l.trim()));
    if (start < 0) return [];
    const items = [];
    for (let i = start + 1; i < lines.length && !lines[i].startsWith('#'); i++) {
      const hit = lines[i].match(/^[-*]\s+(.*)/);
      if (hit) items.push(hit[1]);
    }
    return items;
  }

  // A bold lead-in becomes the short form shown on the diagram.
  const diagramList = (md) => rawList(md).map((item) => {
    const lead = item.match(/^\*\*(.+?):?\*\*/);
    return lead ? lead[1] : item;
  });

  // Swaps the bullets in that section, adding or removing the section when needed.
  function replaceList(md, items) {
    const lines = md.replace(/\s+$/, '').split('\n');
    const bullets = items.map((item) => `- ${item}`);
    const start = lines.findIndex((l) => LIST_HEADING.test(l.trim()));
    if (start < 0) return items.length ? `${lines.join('\n')}\n\n## Steps\n\n${bullets.join('\n')}\n`.replace(/^\n+/, '') : md;
    let end = start + 1;
    while (end < lines.length && !lines[end].startsWith('#')) end++;
    const others = lines.slice(start + 1, end).filter((l) => l.trim() && !/^[-*]\s/.test(l));
    const section = items.length ? [lines[start], '', ...bullets, ...(others.length ? ['', ...others] : [])] : others;
    const after = lines.slice(end);
    const joined = [...lines.slice(0, start), ...section, ...(after.length ? ['', ...after] : [])];
    return `${joined.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
  }

  function setMd(x, md) {
    x.md = md;
    x.list = diagramList(md);
    x.flag = hasFlag(md);
  }

  const clean = (html) => DOMPurify.sanitize(html);
  const inline = (md) => clean(marked.parseInline(md));
  const hasFlag = (md) => /^>\s*\*\*To confirm:\*\*/m.test(md);

  function renderMd(md) {
    const div = document.createElement('div');
    div.className = 'md';
    div.innerHTML = clean(marked.parse(md));
    div.querySelectorAll('blockquote').forEach((q) => {
      if (q.textContent.trim().startsWith('To confirm:')) q.classList.add('flag');
    });
    div.querySelectorAll('pre > code.language-mermaid').forEach((code) => renderFlowchart(code.parentElement, code.textContent));
    return div;
  }

  // Draws a ```mermaid block as a flowchart, falling back to the source if it doesn't parse.
  let mermaidReady = false;
  let flowchartCount = 0;
  function renderFlowchart(pre, source) {
    if (!window.mermaid) return;
    if (!mermaidReady) {
      const dark = matchMedia('(prefers-color-scheme: dark)').matches && document.documentElement.dataset.theme !== 'light';
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: dark ? 'dark' : 'neutral', flowchart: { htmlLabels: false, curve: 'basis' } });
      mermaidReady = true;
    }
    const fig = document.createElement('figure');
    fig.className = 'flowchart';
    pre.replaceWith(fig);
    flowchartCount += 1;
    mermaid.render(`flowchart-${flowchartCount}`, source)
      .then(({ svg }) => { fig.innerHTML = svg; })
      .catch((err) => {
        fig.classList.add('broken');
        fig.textContent = `Flowchart error: ${err.message || err}\n\n${source}`;
      });
  }

  // Which board this page shows, from ?board= or the first row of content/boards.md.
  async function loadBoards() {
    boards = parseTable(await readText('content/boards.md'), 'Boards').filter((r) => r.id && r.folder);
    if (!boards.length) throw new Error('content/boards.md lists no boards');
    const wanted = new URLSearchParams(location.search).get('board');
    board = boards.find((b) => b.id === wanted) || boards[0];
  }

  const boardPath = (file) => `content/${board.folder}/${file}`;

  async function load() {
    const diagram = await readText(boardPath('diagram.md'));
    overviewMd = await readText(boardPath('overview.md')).catch((err) => { problems.push(`Missing file: ${err.message}`); return ''; });

    parseTable(diagram, 'Stages').forEach((r, i) => stages.push({ id: r.id, label: r.label, description: r.description, index: i + 1 }));
    parseTable(diagram, 'Boxes').forEach((r) => {
      nodes.set(r.id, {
        id: r.id, parentId: r.parent, label: r.label, sub: r.subtitle, kind: r.kind, file: r.file,
        col: +r.col || 0, row: +r.row || 0, rowspan: Math.max(+r.rowspan || 1, 1), colspan: Math.max(+r.colspan || 1, 1),
        children: [], md: '', list: [], flag: false,
      });
    });
    for (const n of nodes.values()) {
      if (!n.parentId) { roots.push(n); continue; }
      const parent = nodes.get(n.parentId);
      if (parent) parent.children.push(n);
      else { problems.push(`Box "${n.id}" has unknown parent "${n.parentId}"`); roots.push(n); }
    }
    for (const n of nodes.values()) {
      n.depth = ancestors(n).length;
      n.module = (ancestors(n)[0] || n).id;
    }
    parseTable(diagram, 'Arrows').forEach((r) => {
      if (!nodes.has(r.from) || !nodes.has(r.to)) {
        problems.push(`Arrow "${r.from}" to "${r.to}" uses an unknown box ID`);
        return;
      }
      const stage = stages.find((s) => s.id === r.stage) || null;
      if (r.stage && !stage) problems.push(`Arrow "${r.from}" to "${r.to}" uses an unknown stage "${r.stage}"`);
      edges.push({
        from: r.from, to: r.to, label: r.label, kind: r.kind || 'data', stage,
        both: r.direction === 'both', route: r.route, file: r.file, md: '', list: [],
      });
    });

    await Promise.all([...nodes.values(), ...edges].filter((x) => x.file).map(async (x) => {
      try {
        setMd(x, await readText(boardPath(x.file)));
      } catch (err) {
        problems.push(`Missing file: ${err.message}`);
      }
    }));

    const settings = await readText(boardPath('progress.md')).catch(() => '');
    const value = (name) => (parseTable(settings, 'Connection').find((r) => r.setting === name) || {}).value || '';
    store.url = safeUrl(value('Web app URL'));
    const sheetUrl = safeUrl(value('Sheet URL'));
    if (sheetUrl) { $('open-sheet').href = sheetUrl; $('open-sheet').hidden = false; }
  }

  function safeUrl(text) {
    try {
      const url = new URL(text);
      return url.protocol === 'https:' || url.hostname === 'localhost' ? url.href : '';
    } catch { return ''; }
  }

  function ancestors(n) {
    const chain = [];
    for (let p = nodes.get(n.parentId); p; p = nodes.get(p.parentId)) chain.unshift(p);
    return chain;
  }
  const leavesOf = (n) => (n.children.length ? n.children.flatMap(leavesOf) : [n]);
  const isOpen = (n) => open.has(n.id) && n.children.length > 0;
  const allLeaves = () => [...nodes.values()].filter((n) => !n.children.length);

  /* ---------- Progress store ---------- */

  const store = { url: '', rows: new Map(), pending: 0, state: 'local', error: '', contentReady: false };
  const getRow = (id) => store.rows.get(id) || { done: false, status: 'Not started', owner: '', notes: '' };

  async function fetchSheet() {
    const res = await fetch(store.url);
    const data = await res.json();
    if (!data.ok || !Array.isArray(data.rows)) throw new Error(data.error || 'Unexpected response');
    return data;
  }

  async function postUpdates(updates, content = []) {
    const res = await fetch(store.url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids a CORS preflight, which Apps Script can't answer
      body: JSON.stringify({ updates, content }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Save failed');
  }

  const toUpdate = (id, fields) => {
    const n = nodes.get(id);
    return { id, component: n.label, module: nodes.get(n.module).label, fields };
  };

  function applyServerRows(rows) {
    store.rows = new Map(rows.filter((r) => nodes.has(r.id)).map((r) => [r.id, {
      done: r.done === true,
      status: STATUSES.includes(r.status) ? r.status : 'Not started',
      owner: r.owner || '',
      notes: r.notes || '',
    }]));
  }

  function applyServerContent(rows) {
    if (!Array.isArray(rows)) return;
    const changed = [];
    rows.forEach((row) => {
      const n = nodes.get(row.id);
      if (!n || isBeingEdited(n)) return;
      const fields = { label: row.label || n.label, sub: row.sub, kind: row.kind, md: row.md };
      if (Object.keys(fields).some((k) => n[k] !== fields[k])) {
        applyFields(n, fields);
        changed.push(n);
      }
    });
    if (changed.length) contentChanged(changed);
  }

  const seedFields = (n) => ({ id: n.id, seed: true, fields: { label: n.label, sub: n.sub, kind: n.kind, md: n.md } });

  async function connect() {
    if (!store.url) { renderProgress(); return; }
    store.state = 'loading';
    renderProgress();
    try {
      const data = await fetchSheet();
      applyServerRows(data.rows);
      store.contentReady = Array.isArray(data.content);
      applyServerContent(data.content);
      store.state = 'ok';
      const known = new Set(data.rows.map((r) => r.id));
      const missing = allLeaves().filter((n) => !known.has(n.id));
      const stored = new Set((data.content || []).map((r) => r.id));
      const unstored = store.contentReady ? [...nodes.values()].filter((n) => !stored.has(n.id)) : [];
      if (missing.length || unstored.length) {
        await postUpdates(missing.map((n) => toUpdate(n.id, {})), unstored.map(seedFields));
      }
    } catch (err) {
      store.state = 'error';
      store.error = `Couldn't reach the Google Sheet: ${err.message}`;
    }
    renderProgress();
    setInterval(poll, POLL_MS);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
  }

  async function poll() {
    if (document.hidden || store.pending) return;
    try {
      const data = await fetchSheet();
      if (store.pending) return;
      applyServerRows(data.rows);
      store.contentReady = Array.isArray(data.content);
      applyServerContent(data.content);
      store.state = 'ok';
    } catch (err) {
      store.state = 'error';
      store.error = `Couldn't reach the Google Sheet: ${err.message}`;
    }
    renderProgress();
  }

  async function update(changes) {
    const before = changes.map(({ id }) => [id, store.rows.get(id)]);
    changes.forEach(({ id, fields }) => store.rows.set(id, { ...getRow(id), ...fields }));
    renderProgress();
    if (!store.url) return;

    store.pending++;
    renderProgress();
    try {
      await postUpdates(changes.map(({ id, fields }) => toUpdate(id, fields)));
      store.state = 'ok';
    } catch (err) {
      before.forEach(([id, row]) => (row ? store.rows.set(id, row) : store.rows.delete(id)));
      store.state = 'error';
      store.error = `Change not saved: ${err.message}`;
    }
    store.pending--;
    renderProgress();
  }

  function applyFields(n, fields) {
    ['label', 'sub', 'kind'].forEach((k) => { if (k in fields) n[k] = fields[k]; });
    if ('md' in fields) setMd(n, fields.md);
  }

  // Saves only the box text that actually changed, and restores it if the save fails.
  async function commit(n, fields) {
    const changes = Object.fromEntries(Object.entries(fields).filter(([k, v]) => n[k] !== v));
    if ('label' in changes && !changes.label) delete changes.label;
    if (!Object.keys(changes).length) { syncEditor(n, true); return; }

    const before = Object.fromEntries(Object.keys(changes).map((k) => [k, n[k]]));
    applyFields(n, changes);
    contentChanged([n]);
    if (!store.url) return;

    store.pending++;
    renderProgress();
    try {
      const renamed = 'label' in changes ? leavesOf(n).map((leaf) => toUpdate(leaf.id, {})) : [];
      await postUpdates(renamed, [{ id: n.id, fields: changes }]);
      store.state = 'ok';
    } catch (err) {
      applyFields(n, before);
      contentChanged([n]);
      store.state = 'error';
      store.error = `Change not saved: ${err.message}`;
    }
    store.pending--;
    renderProgress();
  }

  const doneFields = (id, done) => {
    const status = getRow(id).status;
    return { done, status: done ? 'Done' : status === 'Done' ? 'Not started' : status };
  };
  const setDone = (leaves, done) => update(leaves.map((n) => ({ id: n.id, fields: doneFields(n.id, done) })));
  const setStatus = (id, status) => update([{ id, fields: { status, done: status === 'Done' } }]);
  const setText = (id, field, value) => { if (getRow(id)[field] !== value) update([{ id, fields: { [field]: value } }]); };
  const countDone = (leaves) => leaves.filter((n) => getRow(n.id).done).length;

  /* ---------- Diagram DOM ---------- */

  function renderBoxText(n) {
    const main = n.mainEl;
    main.replaceChildren();
    const part = (tag, cls, text) => {
      const p = document.createElement(tag);
      p.className = cls;
      p.textContent = text;
      main.append(p);
      return p;
    };
    part('span', 'tag', n.kind);
    part('span', 'title', n.label);
    if (n.sub) part('span', 'sub', n.sub);
    if (n.list.length) {
      const ul = document.createElement('ul');
      ul.className = 'steps';
      n.list.forEach((item) => {
        const li = document.createElement('li');
        li.innerHTML = inline(item);
        ul.append(li);
      });
      main.append(ul);
    }
    if (n.children.length) n.moreEl = part('span', 'more', '');
    if (n.flag) part('span', 'flag-badge', 'To confirm');
    n.el.classList.toggle('boundary', n.kind === 'Trust boundary');
  }

  function buildEditor(n) {
    const form = document.createElement('div');
    form.className = 'box-edit';
    const field = (tag, cls, label, placeholder) => {
      const f = document.createElement(tag);
      f.className = cls;
      f.setAttribute('aria-label', label);
      f.placeholder = placeholder;
      if (tag === 'textarea') {
        f.rows = 1;
        f.addEventListener('input', () => {
          const was = f.offsetHeight;
          grow(f);
          if (f.offsetHeight !== was) { layout(); animateTo(null); }
        });
      }
      form.append(f);
      return f;
    };
    const kind = field('input', 'ed-kind', 'Type', 'Type');
    const title = field('textarea', 'ed-title', 'Title', 'Title');
    const sub = field('input', 'ed-sub', 'Subtitle', 'Subtitle');
    const list = field('textarea', 'ed-list', 'Bullets, one per line', 'Bullets, one per line');

    kind.addEventListener('change', () => commit(n, { kind: kind.value.trim() }));
    sub.addEventListener('change', () => commit(n, { sub: sub.value.trim() }));
    title.addEventListener('change', () => commit(n, { label: title.value.replace(/\s*\n\s*/g, ' ').trim() }));
    title.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); title.blur(); } });
    list.addEventListener('change', () => {
      const items = list.value.split('\n').map((l) => l.replace(/^\s*[-*]\s+/, '').trim()).filter(Boolean);
      const md = replaceList(n.md, items);
      if (items.join('\n') !== rawList(n.md).join('\n')) commit(n, { md });
    });
    n.fields = { kind, title, sub, list };
    syncEditor(n);
    return form;
  }

  function grow(f) {
    f.style.height = 'auto';
    f.style.height = `${f.scrollHeight + 2}px`;
  }

  // Fills the box's edit fields, leaving alone whichever one is being typed in.
  function syncEditor(n, force) {
    const values = { kind: n.kind, title: n.label, sub: n.sub, list: rawList(n.md).join('\n') };
    Object.entries(n.fields).forEach(([name, f]) => {
      if (force || document.activeElement !== f) f.value = values[name];
    });
  }

  function isBeingEdited(n) {
    const a = document.activeElement;
    return Object.values(n.fields).includes(a)
      || (selected && selected.node === n && $('panel').contains(a) && a.matches('.ed-md'));
  }

  function contentChanged(list) {
    list.forEach((n) => {
      renderBoxText(n);
      syncEditor(n);
    });
    renderNames();
    refreshPanel();
    layout();
    animateTo(null);
  }

  function buildBoxes() {
    const world = $('world');
    for (const n of nodes.values()) {
      const el = document.createElement('div');
      el.className = `box depth-${n.depth}${n.kind === 'Trust boundary' ? ' boundary' : ''}`;
      el.dataset.id = n.id;
      el.dataset.module = n.module;

      const main = document.createElement('button');
      main.type = 'button';
      main.className = 'box-main';
      n.mainEl = main;
      n.el = el;
      renderBoxText(n);
      el.append(main, buildEditor(n));

      const tick = document.createElement('label');
      tick.className = 'tick';
      tick.title = n.children.length ? 'Mark everything inside as done' : 'Mark as done';
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.setAttribute('aria-label', `${n.label} done`);
      box.addEventListener('change', () => setDone(leavesOf(n), box.checked));
      tick.append(box);
      el.append(tick);

      if (n.children.length) {
        n.expander = document.createElement('button');
        n.expander.type = 'button';
        n.expander.className = 'expander';
        el.append(n.expander);
      }
      n.tickEl = box;
      world.append(el);
    }
  }

  function buildEdges() {
    const svg = $('edges');
    const world = $('world');
    edges.forEach((e, i) => {
      e.i = i;
      const g = document.createElementNS(SVG, 'g');
      e.cls = `${e.kind}${e.stage ? ` stage-${e.stage.index}` : ''}`;
      g.setAttribute('class', `edge ${e.cls}`);
      g.dataset.edge = i;
      e.line = document.createElementNS(SVG, 'path');
      e.line.setAttribute('class', 'line');
      e.head = document.createElementNS(SVG, 'path');
      e.head.setAttribute('class', 'head');
      e.hit = document.createElementNS(SVG, 'path');
      e.hit.setAttribute('class', 'hit');
      g.append(e.line, e.head, e.hit);
      svg.append(g);
      e.g = g;

      if (e.list.length) {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = `edge-card ${e.cls}`;
        card.dataset.edge = i;
        const title = document.createElement('strong');
        title.textContent = e.label;
        const ul = document.createElement('ul');
        e.list.forEach((item) => {
          const li = document.createElement('li');
          li.innerHTML = inline(item);
          ul.append(li);
        });
        card.append(title, ul);
        if (e.flag) {
          const badge = document.createElement('span');
          badge.className = 'flag-badge';
          badge.textContent = 'To confirm';
          card.append(badge);
        }
        e.tag = card;
      } else if (e.label) {
        const label = document.createElement('button');
        label.type = 'button';
        label.className = `edge-label ${e.cls}`;
        label.dataset.edge = i;
        label.textContent = e.label;
        e.tag = label;
      }
      if (e.tag) world.append(e.tag);
    });
  }

  // Boards with stages colour arrows by stage, so the legend shows stages and line styles.
  function buildLegend() {
    const legend = $('legend');
    const line = (cls, text) => {
      const span = document.createElement('span');
      span.className = cls;
      span.innerHTML = '<svg width="30" height="8"><line x1="0" y1="4" x2="30" y2="4"/></svg>';
      span.append(text);
      return span;
    };
    if (!stages.length) {
      [['gold', 'Gold data'], ['data', 'Data'], ['control', 'Control'], ['secret', 'Secret'], ['agent', 'Agent']]
        .forEach(([k, text]) => legend.append(line(`k-${k}`, text)));
      return;
    }
    stages.forEach((s) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `legend-stage stage-${s.index}`;
      b.setAttribute('aria-pressed', 'false');
      b.title = `Highlight the ${s.label.replace(/^\d+\.\s*/, '')} arrows`;
      b.innerHTML = '<svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4"/></svg>';
      b.append(s.label);
      b.addEventListener('click', () => (selected && selected.stage === s ? clearSelection() : selectStage(s)));
      s.legendEl = b;
      legend.append(b);
    });
    const sep = document.createElement('i');
    sep.className = 'legend-sep';
    legend.append(sep);
    [['gold', 'Gold data'], ['data', 'Data or agent'], ['control', 'Control'], ['secret', 'Secret']]
      .forEach(([k, text]) => legend.append(line(`k-${k} plain`, text)));
  }

  /* ---------- Layout ---------- */

  // The box an endpoint appears on: itself, or its nearest collapsed ancestor.
  function shownAs(n) {
    for (const a of ancestors(n)) if (!isOpen(a)) return a;
    return n;
  }

  function resolveEdges() {
    const seen = new Set();
    visible = [];
    edges.forEach((e) => {
      const a = shownAs(nodes.get(e.from));
      const b = shownAs(nodes.get(e.to));
      const key = [a.id, b.id].sort().join('|');
      const direct = a.id === e.from && b.id === e.to;
      e.a = a;
      e.b = b;
      // Arrows drawn between their own boxes always show; rolled-up ones merge.
      e.shown = a !== b && (direct || !seen.has(key));
      if (e.shown) {
        seen.add(key);
        visible.push(e);
      }
    });
  }

  function childUnder(container, n) {
    for (let cur = n; cur; cur = nodes.get(cur.parentId)) {
      if ((nodes.get(cur.parentId) || null) === container) return cur;
    }
    return null;
  }

  function measure(n) {
    const kids = n ? n.children : roots;
    if (n && !isOpen(n)) {
      const w = n.depth === 0 ? SIZE.moduleW : SIZE.boxW;
      n.el.style.width = `${w}px`;
      n.el.style.height = 'auto';
      if (editing) { grow(n.fields.title); grow(n.fields.list); }
      n.min = { w, h: Math.max(n.el.offsetHeight, n.depth === 0 ? SIZE.moduleMinH : SIZE.minH) };
      return n.min;
    }
    kids.forEach(measure);

    const cols = Math.max(...kids.map((c) => c.col + c.colspan - 1)) + 1;
    const rows = Math.max(...kids.map((c) => c.row + c.rowspan - 1)) + 1;
    const colW = Array(cols).fill(0);
    const rowH = Array(rows).fill(0);
    const gapX = Array(Math.max(cols - 1, 0)).fill(n ? SIZE.gapX : SIZE.rootGapX);
    const gapY = Array(Math.max(rows - 1, 0)).fill(SIZE.gapY);

    kids.forEach((c) => {
      if (c.colspan === 1) colW[c.col] = Math.max(colW[c.col], c.min.w);
      if (c.rowspan === 1) rowH[c.row] = Math.max(rowH[c.row], c.min.h);
    });

    // Leave room in the gaps for arrow labels and cards.
    visible.forEach((e) => {
      if (!e.tag) return;
      const ca = childUnder(n, e.a);
      const cb = childUnder(n, e.b);
      if (!ca || !cb || ca === cb) return;
      e.tag.hidden = false;
      const w = e.tag.offsetWidth;
      const h = e.tag.offsetHeight;
      if (ca.col !== cb.col) {
        const lo = Math.min(ca.col, cb.col);
        for (let i = lo; i < Math.max(ca.col, cb.col); i++) gapX[i] = Math.max(gapX[i], w + 40);
        if (e.list.length) rowH[ca.row] = Math.max(rowH[ca.row], h + 24);
      } else {
        const lo = Math.min(ca.row, cb.row);
        if (lo < gapY.length) gapY[lo] = Math.max(gapY[lo], h + 44);
      }
    });

    const sum = (arr) => arr.reduce((a, b) => a + b, 0);
    // Spanning boxes share out any extra size they need across their rows or columns.
    const spread = (sizes, gaps, start, span, need) => {
      const have = sum(sizes.slice(start, start + span)) + sum(gaps.slice(start, start + span - 1));
      const extra = (need - have) / span;
      if (extra > 0) for (let i = start; i < start + span; i++) sizes[i] += extra;
    };
    kids.filter((c) => c.rowspan > 1).forEach((c) => spread(rowH, gapY, c.row, c.rowspan, c.min.h));
    kids.filter((c) => c.colspan > 1).forEach((c) => spread(colW, gapX, c.col, c.colspan, c.min.w));

    const pad = n ? SIZE.pad : 0;
    const head = n ? SIZE.head : 0;
    const min = { w: sum(colW) + sum(gapX) + 2 * pad, h: head + sum(rowH) + sum(gapY) + pad };
    const grid = { kids, colW, rowH, gapX, gapY, pad, head };
    if (n) { n.grid = grid; n.min = min; }
    else measure.root = { grid, min };
    return min;
  }

  function place(n, grid, x, y, w, h) {
    if (n) targets.set(n.id, { x, y, w, h });
    if (!grid) return;
    const { kids, colW, rowH, gapX, gapY, pad, head } = grid;
    const used = (arr, gaps) => arr.reduce((a, b) => a + b, 0) + gaps.reduce((a, b) => a + b, 0);
    const extraW = (w - 2 * pad - used(colW, gapX)) / colW.length;
    const extraH = (h - head - pad - used(rowH, gapY)) / rowH.length;
    const widths = colW.map((v) => v + Math.max(extraW, 0));
    const heights = rowH.map((v) => v + Math.max(extraH, 0));
    const left = (i) => x + pad + widths.slice(0, i).reduce((a, b) => a + b, 0) + gapX.slice(0, i).reduce((a, b) => a + b, 0);
    const top = (i) => y + head + heights.slice(0, i).reduce((a, b) => a + b, 0) + gapY.slice(0, i).reduce((a, b) => a + b, 0);

    kids.forEach((c) => {
      const cellH = top(c.row + c.rowspan - 1) + heights[c.row + c.rowspan - 1] - top(c.row);
      const cellW = left(c.col + c.colspan - 1) + widths[c.col + c.colspan - 1] - left(c.col);
      const stretch = c.rowspan > 1 || isOpen(c);
      const boxH = stretch ? cellH : c.min.h;
      place(c, isOpen(c) ? c.grid : null, left(c.col), top(c.row) + (cellH - boxH) / 2, cellW, boxH);
    });
  }

  function layout() {
    resolveEdges();
    const showing = new Set();
    for (const n of nodes.values()) {
      const show = ancestors(n).every(isOpen);
      if (show && n.el.hidden) n.el.classList.add('entering');
      n.el.hidden = !show;
      n.el.classList.toggle('open', isOpen(n));
      n.mainEl.setAttribute('aria-expanded', String(isOpen(n)));
      if (n.children.length) n.mainEl.setAttribute('aria-label', `${n.label}, ${isOpen(n) ? 'collapse' : 'expand'}`);
      if (n.expander) {
        n.expander.textContent = isOpen(n) ? '−' : '+';
        n.expander.tabIndex = editing ? 0 : -1;
        n.expander.setAttribute('aria-label', `${isOpen(n) ? 'Collapse' : 'Expand'} ${n.label}`);
      }
      if (show) showing.add(n.id);
    }
    edges.forEach((e) => {
      e.g.style.display = e.shown ? '' : 'none';
      if (e.tag) e.tag.hidden = !e.shown;
    });
    renderCounts();

    targets = new Map();
    const { grid, min } = (measure(null), measure.root);
    place(null, grid, 0, 0, min.w, min.h);

    for (const [id, t] of targets) {
      if (!rects.has(id)) {
        const n = nodes.get(id);
        const parent = rects.get(n.parentId);
        rects.set(id, parent ? { x: parent.x + 20, y: parent.y + 40, w: t.w, h: Math.min(t.h, 100) } : { ...t });
      }
    }
    for (const id of [...rects.keys()]) if (!showing.has(id)) rects.delete(id);
  }

  /* ---------- Edge routing ---------- */

  const box = (R, n) => {
    const r = R.get(n.id);
    return { ...r, r: r.x + r.w, b: r.y + r.h, cx: r.x + r.w / 2, cy: r.y + r.h / 2 };
  };

  function routeEdges(R) {
    placedLabels.length = 0;
    const routes = visible.map((e) => {
      const A = box(R, e.a);
      const B = box(R, e.b);
      const direct = e.a.id === e.from && e.b.id === e.to;
      let mode;
      if (e.route === 'over') mode = 'over';
      else if (e.route === 'top' && direct && A.x >= B.r) mode = 'top';
      else if (e.route === 'down' && A.b <= B.cy && B.x >= A.cx) mode = 'down';
      else if (B.x >= A.r) mode = 'right';
      else if (A.x >= B.r) mode = 'left';
      else if (B.y >= A.b) mode = 'below';
      else mode = 'above';
      return { e, A, B, mode };
    });

    const sides = new Map();
    const addPort = (node, side, route, end, along) => {
      const key = `${node.id}:${side}`;
      if (!sides.has(key)) sides.set(key, []);
      sides.get(key).push({ route, end, along });
    };
    routes.forEach((rt) => {
      const { e, A, B, mode } = rt;
      if (mode === 'right') { addPort(e.a, 'R', rt, 'a', B.cy); addPort(e.b, 'L', rt, 'b', A.cy); }
      else if (mode === 'left') { addPort(e.a, 'L', rt, 'a', B.cy); addPort(e.b, 'R', rt, 'b', A.cy); }
      else if (mode === 'below') { addPort(e.a, 'B', rt, 'a', B.cx); addPort(e.b, 'T', rt, 'b', A.cx); }
      else if (mode === 'above') { addPort(e.a, 'T', rt, 'a', B.cx); addPort(e.b, 'B', rt, 'b', A.cx); }
      else if (mode === 'down') addPort(e.b, 'L', rt, 'b', A.b);
      else if (mode === 'top' || mode === 'over') addPort(e.b, 'R', rt, 'b', A.y);
    });

    for (const [key, list] of sides) {
      const [id, side] = key.split(':');
      const r = box(R, nodes.get(id));
      const vertical = side === 'L' || side === 'R';
      const length = vertical ? r.h : r.w;
      const center = vertical ? r.cy : r.cx;
      const step = Math.min(24, (length - 16) / list.length);
      list.sort((p, q) => p.along - q.along);
      list.forEach((p, i) => {
        p.route[p.end] = center + (i - (list.length - 1) / 2) * step;
        p.route[`${p.end}Solo`] = list.length === 1;
      });
    }

    // Straighten arrows wherever the two boxes face each other.
    routes.forEach((rt) => {
      const { A, B, mode } = rt;
      const margin = 12;
      if (mode === 'right' || mode === 'left' || mode === 'below' || mode === 'above') {
        const horiz = mode === 'right' || mode === 'left';
        const [al, ah, bl, bh] = horiz ? [A.y, A.b, B.y, B.b] : [A.x, A.r, B.x, B.r];
        if (rt.aSolo && rt.bSolo) {
          const lo = Math.max(al, bl) + margin;
          const hi = Math.min(ah, bh) - margin;
          if (lo <= hi) rt.a = rt.b = (lo + hi) / 2;
        } else if (rt.aSolo && rt.b >= al + margin && rt.b <= ah - margin) {
          rt.a = rt.b;
        } else if (rt.bSolo && rt.a >= bl + margin && rt.a <= bh - margin) {
          rt.b = rt.a;
        }
      }
    });

    // Fan out vertical runs that share a gutter.
    const lanes = new Map();
    routes.forEach((rt) => {
      const { A, B, mode, e } = rt;
      if (mode === 'right' || mode === 'left') {
        rt.mid = mode === 'right' ? (A.r + B.x) / 2 : (B.r + A.x) / 2;
        if (Math.abs(rt.a - rt.b) < 1) return;
      } else if (mode === 'top') {
        const moduleLeft = R.get(e.a.module).x;
        rt.mid = (B.r + moduleLeft) / 2;
      } else if (mode === 'over') {
        rt.mid = B.r + SIZE.gapX / 2;
      } else {
        return;
      }
      const lane = Math.round(rt.mid / 40);
      if (!lanes.has(lane)) lanes.set(lane, []);
      lanes.get(lane).push(rt);
    });
    for (const list of lanes.values()) {
      list.sort((p, q) => (p.a || 0) - (q.a || 0));
      list.forEach((rt, i) => { rt.mid += (i - (list.length - 1) / 2) * 16; });
    }

    routes.forEach((rt) => {
      const { e, A, B, mode, a, b, mid } = rt;
      let pts;
      if (mode === 'top') {
        const lane = R.get(e.a.parentId).y + SIZE.head - 7; // just above the row of sibling boxes
        pts = [[A.cx, A.y], [A.cx, lane], [mid, lane], [mid, b], [B.r, b]];
      } else if (mode === 'over') {
        const lane = overLane(R);
        pts = [[A.cx, A.y], [A.cx, lane], [mid, lane], [mid, b], [B.r, b]];
      } else if (mode === 'down') {
        pts = [[A.cx, A.b], [A.cx, b], [B.x, b]];
      } else if (mode === 'right' || mode === 'left') {
        const x1 = mode === 'right' ? A.r : A.x;
        const x2 = mode === 'right' ? B.x : B.r;
        pts = Math.abs(a - b) < 1 ? [[x1, a], [x2, a]] : [[x1, a], [mid, a], [mid, b], [x2, b]];
      } else {
        const y1 = mode === 'below' ? A.b : A.y;
        const y2 = mode === 'below' ? B.y : B.b;
        const my = (y1 + y2) / 2;
        pts = Math.abs(a - b) < 1 ? [[a, y1], [a, y2]] : [[a, y1], [a, my], [b, my], [b, y2]];
      }
      drawEdge(e, pts);
    });
  }

  // The lane that "over" arrows use, above the whole diagram.
  const overLane = (R) => Math.min(...roots.map((r) => R.get(r.id).y)) - 36;

  function drawEdge(e, pts) {
    const head = e.kind === 'gold' ? 12 : 8;
    const trimmed = pts.map((p) => [...p]);
    trim(trimmed, trimmed.length - 1, trimmed.length - 2, head - 1);
    if (e.both) trim(trimmed, 0, 1, head - 1);
    const d = roundedPath(trimmed);
    e.line.setAttribute('d', d);
    e.hit.setAttribute('d', d);
    let heads = arrowHead(pts[pts.length - 1], pts[pts.length - 2], head);
    if (e.both) heads += arrowHead(pts[0], pts[1], head);
    e.head.setAttribute('d', heads);

    if (e.tag) {
      let at;
      if (e.list.length) {
        // Cards sit at the centre of the whole arrow, in the gutter.
        const first = pts[0];
        const last = pts[pts.length - 1];
        at = pts.length === 4 ? [(pts[1][0] + pts[2][0]) / 2, (pts[1][1] + pts[2][1]) / 2] : [(first[0] + last[0]) / 2, (first[1] + last[1]) / 2];
      } else {
        let best = -1;
        let vertical = false;
        for (let i = 0; i < pts.length - 1; i++) {
          const len = Math.abs(pts[i + 1][0] - pts[i][0]) + Math.abs(pts[i + 1][1] - pts[i][1]);
          if (len > best) {
            best = len;
            vertical = pts[i + 1][0] === pts[i][0];
            at = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
          }
        }
        at = clearOfLabels(at, vertical, e.tag.offsetWidth, e.tag.offsetHeight);
      }
      e.tag.style.left = `${at[0]}px`;
      e.tag.style.top = `${at[1]}px`;
    }
  }

  // Slides a label along its arrow until it no longer touches an earlier label.
  function clearOfLabels(at, vertical, w, h) {
    const pos = [...at];
    const axis = vertical ? 1 : 0;
    const size = vertical ? h : w;
    for (let tries = 0; tries < 6; tries++) {
      const hit = placedLabels.find((l) => Math.abs(l.x - pos[0]) < (l.w + w) / 2 + 4 && Math.abs(l.y - pos[1]) < (l.h + h) / 2 + 4);
      if (!hit) break;
      pos[axis] += size + 8;
    }
    placedLabels.push({ x: pos[0], y: pos[1], w, h });
    return pos;
  }

  function trim(pts, end, next, by) {
    const dx = Math.sign(pts[next][0] - pts[end][0]);
    const dy = Math.sign(pts[next][1] - pts[end][1]);
    pts[end][0] += dx * by;
    pts[end][1] += dy * by;
  }

  function roundedPath(pts) {
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [px, py] = pts[i - 1];
      const [x, y] = pts[i];
      const [nx, ny] = pts[i + 1];
      const r = Math.min(8, (Math.abs(x - px) + Math.abs(y - py)) / 2, (Math.abs(nx - x) + Math.abs(ny - y)) / 2);
      d += `L${x - Math.sign(x - px) * r} ${y - Math.sign(y - py) * r}`;
      d += `Q${x} ${y} ${x + Math.sign(nx - x) * r} ${y + Math.sign(ny - y) * r}`;
    }
    const last = pts[pts.length - 1];
    return `${d}L${last[0]} ${last[1]}`;
  }

  function arrowHead(tip, from, size) {
    const dx = Math.sign(tip[0] - from[0]);
    const dy = Math.sign(tip[1] - from[1]);
    const half = size * 0.55;
    const bx = tip[0] - dx * size;
    const by = tip[1] - dy * size;
    return `M${tip[0]} ${tip[1]}L${bx - dy * half} ${by + dx * half}L${bx + dy * half} ${by - dx * half}Z`;
  }

  /* ---------- Painting and camera ---------- */

  function paint() {
    for (const [id, r] of rects) {
      const s = nodes.get(id).el.style;
      s.left = `${r.x}px`;
      s.top = `${r.y}px`;
      s.width = `${r.w}px`;
      s.height = `${r.h}px`;
    }
    routeEdges(rects);
    applyCamera();
  }
  const applyCamera = () => { $('world').style.transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.k})`; };

  function animateTo(camTarget) {
    cancelAnimationFrame(frame);
    const from = new Map([...rects].map(([id, r]) => [id, { ...r }]));
    const camFrom = { ...cam };
    const lerp = (a, b, t) => a + (b - a) * t;
    const apply = (t) => {
      for (const [id, to] of targets) {
        const f = from.get(id) || to;
        rects.set(id, { x: lerp(f.x, to.x, t), y: lerp(f.y, to.y, t), w: lerp(f.w, to.w, t), h: lerp(f.h, to.h, t) });
      }
      if (camTarget) cam = { x: lerp(camFrom.x, camTarget.x, t), y: lerp(camFrom.y, camTarget.y, t), k: lerp(camFrom.k, camTarget.k, t) };
      paint();
    };
    if (reduced) { apply(1); return; }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / 280, 1);
      apply(1 - (1 - p) ** 3);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  }

  function viewport() {
    const c = $('canvas');
    const panelOpen = !$('panel').hidden && !$('panel').classList.contains('modal');
    const wide = innerWidth > 720;
    return {
      w: c.clientWidth - (panelOpen && wide ? $('panel').offsetWidth : 0),
      h: c.clientHeight - (panelOpen && !wide ? $('panel').offsetHeight : 0),
    };
  }

  function fitCam(r, maxK = 1.1) {
    const v = viewport();
    const side = 28;
    const top = 56; // clear of the toolbar
    const bottom = 52; // clear of the legend
    const k = Math.max(Math.min((v.w - side * 2) / r.w, (v.h - top - bottom) / r.h, maxK), 0.12);
    return { k, x: (v.w - r.w * k) / 2 - r.x * k, y: top + (v.h - top - bottom - r.h * k) / 2 - r.y * k };
  }

  function bounds() {
    const all = [...targets.values()];
    const x = Math.min(...all.map((r) => r.x));
    const bottom = Math.max(...all.map((r) => r.y + r.h));
    let y = Math.min(...all.map((r) => r.y));
    if (visible.some((e) => e.route === 'over')) y = overLane(targets) - 16; // room for the lane's label
    return { x, y, w: Math.max(...all.map((r) => r.x + r.w)) - x, h: bottom - y };
  }

  function camToShow(r) {
    const v = viewport();
    const sx = r.x * cam.k + cam.x;
    const sy = r.y * cam.k + cam.y;
    const inside = sx >= 8 && sy >= 8 && sx + r.w * cam.k <= v.w - 8 && sy + r.h * cam.k <= v.h - 8;
    if (inside) return null;
    return fitCam(r, Math.max(cam.k, 0.7));
  }

  function zoomBy(factor, px, py) {
    const v = viewport();
    const cx = px === undefined ? v.w / 2 : px;
    const cy = py === undefined ? v.h / 2 : py;
    const k = Math.min(Math.max(cam.k * factor, 0.12), 2);
    cam = { k, x: cx - ((cx - cam.x) * k) / cam.k, y: cy - ((cy - cam.y) * k) / cam.k };
    applyCamera();
  }

  /* ---------- Selection and panel ---------- */

  function selectNode(id, { focus = 'show', modal = false } = {}) {
    const n = nodes.get(id);
    if (!n) return;
    ancestors(n).forEach((a) => open.add(a.id));
    selected = { type: 'node', node: n, modal };
    showPanel();
    layout();
    const t = targets.get(id);
    const camTarget = { fit: () => fitCam(t), show: () => camToShow(t), none: () => null }[focus]();
    animateTo(camTarget);
    markSelection();
    setHash(id);
  }

  function selectEdge(e) {
    selected = { type: 'edge', edge: e };
    showPanel();
    markSelection();
    setHash('');
  }

  // Opens every box a stage's arrows touch and highlights those arrows.
  function selectStage(s, list = edges.filter((e) => e.stage === s), hash = `stage-${s.id}`) {
    list.forEach((e) => {
      [e.from, e.to].forEach((id) => ancestors(nodes.get(id)).forEach((a) => open.add(a.id)));
    });
    selected = { type: 'stage', stage: s, edges: list };
    showPanel();
    layout();
    animateTo(fitCam(bounds()));
    markSelection();
    setHash(hash);
  }

  function clearSelection() {
    selected = null;
    $('panel').hidden = true;
    $('backdrop').hidden = true;
    markSelection();
    setHash('');
  }

  function setHash(value) {
    const url = value ? `#${value}` : location.pathname + location.search;
    history.replaceState(null, '', url);
  }

  function markSelection() {
    const sel = selected && selected.type === 'node' ? selected.node : null;
    const selEdge = selected && selected.type === 'edge' ? selected.edge : null;
    const selStage = selected && selected.type === 'stage' ? selected.stage : null;
    const within = (x) => {
      for (let cur = x; cur; cur = nodes.get(cur.parentId)) if (cur === sel) return true;
      return false;
    };
    for (const n of nodes.values()) n.el.classList.toggle('selected', n === sel);
    stages.forEach((s) => s.legendEl.setAttribute('aria-pressed', String(s === selStage)));
    edges.forEach((e) => {
      let touches;
      if (sel) touches = within(nodes.get(e.from)) !== within(nodes.get(e.to)) || e.a === sel || e.b === sel;
      else if (selStage) touches = selected.edges.includes(e);
      else touches = e === selEdge;
      const dim = (sel || selEdge || selStage) && !touches;
      e.g.classList.toggle('hot', !!touches);
      e.g.classList.toggle('dim', !!dim);
      if (e.tag) {
        e.tag.classList.toggle('hot', !!touches);
        e.tag.classList.toggle('dim', !!dim);
      }
    });
  }

  function linkButton(text, onClick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'link';
    b.textContent = text;
    b.addEventListener('click', onClick);
    return b;
  }

  function section(title, content) {
    const s = document.createElement('section');
    s.className = 'panel-section';
    const h = document.createElement('h3');
    h.textContent = title;
    s.append(h, content);
    return s;
  }

  function listOf(items) {
    const ul = document.createElement('ul');
    items.forEach((item) => {
      const li = document.createElement('li');
      li.append(item);
      ul.append(li);
    });
    return ul;
  }

  function header(body, title, lede) {
    const h = document.createElement('h2');
    h.textContent = title;
    body.append(h);
    if (lede) {
      const p = document.createElement('p');
      p.className = 'lede';
      p.textContent = lede;
      body.append(p);
    }
  }

  function sourceNote(file) {
    const p = document.createElement('p');
    p.className = 'source';
    p.append('Edit this text in ');
    const code = document.createElement('code');
    code.textContent = boardPath(file);
    p.append(code);
    return section('Source', p);
  }

  function boxSource(n) {
    const p = document.createElement('p');
    p.className = 'source';
    p.textContent = store.url && store.contentReady
      ? `Saved in the Content tab of the ${board.label} Google Sheet. Use the Edit button to change it.`
      : 'Starting text. Edits are lost on refresh until the Google Sheet is connected.';
    return section('Source', p);
  }

  // Redraws an open panel without moving it, unless someone is typing in it.
  function refreshPanel() {
    const panel = $('panel');
    if (!selected || panel.hidden) return;
    if (panel.contains(document.activeElement) && document.activeElement.matches('input, textarea, select')) return;
    const top = panel.scrollTop;
    showPanel();
    panel.scrollTop = top;
  }

  function showPanel() {
    const body = $('panel-body');
    body.replaceChildren();
    if (selected.type === 'about') {
      header(body, board.title || board.label, board.lede);
      body.append(renderMd(overviewMd), sourceNote('overview.md'));
    } else if (selected.type === 'stage') {
      showStage(body, selected.stage, selected.edges);
    } else if (selected.type === 'edge') {
      showEdge(body, selected.edge);
    } else {
      showNode(body, selected.node);
    }
    // Box details open as a wide modal so their flowcharts have room.
    const modal = selected.type === 'node' && selected.modal && !editing;
    $('panel').classList.toggle('modal', modal);
    $('backdrop').hidden = !modal;
    $('panel').hidden = false;
    $('panel').scrollTop = 0;
  }

  function showNode(body, n) {
    const chain = ancestors(n);
    if (chain.length) {
      const crumbs = document.createElement('div');
      crumbs.className = 'crumbs';
      chain.forEach((a, i) => {
        if (i) crumbs.append(' / ');
        crumbs.append(linkButton(a.label, () => selectNode(a.id, { modal: n === selected.node && selected.modal })));
      });
      body.append(crumbs);
    }
    header(body, n.label, [n.kind, n.sub].filter(Boolean).join(' · '));
    if (editing) {
      const label = document.createElement('label');
      label.className = 'details-edit';
      label.textContent = 'Details, in Markdown';
      const area = document.createElement('textarea');
      area.className = 'ed-md';
      area.rows = 12;
      area.value = n.md;
      area.addEventListener('change', () => commit(n, { md: area.value.replace(/\s+$/, '') ? `${area.value.replace(/\s+$/, '')}\n` : '' }));
      label.append(area);
      const hint = document.createElement('p');
      hint.className = 'source';
      hint.textContent = 'Bullets under a "## Steps" heading also appear on the box.';
      body.append(label, hint);
    } else {
      body.append(renderMd(n.md));
    }

    if (n.children.length) {
      const leaves = leavesOf(n);
      const p = document.createElement('p');
      p.textContent = `${countDone(leaves)} of ${leaves.length} done`;
      p.dataset.count = n.id;
      body.append(section('Progress', p));
      body.append(section('Inside this box', listOf(n.children.map((c) => linkButton(c.label, () => selectNode(c.id, { focus: 'show', modal: selected.modal }))))));
    } else {
      body.append(section('Progress', progressFields(n)));
    }

    const inbound = edges.filter((e) => e.to === n.id);
    const outbound = edges.filter((e) => e.from === n.id);
    const describe = (e, other) => linkButton(`${nodes.get(other).label}${e.label ? ` (${e.label})` : ''}`, () => selectEdge(e));
    if (inbound.length) body.append(section('Receives from', listOf(inbound.map((e) => describe(e, e.from)))));
    if (outbound.length) body.append(section('Connects to', listOf(outbound.map((e) => describe(e, e.to)))));
    body.append(boxSource(n));
  }

  function showEdge(body, e) {
    const from = nodes.get(e.from);
    const to = nodes.get(e.to);
    header(body, e.label || `${from.label} to ${to.label}`, e.both ? 'Two-way connection' : 'One-way connection');
    if (e.md) body.append(renderMd(e.md));
    body.append(section('Connects', listOf([
      linkButton(from.label, () => selectNode(from.id)),
      linkButton(to.label, () => selectNode(to.id)),
    ])));
    if (e.file) body.append(sourceNote(e.file));
  }

  function showStage(body, s, list) {
    header(body, s.label, 'Journey stage');
    if (s.description) body.append(renderMd(s.description));
    const numbered = list.filter((e) => e.label)
      .sort((p, q) => p.label.localeCompare(q.label, undefined, { numeric: true }));
    if (numbered.length) body.append(section('Arrows', listOf(numbered.map((e) => linkButton(e.label, () => selectEdge(e))))));
    const slide = journey.slides.findIndex((sl) => sl.stage === s.id);
    if (slide >= 0 && journey.board === board) {
      body.append(section('Journey', listOf([linkButton('Walk through this stage', () => { switchView('journey'); journey.show(slide); })])));
    }
    body.append(sourceNote('diagram.md'));
  }

  function progressFields(n) {
    const row = getRow(n.id);
    const wrap = document.createElement('div');
    wrap.className = 'fields';
    wrap.dataset.fields = n.id;

    const done = document.createElement('label');
    done.className = 'field-done wide';
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = row.done;
    check.addEventListener('change', () => setDone([n], check.checked));
    done.append(check, 'Done');

    const status = document.createElement('label');
    status.append('Status', statusSelect(row.status, (v) => setStatus(n.id, v)));
    const owner = document.createElement('label');
    const ownerInput = document.createElement('input');
    ownerInput.value = row.owner;
    ownerInput.addEventListener('change', () => setText(n.id, 'owner', ownerInput.value.trim()));
    owner.append('Owner', ownerInput);
    const notes = document.createElement('label');
    notes.className = 'wide';
    const notesInput = document.createElement('textarea');
    notesInput.rows = 3;
    notesInput.value = row.notes;
    notesInput.addEventListener('change', () => setText(n.id, 'notes', notesInput.value.trim()));
    notes.append('Notes', notesInput);

    wrap.append(done, status, owner, notes);
    wrap.sync = () => {
      const r = getRow(n.id);
      check.checked = r.done;
      status.querySelector('select').value = r.status;
      if (document.activeElement !== ownerInput) ownerInput.value = r.owner;
      if (document.activeElement !== notesInput) notesInput.value = r.notes;
    };
    return wrap;
  }

  function statusSelect(value, onChange) {
    const sel = document.createElement('select');
    STATUSES.forEach((s) => sel.add(new Option(s, s)));
    sel.value = value;
    sel.addEventListener('change', () => onChange(sel.value));
    return sel;
  }

  /* ---------- Progress rendering ---------- */

  const sheetRows = new Map();

  function buildSheet() {
    const tbody = $('sheet-body');
    allLeaves().forEach((n) => {
      const tr = document.createElement('tr');
      tr.dataset.id = n.id;
      const cell = (cls) => {
        const td = document.createElement('td');
        td.className = cls;
        tr.append(td);
        return td;
      };
      const check = document.createElement('input');
      check.type = 'checkbox';
      check.setAttribute('aria-label', `${n.label} done`);
      check.addEventListener('change', () => setDone([n], check.checked));
      cell('c-done').append(check);

      const name = cell('c-name');
      const nameLink = linkButton(n.label, () => { switchView('diagram'); selectNode(n.id, { focus: 'fit' }); });
      name.append(nameLink);
      const parent = nodes.get(n.parentId);
      let parentEl = null;
      if (parent && parent.depth > 0) {
        parentEl = document.createElement('span');
        parentEl.className = 'parent';
        name.append(parentEl);
      }
      const moduleEl = cell('c-module');

      const status = statusSelect('Not started', (v) => setStatus(n.id, v));
      status.setAttribute('aria-label', `${n.label} status`);
      cell('c-status').append(status);

      const owner = document.createElement('input');
      owner.setAttribute('aria-label', `${n.label} owner`);
      owner.addEventListener('change', () => setText(n.id, 'owner', owner.value.trim()));
      cell('c-owner').append(owner);

      const notes = document.createElement('input');
      notes.setAttribute('aria-label', `${n.label} notes`);
      notes.addEventListener('change', () => setText(n.id, 'notes', notes.value.trim()));
      cell('c-notes').append(notes);

      tbody.append(tr);
      sheetRows.set(n.id, { tr, check, status, owner, notes, node: n, nameLink, parentEl, moduleEl });
    });

    $('filter-module').add(new Option('All modules', ''));
    roots.forEach((r) => $('filter-module').add(new Option(r.label, r.id)));
    $('filter-status').add(new Option('All statuses', ''));
    STATUSES.forEach((s) => $('filter-status').add(new Option(s, s)));
    ['filter-text', 'filter-module', 'filter-status'].forEach((id) => $(id).addEventListener('input', applyFilters));

    const summary = $('module-summary');
    roots.forEach((r) => {
      const card = document.createElement('div');
      card.className = 'module-card';
      card.dataset.module = r.id;
      r.summaryTitle = document.createElement('b');
      r.summaryText = document.createElement('span');
      const bar = document.createElement('div');
      bar.className = 'bar';
      r.summaryBar = document.createElement('i');
      bar.append(r.summaryBar);
      card.append(r.summaryTitle, r.summaryText, bar);
      summary.append(card);
    });
    renderNames();
  }

  function renderNames() {
    for (const { node, nameLink, parentEl, moduleEl } of sheetRows.values()) {
      nameLink.textContent = node.label;
      if (parentEl) parentEl.textContent = nodes.get(node.parentId).label;
      moduleEl.textContent = nodes.get(node.module).label;
    }
    roots.forEach((r, i) => {
      r.summaryTitle.textContent = r.label;
      $('filter-module').options[i + 1].text = r.label;
    });
  }

  function applyFilters() {
    const text = $('filter-text').value.trim().toLowerCase();
    const module = $('filter-module').value;
    const status = $('filter-status').value;
    let shown = 0;
    for (const { tr, node } of sheetRows.values()) {
      const row = getRow(node.id);
      const hay = `${node.label} ${row.owner} ${row.notes}`.toLowerCase();
      const match = (!text || hay.includes(text)) && (!module || node.module === module) && (!status || row.status === status);
      tr.hidden = !match;
      if (match) shown++;
    }
    $('sheet-empty').hidden = shown > 0;
  }

  function renderCounts() {
    for (const n of nodes.values()) {
      const leaves = leavesOf(n);
      const done = countDone(leaves);
      n.tickEl.checked = done === leaves.length;
      n.tickEl.indeterminate = done > 0 && done < leaves.length;
      n.el.classList.toggle('is-done', done === leaves.length);
      if (n.moreEl) n.moreEl.textContent = `${n.children.length} inside · ${done} of ${leaves.length} done`;
    }
  }

  function renderProgress() {
    renderCounts();
    const leaves = allLeaves();
    const done = countDone(leaves);
    $('overall-text').textContent = `${done} of ${leaves.length} done`;
    $('overall-bar').style.width = `${(done / leaves.length) * 100}%`;
    roots.forEach((r) => {
      const inside = leavesOf(r);
      const d = countDone(inside);
      r.summaryText.textContent = `${d} of ${inside.length}`;
      r.summaryBar.style.width = `${(d / inside.length) * 100}%`;
    });

    for (const { tr, check, status, owner, notes, node } of sheetRows.values()) {
      const row = getRow(node.id);
      check.checked = row.done;
      status.value = row.status;
      if (document.activeElement !== owner) owner.value = row.owner;
      if (document.activeElement !== notes) notes.value = row.notes;
      tr.dataset.status = row.status;
      tr.classList.toggle('is-done', row.done);
    }
    applyFilters();

    const panelFields = document.querySelector('[data-fields]');
    if (panelFields) panelFields.sync();
    const panelCount = document.querySelector('[data-count]');
    if (panelCount) {
      const inside = leavesOf(nodes.get(panelCount.dataset.count));
      panelCount.textContent = `${countDone(inside)} of ${inside.length} done`;
    }

    const outdated = !!store.url && store.state === 'ok' && !store.contentReady;
    const edit = $('edit');
    edit.disabled = !!store.url && !store.contentReady;
    edit.title = edit.disabled ? 'Editing needs the latest Apps Script and a working sheet connection. See README.md.' : '';
    if (edit.disabled && editing) setEditing(false);

    const sync = $('sync');
    sync.className = 'sync';
    sync.title = '';
    if (!store.url) {
      sync.classList.add('warn');
      sync.textContent = 'Sheet not connected: changes are lost on refresh';
    } else if (outdated) {
      sync.classList.add('error');
      sync.textContent = 'Apps Script is out of date: box edits are off';
    } else if (store.state === 'error') {
      sync.classList.add('error');
      sync.textContent = store.error;
    } else if (store.pending) {
      sync.textContent = 'Saving…';
    } else if (store.state === 'loading') {
      sync.textContent = 'Loading sheet…';
    } else {
      sync.classList.add('ok');
      sync.textContent = 'Saved to Google Sheet';
    }
  }

  /* ---------- Interaction ---------- */

  const VIEWS = ['diagram', 'progress', 'journey'];

  function switchView(view) {
    VIEWS.forEach((v) => {
      $(`view-${v}`).hidden = v !== view;
      $(`tab-${v}`).setAttribute('aria-pressed', String(v === view));
    });
    $('about').hidden = view !== 'diagram';
    $('boards').hidden = view === 'journey';
    $('summary').hidden = view === 'journey';
    boardLinks.forEach((a) => { a.hash = view === 'progress' ? 'progress' : ''; });
    if (view === 'diagram') {
      layout();
      animateTo(fitCam(bounds()));
    } else if (view === 'progress') {
      setHash('progress');
    } else {
      journey.show(journey.index);
    }
  }

  // Subtabs for each board. Boards keep separate state, so switching reloads the page.
  const boardLinks = [];
  function buildBoardTabs() {
    const nav = $('boards');
    boards.forEach((b) => {
      const a = document.createElement('a');
      a.className = 'subtab';
      a.href = `?board=${encodeURIComponent(b.id)}`;
      a.textContent = b.label;
      if (b === board) a.setAttribute('aria-current', 'page');
      boardLinks.push(a);
      nav.append(a);
    });
    nav.hidden = boards.length < 2;
  }

  // Arrows whose labels start with these step numbers, such as "2.1".
  const stepEdges = (numbers) => edges.filter((e) => numbers.some((num) => e.label.startsWith(`${num} `)));

  function selectSteps(numbers) {
    const list = stepEdges(numbers);
    const s = list.length && list[0].stage;
    if (s) selectStage(s, list, `steps=${numbers.join(',')}`);
  }

  // From a journey slide: highlight its arrows, or its first box, on the diagram.
  function showOnDiagram(target, slide) {
    const hash = slide.arrows.length ? `steps=${slide.arrows.join(',')}` : slide.show[0] || '';
    if (target !== board) {
      location.href = `?board=${encodeURIComponent(target.id)}${hash ? `#${hash}` : ''}`;
      return;
    }
    switchView('diagram');
    if (slide.arrows.length) selectSteps(slide.arrows);
    else if (nodes.has(slide.show[0])) selectNode(slide.show[0], { focus: 'fit' });
  }

  function setEditing(on) {
    editing = on;
    document.body.classList.toggle('editing', on);
    $('edit').setAttribute('aria-pressed', String(on));
    $('edit').textContent = on ? 'Done editing' : 'Edit';
    if (on) for (const n of nodes.values()) syncEditor(n);
    layout();
    animateTo(null);
    refreshPanel();
  }

  function collapse(n) {
    open.delete(n.id);
    n.children.forEach(collapse);
  }

  function onBoxClick(ev) {
    const el = ev.target.closest('.box');
    if (!el || ev.target.closest('.tick')) return;
    const n = nodes.get(el.dataset.id);
    if (editing) {
      if (ev.target.closest('.expander')) toggleBox(n);
      else if (!selected || selected.node !== n) selectNode(n.id, { focus: 'none' });
    } else if (isOpen(n) && !ev.target.closest('.box-main')) {
      selectNode(n.id, { focus: 'none', modal: true });
    } else if (n.children.length) {
      toggleBox(n);
    } else {
      selectNode(n.id, { focus: 'none', modal: true });
    }
  }

  function toggleBox(n) {
    if (isOpen(n)) {
      collapse(n);
      layout();
      const parent = nodes.get(n.parentId);
      selected = { type: 'node', node: n };
      showPanel();
      animateTo(fitCam(parent ? targets.get(parent.id) : bounds()));
      markSelection();
      setHash(n.id);
    } else {
      open.add(n.id);
      selectNode(n.id, { focus: 'fit' });
    }
  }

  function bindEvents() {
    const canvas = $('canvas');
    let drag = null;
    let suppressClick = false;

    canvas.addEventListener('pointerdown', (ev) => {
      if (ev.target.closest('.tick, input, textarea') || ev.button !== 0) return;
      drag = { x: ev.clientX, y: ev.clientY, camX: cam.x, camY: cam.y, moved: false, id: ev.pointerId };
    });
    canvas.addEventListener('pointermove', (ev) => {
      if (!drag) return;
      const dx = ev.clientX - drag.x;
      const dy = ev.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      if (!drag.moved) {
        drag.moved = true;
        cancelAnimationFrame(frame);
        canvas.setPointerCapture(drag.id);
        canvas.classList.add('dragging');
      }
      cam = { ...cam, x: drag.camX + dx, y: drag.camY + dy };
      applyCamera();
    });
    const endDrag = () => {
      if (drag && drag.moved) suppressClick = true;
      drag = null;
      canvas.classList.remove('dragging');
    };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('wheel', (ev) => {
      ev.preventDefault();
      cancelAnimationFrame(frame);
      const r = canvas.getBoundingClientRect();
      zoomBy(Math.exp(-ev.deltaY * 0.0016), ev.clientX - r.left, ev.clientY - r.top);
    }, { passive: false });

    canvas.addEventListener('click', (ev) => {
      if (suppressClick) { suppressClick = false; return; }
      const edgeEl = ev.target.closest('[data-edge]');
      if (edgeEl) { selectEdge(edges[+edgeEl.dataset.edge]); return; }
      if (ev.target.closest('.box')) onBoxClick(ev);
      else if (selected) clearSelection();
    });

    $('panel-close').addEventListener('click', clearSelection);
    $('backdrop').addEventListener('click', clearSelection);
    $('edit').addEventListener('click', () => setEditing(!editing));
    $('about').addEventListener('click', () => { selected = { type: 'about' }; showPanel(); markSelection(); });
    $('fit').addEventListener('click', () => animateTo(fitCam(bounds())));
    $('zoom-in').addEventListener('click', () => zoomBy(1.25));
    $('zoom-out').addEventListener('click', () => zoomBy(0.8));
    $('expand-all').addEventListener('click', () => {
      for (const n of nodes.values()) if (n.children.length) open.add(n.id);
      layout();
      animateTo(fitCam(bounds()));
    });
    $('collapse-all').addEventListener('click', () => {
      open.clear();
      layout();
      animateTo(fitCam(bounds()));
    });
    $('tab-diagram').addEventListener('click', () => { switchView('diagram'); setHash(''); });
    $('tab-progress').addEventListener('click', () => switchView('progress'));
    $('tab-journey').addEventListener('click', () => switchView('journey'));
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && !$('panel').hidden && !ev.target.matches('input, textarea')) clearSelection(); });
    addEventListener('resize', () => { if (!$('view-diagram').hidden) animateTo(fitCam(bounds())); });
  }

  function showProblems() {
    if (!problems.length) return;
    const box = $('problems');
    box.replaceChildren('Check the Markdown files:');
    const ul = document.createElement('ul');
    problems.forEach((p) => {
      const li = document.createElement('li');
      li.textContent = p;
      ul.append(li);
    });
    box.append(ul);
    box.hidden = false;
  }

  function showFatal(err) {
    const div = document.createElement('div');
    div.className = 'fatal';
    const h = document.createElement('h2');
    h.textContent = "The diagram couldn't load its Markdown files";
    const p = document.createElement('p');
    p.textContent = location.protocol === 'file:'
      ? 'Browsers block this when a page is opened directly from disk. In this folder, run "python3 -m http.server 8000", then open http://localhost:8000.'
      : `Error: ${err.message}`;
    div.append(h, p);
    document.body.replaceChildren(div);
  }

  const journey = window.createJourney({
    $, readText, parseTable, renderMd, inline, setHash, showOnDiagram,
    boards: () => boards,
    problem: (text) => problems.push(text),
  });

  async function init() {
    let journeyLoad;
    try {
      await loadBoards();
      journeyLoad = journey.load().catch((err) => problems.push(`Journey: ${err.message}`));
      await load();
      await journeyLoad;
    } catch (err) {
      showFatal(err);
      return;
    }
    showProblems();
    buildBoardTabs();
    buildLegend();
    buildBoxes();
    buildEdges();
    buildSheet();
    bindEvents();
    renderProgress();
    layout();
    for (const [id, t] of targets) rects.set(id, { ...t });
    cam = fitCam(bounds());
    paint();
    for (const n of nodes.values()) n.el.classList.remove('entering');

    const hash = decodeURIComponent(location.hash.slice(1));
    const stage = stages.find((st) => hash === `stage-${st.id}`);
    if (hash === 'progress') switchView('progress');
    else if (/^journey(-\d+)?$/.test(hash)) {
      journey.index = Math.max((+hash.split('-')[1] || 1) - 1, 0);
      switchView('journey');
    } else if (stage) selectStage(stage);
    else if (hash.startsWith('steps=')) selectSteps(hash.slice(6).split(','));
    else if (nodes.has(hash)) {
      if (nodes.get(hash).children.length) open.add(hash);
      selectNode(hash, { focus: 'fit' });
    }
    connect();
  }

  init();
})();
