/* Wireless Services — hero card deck.
   The three question cards render in their section-2 grid slots, but at the
   top of the page they are held over the banner's right side like a hand of
   cards — cropped to image + title + caption, all pivoting around a shared
   point below their bottom edge so they fan open from the bottom. Scrolling
   interpolates each card back to its natural slot, un-cropping it and
   crossfading the body text back in. */
document.addEventListener('DOMContentLoaded', function () {
  var anchor = document.querySelector('.ws-deck-anchor');
  var grid   = document.querySelector('.ws-q-grid');
  var cards  = Array.prototype.slice.call(document.querySelectorAll('.ws-q-card'));
  if (!anchor || !grid || cards.length === 0) return;

  var mq = window.matchMedia('(min-width: 1200px)');
  /* Hand-fan angles per card (front card first, kept on top) — the shared
     pivot sits at the cards' bottom-left, so the fan opens to the right */
  var fan = [0, 8, 16];
  var metrics = null;
  var ticking = false;

  function measure() {
    cards.forEach(function (c) {
      c.style.transform = 'none';
      c.style.clipPath = 'none';
      c.style.transformOrigin = '';
    });
    var a = anchor.getBoundingClientRect();
    var pivot = null;
    metrics = cards.map(function (c, i) {
      var r = c.getBoundingClientRect();
      var meta = c.querySelector('.ws-q-meta');
      var title = c.querySelector('.ws-q-title');
      var texts = Array.prototype.slice.call(c.querySelectorAll('.ws-q-text'));
      /* Deck crop: keep everything down to the caption line, hide the rest */
      var keep = r.height;
      if (meta) {
        var mr = meta.getBoundingClientRect();
        keep = (mr.top - r.top) + 30;
      }
      var scale = Math.min(1, a.width / r.width);
      /* Pivot: bottom-left corner of the visible (cropped) card */
      var ox = 0;
      var oy = keep * 1.15;
      if (!pivot) pivot = { x: a.left, y: a.top + scale * oy };
      return {
        dx: pivot.x - (r.left + ox),
        dy: pivot.y - (r.top + oy),
        rot: fan[i],
        scale: scale,
        ox: ox,
        oy: oy,
        crop: Math.max(r.height - keep, 0),
        meta: meta,
        title: title,
        texts: texts
      };
    });
  }

  function progress() {
    /* 0 at page top (full deck), 1 once the grid's slot reaches the upper
       third of the viewport (cards settled) */
    var gridTop = grid.getBoundingClientRect().top + window.pageYOffset;
    var dist = Math.max(gridTop - window.innerHeight * 0.3, 1);
    return Math.min(Math.max(window.pageYOffset / dist, 0), 1);
  }

  function reset(c, m) {
    c.style.transform = '';
    c.style.clipPath = '';
    c.style.transformOrigin = '';
    c.style.zIndex = '';
    c.style.boxShadow = '';
    if (m) {
      if (m.meta) m.meta.style.opacity = '';
      if (m.title) m.title.style.borderBottomColor = '';
      m.texts.forEach(function (t) { t.style.opacity = ''; });
    }
  }

  function apply() {
    ticking = false;
    if (!mq.matches) {
      cards.forEach(function (c, i) { reset(c, metrics && metrics[i]); });
      return;
    }
    if (!metrics) measure();
    var p = progress();
    var t = 1 - p;
    cards.forEach(function (c, i) {
      var m = metrics[i];
      if (t === 0) { reset(c, m); return; }
      var s = m.scale + (1 - m.scale) * p;
      c.style.zIndex = String(20 - i);
      c.style.transformOrigin = m.ox + 'px ' + m.oy + 'px';
      c.style.transform = 'translate(' + (m.dx * t).toFixed(2) + 'px,' + (m.dy * t).toFixed(2) + 'px) ' +
                          'rotate(' + (m.rot * t).toFixed(2) + 'deg) scale(' + s.toFixed(4) + ')';
      /* Negative insets keep the box-shadow visible; only the bottom crops */
      c.style.clipPath = 'inset(-80px -80px ' + (m.crop * t).toFixed(2) + 'px -80px)';
      /* Deck shadow: lift the cards off the banner, easing back to the
         resting card shadow as they settle into the grid */
      c.style.boxShadow = '0 ' + (2 + 14 * t).toFixed(1) + 'px ' + (24 + 16 * t).toFixed(1) + 'px rgba(0,0,0,' + (0.06 + 0.24 * t).toFixed(3) + ')';
      /* Crossfade: body text + divider visible at rest, caption visible in deck */
      var textFade = Math.min(Math.max((p - 0.55) / 0.45, 0), 1);
      var metaFade = Math.min(Math.max((0.45 - p) / 0.45, 0), 1);
      m.texts.forEach(function (el) { el.style.opacity = textFade.toFixed(3); });
      if (m.title) m.title.style.borderBottomColor = 'rgba(229,227,227,' + textFade.toFixed(3) + ')';
      if (m.meta) m.meta.style.opacity = metaFade.toFixed(3);
    });
  }

  function request() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(apply); }
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', function () { metrics = null; request(); });
  window.addEventListener('load', function () { metrics = null; request(); });
  apply();
});
