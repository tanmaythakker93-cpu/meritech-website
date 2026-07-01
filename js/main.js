document.addEventListener('DOMContentLoaded', function () {

  /* --------------------------------------------------------
     HAMBURGER MENU
  -------------------------------------------------------- */
  const toggle = document.getElementById('mnToggle');
  const mobile = document.getElementById('mnMobile');

  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      const opening = !toggle.classList.contains('is-open');
      toggle.classList.toggle('is-open');
      if (opening) {
        mobile.style.display = 'block';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            mobile.classList.add('is-open');
          });
        });
      } else {
        mobile.classList.remove('is-open');
        setTimeout(function () { mobile.style.display = 'none'; }, 260);
      }
    });

    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !mobile.contains(e.target)) {
        toggle.classList.remove('is-open');
        mobile.classList.remove('is-open');
        setTimeout(function () { mobile.style.display = 'none'; }, 260);
      }
    });
  }

  /* --------------------------------------------------------
     MOBILE ACCORDION
  -------------------------------------------------------- */
  document.querySelectorAll('[data-mob-acc]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const key = btn.dataset.mobAcc;
      const sub = document.getElementById('mob-' + key);
      const isOpen = sub.classList.contains('is-open');
      document.querySelectorAll('.mn-mob-sub').forEach(function (s) { s.classList.remove('is-open'); });
      document.querySelectorAll('[data-mob-acc]').forEach(function (b) { b.classList.remove('is-open'); });
      if (!isOpen) {
        sub.classList.add('is-open');
        btn.classList.add('is-open');
      }
    });
  });

  /* --------------------------------------------------------
     SUBNAV STICKY
  -------------------------------------------------------- */
  const subnav = document.getElementById('mainSubnav');
  const placeholder = document.getElementById('subnavPlaceholder');
  const subnavTriggerY = subnav
    ? subnav.getBoundingClientRect().top + window.pageYOffset - 80
    : 0;

  function stickyScroll() {
    if (!subnav || !placeholder) return;
    const stuck = window.pageYOffset >= subnavTriggerY;
    subnav.classList.toggle('is-stuck', stuck);
    placeholder.classList.toggle('active', stuck);
  }
  window.addEventListener('scroll', stickyScroll, { passive: true });
  stickyScroll();

  /* --------------------------------------------------------
     SMOOTH SCROLL (subnav links)
  -------------------------------------------------------- */
  function navOffset() {
    const mn = document.querySelector('.mn-bar');
    const sn = document.querySelector('.subnav');
    return (mn ? mn.offsetHeight : 80) + (sn ? sn.offsetHeight : 72) + 8;
  }

  let spyPaused = false;
  let spyTimer = null;

  document.querySelectorAll('.subnav-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navOffset();

      spyPaused = true;
      clearTimeout(spyTimer);

      document.querySelectorAll('.subnav-link').forEach(function (l) { l.classList.remove('active'); });
      link.classList.add('active');

      window.scrollTo({ top: top, behavior: 'smooth' });

      spyTimer = setTimeout(function () { spyPaused = false; }, 1000);
    });
  });

  /* --------------------------------------------------------
     SCROLL SPY (subnav active state — dynamic from page links)
  -------------------------------------------------------- */
  var spySections = Array.from(document.querySelectorAll('.subnav-link[href^="#"]'))
    .map(function (l) { return l.getAttribute('href').slice(1); });

  function onScroll() {
    if (spyPaused || !spySections.length) return;
    const offset = navOffset() + 40;
    let current = spySections[0];
    spySections.forEach(function (id) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= offset) current = id;
    });
    document.querySelectorAll('.subnav-link').forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --------------------------------------------------------
     MAIN FEATURES — PILL TABS
  -------------------------------------------------------- */
  document.querySelectorAll('.mf-pill').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const key = btn.dataset.mfpill;
      document.querySelectorAll('.mf-pill').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.mf-panel').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      const panel = document.getElementById('mf-' + key);
      if (panel) panel.classList.add('active');
    });
  });

  /* --------------------------------------------------------
     NAV ACTIVE STATE — highlight current page link
  -------------------------------------------------------- */
  (function () {
    var page = (window.location.pathname.split('/').pop() || 'index.html').split('?')[0];
    document.querySelectorAll('.mn-dropdown a.dd-product[href]').forEach(function (link) {
      var href = link.getAttribute('href').split('#')[0].split('?')[0];
      if (href && href !== '#' && href === page) {
        link.classList.add('is-active');
        var mnLink = link.closest('.mn-item') && link.closest('.mn-item').querySelector('.mn-link');
        if (mnLink) mnLink.classList.add('is-active');
      }
    });
  })();

  /* --------------------------------------------------------
     SCROLL PROGRESS BAR
  -------------------------------------------------------- */
  var accent = document.querySelector('.mn-accent');
  if (accent) {
    function updateProgress() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = 25 + (docHeight > 0 ? (scrollTop / docHeight) * 75 : 0);
      accent.style.width = pct + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* --------------------------------------------------------
     SCROLL REVEAL
  -------------------------------------------------------- */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(function (el) { revealIO.observe(el); });

  /* Auto-stagger cards inside grid containers */
  document.querySelectorAll('.hl-grid, .uc-cards, .rel-grid').forEach(function (grid) {
    grid.querySelectorAll('.hl-card, .uc-card, .rel-card').forEach(function (card, i) {
      card.classList.add('reveal');
      card.style.transitionDelay = (i * 0.12) + 's';
      revealIO.observe(card);
    });
  });

  /* --------------------------------------------------------
     FAQ ACCORDION (generic — any page with .faq-q elements)
  -------------------------------------------------------- */
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = this.closest('.faq-item');
      var isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('is-open');
        var iq = i.querySelector('.faq-q');
        if (iq) iq.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* --------------------------------------------------------
     DEVICE TYPES ACCORDION (sigma-one.html .dt-head)
  -------------------------------------------------------- */
  document.querySelectorAll('.dt-head').forEach(function (head) {
    head.addEventListener('click', function () {
      var item = this.closest('.dt-item');
      var isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.dt-item').forEach(function (i) { i.classList.remove('is-open'); });
      if (!isOpen) { item.classList.add('is-open'); }
    });
  });

  /* --------------------------------------------------------
     COUNTER ANIMATION
  -------------------------------------------------------- */
  var counters = document.querySelectorAll('.counter');
  if (counters.length) {
    var counterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.dataset.target, 10);
        var duration = 1400;
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var ease = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(ease * target);
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
        counterIO.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { counterIO.observe(c); });
  }

});
