// The Journey tab: a slideshow read from content/journey.md, with a mini diagram of the
// board it describes and an illustration for each slide.
window.createJourney = (ctx) => {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const FIELD = /^(Stage|Visual|Show|Arrows):\s*(.*)$/;
  const journey = { slides: [], index: 0, boardId: '', stages: [], boxes: [], arrows: [], loaded: false };

  /* ---------- Small DOM helpers ---------- */

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== false) el.setAttribute(k, v); });
    kids.flat().forEach((k) => { if (k !== null && k !== undefined && k !== false) el.append(k); });
    return el;
  }

  function s(tag, attrs, ...kids) {
    const el = document.createElementNS(SVGNS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => { if (v !== undefined && v !== null) el.setAttribute(k, v); });
    kids.flat().forEach((k) => { if (k !== null && k !== undefined) el.append(k); });
    return el;
  }

  const md = (text, tag = 'span', cls) => {
    const el = h(tag, { class: cls });
    el.innerHTML = ctx.inline(text);
    return el;
  };

  // "Title: detail" items, used by most illustrations.
  const split = (item) => {
    const m = item.match(/^([^:]+):\s+(.*)$/);
    return m ? [m[1], m[2]] : [item, ''];
  };

  const ICONS = {
    table: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M9 9v11M15 9v11"/></svg>',
    graph: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="8" r="2.5"/><circle cx="9" cy="18" r="2.5"/><path d="M8.3 7l7.3 1M7 8.3l1.6 7.4M16.6 10.1l-5.9 6"/></svg>',
    chart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20h18M4 16l5-5 4 3 7-8"/><path d="M16 6h4v4"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    clip: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5l-8.2 8.2a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8"/></svg>',
  };
  const icon = (name, cls = 'v-icon') => {
    const span = h('span', { class: cls, 'aria-hidden': 'true' });
    span.innerHTML = ICONS[name];
    return span;
  };

  /* ---------- Loading ---------- */

  function parseSlides(text) {
    const parts = text.split(/^## /m);
    const intro = parts.shift() || '';
    journey.boardId = (intro.match(/^Board:\s*(\S+)/m) || [])[1] || '';
    return parts.map((part) => {
      const lines = part.split('\n');
      const slide = { title: lines.shift().trim(), stage: '', visual: '', show: [], arrows: [], items: [] };
      while (lines.length && FIELD.test(lines[0])) {
        const [, key, value] = lines.shift().match(FIELD);
        const list = value.split(',').map((v) => v.trim()).filter(Boolean);
        if (key === 'Stage') slide.stage = value.trim();
        else if (key === 'Visual') slide.visual = value.trim();
        else if (key === 'Show') slide.show = list;
        else slide.arrows = list;
      }
      const rest = lines.join('\n');
      const at = rest.search(/^### Visual\s*$/m);
      slide.body = (at < 0 ? rest : rest.slice(0, at)).trim();
      if (at >= 0) {
        slide.items = rest.slice(at).split('\n').slice(1)
          .map((l) => l.match(/^[-*]\s+(.*)/)).filter(Boolean).map((m) => m[1].trim());
      }
      return slide;
    });
  }

  async function load() {
    const text = await ctx.readText('content/journey.md');
    journey.slides = parseSlides(text);
    const board = ctx.boards().find((b) => b.id === journey.boardId);
    if (!board) throw new Error(`content/journey.md names an unknown board "${journey.boardId}"`);
    journey.board = board;
    const diagram = await ctx.readText(`content/${board.folder}/diagram.md`);
    journey.stages = ctx.parseTable(diagram, 'Stages').map((r, i) => ({ id: r.id, label: r.label, index: i + 1 }));
    journey.boxes = ctx.parseTable(diagram, 'Boxes');
    journey.arrows = ctx.parseTable(diagram, 'Arrows');
    journey.slides.forEach((sl) => {
      if (sl.stage && !stageOf(sl)) ctx.problem(`Journey slide "${sl.title}" uses an unknown stage "${sl.stage}"`);
      if (sl.visual && !VISUALS[sl.visual]) ctx.problem(`Journey slide "${sl.title}" uses an unknown visual "${sl.visual}"`);
      sl.show.filter((id) => !box(id)).forEach((id) => ctx.problem(`Journey slide "${sl.title}" shows an unknown box "${id}"`));
      sl.arrows.filter((n) => !arrowsFor(n).length).forEach((n) => ctx.problem(`Journey slide "${sl.title}" names arrow "${n}", which isn't on the diagram`));
    });
    journey.loaded = true;
    buildTrack();
  }

  const stageOf = (slide) => journey.stages.find((st) => st.id === slide.stage);
  const box = (id) => journey.boxes.find((b) => b.id === id);
  const arrowsFor = (num) => journey.arrows.filter((a) => a.label.startsWith(`${num} `));
  const stageVar = (slide) => {
    const st = stageOf(slide);
    return st ? `var(--stage-${st.index})` : 'var(--stage-0)';
  };

  /* ---------- Navigation ---------- */

  function buildTrack() {
    const track = ctx.$('deck-track');
    track.replaceChildren();
    const groups = [];
    journey.slides.forEach((sl, i) => {
      const key = sl.stage || '';
      if (!groups.length || groups[groups.length - 1].key !== key) groups.push({ key, slides: [] });
      groups[groups.length - 1].slides.push(i);
    });
    groups.forEach((g) => {
      const st = journey.stages.find((x) => x.id === g.key);
      const group = h('div', { class: 'track-group', style: `--st: ${st ? `var(--stage-${st.index})` : 'var(--stage-0)'}` },
        h('span', { class: 'track-label' }, st ? st.label : 'Why'));
      const dots = h('div', { class: 'track-dots' });
      g.slides.forEach((i) => {
        const dot = h('button', { type: 'button', class: 'track-dot', 'aria-label': `Slide ${i + 1}: ${journey.slides[i].title}`, title: journey.slides[i].title });
        dot.addEventListener('click', () => show(i));
        journey.slides[i].dot = dot;
        dots.append(dot);
      });
      group.append(dots);
      track.append(group);
    });
  }

  function show(i) {
    if (!journey.loaded) return;
    journey.index = Math.max(0, Math.min(i, journey.slides.length - 1));
    const slide = journey.slides[journey.index];
    const el = ctx.$('slide');
    el.replaceChildren(renderSlide(slide));
    ctx.$('view-journey').style.setProperty('--st', stageVar(slide));
    el.scrollTop = 0;
    journey.slides.forEach((sl, j) => {
      sl.dot.setAttribute('aria-current', j === journey.index ? 'step' : 'false');
      sl.dot.classList.toggle('seen', j < journey.index);
    });
    ctx.$('deck-prev').disabled = journey.index === 0;
    ctx.$('deck-next').disabled = journey.index === journey.slides.length - 1;
    ctx.$('deck-count').textContent = `${journey.index + 1} of ${journey.slides.length}`;
    ctx.setHash(`journey-${journey.index + 1}`);
  }

  function bind() {
    ctx.$('deck-prev').addEventListener('click', () => show(journey.index - 1));
    ctx.$('deck-next').addEventListener('click', () => show(journey.index + 1));
    document.addEventListener('keydown', (ev) => {
      if (ctx.$('view-journey').hidden || ev.target.matches('input, textarea, select')) return;
      if (ev.key === 'ArrowRight' || ev.key === 'PageDown') { ev.preventDefault(); show(journey.index + 1); }
      if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') { ev.preventDefault(); show(journey.index - 1); }
    });
  }

  /* ---------- Slide ---------- */

  function renderSlide(slide) {
    const st = stageOf(slide);
    const text = h('div', { class: 'slide-text' },
      h('p', { class: 'slide-kicker' },
        h('span', { class: 'stage-chip' }, st ? st.label : 'Why FourthSpace'),
        h('span', {}, `Step ${journey.index + 1} of ${journey.slides.length}`)),
      h('h2', {}, slide.title),
      ctx.renderMd(slide.body));

    if (slide.show.length || slide.arrows.length) {
      const named = slide.show.map(box).filter(Boolean).map((b) => b.label);
      const steps = slide.arrows.flatMap(arrowsFor).map((a) => a.label);
      const caption = h('figcaption', {}, [named.length && `Highlighted: ${named.join(', ')}.`, steps.length && `Arrows: ${steps.join(', ')}.`].filter(Boolean).join(' '));
      const go = h('button', { type: 'button', class: 'btn' }, 'Show on the diagram');
      go.addEventListener('click', () => ctx.showOnDiagram(journey.board, slide));
      text.append(h('figure', { class: 'mini' }, miniDiagram(slide), caption), go);
    }

    const make = VISUALS[slide.visual];
    const visual = h('div', { class: `slide-visual v-${slide.visual || 'none'}` });
    if (make) visual.append(make(slide.items, slide));
    return h('article', { class: 'slide-inner' }, text, visual);
  }

  /* ---------- Mini diagram ---------- */

  // A simplified Orion / Merlin / Agora strip: each module and the boxes directly inside it,
  // with the slide's boxes highlighted and its arrows drawn between them.
  function miniDiagram(slide) {
    const colW = 168;
    const gap = 64;
    const top = slide.arrows.flatMap(arrowsFor).some((a) => a.route === 'over') ? 30 : 4;
    const headH = 24;
    const chipH = 22;
    const chipGap = 5;
    const modules = journey.boxes.filter((b) => !b.parent).sort((p, q) => +p.col - +q.col);
    const pos = new Map();
    let height = 0;
    modules.forEach((m, i) => {
      const x = i * (colW + gap);
      pos.set(m.id, { x, y: top, w: colW, h: headH, mod: i, head: true });
      const kids = journey.boxes.filter((b) => b.parent === m.id).sort((p, q) => +p.row - +q.row || +p.col - +q.col);
      kids.forEach((k, j) => pos.set(k.id, { x: x + 6, y: top + headH + 4 + j * (chipH + chipGap), w: colW - 12, h: chipH, mod: i }));
      height = Math.max(height, top + headH + 4 + kids.length * (chipH + chipGap) + 4);
    });
    const anchor = (id) => {
      for (let b = box(id); b; b = box(b.parent)) if (pos.has(b.id)) return b.id;
      return null;
    };

    const lit = new Set(slide.show.map(anchor).filter(Boolean));
    const arrows = slide.arrows.flatMap(arrowsFor);
    arrows.forEach((a) => { lit.add(anchor(a.from)); lit.add(anchor(a.to)); });

    const width = modules.length * colW + (modules.length - 1) * gap;
    const svg = s('svg', { viewBox: `-4 0 ${width + 8} ${height + 2}`, class: 'mini-svg', role: 'img', 'aria-label': 'Where this happens on the diagram' });
    modules.forEach((m) => {
      const p = pos.get(m.id);
      svg.append(s('rect', { x: p.x, y: p.y, width: colW, height: height - p.y, rx: 8, class: `mini-module m-${m.id}` }));
      const head = s('text', { x: p.x + 10, y: p.y + 16, class: `mini-head${lit.has(m.id) ? ' lit' : ''}` });
      head.textContent = m.label;
      svg.append(head);
    });
    for (const [id, p] of pos) {
      if (p.head) continue;
      svg.append(s('rect', { x: p.x, y: p.y, width: p.w, height: p.h, rx: 5, class: `mini-chip${lit.has(id) ? ' lit' : ''}` }));
      const t = s('text', { x: p.x + 8, y: p.y + 15, class: `mini-label${lit.has(id) ? ' lit' : ''}` });
      t.textContent = box(id).label;
      svg.append(t);
    }

    const counts = new Map();
    const lane = (key) => {
      const n = counts.get(key) || 0;
      counts.set(key, n + 1);
      return n;
    };
    // Arrows between the same two boxes merge into one, labelled with all their numbers.
    const merged = new Map();
    arrows.forEach((a) => {
      const ia = anchor(a.from);
      const ib = anchor(a.to);
      if (!ia || !ib || ia === ib) return;
      const key = [ia, ib].sort().join('|');
      const num = a.label.split(' ')[0];
      const m = merged.get(key);
      if (!m) merged.set(key, { ia, ib, stage: a.stage, both: a.direction === 'both', nums: [num] });
      else {
        m.nums.push(num);
        if (m.ia !== ia || a.direction === 'both') m.both = true;
      }
    });
    merged.forEach((a) => {
      const { ia, ib } = a;
      const A = pos.get(ia);
      const B = pos.get(ib);
      const ay = A.y + A.h / 2;
      const by = B.y + B.h / 2;
      const st = journey.stages.find((x) => x.id === a.stage);
      const g = s('g', { class: `mini-arrow stage-${st ? st.index : 0}` });
      const text = a.nums.join(', ');
      const bw = text.length * 5.6 + 10;
      let d;
      let badge;
      let startDir = null;
      let endDir;
      if (A.mod === B.mod) {
        // A bracket down the module's left side, clear of the traffic to its right.
        const x = A.x - 10 - lane(`side${A.mod}`) * 8;
        d = `M${A.x} ${ay}H${x}V${by}H${B.x}`;
        badge = [x - bw / 2 - 2, (ay + by) / 2]; // beside the bracket, in the gap
        startDir = -1;
        endDir = 1;
      } else if (Math.abs(A.mod - B.mod) === 1) {
        const right = B.mod > A.mod;
        const gx = Math.min(A.mod, B.mod) * (colW + gap) + colW + gap / 2 + (lane(`gap${Math.min(A.mod, B.mod)}`) - 1) * 9;
        d = `M${right ? A.x + A.w : A.x} ${ay}H${gx}V${by}H${right ? B.x : B.x + B.w}`;
        badge = [gx, (ay + by) / 2];
        startDir = right ? 1 : -1;
        endDir = right ? 1 : -1;
      } else {
        // Over the top, like the "over" route on the full diagram.
        const ly = 8 + lane('over') * 6;
        const gx = B.x + B.w + 6 + gap / 2;
        d = `M${A.x + A.w / 2} ${A.y}V${ly}H${gx}V${by}H${B.x + B.w}`;
        badge = [(A.x + A.w / 2 + gx) / 2, ly];
        endDir = -1;
      }
      g.append(s('path', { d, class: 'mini-line' }));
      const tipX = endDir > 0 ? B.x : B.x + B.w;
      g.append(s('path', { d: `M${tipX} ${by}l${-endDir * 7} -4v8z`, class: 'mini-head-arrow' }));
      if (a.both && startDir) {
        const sx = startDir > 0 ? A.x + A.w : A.x;
        g.append(s('path', { d: `M${sx} ${ay}l${startDir * 7} -4v8z`, class: 'mini-head-arrow' }));
      }
      g.append(s('rect', { x: badge[0] - bw / 2, y: badge[1] - 8, width: bw, height: 16, rx: 8, class: 'mini-badge' }));
      const t = s('text', { x: badge[0], y: badge[1] + 3.5, class: 'mini-badge-text' });
      t.textContent = text;
      g.append(t);
      svg.append(g);
    });
    return svg;
  }

  /* ---------- Illustrations ---------- */

  // Hexagon heatmap. `t` moves the hot spot, so a row of these reads as change over time.
  function hexGrid(t, { cols = 7, rows = 5, r = 13, routes = false } = {}) {
    const w = Math.sqrt(3) * r;
    const svg = s('svg', { viewBox: `0 0 ${cols * w + w / 2 + 2} ${rows * r * 1.5 + r / 2 + 2}`, class: 'hexes', 'aria-hidden': 'true' });
    const cx = 1.6 + t * 2.6;
    const cy = 1.3 + t * 1.6;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = 1 + col * w + (row % 2 ? w / 2 : 0) + w / 2;
        const y = 1 + row * r * 1.5 + r;
        const dist = Math.hypot(col - cx, (row - cy) * 1.2);
        const v = Math.max(0.08, Math.min(1, (0.55 + t * 0.4) * Math.exp(-(dist * dist) / (5 + t * 4)) + ((col * 7 + row * 3) % 5) * 0.03));
        const pts = [0, 1, 2, 3, 4, 5].map((k) => {
          const ang = (Math.PI / 3) * k - Math.PI / 6;
          return `${(x + (r - 0.8) * Math.cos(ang)).toFixed(1)},${(y + (r - 0.8) * Math.sin(ang)).toFixed(1)}`;
        }).join(' ');
        svg.append(s('polygon', { points: pts, class: 'hex', 'fill-opacity': v.toFixed(2) }));
      }
    }
    if (routes) {
      svg.append(s('polyline', { points: `${w * 0.8},${r * 6.6} ${w * 2.6},${r * 4} ${w * 4.2},${r * 3.6} ${w * 6.4},${r * 1.4}`, class: 'route' }));
      svg.append(s('polyline', { points: `${w * 1.2},${r * 1.2} ${w * 3},${r * 2.6} ${w * 5.2},${r * 5.6} ${w * 7},${r * 6.2}`, class: 'route two' }));
      [[w * 2.6, r * 4], [w * 5.2, r * 5.6]].forEach(([x, y]) => svg.append(s('circle', { cx: x, cy: y, r: 4.5, class: 'marker' })));
    }
    return svg;
  }

  const arrowRight = () => h('span', { class: 'v-arrow', 'aria-hidden': 'true' }, '→');

  function windowFrame(title, ...body) {
    return h('div', { class: 'v-window' },
      h('div', { class: 'v-window-bar' }, h('i'), h('i'), h('i'), h('span', {}, title)),
      h('div', { class: 'v-window-body' }, ...body));
  }

  function tabbedPlan(items) {
    const [tabs, ask, reply] = [items.slice(0, 4), items[4], items[5]];
    const panes = [
      () => h('div', { class: 'v-schema' },
        h('p', { class: 'v-mono' }, 'area_daily'),
        h('table', {},
          h('thead', {}, h('tr', {}, h('th', {}, 'Column'), h('th', {}, 'Type'))),
          h('tbody', {}, ...[['h3_cell', 'H3 index'], ['date', 'date'], ['journey_time_p50', 'minutes'], ['footfall', 'count'], ['footfall_weekend', 'count']]
            .map(([c, t], i) => h('tr', { class: i === 4 ? 'new' : '' }, h('td', { class: 'v-mono' }, c), h('td', {}, t)))))),
      () => h('div', { class: 'v-steps' }, ...['Raw data', 'Clean and de-identify', 'Derive metrics', 'Spacetime-H3 index', 'Compliance gate', 'Golden Datasets']
        .flatMap((t, i, all) => [h('span', { class: `v-step${i === all.length - 1 ? ' gold' : ''}` }, t), i < all.length - 1 ? arrowRight() : null])),
      () => {
        const svg = s('svg', { viewBox: '0 0 300 150', class: 'v-onto', role: 'img', 'aria-label': 'Ontology graph' });
        const nodes = { area: [70, 40, 'Area'], cell: [210, 40, 'Space-Time Cell'], metric: [210, 115, 'Metric'], site: [70, 115, 'Candidate Site'] };
        [['site', 'area'], ['area', 'cell'], ['cell', 'metric']].forEach(([p, q]) => {
          svg.append(s('line', { x1: nodes[p][0], y1: nodes[p][1], x2: nodes[q][0], y2: nodes[q][1], class: 'v-onto-link' }));
        });
        Object.values(nodes).forEach(([x, y, label]) => {
          svg.append(s('rect', { x: x - 52, y: y - 13, width: 104, height: 26, rx: 13, class: 'v-onto-node' }));
          const t = s('text', { x, y: y + 4, class: 'v-onto-text' });
          t.textContent = label;
          svg.append(t);
        });
        return svg;
      },
      () => h('div', { class: 'v-models' },
        h('div', { class: 'v-card' }, h('b', {}, 'Journey time forecaster'), h('small', {}, 'Time-series transformer'), h('p', {}, 'Median journey time per cell, 6 weeks ahead')),
        h('div', { class: 'v-card' }, h('b', {}, 'Route impact model'), h('small', {}, 'Gradient-boosted trees'), h('p', {}, 'Change in journey time if a route is added'))),
    ];
    const pane = h('div', { class: 'v-pane' });
    const bar = h('div', { class: 'v-tabs', role: 'tablist' });
    const pick = (i) => {
      [...bar.children].forEach((b, j) => b.setAttribute('aria-selected', String(i === j)));
      pane.replaceChildren(panes[i]());
    };
    tabs.forEach((t, i) => {
      const b = h('button', { type: 'button', role: 'tab' }, t);
      b.addEventListener('click', () => pick(i));
      bar.append(b);
    });
    pick(0);
    const doc = h('div', { class: 'v-doc' }, bar, pane);
    const chat = h('div', { class: 'v-side-chat' },
      ask ? md(ask, 'p', 'v-bubble user') : null,
      reply ? md(reply, 'p', 'v-bubble agent') : null);
    return windowFrame('Plan document', h('div', { class: 'v-plan' }, doc, chat));
  }

  const VISUALS = {
    decisions(items) {
      const cards = items.map((item) => {
        const [first, ...rest] = item.split(' ');
        const emoji = !/[A-Za-z0-9]/.test(first);
        return h('div', { class: 'v-card v-decision' },
          h('span', { class: 'v-emoji', 'aria-hidden': 'true' }, emoji ? first : '📍'),
          h('span', {}, emoji ? rest.join(' ') : item));
      });
      return h('div', { class: 'v-stack' },
        h('div', { class: 'v-grid four' }, ...cards),
        h('div', { class: 'v-flow' },
          h('span', { class: 'v-pill' }, 'Raw data'), arrowRight(),
          h('span', { class: 'v-pill hot' }, h('small', {}, 'FourthSpace'), 'Interpretable signals'), arrowRight(),
          h('span', { class: 'v-pill' }, 'Decision')));
    },

    expectations(items) {
      const [first, ...rest] = items;
      return h('div', { class: 'v-grid two' },
        h('div', { class: 'v-card v-dim' },
          h('small', {}, 'Not enough'),
          h('div', { class: 'v-sites' }, ...['A', 'B', 'C'].map((x) => h('span', {}, `📍 Site ${x}`))),
          h('p', {}, first || '')),
        h('div', { class: 'v-card v-hot' },
          h('small', {}, 'What users expect'),
          h('ul', { class: 'v-checks' }, ...rest.map((item) => h('li', {}, icon('check'), md(item))))));
    },

    project(items) {
      const icons = ['table', 'graph', 'chart'];
      return h('div', { class: 'v-project' },
        h('div', { class: 'v-project-back' }), h('div', { class: 'v-project-back two' }),
        h('div', { class: 'v-project-main' },
          h('div', { class: 'v-project-head' },
            h('b', {}, 'Project'),
            h('span', { class: 'v-avatars', title: 'Many users per Project' }, h('i', {}, 'A'), h('i', {}, 'K'), h('i', {}, 'R'))),
          ...items.map((item, i) => {
            const [title, detail] = split(item);
            return h('div', { class: 'v-part' }, icon(icons[i % 3]), h('div', {}, h('b', {}, title), md(detail, 'p')));
          }),
          h('p', { class: 'v-note' }, 'Stored in Merlin, on GCP')));
    },

    hexes(items) {
      return h('div', { class: 'v-stack' },
        h('div', { class: 'v-grid three' }, ...items.map((label, i) => h('figure', { class: 'v-hexfig' },
          hexGrid(items.length > 1 ? i / (items.length - 1) : 0), h('figcaption', {}, label)))),
        h('div', { class: 'v-scale' }, h('span', {}, 'Low'), h('i'), h('span', {}, 'High predicted value')));
    },

    onboard(items) {
      const files = items.slice(0, -1);
      const ask = items[items.length - 1] || '';
      return windowFrame('Agora · New Project',
        h('div', { class: 'v-files' }, ...files.map((f) => h('span', { class: 'v-file' }, icon('clip'), f))),
        md(ask, 'p', 'v-bubble user'),
        h('div', { class: 'v-input' }, h('span', {}, 'Describe the decision…'), h('b', {}, 'Send')));
    },

    schema(items) {
      const [head, ...rest] = items;
      const [k, v] = split(head || '');
      const cols = rest.filter((x) => split(x)[1]);
      const rules = rest.filter((x) => !split(x)[1]);
      return h('div', { class: 'v-grid two wide-first' },
        h('div', { class: 'v-card' },
          h('small', {}, 'Orion replies'),
          h('p', { class: 'v-big' }, h('b', {}, v), ` ${k.toLowerCase()}`),
          h('table', { class: 'v-table' },
            h('thead', {}, h('tr', {}, h('th', {}, 'Column'), h('th', {}, 'Type'))),
            h('tbody', {}, ...cols.map((c) => { const [name, type] = split(c); return h('tr', {}, h('td', { class: 'v-mono' }, name), h('td', {}, type)); }))),
          h('p', { class: 'v-note' }, icon('lock', 'v-icon small'), 'No raw values leave Orion')),
        h('div', { class: 'v-card' },
          h('small', {}, 'Regulations from the user'),
          h('div', { class: 'v-chips' }, ...rules.map((r) => h('span', { class: 'v-chip' }, r)))));
    },

    react(items) {
      const [reason, act, observe, ...outs] = items;
      const svg = s('svg', { viewBox: '0 0 240 230', class: 'v-loop', role: 'img', 'aria-label': `${reason}, ${act}, ${observe} loop` });
      const c = [120, 118];
      const R = 76;
      const at = (deg) => [c[0] + R * Math.cos((deg * Math.PI) / 180), c[1] + R * Math.sin((deg * Math.PI) / 180)];
      const angles = [-90, 30, 150];
      angles.forEach((deg, i) => {
        const from = at(deg + 24);
        const to = at(angles[(i + 1) % 3] - 24);
        svg.append(s('path', { d: `M${from[0]} ${from[1]}A${R} ${R} 0 0 1 ${to[0]} ${to[1]}`, class: 'v-loop-arc', 'marker-end': 'url(#loop-head)' }));
      });
      svg.prepend(s('defs', {}, s('marker', { id: 'loop-head', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' },
        s('path', { d: 'M0 0L10 5L0 10z', class: 'v-loop-tip' }))));
      [reason, act, observe].forEach((label, i) => {
        const [x, y] = at(angles[i]);
        svg.append(s('circle', { cx: x, cy: y, r: 31, class: 'v-loop-node' }));
        const t = s('text', { x, y: y + 4, class: 'v-loop-text' });
        t.textContent = label;
        svg.append(t);
      });
      const mid = s('text', { x: c[0], y: c[1] + 4, class: 'v-loop-mid' });
      mid.textContent = 'Plan agents';
      svg.append(mid);
      const icons = ['table', 'graph', 'chart'];
      return h('div', { class: 'v-grid loop' }, svg,
        h('div', { class: 'v-outs' }, ...outs.map((o, i) => {
          const [title, detail] = split(o);
          return h('div', { class: 'v-part' }, icon(icons[i % 3]), h('div', {}, h('b', {}, title), md(detail, 'p')));
        })));
    },

    verify(items) {
      return h('div', { class: 'v-card v-verify' },
        h('div', { class: 'v-verify-head' }, h('b', {}, 'Verification agent'), h('span', { class: 'v-pass' }, 'All checks passed')),
        h('ul', { class: 'v-checks' }, ...items.map((item, i) => h('li', { style: `--i: ${i}` }, icon('check'), md(item)))));
    },

    plandoc: tabbedPlan,

    create(items) {
      const [lane1, out1, lane2, out2, last] = items;
      const lane = (item, out, width, cls) => {
        const [name, detail] = split(item || '');
        return h('div', { class: 'v-lane' },
          h('span', { class: 'v-lane-label' }, name, detail ? h('small', {}, detail) : null),
          h('div', { class: 'v-lane-track' },
            h('i', { class: `v-bar ${cls}`, style: `--w: ${width}%` }),
            out ? h('span', { class: 'v-milestone', style: `left: ${width}%` }, out) : null));
      };
      return h('div', { class: 'v-card v-gantt' },
        h('div', { class: 'v-gantt-axis' }, h('span', {}, 'Plan approved'), h('span', {}, 'Project ready')),
        lane(lane1, out1, 45, 'one'),
        lane(lane2, out2, 55, 'two'),
        lane('Palantir Foundry: Reads the Golden Datasets', last, 0, 'none'),
        h('p', { class: 'v-note' }, 'Everything the Project owns is stored in Merlin.'));
    },

    recovery(items) {
      const [cp1, cp2, fail, audit, fix, restart, ready] = items;
      const svg = s('svg', { viewBox: '0 0 520 205', class: 'v-recovery', role: 'img', 'aria-label': 'Failure, recovery and restart from a checkpoint' });
      svg.append(s('defs', {}, s('marker', { id: 'rec-head', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' },
        s('path', { d: 'M0 0L10 5L0 10z', class: 'v-rec-tip' }))));
      const label = (x, y, text, cls = 'v-rec-text') => {
        const t = s('text', { x, y, class: cls });
        t.textContent = text || '';
        svg.append(t);
      };
      const pill = (x, y, text) => {
        const w = (text || '').length * 7 + 22;
        svg.append(s('rect', { x: x - w / 2, y: y - 13, width: w, height: 26, rx: 13, class: 'v-rec-pill' }));
        label(x, y + 4.5, text);
        return w;
      };
      // First run: two checkpoints, then a failure.
      svg.append(s('line', { x1: 24, y1: 110, x2: 388, y2: 110, class: 'v-rec-run' }));
      [[90, cp1], [200, cp2]].forEach(([x, text]) => {
        svg.append(s('circle', { cx: x, cy: 110, r: 7, class: 'v-rec-cp' }));
        label(x - 8, 136, text, 'v-rec-text muted end');
      });
      svg.append(s('path', { d: 'M372 102l16 16M388 102l-16 16', class: 'v-rec-fail' }));
      label(380, 92, fail, 'v-rec-text bad');
      // Recovery loop underneath, back to the last checkpoint.
      const arrow = (d) => svg.append(s('path', { d, class: 'v-rec-loop', 'marker-end': 'url(#rec-head)' }));
      arrow('M380 124V158');
      pill(380, 175, audit);
      arrow('M351 175H316');
      pill(290, 175, fix);
      arrow('M268 175H240');
      pill(200, 175, restart);
      arrow('M200 162V121');
      // Second run from the checkpoint to the finish.
      svg.append(s('path', { d: 'M200 103V48H468', class: 'v-rec-retry', 'marker-end': 'url(#rec-head)' }));
      svg.append(s('circle', { cx: 486, cy: 48, r: 11, class: 'v-rec-ready' }));
      svg.append(s('path', { d: 'M480.5 48l4 4 7.5-8', class: 'v-rec-tick' }));
      label(497, 26, ready, 'v-rec-text end');
      return h('div', { class: 'v-card' }, svg);
    },

    interact(items) {
      const [ask, ...sources] = items;
      const icons = ['table', 'graph', 'chart'];
      const fan = s('svg', { viewBox: '0 0 300 40', preserveAspectRatio: 'none', class: 'v-fan', 'aria-hidden': 'true' },
        ...[50, 150, 250].map((x) => s('path', { d: `M150 0C150 20 ${x} 18 ${x} 40`, class: 'v-fan-line' })));
      return h('div', { class: 'v-stack center' },
        md(ask || '', 'p', 'v-bubble user'),
        h('span', { class: 'v-arrow down', 'aria-hidden': 'true' }, '↓'),
        h('div', { class: 'v-hub' }, h('b', {}, 'Research agents'), h('small', {}, 'Plan · Query · Report')),
        fan,
        h('div', { class: 'v-grid three' }, ...sources.map((src, i) => h('div', { class: 'v-card v-source' }, icon(icons[i % 3]), h('span', {}, src)))));
    },

    outputs(items) {
      const [docTitle, finding, mapTitle] = items;
      const bars = h('div', { class: 'v-bars', 'aria-hidden': 'true' }, ...[62, 48, 80, 35, 70].map((v) => h('i', { style: `height: ${v}%` })));
      return h('div', { class: 'v-grid two' },
        windowFrame(docTitle || '',
          md(finding || '', 'h4', 'v-doc-title'),
          h('div', { class: 'v-lines', 'aria-hidden': 'true' }, h('i'), h('i'), h('i', { class: 'short' })),
          bars,
          h('div', { class: 'v-chips' }, h('span', { class: 'v-chip' }, '14 queries'), h('span', { class: 'v-chip' }, '2 models'), h('span', { class: 'v-chip' }, 'Sources'))),
        windowFrame(mapTitle || '',
          h('div', { class: 'v-map' }, hexGrid(0.6, { cols: 8, rows: 6, r: 12, routes: true })),
          h('div', { class: 'v-chips' }, h('span', { class: 'v-chip on' }, 'Heatmap'), h('span', { class: 'v-chip on' }, 'Routes'), h('span', { class: 'v-chip' }, 'Forecast'))));
    },
  };

  bind();
  return {
    load,
    show,
    get slides() { return journey.slides; },
    get board() { return journey.board; },
    get index() { return journey.index; },
    set index(i) { journey.index = i; },
  };
};
