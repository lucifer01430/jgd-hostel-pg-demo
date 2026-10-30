/* =========================================================================
   Jaigurudev Hostel PG & Kitchen — storefront demo
   Vanilla JS, no build step, no backend. Cart lives in memory + localStorage.
   ========================================================================= */
(function () {
  'use strict';

  var D = window.JGD_DATA;
  var I18N = window.JGD_I18N;
  var t = I18N.t;
  var B = D.BUSINESS;
  var PRICE = B.pricePerPlate;
  var MAX_QTY = 20;

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- utils */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function icon(name, cls) {
    return '<svg class="i' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  }
  function rupees(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
  function plates(n) {
    if (I18N.lang === 'en') return n + (n === 1 ? ' plate' : ' plates');
    return n + ' प्लेट';
  }
  function L(obj) { return obj ? (obj[I18N.lang] || obj.hi) : ''; }
  function mealById(id) { for (var i = 0; i < D.MEALS.length; i++) if (D.MEALS[i].id === id) return D.MEALS[i]; return null; }
  function clampQty(q) { q = parseInt(q, 10); if (isNaN(q) || q < 1) q = 1; return Math.min(q, MAX_QTY); }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage may be unavailable */ } }
  };

  /* ---------------------------------------------------------------- state */
  var state = {
    lang: (root.lang === 'en' ? 'en' : 'hi'),
    cart: sanitizeCart(store.get('jgd-cart', {})),
    pref: store.get('jgd-pref', null),            // null → derived from items
    customer: store.get('jgd-customer', { name: '', address: '' }) || { name: '', address: '' },
    slot: 'morning',
    cat: 'all',
    modalMeal: null,
    modalQty: 1
  };
  I18N.lang = state.lang;

  function sanitizeCart(c) {
    var out = {};
    if (c && typeof c === 'object') Object.keys(c).forEach(function (id) { if (mealById(id)) out[id] = clampQty(c[id]); });
    return out;
  }
  function saveCart() { store.set('jgd-cart', state.cart); store.set('jgd-pref', state.pref); }
  function cartQty() { return Object.keys(state.cart).reduce(function (s, id) { return s + state.cart[id]; }, 0); }
  function derivedPref() {
    if (state.pref) return state.pref;
    var slots = Object.keys(state.cart).map(function (id) { return mealById(id).slot; });
    if (!slots.length) return 'any';
    return slots.every(function (s) { return s === slots[0]; }) ? slots[0] : 'any';
  }

  /* --------------------------------------------------------------- images */
  function hydrateImg(img, key, opts) {
    var cfg = D.IMAGES[key];
    if (!cfg || !img) return;
    opts = opts || {};
    img.dataset.img = key;
    if (img.dataset.hydrated !== key) {
      img.dataset.hydrated = key;
      img.classList.add('is-loading');
      img.addEventListener('load', onImgLoad);
      img.addEventListener('error', onImgError);
      if (opts.pos) img.style.objectPosition = opts.pos;
      img.srcset = cfg.srcset();
      img.src = cfg.src(opts.width || 800);
    }
    img.alt = img.hasAttribute('data-decorative') ? '' : L(cfg.alt);
  }
  function onImgLoad(e) { e.currentTarget.classList.remove('is-loading'); }
  function onImgError(e) {
    var img = e.currentTarget;
    if (img.dataset.fallback) return;                       // guard against loops
    img.dataset.fallback = '1';
    img.removeAttribute('srcset');
    img.src = D.IMAGES.fallback;
    img.classList.remove('is-loading');
    img.classList.add('is-fallback');
    img.title = t('img.fallback');
  }
  function hydrateStaticImages() { $$('img.js-img').forEach(function (img) { hydrateImg(img, img.dataset.img); }); }

  /* ----------------------------------------------------------------- i18n */
  function applyStatic() {
    root.lang = state.lang;
    document.title = t('meta.title');
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    $$('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n-html')); }); // trusted dictionary strings only
    $$('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':'); if (p.length === 2) el.setAttribute(p[0].trim(), t(p[1].trim()));
      });
    });
    $$('.lang-switch__btn').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)); });
    var toggle = $('#navToggle');
    if (toggle) toggle.setAttribute('aria-label', t(toggle.getAttribute('aria-expanded') === 'true' ? 'nav.close' : 'nav.open'));
    $$('.js-wa-general').forEach(function (a) { a.href = waUrl(t('wa.general')); });
    $$('.js-wa-hostel').forEach(function (a) { a.href = waUrl(t('wa.hostel')); });
    $('#footerRights').textContent = t('footer.rights', { year: new Date().getFullYear() });
    var dateEl = $('#menuDate');
    if (dateEl) {
      var now = new Date();
      try { dateEl.textContent = new Intl.DateTimeFormat(state.lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now); }
      catch (e) { dateEl.textContent = now.toDateString(); }
      dateEl.setAttribute('datetime', now.toISOString().slice(0, 10));
    }
  }

  function setLang(lang) {
    if (lang !== 'hi' && lang !== 'en') return;
    state.lang = lang; I18N.lang = lang;
    try { localStorage.setItem('jgd-lang', lang); } catch (e) {}
    renderAll();
    if (isOpen(mealModal) && state.modalMeal) renderMealModal(state.modalMeal.id, true);
  }

  function renderAll() {
    applyStatic();
    renderMenu(false);
    renderFilters();
    renderGrid(false);
    renderOccasions();
    renderBulkSelect();
    renderCart();
    renderCredits();
    hydrateStaticImages();
    clearFormErrorsText();
  }

  /* ------------------------------------------------------------- whatsapp */
  function waUrl(text) { return 'https://wa.me/' + B.whatsapp + (text ? '?text=' + encodeURIComponent(text) : ''); }
  function openWhatsApp(text) {
    if (!text || !String(text).trim()) return false;           // never send a blank message
    var a = document.createElement('a');
    a.href = waUrl(text); a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    toast(t('toast.wa'), 'wa');
    return true;
  }
  function slotLabel(s) { return t(s === 'morning' ? 'slot.morning' : s === 'evening' ? 'slot.evening' : 'slot.any'); }

  /** lines: [{id, qty}] */
  function buildOrderMessage(lines, pref) {
    var total = 0, qtySum = 0, out = [];
    lines.forEach(function (l) { total += l.qty * PRICE; qtySum += l.qty; });
    out.push(t('wa.greet'), '', t('wa.intro'), '');
    if (lines.length === 1) {
      out.push(t('wa.meal') + ': ' + L(mealById(lines[0].id).name));
      out.push(t('wa.qty') + ': ' + plates(lines[0].qty));
    } else {
      out.push(t('wa.meal') + ':');
      lines.forEach(function (l, i) { out.push((i + 1) + '. ' + L(mealById(l.id).name) + ' — ' + plates(l.qty)); });
      out.push(t('wa.qty') + ': ' + plates(qtySum));
    }
    out.push(t('wa.price'));
    out.push(t('wa.total') + ': ' + rupees(total));
    out.push(t('wa.pref') + ': ' + slotLabel(pref));
    var name = (state.customer.name || '').trim(), addr = (state.customer.address || '').trim();
    if (name || addr) {
      out.push('');
      if (name) out.push(t('wa.name') + ': ' + name);
      if (addr) out.push(t('wa.addr') + ': ' + addr);
    }
    out.push('', t('wa.outro'), '', t('wa.thanks'));
    return out.join('\n');
  }

  /* ---------------------------------------------------------------- toast */
  function toast(msg, kind) {
    var wrap = $('#toasts'); if (!wrap) return;
    var el = document.createElement('div');
    el.className = 'toast' + (kind ? ' toast--' + kind : '');
    el.innerHTML = icon(kind === 'wa' ? 'whatsapp' : kind === 'muted' ? 'info-circle' : 'check2-circle') + '<span>' + esc(msg) + '</span>';
    wrap.appendChild(el);
    while (wrap.children.length > 2) wrap.removeChild(wrap.firstChild);
    requestAnimationFrame(function () { el.classList.add('is-in'); });
    setTimeout(function () { el.classList.remove('is-in'); setTimeout(function () { el.remove(); }, 300); }, 2800);
  }

  /* ------------------------------------------------------------ preloader */
  var preloaderDone = false;
  function hidePreloader() {
    if (preloaderDone) return; preloaderDone = true;
    var p = $('#preloader'); if (!p) return;
    p.classList.add('is-hidden');
    root.classList.add('is-ready');
    setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 700);
  }
  window.addEventListener('load', hidePreloader);
  setTimeout(hidePreloader, 2200);                 // never wait on slow 3rd-party images
  window.addEventListener('error', function () { hidePreloader(); });

  /* --------------------------------------------------------------- header */
  var header = $('#siteHeader');
  function setHeaderVar() { root.style.setProperty('--header-h', (header ? header.offsetHeight : 72) + 'px'); }
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var was = header.classList.contains('is-scrolled'), now = window.scrollY > 24;
      if (was !== now) { header.classList.toggle('is-scrolled', now); setTimeout(setHeaderVar, 320); }
      ticking = false;
    });
  }

  /* ------------------------------------------------------------ mobile nav */
  var navToggle = $('#navToggle'), nav = $('#primaryNav');
  function setNav(open) {
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', t(open ? 'nav.close' : 'nav.open'));
    if (open) setHeaderVar();
    root.classList.toggle('nav-open', open);
    if (open) { var first = $('.nav__link', nav); if (first) first.focus(); }
  }
  navToggle.addEventListener('click', function () { setNav(navToggle.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1080 && root.classList.contains('nav-open')) setNav(false); setHeaderVar(); });

  /* active section highlight */
  function initScrollSpy() {
    if (!('IntersectionObserver' in window)) return;
    var links = $$('.nav__link');
    var map = {}; links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (a) { a.removeAttribute('aria-current'); });
          map[en.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ------------------------------------------------------------ menu tabs */
  var tabs = $$('.tab');
  function renderMenu(animate) {
    var panel = $('#panel-menu');
    var meal = mealById(D.TODAY[state.slot]);
    tabs.forEach(function (tb) {
      var on = tb.dataset.slot === state.slot;
      tb.setAttribute('aria-selected', String(on)); tb.tabIndex = on ? 0 : -1;
      if (on) panel.setAttribute('aria-labelledby', tb.id);
    });
    $('.tabs').setAttribute('data-active', state.slot);
    var items = L(meal.items);
    panel.innerHTML =
      '<article class="menu-card' + (animate && !reduceMotion ? ' is-switching' : '') + '">' +
        '<figure class="menu-card__media">' +
          '<img class="menu-card__img" alt="" width="900" height="700" sizes="(max-width: 900px) 92vw, 560px" decoding="async">' +
          '<span class="slot-badge">' + icon(state.slot === 'morning' ? 'sunrise' : 'moon-stars') + esc(slotLabel(state.slot)) + '</span>' +
          '<figcaption class="photo-note">' + esc(t('photo.note')) + '</figcaption>' +
        '</figure>' +
        '<div class="menu-card__body">' +
          '<h3 class="menu-card__name">' + esc(L(meal.name)) + '</h3>' +
          '<p class="menu-card__desc">' + esc(L(meal.short)) + '</p>' +
          '<p class="menu-card__label">' + esc(t('menu.includes')) + '</p>' +
          '<ul class="plate-list">' + items.map(function (it, i) {
            return '<li class="plate-list__item' + (i === 0 ? ' is-lead' : '') + '">' + icon('check2-circle') + '<span>' + esc(it) + '</span></li>';
          }).join('') + '</ul>' +
          '<div class="menu-card__foot">' +
            '<p class="price price--lg"><span class="price__amt">' + rupees(PRICE) + '</span><span class="price__unit">' + esc(t('price.unit')) + '</span></p>' +
            '<div class="menu-card__btns">' +
              '<button type="button" class="btn btn--primary" data-add="' + meal.id + '" data-slot="' + state.slot + '">' + icon('plus-lg') + '<span>' + esc(t('menu.add')) + '</span></button>' +
              '<button type="button" class="btn btn--outline" data-wa-meal="' + meal.id + '" data-slot="' + state.slot + '">' + icon('whatsapp', 'i--wa') + '<span>' + esc(t('menu.wa')) + '</span></button>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="link-btn" data-details="' + meal.id + '">' + esc(t('menu.details')) + icon('arrow-right') + '</button>' +
        '</div>' +
      '</article>';
    hydrateImg($('.menu-card__img', panel), meal.img, { pos: meal.pos, width: 900 });
  }
  tabs.forEach(function (tb, idx) {
    tb.addEventListener('click', function () { if (state.slot !== tb.dataset.slot) { state.slot = tb.dataset.slot; renderMenu(true); } });
    tb.addEventListener('keydown', function (e) {
      var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (e.key === 'Home') dir = -idx; if (e.key === 'End') dir = tabs.length - 1 - idx;
      if (!dir) return;
      e.preventDefault();
      var next = tabs[(idx + dir + tabs.length) % tabs.length];
      next.focus(); next.click();
    });
  });

  /* ------------------------------------------------------------ catalogue */
  function catLabel(meal) {
    var c = meal.cats.indexOf('special') > -1 ? 'special' : meal.cats[0];
    return t('cat.' + c);
  }
  function renderFilters() {
    var wrap = $('#filterChips');
    wrap.innerHTML = D.CATEGORIES.map(function (c) {
      var n = c === 'all' ? D.MEALS.length : D.MEALS.filter(function (m) { return m.cats.indexOf(c) > -1; }).length;
      if (!n) return '';                              // only show categories that have content
      return '<button type="button" class="chip" data-cat="' + c + '" aria-pressed="' + (state.cat === c) + '">' +
        esc(t('cat.' + c)) + '<span class="chip__n">' + n + '</span></button>';
    }).join('');
  }
  function renderGrid(animate) {
    var grid = $('#mealGrid');
    var list = D.MEALS.filter(function (m) { return state.cat === 'all' || m.cats.indexOf(state.cat) > -1; });
    $('#shopCount').textContent = t('shop.count', { n: list.length });
    if (!list.length) { grid.innerHTML = '<li class="grid__empty">' + esc(t('shop.empty')) + '</li>'; return; }
    grid.innerHTML = list.map(function (m, i) {
      var name = L(m.name), items = L(m.items);
      return '<li class="card' + (animate && !reduceMotion ? ' card--enter' : '') + '" style="--i:' + i + '">' +
        '<article class="card__inner" aria-labelledby="card-' + m.id + '">' +
          '<div class="card__media">' +
            '<img class="card__img" alt="" width="800" height="600" loading="lazy" decoding="async" sizes="(max-width: 640px) 92vw, (max-width: 1080px) 46vw, 380px">' +
            '<span class="card__cat">' + esc(catLabel(m)) + '</span>' +
            '<span class="photo-note">' + esc(t('photo.note')) + '</span>' +
          '</div>' +
          '<div class="card__body">' +
            '<div class="card__top">' +
              '<h3 class="card__title" id="card-' + m.id + '">' + esc(name) + '</h3>' +
              '<p class="price"><span class="price__amt">' + rupees(PRICE) + '</span><span class="price__unit">' + esc(t('price.unit')) + '</span></p>' +
            '</div>' +
            '<p class="card__desc">' + esc(L(m.short)) + '</p>' +
            '<p class="card__items">' + items.map(esc).join('<span aria-hidden="true"> · </span>') + '</p>' +
            '<div class="card__btns">' +
              '<button type="button" class="btn btn--outline btn--sm" data-details="' + m.id + '" aria-label="' + esc(t('card.detailsFor', { name: name })) + '">' + icon('eye') + '<span>' + esc(t('card.details')) + '</span></button>' +
              '<button type="button" class="btn btn--primary btn--sm" data-order="' + m.id + '" aria-label="' + esc(t('card.orderFor', { name: name })) + '">' + icon('plus-lg') + '<span>' + esc(t('card.order')) + '</span></button>' +
            '</div>' +
          '</div>' +
        '</article></li>';
    }).join('');
    $$('.card__img', grid).forEach(function (img, i) { hydrateImg(img, list[i].img, { pos: list[i].pos, width: 800 }); });
  }
  $('#filterChips').addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b || b.dataset.cat === state.cat) return;
    state.cat = b.dataset.cat;
    $$('.chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
    var grid = $('#mealGrid');
    if (reduceMotion) { renderGrid(false); return; }
    grid.classList.add('is-leaving');
    setTimeout(function () { grid.classList.remove('is-leaving'); renderGrid(true); }, 180);
  });

  /* -------------------------------------------------------- bulk section */
  function renderOccasions() {
    $('#occasionList').innerHTML = D.OCCASIONS.map(function (o) {
      return '<li class="occasion">' + icon(o.icon) + '<span>' + esc(t('occ.' + o.key)) + '</span></li>';
    }).join('');
  }
  function renderBulkSelect() {
    var sel = $('#bfEvent'); var v = sel.value;
    sel.innerHTML = '<option value="">' + esc(t('bf.eventPh')) + '</option>' +
      D.OCCASIONS.concat([{ key: 'other' }]).map(function (o) { return '<option value="' + o.key + '">' + esc(t('occ.' + o.key)) + '</option>'; }).join('');
    sel.value = v;
  }
  function renderCredits() {
    var seen = {}, parts = [];
    Object.keys(D.IMAGES).forEach(function (k) {
      var c = D.IMAGES[k]; if (!c || !c.page || seen[c.page]) return; seen[c.page] = 1;
      parts.push('<a href="' + esc(c.page) + '" target="_blank" rel="noopener">' + esc(c.credit) + '</a>');
    });
    $('#photoCredits').innerHTML = parts.join(', ');
  }

  /* --------------------------------------------------- layers (modal/drawer) */
  var mealModal = $('#mealModal'), bulkModal = $('#bulkModal'), cartDrawer = $('#cartDrawer'), cartOverlay = $('#cartOverlay');
  var layerStack = [];
  function isOpen(el) { return layerStack.indexOf(el) > -1; }
  function focusables(el) {
    return $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', el)
      .filter(function (n) { return n.offsetParent !== null || n === document.activeElement; });
  }
  function openLayer(el, opener, focusEl) {
    if (isOpen(el)) return;
    if (root.classList.contains('nav-open')) setNav(false);
    el._opener = opener || document.activeElement;
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    root.style.setProperty('--sbw', sbw + 'px');
    el.hidden = false;
    if (el === cartDrawer) cartOverlay.hidden = false;
    layerStack.push(el);
    root.classList.add('has-layer');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('is-open');
        if (el === cartDrawer) cartOverlay.classList.add('is-open');
      });
    });
    setTimeout(function () { var f = focusEl || focusables(el)[0]; if (f) f.focus({ preventScroll: true }); }, 60);
  }
  function closeLayer(el) {
    var i = layerStack.indexOf(el); if (i < 0) return;
    layerStack.splice(i, 1);
    el.classList.remove('is-open');
    if (el === cartDrawer) cartOverlay.classList.remove('is-open');
    var done = function () {
      if (isOpen(el)) return;
      el.hidden = true;
      if (el === cartDrawer) cartOverlay.hidden = true;
    };
    setTimeout(done, reduceMotion ? 0 : 280);
    if (!layerStack.length) root.classList.remove('has-layer');
    var op = el._opener; if (op && document.contains(op) && op.focus) op.focus({ preventScroll: true });
  }
  document.addEventListener('keydown', function (e) {
    var top = layerStack[layerStack.length - 1];
    if (e.key === 'Escape') {
      if (top) { e.preventDefault(); closeLayer(top); }
      else if (root.classList.contains('nav-open')) { setNav(false); navToggle.focus(); }
      return;
    }
    if (e.key === 'Tab' && top) {
      var f = focusables(top); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || !top.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !top.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    }
  });
  [mealModal, bulkModal].forEach(function (m) {
    m.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeLayer(m); });
  });
  cartOverlay.addEventListener('click', function () { closeLayer(cartDrawer); });

  /* ------------------------------------------------------ meal details */
  function renderMealModal(id, keepQty) {
    var m = mealById(id); if (!m) return false;
    state.modalMeal = m;
    if (!keepQty) state.modalQty = 1;
    var q = state.modalQty;
    var c = $('#mealModalContent');
    c.innerHTML =
      '<div class="meal">' +
        '<figure class="meal__media"><img class="meal__img" alt="" width="900" height="700" sizes="(max-width: 760px) 100vw, 460px" decoding="async">' +
          '<figcaption class="photo-note">' + esc(t('photo.note')) + '</figcaption>' +
          '<span class="card__cat">' + esc(catLabel(m)) + '</span></figure>' +
        '<div class="meal__body">' +
          '<p class="meal__slot">' + icon(m.slot === 'morning' ? 'sunrise' : 'moon-stars') + esc(slotLabel(m.slot)) + ' · <span class="demo-pill demo-pill--sm">' + esc(t('menu.demo')) + '</span></p>' +
          '<h2 class="meal__title" id="mealModalTitle">' + esc(L(m.name)) + '</h2>' +
          '<p class="meal__desc">' + esc(L(m.short)) + '</p>' +
          '<p class="menu-card__label">' + esc(t('modal.includes')) + '</p>' +
          '<ul class="plate-list plate-list--compact">' + L(m.items).map(function (it, i) {
            return '<li class="plate-list__item' + (i === 0 ? ' is-lead' : '') + '">' + icon('check2-circle') + '<span>' + esc(it) + '</span></li>';
          }).join('') + '</ul>' +
          '<div class="meal__buy">' +
            '<p class="price price--lg"><span class="price__amt">' + rupees(PRICE) + '</span><span class="price__unit">' + esc(t('price.unit')) + '</span></p>' +
            '<div class="qty" role="group" aria-labelledby="mealQtyLbl">' +
              '<span class="qty__label" id="mealQtyLbl">' + esc(t('qty.label')) + '</span>' +
              '<button type="button" class="qty__btn" data-mq="-1" aria-label="' + esc(t('qty.dec')) + '"' + (q <= 1 ? ' disabled' : '') + '>' + icon('dash-lg') + '</button>' +
              '<output class="qty__val" id="mealQtyVal" aria-live="polite">' + q + '</output>' +
              '<button type="button" class="qty__btn" data-mq="1" aria-label="' + esc(t('qty.inc')) + '"' + (q >= MAX_QTY ? ' disabled' : '') + '>' + icon('plus-lg') + '</button>' +
            '</div>' +
          '</div>' +
          '<p class="meal__total"><span>' + esc(t('total.est')) + '</span><strong id="mealTotal">' + rupees(q * PRICE) + '</strong><small>(' + esc(plates(q)) + ' × ' + rupees(PRICE) + ')</small></p>' +
          '<div class="meal__btns">' +
            '<button type="button" class="btn btn--primary btn--block" data-modal-add>' + icon('plus-lg') + '<span>' + esc(t('modal.add')) + '</span></button>' +
            '<button type="button" class="btn btn--wa btn--block" data-modal-wa>' + icon('whatsapp') + '<span>' + esc(t('modal.wa')) + '</span></button>' +
          '</div>' +
          '<p class="meal__note">' + icon('info-circle') + esc(t('modal.note')) + '</p>' +
        '</div>' +
      '</div>';
    hydrateImg($('.meal__img', c), m.img, { pos: m.pos, width: 900 });
    return true;
  }
  function openMeal(id, opener) {
    if (!renderMealModal(id, false)) return;               // never open an empty modal
    openLayer(mealModal, opener, $('.modal__close', mealModal));
  }
  mealModal.addEventListener('click', function (e) {
    var mq = e.target.closest('[data-mq]');
    if (mq) {
      state.modalQty = clampQty(state.modalQty + parseInt(mq.dataset.mq, 10));
      var focusDir = mq.dataset.mq;
      renderMealModal(state.modalMeal.id, true);
      var again = $('[data-mq="' + focusDir + '"]', mealModal);
      if (again && !again.disabled) again.focus(); else { var other = $('[data-mq]:not([disabled])', mealModal); if (other) other.focus(); }
      return;
    }
    if (e.target.closest('[data-modal-add]')) {
      addToCart(state.modalMeal.id, state.modalQty);
      closeLayer(mealModal);
      return;
    }
    if (e.target.closest('[data-modal-wa]')) {
      openWhatsApp(buildOrderMessage([{ id: state.modalMeal.id, qty: state.modalQty }], state.modalMeal.slot));
    }
  });

  /* --------------------------------------------------------------- cart */
  function addToCart(id, qty, slot) {
    if (!mealById(id)) return;
    state.cart[id] = clampQty((state.cart[id] || 0) + (qty || 1));
    if (slot) state.pref = slot;
    saveCart(); renderCart(); bumpBadges();
    toast(t('toast.added', { name: L(mealById(id).name) }));
  }
  function setQty(id, q) {
    if (q <= 0) { delete state.cart[id]; toast(t('toast.removed'), 'muted'); }
    else state.cart[id] = clampQty(q);
    if (!cartQty()) state.pref = null;
    saveCart(); renderCart();
  }
  function bumpBadges() {
    if (reduceMotion) return;
    $$('[data-cart-count]').forEach(function (b) { b.classList.remove('is-bump'); void b.offsetWidth; b.classList.add('is-bump'); });
  }
  function renderCart() {
    var n = cartQty();
    $$('[data-cart-count]').forEach(function (b) { b.textContent = n; b.hidden = n === 0; });
    $$('.js-open-cart').forEach(function (b) { b.setAttribute('aria-label', n ? t('cart.count', { plates: plates(n) }) : t('nav.cart')); });
    root.classList.toggle('has-cart', n > 0);

    var body = $('#cartBody'), foot = $('#cartFoot');
    var ids = Object.keys(state.cart);
    if (!ids.length) {
      body.innerHTML =
        '<div class="cart-empty">' +
          '<span class="cart-empty__icon">' + icon('basket2') + '</span>' +
          '<p class="cart-empty__t">' + esc(t('cart.emptyT')) + '</p>' +
          '<p class="cart-empty__d">' + esc(t('cart.emptyD')) + '</p>' +
          '<a href="#meals" class="btn btn--primary js-close-cart">' + esc(t('cart.browse')) + icon('arrow-right') + '</a>' +
        '</div>';
      foot.innerHTML = '';
      return;
    }
    var pref = derivedPref();
    body.innerHTML =
      '<ul class="cart-list">' + ids.map(function (id) {
        var m = mealById(id), q = state.cart[id], name = L(m.name);
        return '<li class="cart-item">' +
          '<img class="cart-item__img" alt="" width="72" height="72" loading="lazy" data-decorative>' +
          '<div class="cart-item__info">' +
            '<p class="cart-item__name">' + esc(name) + '</p>' +
            '<p class="cart-item__meta">' + esc(t('cart.line', { plates: plates(q) })) + '</p>' +
            '<div class="qty qty--sm" role="group" aria-label="' + esc(t('qty.label') + ': ' + name) + '">' +
              '<button type="button" class="qty__btn" data-cq="-1" data-id="' + id + '" aria-label="' + esc(t('qty.dec')) + '">' + icon(q <= 1 ? 'trash3' : 'dash-lg') + '</button>' +
              '<output class="qty__val">' + q + '</output>' +
              '<button type="button" class="qty__btn" data-cq="1" data-id="' + id + '" aria-label="' + esc(t('qty.inc')) + '"' + (q >= MAX_QTY ? ' disabled' : '') + '>' + icon('plus-lg') + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="cart-item__end">' +
            '<p class="cart-item__total">' + rupees(q * PRICE) + '</p>' +
            '<button type="button" class="link-btn link-btn--danger" data-remove="' + id + '" aria-label="' + esc(t('cart.removeFor', { name: name })) + '">' + esc(t('cart.remove')) + '</button>' +
          '</div>' +
        '</li>';
      }).join('') + '</ul>' +
      '<fieldset class="pref"><legend>' + esc(t('cart.pref')) + '</legend><div class="pref__opts">' +
        ['morning', 'evening', 'any'].map(function (s) {
          return '<label class="pref__opt"><input type="radio" name="pref" value="' + s + '"' + (pref === s ? ' checked' : '') + '><span>' + icon(s === 'morning' ? 'sunrise' : s === 'evening' ? 'moon-stars' : 'clock') + esc(slotLabel(s)) + '</span></label>';
        }).join('') +
      '</div></fieldset>' +
      '<div class="cart-fields">' +
        '<div class="field field--sm"><label for="cartName">' + esc(t('cart.name')) + ' <small class="opt">' + esc(t('cart.optional')) + '</small></label>' +
          '<input id="cartName" type="text" autocomplete="name" maxlength="60" value="' + esc(state.customer.name) + '"></div>' +
        '<div class="field field--sm"><label for="cartAddr">' + esc(t('cart.address')) + ' <small class="opt">' + esc(t('cart.optional')) + '</small></label>' +
          '<textarea id="cartAddr" rows="2" maxlength="200" autocomplete="street-address" placeholder="' + esc(t('cart.addressPh')) + '">' + esc(state.customer.address) + '</textarea></div>' +
      '</div>';
    $$('.cart-item__img', body).forEach(function (img, i) { var m = mealById(ids[i]); hydrateImg(img, m.img, { pos: m.pos, width: 200 }); img.removeAttribute('srcset'); });

    foot.innerHTML =
      '<div class="cart-total"><span>' + esc(t('total.est')) + '<small>' + esc(plates(n)) + ' × ' + rupees(PRICE) + '</small></span><strong>' + rupees(n * PRICE) + '</strong></div>' +
      '<p class="cart-error" id="cartError" role="alert" hidden></p>' +
      '<button type="button" class="btn btn--wa btn--block btn--lg" id="checkoutBtn">' + icon('whatsapp') + '<span>' + esc(t('cart.checkout')) + '</span></button>' +
      '<p class="cart-note">' + icon('info-circle') + '<span>' + esc(t('cart.note')) + '</span></p>' +
      '<button type="button" class="link-btn link-btn--muted" id="clearCart">' + icon('trash3') + esc(t('cart.clear')) + '</button>';
  }
  cartDrawer.addEventListener('click', function (e) {
    var cq = e.target.closest('[data-cq]');
    if (cq) {
      var id = cq.dataset.id, dir = cq.dataset.cq;
      setQty(id, (state.cart[id] || 0) + parseInt(dir, 10));
      var again = $('[data-cq="' + dir + '"][data-id="' + id + '"]', cartDrawer);
      (again && !again.disabled ? again : $('.drawer__head .icon-btn', cartDrawer)).focus();
      return;
    }
    var rm = e.target.closest('[data-remove]');
    if (rm) { setQty(rm.dataset.remove, 0); $('.drawer__head .icon-btn', cartDrawer).focus(); return; }
    if (e.target.closest('.js-close-cart')) { closeLayer(cartDrawer); return; }
    if (e.target.closest('#clearCart')) {
      state.cart = {}; state.pref = null; saveCart(); renderCart(); toast(t('toast.cleared'), 'muted');
      $('.drawer__head .icon-btn', cartDrawer).focus(); return;
    }
    if (e.target.closest('#checkoutBtn')) {
      var ids = Object.keys(state.cart), err = $('#cartError');
      if (!ids.length || !cartQty()) { if (err) { err.textContent = t('cart.errEmpty'); err.hidden = false; } return; }
      openWhatsApp(buildOrderMessage(ids.map(function (i) { return { id: i, qty: state.cart[i] }; }), derivedPref()));
    }
  });
  cartDrawer.addEventListener('input', function (e) {
    if (e.target.id === 'cartName') { state.customer.name = e.target.value; store.set('jgd-customer', state.customer); }
    if (e.target.id === 'cartAddr') { state.customer.address = e.target.value; store.set('jgd-customer', state.customer); }
  });
  cartDrawer.addEventListener('change', function (e) {
    if (e.target.name === 'pref') { state.pref = e.target.value; saveCart(); }
  });

  /* ----------------------------------------------------------- delegated */
  document.addEventListener('click', function (e) {
    var el;
    if ((el = e.target.closest('.lang-switch__btn'))) { setLang(el.dataset.lang); return; }
    if ((el = e.target.closest('.js-open-cart'))) { renderCart(); openLayer(cartDrawer, el, $('.drawer__head .icon-btn', cartDrawer)); return; }
    if ((el = e.target.closest('.js-close-cart')) && !cartDrawer.contains(el)) { closeLayer(cartDrawer); return; }
    if ((el = e.target.closest('.js-open-bulk'))) { openLayer(bulkModal, el, $('#bfName')); return; }
    if ((el = e.target.closest('[data-details]')) && !mealModal.contains(el)) { openMeal(el.dataset.details, el); return; }
    if ((el = e.target.closest('[data-order]'))) {
      addToCart(el.dataset.order, 1);
      openLayer(cartDrawer, el, $('.drawer__head .icon-btn', cartDrawer));
      return;
    }
    if ((el = e.target.closest('[data-add]'))) { addToCart(el.dataset.add, 1, el.dataset.slot); return; }
    if ((el = e.target.closest('[data-wa-meal]'))) {
      openWhatsApp(buildOrderMessage([{ id: el.dataset.waMeal, qty: 1 }], el.dataset.slot));
      return;
    }
  });

  /* ------------------------------------------------------ bulk enquiry form */
  var form = $('#bulkForm');
  function todayISO() { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
  $('#bfDate').min = todayISO();
  function setErr(input, key) {
    var p = document.getElementById(input.getAttribute('aria-describedby'));
    if (key) { input.setAttribute('aria-invalid', 'true'); if (p) { p.textContent = t(key); p.dataset.key = key; } input.closest('.field').classList.add('has-error'); }
    else { input.removeAttribute('aria-invalid'); if (p) { p.textContent = ''; delete p.dataset.key; } input.closest('.field').classList.remove('has-error'); }
  }
  function clearFormErrorsText() {
    // re-translate any visible errors after a language switch
    $$('.field__err', form).forEach(function (p) { if (p.dataset.key) p.textContent = t(p.dataset.key); });
    var s = $('#bulkSummary'); if (s && !s.hidden) s.textContent = t('bf.summary');
    var st = $('#bulkStatus'); if (st && st.dataset.key) st.textContent = t(st.dataset.key);
  }
  function validateField(input) {
    var v = (input.value || '').trim();
    switch (input.id) {
      case 'bfName': setErr(input, v.length < 2 ? 'err.name' : null); break;
      case 'bfEvent': setErr(input, !v ? 'err.event' : null); break;
      case 'bfLocation': setErr(input, v.length < 3 ? 'err.location' : null); break;
      case 'bfPlates':
        setErr(input, v && (!/^\d+$/.test(v) || +v < 1 || +v > 5000) ? 'err.plates' : null); break;
      case 'bfDate': setErr(input, v && v < todayISO() ? 'err.date' : null); break;
    }
    return input.getAttribute('aria-invalid') !== 'true';
  }
  form.addEventListener('blur', function (e) { if (e.target.matches('input, select, textarea') && e.target.value) validateField(e.target); }, true);
  form.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid') === 'true') validateField(e.target); });
  form.addEventListener('change', function (e) { if (e.target.tagName === 'SELECT') validateField(e.target); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fields = ['bfName', 'bfEvent', 'bfDate', 'bfPlates', 'bfLocation'].map(function (id) { return document.getElementById(id); });
    var bad = fields.filter(function (f) { return !validateField(f); });
    var summary = $('#bulkSummary'), status = $('#bulkStatus');
    if (bad.length) {
      summary.textContent = t('bf.summary'); summary.hidden = false;
      status.textContent = ''; delete status.dataset.key;
      bad[0].focus();
      return;
    }
    summary.hidden = true;
    var v = function (id) { return document.getElementById(id).value.trim(); };
    var ev = $('#bfEvent');
    var dateStr = '';
    if (v('bfDate')) {
      try { dateStr = new Intl.DateTimeFormat(state.lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(v('bfDate') + 'T00:00:00')); }
      catch (err) { dateStr = v('bfDate'); }
    }
    var lines = [t('wa.greet'), '', t('wa.bulkIntro'), '',
      t('wa.event') + ': ' + ev.options[ev.selectedIndex].text,
      t('wa.name') + ': ' + v('bfName')];
    if (dateStr) lines.push(t('wa.date') + ': ' + dateStr);
    if (v('bfPlates')) lines.push(t('wa.approx') + ': ' + v('bfPlates'));
    lines.push(t('wa.location') + ': ' + v('bfLocation'));
    if (v('bfMsg')) lines.push(t('wa.message') + ': ' + v('bfMsg'));
    lines.push('', t('wa.bulkOutro'), '', t('wa.thanks'));
    if (openWhatsApp(lines.join('\n'))) { status.textContent = t('bf.sent'); status.dataset.key = 'bf.sent'; }
  });

  /* ----------------------------------------------------------------- FAQ */
  $$('.acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      document.getElementById(btn.getAttribute('aria-controls')).classList.toggle('is-open', open);
    });
  });

  /* -------------------------------------------------------------- reveals */
  function initReveal() {
    var els = $$('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* -------------------------------------------------- mobile bar vs footer */
  function initMobileBar() {
    var bar = $('#mobileBar'), footer = $('#siteFooter');
    if (!('IntersectionObserver' in window) || !bar || !footer) return;
    new IntersectionObserver(function (entries) {
      bar.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { threshold: 0.02 }).observe(footer);
  }

  /* ----------------------------------------------------------------- init */
  function init() {
    root.classList.add('js-ok');
    renderAll();
    setHeaderVar();
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    initScrollSpy();
    initReveal();
    initMobileBar();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setHeaderVar);
  }

  try { init(); }
  catch (err) {
    // Fail safe: never leave content hidden behind the preloader or reveal styles.
    if (window.console) console.error(err);
    root.classList.add('reveal-off');
    hidePreloader();
  }

  // Expose a tiny API for testing / future integration (e.g. owner-managed menus).
  window.JGD = { state: state, buildOrderMessage: buildOrderMessage, setLang: setLang, addToCart: addToCart, waUrl: waUrl };
})();
