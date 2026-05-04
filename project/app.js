// History Flow — Canvas renderer v3
// Cities + People both rendered on Canvas for performance
// SVG used only for base map (land, ocean, graticule, borders)
(() => {
  'use strict';

  const YEAR_MIN = -11000;
  const YEAR_MAX = 2000;
  const WORLD_TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

  // Mutable range — updated when dataset changes
  let rangeMin = YEAR_MIN, rangeMax = YEAR_MAX;

  // Per-dataset ranges, computed after data loads
  const datasetRanges = {
    cities: { min: YEAR_MIN, max: YEAR_MAX },
    people: { min: YEAR_MIN, max: YEAR_MAX },
    both:   { min: YEAR_MIN, max: YEAR_MAX }
  };

  const RANGE_BUFFER = 5;

  function computeRanges() {
    if (state.cities && state.cities.length) {
      const years = state.cities.map(c => c.year);
      datasetRanges.cities = { min: Math.min(...years) - RANGE_BUFFER, max: Math.max(...years) + RANGE_BUFFER };
    }
    if (state.people && state.people.length) {
      const years = state.people.map(p => p.year);
      datasetRanges.people = { min: Math.min(...years) - RANGE_BUFFER, max: Math.max(...years) + RANGE_BUFFER };
    }
    datasetRanges.both = {
      min: Math.min(datasetRanges.cities.min, datasetRanges.people.min),
      max: Math.max(datasetRanges.cities.max, datasetRanges.people.max)
    };
  }

  function ticksForRange(min, max) {
    const span = max - min;
    let step;
    if (span > 10000) step = 2000;
    else if (span > 5000) step = 1000;
    else if (span > 2000) step = 500;
    else if (span > 1000) step = 200;
    else step = 100;
    const ticks = [];
    const start = Math.ceil(min / step) * step;
    for (let t = start; t <= max; t += step) ticks.push(t);
    return ticks;
  }

  function rebuildTicks(min, max) {
    const ticksEl = document.getElementById('ticks');
    if (!ticksEl) return;
    ticksEl.innerHTML = '';
    for (const ty of ticksForRange(min, max)) {
      const el = document.createElement('div');
      el.className = 'tick';
      el.style.left = ((ty - min) / (max - min) * 100) + '%';
      el.textContent = ty === 0 ? '0' : (ty < 0 ? `${-ty}BC` : `${ty}AD`);
      ticksEl.appendChild(el);
    }
  }

  function applyRange(min, max) {
    rangeMin = min; rangeMax = max;
    slider.min = min; slider.max = max;
    rebuildTicks(min, max);
    setYear(Math.max(min, Math.min(max, state.year)));
  }

  const DATASET_META = {
    cities: {
      subtitle: 'Cities of the world, plotted by their earliest recorded foundation date. Dot size reflects historical importance.',
      statLabel: 'Cities founded',
    },
    people: {
      subtitle: 'Globally famous historical figures, plotted by birthplace. Dot size reflects Historical Popularity Index (HPI). Coloured by domain.',
      statLabel: 'People born',
    },
    both: {
      subtitle: 'Combined view — city foundations (sepia dots) and famous people (coloured diamonds) overlaid on the same map.',
      statLabel: 'Entries visible',
    }
  };

  // ── STATE ──────────────────────────────────────────────
  const state = {
    year: -10000,
    playing: false,
    playSpeed: 10,
    lastFrameTime: null,
    transform: d3.zoomIdentity,
    world: null, countries: null, land: null,
    cities: null, people: null,
    dataset: 'cities',
    activeDomains: new Set(['A','S','L','P','R','H']),
    selectedItem: null,
    hoveredItem: null,
    tweaks: { ...(window.TWEAK_DEFAULTS || { speed:10, dotSize:0.4, glow:0.5, borders:true, trails:true }) }
  };
  state.playSpeed = state.tweaks.speed;

  try {
    const saved = JSON.parse(localStorage.getItem('history-flow-state') || '{}');
    if (typeof saved.year === 'number') state.year = Math.max(YEAR_MIN, Math.min(YEAR_MAX, saved.year));
    if (saved.dataset) state.dataset = saved.dataset;
  } catch(e) {}

  // ── HELPERS ────────────────────────────────────────────
  function formatYear(y) {
    y = Math.round(y);
    if (y < 0) return `${Math.abs(y)} BC`;
    if (y === 0) return '1 AD';
    return `${y} AD`;
  }

  const ERAS = [
    [-10000,-5000,'Stone Age'],[-5000,-3000,'Chalcolithic'],[-3000,-1200,'Bronze Age'],
    [-1200,-500,'Iron Age'],[-500,500,'Classical Antiquity'],[500,1000,'Early Middle Ages'],
    [1000,1400,'High Middle Ages'],[1400,1600,'Renaissance'],[1600,1800,'Early Modern'],
    [1800,1900,'Industrial Age'],[1900,2100,'Modern Era']
  ];
  function eraOf(y) { for (const [a,b,n] of ERAS) if (y>=a && y<b) return n; return 'Modern Era'; }

  const DOMAIN_COLORS = window.PEOPLE_DOMAIN_COLORS || {};
  const DOMAIN_LABELS = window.PEOPLE_DOMAIN_LABELS || {};

  // ── PROJECTION & SVG BASE MAP ──────────────────────────
  const svgEl = document.getElementById('map');
  const svg = d3.select(svgEl);
  let projection, pathGen, width, height;
  let canvas, ctx;

  function setupSizes() {
    const wrap = document.getElementById('map-wrap');
    width = wrap.clientWidth; height = wrap.clientHeight;
    svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);
    projection = d3.geoNaturalEarth1()
      .scale(Math.min(width/6.2, height/3.2))
      .translate([width/2, height/2])
      .precision(0.1);
    pathGen = d3.geoPath(projection);

    // Canvas overlay (same size)
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;';
      document.getElementById('map-wrap').appendChild(canvas);
    }
    canvas.width = width; canvas.height = height;
    canvas.style.width = width+'px'; canvas.style.height = height+'px';
    ctx = canvas.getContext('2d');
  }

  function setupDefs() {
    const defs = svg.append('defs');
    const grad = defs.append('radialGradient').attr('id','ocean-grad').attr('cx','50%').attr('cy','50%').attr('r','70%');
    grad.append('stop').attr('offset','0%').attr('stop-color','#d7c8a3');
    grad.append('stop').attr('offset','100%').attr('stop-color','#b89f72');
    const lg = defs.append('linearGradient').attr('id','land-grad').attr('x1','0%').attr('y1','0%').attr('x2','0%').attr('y2','100%');
    lg.append('stop').attr('offset','0%').attr('stop-color','#ecdcb8');
    lg.append('stop').attr('offset','100%').attr('stop-color','#dcc99a');
    const pat = defs.append('pattern').attr('id','water-hatch').attr('patternUnits','userSpaceOnUse').attr('width',6).attr('height',6);
    pat.append('rect').attr('width',6).attr('height',6).attr('fill','#d7c8a3');
    pat.append('path').attr('d','M-1,1 l2,-2 M0,6 l6,-6 M5,7 l2,-2').attr('stroke','#c2ae7f').attr('stroke-width',0.4).attr('opacity',0.5);
  }

  let gRoot, gOcean, gGraticule, gLand, gBorders;
  function setupSVGLayers() {
    gRoot = svg.append('g').attr('class','root');
    gOcean = gRoot.append('g'); gGraticule = gRoot.append('g');
    gLand = gRoot.append('g'); gBorders = gRoot.append('g');
  }

  function renderBase() {
    gOcean.selectAll('*').remove(); gGraticule.selectAll('*').remove();
    gLand.selectAll('*').remove(); gBorders.selectAll('*').remove();
    gOcean.append('path').attr('d',pathGen({type:'Sphere'})).attr('fill','url(#water-hatch)').attr('stroke','#6b4423').attr('stroke-width',0.8);
    const gr = d3.geoGraticule().step([15,15]);
    gGraticule.append('path').attr('d',pathGen(gr())).attr('fill','none').attr('stroke','rgba(107,68,35,0.18)').attr('stroke-width',0.4);
    if (state.land) gLand.append('path').attr('d',pathGen(state.land)).attr('fill','url(#land-grad)').attr('stroke','#a8906a').attr('stroke-width',0.6);
    if (state.countries && state.tweaks.borders) gBorders.append('path').attr('d',pathGen(state.countries)).attr('fill','none').attr('stroke','rgba(120,85,50,0.4)').attr('stroke-width',0.4).attr('stroke-dasharray','1.5,1.5');
  }

  // ── CANVAS DOT RENDERING ──────────────────────────────
  // Spatial grid for hit detection
  const GRID_CELL = 40; // px
  let hitGrid = {};
  let allDots = []; // flat list of rendered dots this frame: {x,y,r,item,type}

  function clearCanvas() {
    ctx.clearRect(0, 0, width, height);
    hitGrid = {}; allDots = [];
  }

  function gridKey(x, y) {
    return `${Math.floor(x/GRID_CELL)},${Math.floor(y/GRID_CELL)}`;
  }

  function registerDot(x, y, r, item, type) {
    allDots.push({x, y, r, item, type});
    // register in nearby cells
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const k = `${Math.floor((x + dx*GRID_CELL)/GRID_CELL)},${Math.floor((y + dy*GRID_CELL)/GRID_CELL)}`;
        if (!hitGrid[k]) hitGrid[k] = [];
        hitGrid[k].push(allDots.length - 1);
      }
    }
  }

  function hitTest(mx, my) {
    const k = gridKey(mx, my);
    const candidates = hitGrid[k] || [];
    let best = null, bestR = 12; // min hit radius
    for (const i of candidates) {
      const d = allDots[i];
      const dist = Math.sqrt((mx-d.x)**2 + (my-d.y)**2);
      const hitR = Math.max(8, d.r + 4);
      if (dist <= hitR && hitR > bestR) {
        best = d; bestR = hitR;
      }
      if (dist <= hitR && !best) best = d;
    }
    return best;
  }

  function drawCity(x, y, r, age, dotSize) {
    const alpha = !state.tweaks.trails ? 1 : (age < 50 ? Math.min(1, 0.5 + age/80) : 1);
    if (alpha <= 0) return;

    // Glow ring for newly founded cities
    if (age < 80 && state.tweaks.glow > 0) {
      const glowR = r + (1 - age/80) * 8 * state.tweaks.glow;
      const glowA = (1 - age/80) * 0.5 * state.tweaks.glow * alpha;
      ctx.beginPath();
      ctx.arc(x, y, glowR, 0, Math.PI*2);
      ctx.fillStyle = `rgba(139,58,42,${glowA.toFixed(3)})`;
      ctx.fill();
    }

    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fillStyle = '#6b2818';
    ctx.fill();
    ctx.strokeStyle = 'rgba(241,232,212,0.7)';
    ctx.lineWidth = 0.4 / state.transform.k;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawPerson(x, y, r, age, color) {
    const alpha = !state.tweaks.trails ? 1 : (age < 50 ? Math.min(1, 0.4 + age/80) : 1);
    if (alpha <= 0) return;

    // Glow for new arrivals
    if (age < 80 && state.tweaks.glow > 0) {
      const glowR = r + (1 - age/80) * 7 * state.tweaks.glow;
      const glowA = (1 - age/80) * 0.4 * state.tweaks.glow * alpha;
      ctx.beginPath();
      ctx.arc(x, y, glowR, 0, Math.PI*2);
      ctx.fillStyle = color.replace(')', `,${glowA.toFixed(3)})`).replace('rgb','rgba');
      ctx.fill();
    }

    ctx.globalAlpha = alpha;
    // Diamond shape
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI/4);
    ctx.beginPath();
    ctx.rect(-r, -r, r*2, r*2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(241,232,212,0.7)';
    ctx.lineWidth = 0.4 / state.transform.k;
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function renderDots(year) {
    clearCanvas();

    // Apply zoom transform to ctx
    const t = state.transform;
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.scale(t.k, t.k);

    const dotScale = state.tweaks.dotSize;

    // ── CITIES ──
    if ((state.dataset === 'cities' || state.dataset === 'both') && state.cities) {
      for (const c of state.cities) {
        if (c.year > year) continue;
        const pt = projection([c.lon, c.lat]);
        if (!pt) continue;
        const r = (1.2 + c.importance * 0.9) * dotScale;
        const age = year - c.year;
        drawCity(pt[0], pt[1], r, age, dotScale);
        // Register in screen coords
        const sx = pt[0]*t.k + t.x, sy = pt[1]*t.k + t.y;
        registerDot(sx, sy, r*t.k, c, 'city');
      }
    }

    // ── PEOPLE ──
    if ((state.dataset === 'people' || state.dataset === 'both') && state.people) {
      for (const p of state.people) {
        if (p.year > year || !state.activeDomains.has(p.domain)) continue;
        const pt = projection([p.lon, p.lat]);
        if (!pt) continue;
        // Size based on HPI — remap from Pantheon range (12-32) to radius 1.5-8
        const hpiMin = (window.PEOPLE_HPI_RANGE && window.PEOPLE_HPI_RANGE[0]) || 12;
        const hpiMax = (window.PEOPLE_HPI_RANGE && window.PEOPLE_HPI_RANGE[1]) || 32;
        const r = Math.max(1.5, ((p.hpi - hpiMin) / (hpiMax - hpiMin)) * 7 + 1.5) * dotScale;
        const age = year - p.year;
        const color = DOMAIN_COLORS[p.domain] || '#6b4423';
        drawPerson(pt[0], pt[1], r, age, color);
        const sx = pt[0]*t.k + t.x, sy = pt[1]*t.k + t.y;
        registerDot(sx, sy, r*t.k, p, 'person');
      }
    }

    ctx.restore();

    // ── LABELS ──
    renderLabels(year, t);
  }

  function renderLabels(year, t) {
    if (t.k < 1.8) return;
    const k = t.k;
    const fontSize = 11;

    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.scale(k, k);
    ctx.font = `${fontSize/k}px "IM Fell English SC", Georgia, serif`;
    ctx.textBaseline = 'bottom';

    const placed = [], minDist = 40/k;
    let items = [];

    if (state.dataset === 'cities' || state.dataset === 'both') {
      const thr = k > 5 ? 1 : (k > 3.5 ? 2 : (k > 2.5 ? 3 : 4));
      (state.cities||[]).filter(c => c.year <= year && c.importance >= thr)
        .forEach(c => { const pt = projection([c.lon, c.lat]); if (pt) items.push({name:c.name, pt, score:c.importance*20}); });
    }
    if (state.dataset === 'people' || state.dataset === 'both') {
      const hpiRangeMin = (window.PEOPLE_HPI_RANGE && window.PEOPLE_HPI_RANGE[0]) || 12;
      const hpiRangeMax = (window.PEOPLE_HPI_RANGE && window.PEOPLE_HPI_RANGE[1]) || 32;
      const hpiThreshPct = k > 5 ? 0.5 : (k > 3.5 ? 0.7 : 0.85);
      const hpiMin = hpiRangeMin + (hpiRangeMax - hpiRangeMin) * hpiThreshPct;
      (state.people||[]).filter(p => p.year <= year && p.hpi >= hpiMin && state.activeDomains.has(p.domain))
        .forEach(p => { const pt = projection([p.lon, p.lat]); if (pt) items.push({name:p.name, pt, score:p.hpi}); });
    }

    items.sort((a,b) => b.score - a.score);
    for (const item of items) {
      const [px, py] = item.pt;
      let ok = true;
      for (const q of placed) {
        if (Math.abs(px - q[0]) < minDist && Math.abs(py - q[1]) < minDist*0.6) { ok=false; break; }
      }
      if (!ok) continue;
      placed.push([px, py]);

      const tx = px + 5/k, ty = py - 4/k;
      // Halo
      ctx.strokeStyle = 'rgba(241,232,212,0.9)';
      ctx.lineWidth = 2.5/k;
      ctx.lineJoin = 'round';
      ctx.strokeText(item.name, tx, ty);
      ctx.fillStyle = '#3a2a14';
      ctx.fillText(item.name, tx, ty);
    }
    ctx.restore();
  }

  // Master render
  function render(year) {
    renderDots(year);
    updateStats(year);
  }

  // ── TICKER ────────────────────────────────────────────
  let tickerTimeout = null;
  let lastTickerYear = -Infinity;

  function checkNewEntries(year, prevYear) {
    if (year <= prevYear) return; // only forward playback
    let newest = null, newestYear = -Infinity;

    if (state.dataset === 'cities' || state.dataset === 'both') {
      for (const c of (state.cities||[])) {
        if (c.year > prevYear && c.year <= year && c.year > newestYear) {
          newestYear = c.year; newest = { name: c.name, sub: c.country, label: 'Founded', color: '#6b4423' };
        }
      }
    }
    if (state.dataset === 'people' || state.dataset === 'both') {
      for (const p of (state.people||[])) {
        if (!state.activeDomains.has(p.domain)) continue;
        if (p.year > prevYear && p.year <= year && p.year > newestYear) {
          newestYear = p.year;
          newest = { name: p.name, sub: `${p.occupation} · ${formatYear(p.year)}`, label: 'Born', color: DOMAIN_COLORS[p.domain]||'#6b4423' };
        }
      }
    }

    if (newest && newestYear !== lastTickerYear) {
      lastTickerYear = newestYear;
      showTicker(newest);
    }
  }

  function showTicker(entry) {
    const ticker = document.getElementById('new-entry-ticker');
    const nameEl = document.getElementById('ticker-name');
    const subEl = document.getElementById('ticker-sub');
    const labelEl = document.getElementById('ticker-label');

    labelEl.textContent = entry.label;
    nameEl.textContent = entry.name;
    nameEl.style.color = entry.color;
    subEl.textContent = entry.sub;

    // Force re-animation
    nameEl.style.animation = 'none';
    nameEl.offsetHeight; // reflow
    nameEl.style.animation = '';

    ticker.classList.add('visible');
    clearTimeout(tickerTimeout);
    tickerTimeout = setTimeout(() => ticker.classList.remove('visible'), 3500);
  }
  function updateStats(year) {
    let count = 0, total = 0, newestName = '—', newestYear = -Infinity;
    if (state.dataset === 'cities' || state.dataset === 'both') {
      const vc = (state.cities||[]).filter(c => c.year <= year);
      count += vc.length; total += (state.cities||[]).length;
      const n = vc.reduce((a,b) => b.year>a.year?b:a, {year:-Infinity,name:'—'});
      if (n.year > newestYear) { newestYear = n.year; newestName = n.name; }
    }
    if (state.dataset === 'people' || state.dataset === 'both') {
      const vp = (state.people||[]).filter(p => p.year <= year && state.activeDomains.has(p.domain));
      count += vp.length; total += (state.people||[]).length;
      const n = vp.reduce((a,b) => b.year>a.year?b:a, {year:-Infinity,name:'—'});
      if (n.year > newestYear) { newestYear = n.year; newestName = n.name; }
    }
    document.getElementById('stat-count').textContent = count.toLocaleString();
    document.getElementById('stat-total').textContent = total.toLocaleString();
    document.getElementById('stat-newest').textContent = newestName;
    document.getElementById('era-name').textContent = eraOf(year);
  }

  // ── ZOOM ───────────────────────────────────────────────
  const zoom = d3.zoom().scaleExtent([1,16])
    .on('start', () => svgEl.classList.add('dragging'))
    .on('end', () => svgEl.classList.remove('dragging'))
    .on('zoom', (event) => {
      state.transform = event.transform;
      gRoot.attr('transform', event.transform);
      gRoot.selectAll('path').attr('vector-effect','non-scaling-stroke');
      render(state.year);
    });

  function applyZoom() { svg.call(zoom); }
  document.getElementById('zoom-in').addEventListener('click', () => svg.transition().duration(250).call(zoom.scaleBy, 1.5));
  document.getElementById('zoom-out').addEventListener('click', () => svg.transition().duration(250).call(zoom.scaleBy, 1/1.5));
  document.getElementById('zoom-reset').addEventListener('click', () => svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity));

  // ── CANVAS MOUSE EVENTS ────────────────────────────────
  const tooltip = document.getElementById('tooltip');
  const ttName = document.getElementById('tt-name');
  const ttCountry = document.getElementById('tt-country');
  const ttYear = document.getElementById('tt-year');

  // Use SVG for mouse events (sits above canvas in z-order via pointer-events)
  // But canvas is pointer-events:none, so mouse goes to SVG
  svgEl.addEventListener('mousemove', (e) => {
    const rect = svgEl.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const hit = hitTest(mx, my);
    if (hit) {
      const d = hit.item, type = hit.type;
      ttName.textContent = d.name;
      if (type === 'city') {
        ttCountry.textContent = d.country;
        ttYear.textContent = `Founded ${formatYear(d.year)}`;
      } else {
        ttCountry.textContent = `${d.occupation} · ${DOMAIN_LABELS[d.domain]||d.domain}`;
        ttYear.textContent = `Born ${formatYear(d.year)} · HPI ${d.hpi}`;
      }
      tooltip.classList.add('visible');
      const pad = 14;
      let tx = e.clientX + pad, ty = e.clientY + pad;
      if (tx + tooltip.offsetWidth > window.innerWidth - 10) tx = e.clientX - tooltip.offsetWidth - pad;
      if (ty + tooltip.offsetHeight > window.innerHeight - 10) ty = e.clientY - tooltip.offsetHeight - pad;
      tooltip.style.left = tx+'px'; tooltip.style.top = ty+'px';
      svgEl.style.cursor = 'pointer';
    } else {
      tooltip.classList.remove('visible');
      svgEl.style.cursor = '';
    }
  });

  svgEl.addEventListener('mouseleave', () => { tooltip.classList.remove('visible'); });

  svgEl.addEventListener('click', (e) => {
    if (svgEl.classList.contains('dragging')) return;
    const rect = svgEl.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const hit = hitTest(mx, my);
    if (hit) {
      selectItem(hit.item, hit.type);
    } else {
      document.getElementById('city-card').classList.remove('visible');
      state.selectedItem = null;
    }
  });

  // ── CARD ───────────────────────────────────────────────
  function selectItem(d, type) {
    state.selectedItem = d;
    document.getElementById('card-name').textContent = d.name;
    if (type === 'city') {
      document.getElementById('card-country').textContent = d.country;
      document.getElementById('card-founded-label').textContent = 'Founded';
      document.getElementById('card-year').textContent = formatYear(d.year);
      document.getElementById('card-coords').textContent =
        `${Math.abs(d.lat).toFixed(2)}°${d.lat>=0?'N':'S'}, ${Math.abs(d.lon).toFixed(2)}°${d.lon>=0?'E':'W'}`;
      const pips = document.getElementById('card-age-bars');
      pips.innerHTML = '';
      for (let i=0;i<5;i++) {
        const el = document.createElement('div');
        el.className = 'age-pip'+(i<d.importance?' active':'');
        pips.appendChild(el);
      }
    } else {
      document.getElementById('card-country').textContent = `${d.occupation} · ${DOMAIN_LABELS[d.domain]||d.domain}`;
      document.getElementById('card-founded-label').textContent = 'Born';
      document.getElementById('card-year').textContent = formatYear(d.year);
      document.getElementById('card-coords').textContent =
        `Birthplace: ${Math.abs(d.lat).toFixed(2)}°${d.lat>=0?'N':'S'}, ${Math.abs(d.lon).toFixed(2)}°${d.lon>=0?'E':'W'} · HPI ${d.hpi}`;
      const pips = document.getElementById('card-age-bars');
      pips.innerHTML = '';
      // HPI pips — remap to 0-10 scale
      const hpiMin2 = (window.PEOPLE_HPI_RANGE && window.PEOPLE_HPI_RANGE[0]) || 12;
      const hpiMax2 = (window.PEOPLE_HPI_RANGE && window.PEOPLE_HPI_RANGE[1]) || 32;
      const filled = Math.round(((d.hpi - hpiMin2) / (hpiMax2 - hpiMin2)) * 10);
      const color = DOMAIN_COLORS[d.domain]||'#6b4423';
      for (let i=0;i<10;i++) {
        const el = document.createElement('div');
        el.className = 'age-pip'+(i<filled?' active':'');
        if (i < filled) { el.style.background = color; el.style.borderColor = color; }
        pips.appendChild(el);
      }
    }
    document.getElementById('city-card').classList.add('visible');
  }
  document.getElementById('card-close').addEventListener('click', () => {
    document.getElementById('city-card').classList.remove('visible');
    state.selectedItem = null;
  });

  // ── TIMELINE ──────────────────────────────────────────
  const slider = document.createElement('input');
  slider.type='range'; slider.className='year-slider';
  slider.min=YEAR_MIN; slider.max=YEAR_MAX; slider.step=1; slider.value=state.year;

  function buildTimeline() {
    const tc = document.createElement('div');
    tc.className = 'timeline-container';
    tc.innerHTML = `
      <div class="timeline-panel">
        <div class="year-display">
          <span class="year-number" id="year-number">${Math.abs(state.year)}</span>
          <span class="year-suffix" id="year-suffix">${state.year<0?'BC':'AD'}</span>
        </div>
        <div class="slider-row">
          <button class="play-btn" id="play-btn" title="Play/Pause">
            <svg viewBox="0 0 24 24" id="play-icon"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <div class="slider-wrap" id="slider-wrap">
            <div class="slider-track"></div>
            <div class="ticks" id="ticks"></div>
          </div>
          <div class="speed-control">
            <span>Speed</span>
            <select id="speed-select">
              <option value="5">5 yr/s</option>
              <option value="10">10 yr/s</option>
              <option value="25" selected>25 yr/s</option>
              <option value="50">50 yr/s</option>
              <option value="100">100 yr/s</option>
              <option value="250">250 yr/s</option>
              <option value="500">500 yr/s</option>
            </select>
          </div>
        </div>
      </div>`;
    document.body.appendChild(tc);
    document.getElementById('slider-wrap').appendChild(slider);

    rebuildTicks(rangeMin, rangeMax);
    slider.addEventListener('input', e => setYear(+e.target.value));
    document.getElementById('play-btn').addEventListener('click', togglePlay);
    document.getElementById('speed-select').addEventListener('change', e => { state.playSpeed = +e.target.value; });
    document.getElementById('speed-select').value = String(state.playSpeed);
  }

  function setYear(y) {
    const prevYear = state.year;
    state.year = Math.max(rangeMin, Math.min(rangeMax, y));
    slider.value = state.year;
    const n = document.getElementById('year-number'), s = document.getElementById('year-suffix');
    if (n && s) { n.textContent = Math.abs(Math.round(state.year)); s.textContent = state.year<0?'BC':'AD'; }
    checkNewEntries(state.year, prevYear);
    render(state.year);
    try { localStorage.setItem('history-flow-state', JSON.stringify({year:state.year, dataset:state.dataset})); } catch(e) {}
  }

  function togglePlay() {
    state.playing = !state.playing;
    const icon = document.getElementById('play-icon');
    if (state.playing) {
      icon.innerHTML = '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>';
      state.lastFrameTime = performance.now();
      requestAnimationFrame(playLoop);
    } else {
      icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
    }
  }

  function playLoop(t) {
    if (!state.playing) return;
    const dt = (t - state.lastFrameTime)/1000;
    state.lastFrameTime = t;
    let ny = state.year + state.playSpeed * dt;
    if (ny >= rangeMax) {
      ny = rangeMax; state.playing = false;
      document.getElementById('play-icon').innerHTML = '<path d="M8 5v14l11-7z"/>';
    }
    setYear(ny);
    if (state.playing) requestAnimationFrame(playLoop);
  }

  // ── DATASET SWITCHER ───────────────────────────────────
  function setupDatasetSwitcher() {
    const sel = document.getElementById('dataset-select');
    const subtitleEl = document.getElementById('dataset-subtitle');
    const legendEl = document.getElementById('domain-legend');

    sel.value = state.dataset;
    subtitleEl.textContent = DATASET_META[state.dataset].subtitle;
    legendEl.classList.toggle('visible', state.dataset==='people'||state.dataset==='both');

    sel.addEventListener('change', e => {
      state.dataset = e.target.value;
      subtitleEl.textContent = DATASET_META[state.dataset].subtitle;
      legendEl.classList.toggle('visible', state.dataset==='people'||state.dataset==='both');
      const r = datasetRanges[state.dataset];
      applyRange(r.min, r.max);
      try { localStorage.setItem('history-flow-state', JSON.stringify({year:state.year,dataset:state.dataset})); } catch(e) {}
    });

    document.querySelectorAll('.legend-item').forEach(el => {
      el.addEventListener('click', () => {
        const domain = el.dataset.domain;
        if (state.activeDomains.has(domain)) {
          if (state.activeDomains.size > 1) { state.activeDomains.delete(domain); el.classList.add('dimmed'); }
        } else {
          state.activeDomains.add(domain); el.classList.remove('dimmed');
        }
        render(state.year);
      });
    });
  }

  // ── TWEAKS ────────────────────────────────────────────
  function setupTweaks() {
    const panel = document.getElementById('tweaks');
    document.getElementById('tweaks-toggle').addEventListener('click', () => panel.classList.toggle('visible'));
    window.addEventListener('message', e => {
      if (!e.data) return;
      if (e.data.type==='__activate_edit_mode') panel.classList.add('visible');
      else if (e.data.type==='__deactivate_edit_mode') panel.classList.remove('visible');
    });
    try { window.parent.postMessage({type:'__edit_mode_available'},'*'); } catch(e) {}

    const syncKeys = () => {
      try { window.parent.postMessage({type:'__edit_mode_set_keys', edits:state.tweaks},'*'); } catch(e) {}
    };

    const tSpeed = document.getElementById('tw-speed');
    tSpeed.value = state.tweaks.speed;
    document.getElementById('val-speed').textContent = `${state.tweaks.speed} yr/s`;
    tSpeed.addEventListener('input', e => {
      state.tweaks.speed = +e.target.value; state.playSpeed = +e.target.value;
      document.getElementById('val-speed').textContent = `${+e.target.value} yr/s`;
      const ss = document.getElementById('speed-select'); if(ss) ss.value = String(+e.target.value);
      syncKeys();
    });

    const tDot = document.getElementById('tw-dot');
    tDot.value = state.tweaks.dotSize;
    document.getElementById('val-dot').textContent = `${(+state.tweaks.dotSize).toFixed(1)}×`;
    tDot.addEventListener('input', e => {
      state.tweaks.dotSize = +e.target.value;
      document.getElementById('val-dot').textContent = `${(+e.target.value).toFixed(1)}×`;
      render(state.year); syncKeys();
    });

    const tGlow = document.getElementById('tw-glow');
    tGlow.value = state.tweaks.glow;
    document.getElementById('val-glow').textContent = (+state.tweaks.glow).toFixed(2);
    tGlow.addEventListener('input', e => {
      state.tweaks.glow = +e.target.value;
      document.getElementById('val-glow').textContent = (+e.target.value).toFixed(2);
      render(state.year); syncKeys();
    });

    const tBorders = document.getElementById('tw-borders');
    tBorders.checked = !!state.tweaks.borders;
    tBorders.addEventListener('change', e => {
      state.tweaks.borders = e.target.checked;
      renderBase(); render(state.year); syncKeys();
    });

    const tTrails = document.getElementById('tw-trails');
    tTrails.checked = !!state.tweaks.trails;
    tTrails.addEventListener('change', e => {
      state.tweaks.trails = e.target.checked;
      render(state.year); syncKeys();
    });
  }

  // ── DATA LOADING ──────────────────────────────────────
  function loadCities() {
    state.cities = (window.CITIES_DATA||[])
      .filter(c => c[4] != null)
      .map((c,i) => ({
        id:i, name:c[0], country:c[1], lon:c[2], lat:c[3], year:c[4], importance:c[5]
      }));
  }

  function loadPeople() {
    state.people = (window.PEOPLE_DATA||[]).map((p,i) => ({
      id:i, name:p[0], year:p[1], lon:p[2], lat:p[3],
      occupation:p[4], domain:p[5], hpi:p[6], gender:p[7]
    }));
  }

  async function loadWorld() {
    const url = (window.__resources && window.__resources.worldTopo) || WORLD_TOPO_URL;
    const res = await fetch(url);
    const topo = await res.json();
    state.world = topo;
    state.land = topojson.feature(topo, topo.objects.countries);
    state.countries = topojson.mesh(topo, topo.objects.countries, (a,b) => a!==b);
  }

  // ── INIT ──────────────────────────────────────────────
  async function init() {
    setupSizes();
    setupDefs();
    setupSVGLayers();
    applyZoom();
    buildTimeline();
    setupTweaks();
    setupDatasetSwitcher();
    loadCities();
    loadPeople();
    computeRanges();
    const initRange = datasetRanges[state.dataset];
    applyRange(initRange.min, initRange.max);
    try { await loadWorld(); } catch(e) { console.warn('World map fetch failed', e); }
    renderBase();
    setYear(state.year);
    document.getElementById('loading').classList.add('hidden');
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { setupSizes(); renderBase(); render(state.year); }, 150);
  });

  document.addEventListener('keydown', e => {
    if (e.target.tagName==='INPUT'||e.target.tagName==='SELECT') return;
    if (e.key===' ') { e.preventDefault(); togglePlay(); }
    else if (e.key==='ArrowLeft') setYear(state.year-(e.shiftKey?500:50));
    else if (e.key==='ArrowRight') setYear(state.year+(e.shiftKey?500:50));
    else if (e.key==='Home') setYear(rangeMin);
    else if (e.key==='End') setYear(rangeMax);
  });

  init();
})();
