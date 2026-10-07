/* =========================================================
   POIKKA – skripty (v1). Bez závislostí.
   ========================================================= */
(function () {
  'use strict';
  var PREVIEW = !!window.POIKKA_PREVIEW;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return new Intl.NumberFormat('cs-CZ').format(Math.round(n)) + '\u00a0Kč'; };
  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  /* ---------- načtení stránky (hero choreografie) ---------- */
  function loaded() {
    var go = function () { $$('.pk').forEach(function (el) { el.classList.add('is-loaded'); }); };
    if (document.fonts && document.fonts.ready) {
      Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 900); })]).then(function () { requestAnimationFrame(go); });
    } else { go(); }
  }

  /* ---------- hlavička: zmenšení + schování při scrollu dolů ---------- */
  function header() {
    var hw = $('.pk-headwrap'); if (!hw) return;
    var last = window.scrollY, ticking = false;
    function upd() {
      var y = window.scrollY;
      hw.classList.toggle('is-scrolled', y > 40);
      var menuOpen = document.documentElement.classList.contains('pk-lock');
      if (!menuOpen) hw.classList.toggle('is-hidden', y > 420 && y > last + 2);
      if (y < last - 2) hw.classList.remove('is-hidden');
      last = y; ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(upd); ticking = true; } }, { passive: true });
    upd();
  }

  /* ---------- zámek scrollu + šuplíky ---------- */
  var scrim;
  function lock(on) { document.documentElement.classList.toggle('pk-lock', on); document.documentElement.style.overflow = on ? 'hidden' : ''; }
  function openDrawer(id) {
    var d = document.getElementById(id); if (!d) return;
    scrim = scrim || $('.pk-scrim');
    $$('.pk-drawer.is-open').forEach(function (x) { x.classList.remove('is-open'); });
    d.classList.add('is-open'); d.setAttribute('aria-hidden', 'false');
    if (scrim) scrim.classList.add('is-open');
    lock(true);
    var f = d.querySelector('button, input, a'); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 350);
  }
  function closeDrawers() {
    $$('.pk-drawer.is-open').forEach(function (x) { x.classList.remove('is-open'); x.setAttribute('aria-hidden', 'true'); });
    var mm = $('.pk-mmenu.is-open'); if (mm) mm.classList.remove('is-open');
    if (scrim) scrim.classList.remove('is-open');
    lock(false);
  }
  function drawers() {
    document.addEventListener('click', function (e) {
      var o = e.target.closest('[data-open]');
      if (o) { e.preventDefault(); openDrawer(o.getAttribute('data-open')); return; }
      if (e.target.closest('[data-close]') || e.target.classList.contains('pk-scrim')) { e.preventDefault(); closeDrawers(); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawers(); });
  }

  /* ---------- mobilní menu ---------- */
  function mobileMenu() {
    var m = $('.pk-mmenu'); if (!m) return;
    $$('[data-menu-open]').forEach(function (b) {
      b.addEventListener('click', function () { m.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); lock(true); });
    });
    $$('[data-menu-close], .pk-mmenu nav a', m).forEach(function (b) {
      b.addEventListener('click', function () { m.classList.remove('is-open'); lock(false); });
    });
  }

  /* ---------- odkrývání fotek při scrollu ---------- */
  function reveals() {
    var els = $$('[data-reveal], [data-inview]');
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: .08 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* =========================================================
     ROSTOUCÍ OVERAL – interaktivní schéma
     ========================================================= */
  var STAGES = [
    { cm: 62, age: 'zhruba 3 měsíce', fold: 'Manžety 2× ohrnuté' },
    { cm: 68, age: 'zhruba 6 měsíců', fold: 'Manžety 1× ohrnuté' },
    { cm: 74, age: 'zhruba 9 měsíců', fold: 'Manžety rozložené' },
    { cm: 80, age: '12 měsíců a víc', fold: 'Plná délka' }
  ];
  function overalSVG(t) {
    var ink = '#2E2721', fill = '#B8B5C8', fillD = '#A19EB7', paper = '#FAF7F2', o = '#E87444';
    var tb = 282 + 8 * t, hipY = tb - 22;
    var legLen = 88 + 50 * t, armLen = 70 + 34 * t;
    var stage = t < .17 ? 0 : t < .5 ? 1 : t < .83 ? 2 : 3;
    var foldsArr = [2, 1, 0, 0][stage];
    var cuffA = 12 + foldsArr * 9, cuffL = 13 + foldsArr * 10;
    var ang = 33 * Math.PI / 180, s = Math.sin(ang), c = Math.cos(ang);
    var sL = [138, 172], sR = [222, 172];
    var eL = [sL[0] - s * armLen, sL[1] + c * armLen], eR = [sR[0] + s * armLen, sR[1] + c * armLen];
    var lL0 = [156, hipY], lL1 = [150, hipY + legLen], lR0 = [204, hipY], lR1 = [210, hipY + legLen];
    function limb(a, b, w) {
      var d = 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'L' + b[0].toFixed(1) + ' ' + b[1].toFixed(1);
      return '<path d="' + d + '" stroke="' + ink + '" stroke-width="' + (w + 6) + '" stroke-linecap="round"/>' +
             '<path d="' + d + '" stroke="' + fill + '" stroke-width="' + w + '" stroke-linecap="round"/>';
    }
    function cuff(a, b, w, len, folds) {
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      var st = [b[0] - ux * len, b[1] - uy * len];
      var d = 'M' + st[0].toFixed(1) + ' ' + st[1].toFixed(1) + 'L' + b[0].toFixed(1) + ' ' + b[1].toFixed(1);
      var out = '<path d="' + d + '" stroke="' + ink + '" stroke-width="' + (w + 10) + '" stroke-linecap="round"/>' +
                '<path d="' + d + '" stroke="' + fillD + '" stroke-width="' + (w + 4) + '" stroke-linecap="round"/>';
      var nx = -uy, ny = ux, hw = (w + 4) / 2;
      for (var i = 1; i <= folds; i++) {
        var p = [st[0] + ux * len * i / (folds + 1), st[1] + uy * len * i / (folds + 1)];
        out += '<path d="M' + (p[0] + nx * hw).toFixed(1) + ' ' + (p[1] + ny * hw).toFixed(1) + 'L' + (p[0] - nx * hw).toFixed(1) + ' ' + (p[1] - ny * hw).toFixed(1) + '" stroke="' + ink + '" stroke-width="2.4"/>';
      }
      return out;
    }
    var feetY = hipY + legLen + 29;
    var g = '';
    // pravítko
    g += '<g stroke="' + ink + '" stroke-width="1.5" fill="none" opacity=".75"><path d="M326 22V' + feetY.toFixed(1) + '"/>';
    for (var y = 22; y <= feetY; y += 14) g += '<path d="M326 ' + y + 'h' + ((y - 22) % 56 === 0 ? -10 : -5) + '"/>';
    g += '<path d="M240 ' + feetY.toFixed(1) + 'H334" stroke-dasharray="4 5"/><path d="M318 22h16"/></g>';
    // nohy + ruce
    g += '<g fill="none">' + limb(lL0, lL1, 50) + limb(lR0, lR1, 50) + limb(sL, eL, 40) + limb(sR, eR, 40) + '</g>';
    // trup
    g += '<path d="M150 150Q120 152 121 184L125 ' + (tb - 32).toFixed(1) + 'Q127 ' + tb.toFixed(1) + ' 160 ' + tb.toFixed(1) + 'L200 ' + tb.toFixed(1) + 'Q233 ' + tb.toFixed(1) + ' 235 ' + (tb - 32).toFixed(1) + 'L239 184Q240 152 210 150Z" fill="' + fill + '" stroke="' + ink + '" stroke-width="3" stroke-linejoin="round"/>';
    // kapsa-klokanka
    g += '<path d="M146 ' + (tb - 70).toFixed(1) + 'Q180 ' + (tb - 80).toFixed(1) + ' 214 ' + (tb - 70).toFixed(1) + 'L218 ' + (tb - 30).toFixed(1) + 'H142Z" fill="' + fillD + '" stroke="' + ink + '" stroke-width="2.4" stroke-linejoin="round"/>';
    // zip
    g += '<path d="M180 160V' + (tb - 10).toFixed(1) + '" stroke="' + ink + '" stroke-width="2.2" stroke-dasharray="3 4"/><rect x="176" y="164" width="8" height="15" rx="4" fill="' + paper + '" stroke="' + ink + '" stroke-width="2"/>';
    // manžety (ohrnuté)
    g += '<g fill="none">' + cuff(sL, eL, 40, cuffA, foldsArr) + cuff(sR, eR, 40, cuffA, foldsArr) + cuff(lL0, lL1, 50, cuffL, foldsArr) + cuff(lR0, lR1, 50, cuffL, foldsArr) + '</g>';
    // kapuce jako v logu
    g += '<path d="M180 20C197 22 240 54 243 102C246 140 222 162 180 162C138 162 114 140 117 102C120 54 163 22 180 20Z" fill="' + fill + '" stroke="' + ink + '" stroke-width="3" stroke-linejoin="round"/>';
    g += '<path d="M180 20q5-9 12-6" fill="none" stroke="' + ink + '" stroke-width="2.6" stroke-linecap="round"/>';
    g += '<ellipse cx="180" cy="106" rx="46" ry="44" fill="#fff" stroke="' + ink + '" stroke-width="2.4"/>';
    g += '<ellipse cx="180" cy="108" rx="39" ry="37" fill="#F1E1D2" stroke="' + ink + '" stroke-width="2.4"/>';
    g += '<path d="M150 82c8-12 22-14 30-8 8-6 22-4 30 8-4-3-11-4-15-1-5-6-15-6-15 2-1-8-11-8-15-2-4-3-11-2-15 1z" fill="#E4A85B" stroke="' + ink + '" stroke-width="1.6" stroke-linejoin="round"/>';
    g += '<g fill="none" stroke="' + ink + '" stroke-width="2.2" stroke-linecap="round"><path d="M159 104q7 5 14 0"/><path d="M187 104q7 5 14 0"/></g>';
    g += '<circle cx="160" cy="118" r="7" fill="#EBC3AE" opacity=".8"/><circle cx="200" cy="118" r="7" fill="#EBC3AE" opacity=".8"/>';
    g += '<circle cx="180" cy="128" r="9" fill="' + o + '" stroke="' + ink + '" stroke-width="2.2"/><circle cx="180" cy="128" r="3.2" fill="' + paper + '" stroke="' + ink + '" stroke-width="1.6"/>';
    return g;
  }
  function growth() {
    $$('[data-grow]').forEach(function (root) {
      if (root.dataset.pkInit) return; root.dataset.pkInit = 1;
      var svg = $('.pk-stage-svg', root), range = $('.pk-range', root);
      var cmEl = $('[data-cm]', root), ageEl = $('[data-age]', root), foldEl = $('[data-fold]', root);
      var steps = $$('.pk-step', root);
      var t = 0, raf = null, demoDone = false, userTouched = false;
      function paint(v) {
        t = Math.max(0, Math.min(1, v));
        svg.innerHTML = overalSVG(t);
        var idx = Math.round(t * 3), st = STAGES[idx];
        cmEl.textContent = Math.round(62 + 18 * t);
        ageEl.textContent = st.age; foldEl.textContent = st.fold;
        range.value = Math.round(t * 300);
        range.style.setProperty('--p', (t * 100) + '%');
        steps.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); s.setAttribute('aria-pressed', i === idx); });
      }
      function tween(to, dur, cb) {
        cancelAnimationFrame(raf);
        if (reduce) { paint(to); cb && cb(); return; }
        var from = t, t0 = performance.now();
        (function f(now) {
          var k = Math.min(1, (now - t0) / dur);
          paint(from + (to - from) * ease(k));
          if (k < 1) raf = requestAnimationFrame(f); else cb && cb();
        })(t0);
      }
      range.addEventListener('input', function () { userTouched = true; cancelAnimationFrame(raf); paint(range.value / 300); });
      range.addEventListener('change', function () { tween(Math.round(range.value / 100) / 3, 380); });
      steps.forEach(function (s, i) { s.addEventListener('click', function () { userTouched = true; tween(i / 3, 700); }); });
      paint(0);
      if ('IntersectionObserver' in window && !reduce) {
        var io = new IntersectionObserver(function (en) {
          if (en[0].isIntersecting && !demoDone) {
            demoDone = true; io.disconnect();
            setTimeout(function () {
              if (userTouched) return;
              tween(1, 1900, function () { setTimeout(function () { if (!userTouched) tween(0, 1100); }, 700); });
            }, 350);
          }
        }, { threshold: .45 });
        io.observe(svg);
      }
    });
  }


  /* ---------- porovnání ohrnuto / rozloženo ---------- */
  function compare() {
    $$('[data-compare]').forEach(function (root) {
      if (root.dataset.pkInit) return; root.dataset.pkInit = 1;
      var stage = $('.pk-cmp-stage', root), range = $('.pk-cmp-range', root);
      var imgA = $('.pk-cmp-before', root), imgB = $('.pk-cmp-after', root);
      var tabs = $$('.pk-cmp-tab', root);
      var host = root.closest('[data-grow-photo]') || root;
      var steps = $$('.pk-step', host);
      var pos = 50, raf = null, touched = false;
      function set(p) {
        pos = Math.max(0, Math.min(100, p));
        stage.style.setProperty('--pos', pos + '%'); range.value = Math.round(pos);
        var idx = pos > 66 ? 0 : pos > 33 ? 1 : 2;
        steps.forEach(function (st, i) { st.classList.toggle('is-active', i === idx); st.setAttribute('aria-pressed', i === idx); });
      }
      function tween(to, dur, cb) {
        cancelAnimationFrame(raf);
        if (reduce) { set(to); cb && cb(); return; }
        var from = pos, t0 = performance.now();
        (function f(now) { var k = Math.min(1, (now - t0) / dur); set(from + (to - from) * ease(k)); if (k < 1) raf = requestAnimationFrame(f); else cb && cb(); })(t0);
      }
      range.addEventListener('input', function () { touched = true; cancelAnimationFrame(raf); set(+range.value); });
      steps.forEach(function (st) { st.addEventListener('click', function () { touched = true; tween(+st.dataset.pos, 700); }); });
      tabs.forEach(function (t) {
        t.addEventListener('click', function () {
          tabs.forEach(function (x) { x.classList.toggle('is-active', x === t); x.setAttribute('aria-selected', x === t); });
          imgA.src = t.dataset.a; imgB.src = t.dataset.b; touched = true; tween(50, 500);
        });
      });
      set(50);
      if ('IntersectionObserver' in window && !reduce) {
        var io = new IntersectionObserver(function (en) {
          if (!en[0].isIntersecting) return; io.disconnect();
          setTimeout(function () {
            if (touched) return;
            tween(92, 900, function () { if (!touched) tween(8, 1400, function () { if (!touched) tween(50, 800); }); });
          }, 300);
        }, { threshold: .5 });
        io.observe(stage);
      }
    });
  }

  /* ---------- karusely (lifestyle, recenze) ---------- */
  function carousels() {
    $$('[data-carousel]').forEach(function (root) {
      if (root.dataset.pkInit) return; root.dataset.pkInit = 1;
      var track = $('.pk-track', root), prev = $('[data-prev]', root), next = $('[data-next]', root), bar = $('.pk-progress > span', root);
      if (!track) return;
      function step() { var it = track.children[0]; if (!it) return 300; var gap = parseFloat(getComputedStyle(track).columnGap) || 16; return it.getBoundingClientRect().width + gap; }
      function upd() {
        var max = track.scrollWidth - track.clientWidth, p = max > 0 ? track.scrollLeft / max : 0;
        if (prev) prev.disabled = track.scrollLeft < 4;
        if (next) next.disabled = track.scrollLeft > max - 4;
        if (bar) { var vis = Math.min(1, track.clientWidth / track.scrollWidth); bar.style.width = (vis * 100) + '%'; bar.style.transform = 'translateX(' + (p * (1 / vis - 1) * 100) + '%)'; }
      }
      prev && prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
      next && next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
      track.addEventListener('scroll', function () { requestAnimationFrame(upd); }, { passive: true });
      window.addEventListener('resize', upd);
      // tažení myší
      var down = false, sx = 0, sl = 0, moved = false;
      track.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
      window.addEventListener('pointermove', function (e) {
        if (!down) return; var dx = e.clientX - sx;
        if (Math.abs(dx) > 5 && !moved) { moved = true; track.classList.add('is-drag'); }
        if (moved) track.scrollLeft = sl - dx;
      });
      window.addEventListener('pointerup', function () {
        if (!down) return; down = false;
        if (moved) { track.classList.remove('is-drag'); var s = step(); track.scrollTo({ left: Math.round(track.scrollLeft / s) * s, behavior: 'smooth' }); }
      });
      upd();
    });
  }

  /* ---------- akordeony ---------- */
  function accordions() {
    $$('.pk-acc').forEach(function (a) {
      if (a.dataset.pkInit) return; a.dataset.pkInit = 1;
      var b = $('.pk-acc-btn', a);
      b.addEventListener('click', function () {
        var open = !a.classList.contains('is-open');
        a.classList.toggle('is-open', open); b.setAttribute('aria-expanded', open);
      });
    });
  }

  function openFromHash() {
    var id = location.hash && location.hash.slice(1); if (!id) return;
    var el = document.getElementById(id);
    if (el && el.classList.contains('pk-acc')) {
      el.classList.add('is-open'); var b = $('.pk-acc-btn', el); if (b) b.setAttribute('aria-expanded', 'true');
      setTimeout(function () { el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }, 120);
    }
  }
  window.addEventListener('hashchange', openFromHash);

  /* ---------- newsletter ---------- */
  function newsletter() {
    $$('[data-news]').forEach(function (n) {
      var f = $('form', n); if (!f) return;
      f.addEventListener('submit', function (e) {
        // Ve WP napojte na Ecomail / Mailchimp / SmartEmailing – stačí změnit action formuláře a smazat tento handler.
        if (f.getAttribute('action')) return;
        e.preventDefault(); n.classList.add('is-done');
      });
    });
  }

  /* ---------- toast + košík ---------- */
  var toastT;
  function toast(msg) {
    var t = $('.pk-toast'); if (!t) return;
    $('span', t).textContent = msg; t.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('is-on'); }, 2400);
  }
  var cart = [], CART_KEY = 'pk-cart-preview';
  function loadCart() { if (!PREVIEW) return; try { var c = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); if (Array.isArray(c)) cart = c; } catch (e) {} }
  function saveCart() { if (!PREVIEW) return; try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} }
  function bumpCart(n) {
    $$('.pk-cartcount').forEach(function (c) { c.textContent = n; c.classList.remove('is-bump'); void c.offsetWidth; c.classList.add('is-bump'); });
  }
  function renderCart() {
    var body = $('#pk-cart .pk-drawer-body'); if (!body) return;
    var total = cart.reduce(function (s, i) { return s + i.price; }, 0);
    var qty = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    body.innerHTML = cart.length ? cart.map(function (i) {
      return '<div class="pk-cartline"><div class="pk-ph" data-tone="' + i.tone + '">' + (i.img ? '<img src="' + i.img + '" alt="">' : '') + '</div><div><b>' + i.name + '</b><span>' + i.variant + '</span></div><b>' + money(i.price) + '</b></div>';
    }).join('') : '<p class="pk-cart-empty">Košík je zatím prázdný.</p>';
    var tot = $('#pk-cart [data-cart-total]'); if (tot) tot.textContent = money(total);
    var cfg = window.POIKKA_PDP || {}, free = cfg.freeShipping || 2500;
    var sh = $('#pk-cart .pk-ship'); if (sh) shipping(sh, total, free);
    bumpCart(qty);
  }
  function shipping(el, total, free) {
    var left = free - total, t = $('.pk-ship-t span', el), bar = $('.pk-ship-bar span', el);
    el.classList.toggle('is-free', left <= 0);
    t.innerHTML = left > 0 ? 'Do dopravy zdarma vám chybí <b>' + money(left) + '</b>' : '<b>Doprava zdarma</b> je vaše';
    bar.style.width = Math.min(100, total / free * 100) + '%';
  }

  /* =========================================================
     PRODUKTOVÁ STRÁNKA
     ========================================================= */
  function pdp() {
    var root = $('[data-pdp]'); if (!root || root.dataset.pkInit) return; root.dataset.pkInit = 1;
    var cfg = window.POIKKA_PDP || {};
    var base = cfg.price || 1890;
    var activeB = $('.pk-bundle.is-active', root);
    var state = { color: null, colorName: '', tone: 'lav', size: null, sizeName: '', bundle: activeB ? activeB.dataset.bundle : 'one', qty: 1 };
    var bundles = cfg.bundles || {
      one: { name: '1 overal', price: base, old: 0, pcs: 1 },
      duo: { name: '2 overaly', price: Math.round(base * 2 * .9), old: base * 2, pcs: 2 },
      gift: { name: 'Dárková sada', price: base + 200, old: 0, pcs: 1 }
    };

    // barva
    var swatches = $$('.pk-swatch', root), colorLabel = $('[data-color-name]', root), mainImg = $('.pk-gal-track > .pk-ph', root);
    function setColor(sw) {
      swatches.forEach(function (s) { s.classList.toggle('is-active', s === sw); s.setAttribute('aria-checked', s === sw); });
      state.color = sw.dataset.value; state.colorName = sw.dataset.label; state.tone = sw.dataset.tone || 'lav';
      colorLabel.textContent = state.colorName;
      var src = sw.dataset.img || (cfg.colorImages || {})[state.color];
      if (src) state.img = src;
      if (mainImg) {
        var img = $('img', mainImg);
        if (img && src && img.getAttribute('src') !== src) {
          img.style.opacity = 0;
          setTimeout(function () {
            mainImg.classList.toggle('pk-ph--pack', sw.dataset.fit === 'pack');
            mainImg.classList.toggle('pk-ph--paper', sw.dataset.fit === 'paper');
            img.onload = function () { img.style.opacity = 1; };
            img.src = src; if (img.complete) img.style.opacity = 1;
          }, 220);
          var gt0 = $('.pk-gal-track', root); if (gt0 && gt0.scrollLeft > 0) gt0.scrollTo({ left: 0, behavior: 'smooth' });
        }
        if (!src) mainImg.setAttribute('data-tone', state.tone);
      }
      $$('[data-sb-thumb] img').forEach(function (x) { if (sw.dataset.thumb) x.src = sw.dataset.thumb; });
      update();
    }
    swatches.forEach(function (s) { s.addEventListener('click', function () { setColor(s); }); });

    // další volby (např. ouška)
    state.extra = {};
    $$('[data-choice]', root).forEach(function (g) {
      var btns = $$('.pk-chip', g), name = g.dataset.choice, lab = $('[data-choice-label]', g.closest('.pk-opt'));
      function pick(b, silent) {
        btns.forEach(function (x) { x.classList.toggle('is-active', x === b); x.setAttribute('aria-checked', x === b); });
        state.extra[name] = { value: b.dataset.value, label: b.dataset.label };
        if (lab) lab.textContent = b.dataset.label; if (!silent) update();
      }
      btns.forEach(function (b) { b.addEventListener('click', function () { pick(b); }); });
      if (btns[0]) pick(btns[0], true);
    });
    function extras() { return Object.keys(state.extra || {}).map(function (k) { return state.extra[k].label; }); }

    // velikost
    var sizes = $$('.pk-size', root);
    function setSize(b) {
      sizes.forEach(function (s) { s.classList.toggle('is-active', s === b); s.setAttribute('aria-checked', s === b); });
      state.size = b.dataset.value; state.sizeName = b.dataset.label; update();
    }
    sizes.forEach(function (s) { s.addEventListener('click', function () { setSize(s); }); });
    window.POIKKA_setSize = function (v) { var b = sizes.filter(function (s) { return s.dataset.value === v; })[0]; if (b) setSize(b); };

    // balíčky
    var bEls = $$('.pk-bundle', root);
    bEls.forEach(function (b) {
      b.addEventListener('click', function () {
        bEls.forEach(function (x) { x.classList.toggle('is-active', x === b); x.setAttribute('aria-checked', x === b); });
        state.bundle = b.dataset.bundle; update();
      });
    });

    // množství
    var qOut = $('.pk-qty output', root);
    $$('.pk-qty button', root).forEach(function (b) {
      b.addEventListener('click', function () { state.qty = Math.max(1, Math.min(9, state.qty + (+b.dataset.step))); qOut.textContent = state.qty; update(); });
    });

    var priceEl = $('[data-price]', root), oldEl = $('[data-price-old]', root), saveEl = $('[data-price-save]', root), perEl = $('[data-per-month]', root);
    var addBtns = $$('[data-add]'), sbVar = $('[data-sb-var]'), sbPrice = $('[data-sb-price]');
    var ship = $('.pk-ship', root);
    function total() { return bundles[state.bundle].price * state.qty; }
    function update() {
      var b = bundles[state.bundle], tot = total();
      priceEl.textContent = money(b.price);
      oldEl.textContent = b.old ? money(b.old) : ''; oldEl.hidden = !b.old;
      saveEl.textContent = b.old ? 'Ušetříte ' + money(b.old - b.price) : ''; saveEl.hidden = !b.old;
      if (cfg.perMonth === false) { perEl.hidden = true; } else { perEl.textContent = 'Při roce nošení vychází na ' + money(b.price / b.pcs / (cfg.perMonth || 12)) + ' měsíčně.'; }
      addBtns.forEach(function (a) { var l = $('[data-add-label]', a); if (l) l.textContent = 'Do košíku za ' + money(tot); });
      if (sbVar) sbVar.textContent = [state.colorName].concat(extras(), [state.sizeName, b.name]).filter(Boolean).join(', ');
      if (sbPrice) sbPrice.textContent = money(tot);
      if (ship) shipping(ship, tot, cfg.freeShipping || 2500);
    }

    // přidání do košíku
    function add(btn) {
      if (!state.size) { toast('Vyberte prosím velikost'); var sz = $('.pk-sizes', root); sz && sz.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      var b = bundles[state.bundle];
      if (!PREVIEW && cfg.productId) {
        // WooCommerce: přidání přes URL (funguje pro variabilní produkt)
        var exVals = Object.keys(state.extra || {}).map(function (k) { return state.extra[k].value; });
        var vid = (cfg.variations || {})[[state.color].concat(exVals, [state.size]).join('|')] || '';
        var pid = (b.productId || cfg.productId);
        var q = new URLSearchParams({ 'add-to-cart': pid, quantity: state.qty * (b.productId ? 1 : b.pcs) });
        if (!b.productId && vid) { q.set('variation_id', vid); q.set(cfg.attrColor || 'attribute_pa_barva', state.color); q.set(cfg.attrSize || 'attribute_pa_velikost', state.size); Object.keys(state.extra || {}).forEach(function (k) { var a = (cfg.attrExtra || {})[k]; if (a) q.set(a, state.extra[k].value); }); }
        window.location.href = (cfg.cartUrl || '/kosik/') + '?' + q.toString();
        return;
      }
      $$('[data-add]').forEach(function (a) { a.classList.add('is-added'); setTimeout(function () { a.classList.remove('is-added'); }, 1600); });
      cart.push({ name: cfg.name || 'Rostoucí overal', variant: [state.colorName].concat(extras(), [state.sizeName, b.name + (state.qty > 1 ? ' × ' + state.qty : '')]).filter(Boolean).join(', '), price: total(), qty: b.pcs * state.qty, tone: state.tone, img: state.img });
      saveCart(); renderCart();
      setTimeout(function () { openDrawer('pk-cart'); }, 650);
    }
    addBtns.forEach(function (a) { a.addEventListener('click', function () { add(a); }); });

    // lepicí lišta
    var bar = $('.pk-stickybar'), mainAdd = $('.pk-buy', root);
    if (bar && mainAdd && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        var e = en[0]; bar.classList.toggle('is-on', !e.isIntersecting && e.boundingClientRect.top < 0);
      }).observe(mainAdd);
    }

    // galerie – tečky na mobilu
    var gt = $('.pk-gal-track', root), dots = $('.pk-gal-dots', root);
    if (gt && dots) {
      var n = gt.children.length; dots.innerHTML = new Array(n + 1).join('<span></span>');
      var ds = $$('span', dots);
      var upd = function () { var w = gt.children[0].getBoundingClientRect().width + 8; var i = Math.round(gt.scrollLeft / w); ds.forEach(function (d, k) { d.classList.toggle('is-on', k === i); }); };
      gt.addEventListener('scroll', function () { requestAnimationFrame(upd); }, { passive: true }); upd();
    }

    // načtení více recenzí
    var more = $('[data-rev-more]'), grid = $('.pk-revgrid');
    if (more && grid) more.addEventListener('click', function () { grid.classList.add('is-all'); more.hidden = true; });

    // výchozí stav
    if (swatches[0]) setColor(swatches[0]);
    var pre = sizes.filter(function (s) { return s.dataset.default; })[0]; if (pre) setSize(pre);
    update();
  }

  /* ---------- kalkulačka velikosti ---------- */
  function sizeCalc() {
    var c = $('[data-calc]'); if (!c) return;
    var inp = $('input', c), out = $('.pk-calc-out', c), btn = $('.pk-btn', c);
    function run() {
      var v = parseFloat(String(inp.value).replace(',', '.'));
      if (!v || v < 40 || v > 120) { out.innerHTML = 'Zadejte výšku dítěte v centimetrech, třeba 64.'; return; }
      var rec = v <= 76 ? { v: '62-80', l: '62–80' } : { v: '80-98', l: '80–98' };
      var tip = v < 62 ? 'Manžety zatím nechte 2× ohrnuté.' : v <= 68 ? 'Začnete s manžetami 1× ohrnutými.' : v <= 76 ? 'Overal vydrží ještě dlouho, manžety postupně rozložíte.' : 'Ve větší velikosti začnete s ohrnutými manžetami.';
      out.innerHTML = 'Doporučujeme velikost <b>' + rec.l + ' cm</b>. ' + tip + ' <button type="button" class="pk-opt-link" data-pick="' + rec.v + '">Vybrat tuto velikost</button>';
    }
    btn.addEventListener('click', run);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); run(); } });
    out.addEventListener('click', function (e) { var p = e.target.closest('[data-pick]'); if (p) { window.POIKKA_setSize && window.POIKKA_setSize(p.dataset.pick); closeDrawers(); toast('Velikost vybrána'); } });
  }

  function init() {
    loaded(); header(); drawers(); openFromHash(); mobileMenu(); reveals(); growth(); compare(); carousels(); accordions(); newsletter(); pdp(); sizeCalc();
    if (PREVIEW) {
      loadCart(); renderCart();
      document.addEventListener('click', function (e) {
        if (e.target.closest('[data-preview-checkout]')) { e.preventDefault(); toast('Tohle je náhled webu, objednávky zatím nejdou.'); }
        if (e.target.closest('[data-cart-clear]')) { e.preventDefault(); cart = []; saveCart(); renderCart(); }
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
