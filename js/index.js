document.addEventListener('DOMContentLoaded', function () {

  /* ── ACCORDION SLIDER ── */
  var slides = document.querySelectorAll('.hp-slide');
  slides.forEach(function (slide) {
    slide.addEventListener('click', function () {
      // collapsed slide (touch devices): first tap expands, second tap opens
      if (!slide.classList.contains('is-active')) {
        slides.forEach(function (s) { s.classList.remove('is-active'); });
        slide.classList.add('is-active');
        return;
      }
      var href = slide.dataset.href;
      if (href) window.location.href = href;
    });
    slide.addEventListener('mouseenter', function () {
      slides.forEach(function (s) { s.classList.remove('is-active'); });
      slide.classList.add('is-active');
    });
    slide.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && slide.dataset.href) {
        e.preventDefault();
        window.location.href = slide.dataset.href;
      }
    });
  });

  /* ── WHAT WE BUILD: horizontal card carousel ── */
  var buildTrack = document.querySelector('.hp-build-track');
  var buildArrows = document.querySelectorAll('.hp-build-arrow');

  var buildSection = document.getElementById('hp-build');

  if (buildTrack && buildArrows.length) {
    function maxScroll() { return buildTrack.scrollWidth - buildTrack.clientWidth; }

    // scroll one card (width + gap) per click
    function cardStep() {
      var card = buildTrack.querySelector('.hp-build-card');
      if (!card) return buildTrack.clientWidth * 0.8;
      var gap = parseFloat(getComputedStyle(buildTrack).columnGap) || 22;
      return card.offsetWidth + gap;
    }

    function updateArrows() {
      var max = maxScroll() - 1;
      buildArrows.forEach(function (btn) {
        if (btn.dataset.dir === 'prev') btn.disabled = buildTrack.scrollLeft <= 0;
        else btn.disabled = buildTrack.scrollLeft >= max;
      });
    }

    // ── SCROLL #1: click the arrows ──
    // a manual click briefly suspends the page-scroll sync so it isn't overridden
    var autoLocked = false, autoTimer = null;
    function lockAuto() {
      autoLocked = true;
      clearTimeout(autoTimer);
      autoTimer = setTimeout(function () { autoLocked = false; }, 1000);
    }
    buildArrows.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = btn.dataset.dir === 'prev' ? -1 : 1;
        if (pinned) {
          // pinned: the page scroll drives the cards, so move the page by one card
          window.scrollBy({ top: dir * cardStep() * scrollRatio, behavior: 'smooth' });
          return;
        }
        lockAuto();
        buildTrack.scrollBy({ left: dir * cardStep(), behavior: 'smooth' });
      });
    });

    // ── PINNED SCROLL: the section sticks under the header while the page scrolls;
    // the vertical scroll distance is converted into sideways card movement, and the
    // page carries on to the next section once the last card has been reached.
    var HEADER_H = 80;                       // fixed .mn-bar height
    var buildInner = buildSection ? buildSection.querySelector('.hp-build-inner') : null;
    var pinned = false, pinTop = HEADER_H, pinLen = 0, pinPadTop = 0;
    var scrollRatio = 1.15;                  // page px per card px: higher = slower, calmer
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function layoutPin() {
      if (!buildSection || !buildInner || reduceMotion) return;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      buildSection.classList.remove('is-pinned');
      buildSection.style.height = '';
      var cs = getComputedStyle(buildSection);
      pinPadTop = parseFloat(cs.paddingTop) || 0;
      var padBottom = parseFloat(cs.paddingBottom) || 0;
      var innerH = buildInner.offsetHeight;
      // if the content is taller than the space under the header, pin it higher so the
      // card bottoms (and links) stay visible
      pinTop = (innerH > vh - HEADER_H - 16) ? (vh - innerH - 16) : HEADER_H;
      var span = maxScroll();
      if (span < 8) return;
      pinLen = Math.round(span * scrollRatio);
      buildInner.style.top = pinTop + 'px';
      buildSection.style.height = (pinPadTop + innerH + pinLen + padBottom) + 'px';
      buildSection.classList.add('is-pinned');
      pinned = true;
    }

    // ── SCROLL #2: auto — cards move horizontally as the page scrolls vertically
    // through the section. Page scroll only updates a TARGET; a rAF loop eases the
    // track toward it, so the motion stays smooth even when scroll events are bursty.
    function computeTarget() {
      if (!buildSection) return buildTrack.scrollLeft;
      if (pinned) {
        var pr = buildSection.getBoundingClientRect();
        // 0 when the content first reaches its pinned position, 1 when it is released
        var p = (pinTop - pinPadTop - pr.top) / Math.max(pinLen, 1);
        return Math.max(0, Math.min(1, p)) * maxScroll();
      }
      var rect = buildSection.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      // progress stays 0 (card 1 fully visible) until the section top reaches the
      // top of the viewport, then climbs to 1 by the time the section bottom
      // reaches the viewport bottom — so the whole traversal happens in view
      var denom = rect.height - vh;
      var progress = denom > 40 ? (-rect.top) / denom : (-rect.top) / rect.height;
      progress = Math.max(0, Math.min(1, progress));
      return progress * maxScroll();
    }

    layoutPin();
    var targetLeft = computeTarget();
    var currentLeft = targetLeft;
    buildTrack.scrollLeft = currentLeft;

    function tickAnim() {
      if (autoLocked) {
        // arrows own the track right now — stay synced so there's no jump on release
        currentLeft = targetLeft = buildTrack.scrollLeft;
      } else {
        currentLeft += (targetLeft - currentLeft) * 0.10; // easing factor → higher = snappier
        if (Math.abs(targetLeft - currentLeft) < 0.4) currentLeft = targetLeft;
        buildTrack.scrollLeft = currentLeft;
      }
      updateArrows();
      requestAnimationFrame(tickAnim);
    }

    window.addEventListener('scroll', function () { if (pinned) targetLeft = computeTarget(); }, { passive: true });
    window.addEventListener('resize', function () { pinned = false; layoutPin(); targetLeft = pinned ? computeTarget() : buildTrack.scrollLeft; updateArrows(); });
    window.addEventListener('load', function () { pinned = false; layoutPin(); targetLeft = pinned ? computeTarget() : buildTrack.scrollLeft; });
    updateArrows();
    requestAnimationFrame(tickAnim);
  }

  /* ── HERO HEADLINE: typewriter (types the three lines in sequence) ── */
  var heroHeadline = document.querySelector('.hp-hero-headline');
  if (heroHeadline && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    // read the authored lines (split on <br>), then rebuild as per-line blocks
    var heroLines = heroHeadline.innerHTML.split(/<br\s*\/?>/i).map(function (s) {
      return s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }).filter(function (s) { return s.length; });

    heroHeadline.innerHTML = '';
    // each line is a block that reserves its height up front → no layout shift
    var heroSpans = heroLines.map(function () {
      var s = document.createElement('span');
      s.className = 'hp-type-line';
      s.style.display = 'block';
      s.style.minHeight = '1em';
      s.textContent = '​'; // zero-width space holds the line height
      heroHeadline.appendChild(s);
      return s;
    });

    var heroCaret = document.createElement('span');
    heroCaret.className = 'hp-type-caret';
    heroCaret.setAttribute('aria-hidden', 'true');
    var heroBlink = setInterval(function () {
      heroCaret.style.visibility = (heroCaret.style.visibility === 'hidden') ? 'visible' : 'hidden';
    }, 500);

    var hli = 0, hci = 0;
    function heroTick() {
      if (hli >= heroLines.length) {
        setTimeout(function () { clearInterval(heroBlink); heroCaret.remove(); }, 2600);
        return;
      }
      var text = heroLines[hli];
      hci++;
      heroSpans[hli].textContent = text.slice(0, hci);
      heroSpans[hli].appendChild(heroCaret);
      if (hci >= text.length) { hli++; hci = 0; setTimeout(heroTick, 260); }
      else { setTimeout(heroTick, 55); }
    }
    setTimeout(heroTick, 300);
  }

  /* ── QUOTE LINE ANIMATION ── */
  var quoteIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.hp-ql').forEach(function (el) { quoteIO.observe(el); });

});
