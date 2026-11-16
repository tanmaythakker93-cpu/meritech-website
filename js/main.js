document.addEventListener('DOMContentLoaded', function () {

  /* --------------------------------------------------------
     HAMBURGER / MOBILE DRAWER
     aria-expanded + aria-controls on the toggle, Escape closes,
     focus is trapped inside while open, body scroll is locked.
     The drawer is only ever shown below 992px (or on touch
     devices, see responsivestyle.css); a resize past 991px on a
     pointer device closes it.
  -------------------------------------------------------- */
  const toggle = document.getElementById('mnToggle');
  const mobile = document.getElementById('mnMobile');
  const desktopMQ = window.matchMedia('(min-width: 992px)');
  const touchMQ = window.matchMedia('(hover: none) and (pointer: coarse)');
  let drawerTimer = null;

  function drawerOpen() { return !!(toggle && toggle.classList.contains('is-open')); }

  function openDrawer() {
    clearTimeout(drawerTimer);
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    mobile.style.display = 'block';
    document.documentElement.classList.add('mn-lock');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { mobile.classList.add('is-open'); });
    });
  }

  function closeDrawer(returnFocus) {
    if (!drawerOpen()) return;
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    mobile.classList.remove('is-open');
    document.documentElement.classList.remove('mn-lock');
    clearTimeout(drawerTimer);
    drawerTimer = setTimeout(function () { mobile.style.display = 'none'; }, 260);
    if (returnFocus) toggle.focus();
  }

  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      if (drawerOpen()) closeDrawer(false); else openDrawer();
    });

    document.addEventListener('click', function (e) {
      if (drawerOpen() && !toggle.contains(e.target) && !mobile.contains(e.target)) closeDrawer(false);
    });

    document.addEventListener('keydown', function (e) {
      if (!drawerOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); closeDrawer(true); return; }
      if (e.key !== 'Tab') return;
      /* focus trap: toggle + every visible focusable inside the drawer */
      const items = [toggle].concat(Array.prototype.filter.call(
        mobile.querySelectorAll('a[href], button'),
        function (el) { return el.offsetParent !== null; }
      ));
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!toggle.contains(active) && !mobile.contains(active)) {
        e.preventDefault(); first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault(); first.focus();
      }
    });

    function syncDrawerToViewport() {
      if (desktopMQ.matches && !touchMQ.matches) {
        if (drawerOpen()) closeDrawer(false);
        mobile.style.display = 'none';
        mobile.classList.remove('is-open');
        document.documentElement.classList.remove('mn-lock');
      }
    }
    if (desktopMQ.addEventListener) desktopMQ.addEventListener('change', syncDrawerToViewport);
    else if (desktopMQ.addListener) desktopMQ.addListener(syncDrawerToViewport);
  }

  /* --------------------------------------------------------
     DESKTOP MEGA DROPDOWN
     Hover intent (pointer devices): opens with a short delay so
     skimming across the bar doesn't flash menus; switches
     instantly between adjacent items; a close grace period stops
     flicker. Keyboard: focus inside an item opens it (CSS
     :focus-within) and aria-expanded on the trigger link is kept
     in sync; Escape closes and returns focus to the trigger.
  -------------------------------------------------------- */
  (function () {
    const ddItems = Array.prototype.filter.call(
      document.querySelectorAll('.mn-nav .mn-item'),
      function (item) { return item.querySelector('.mn-dropdown'); }
    );
    if (!ddItems.length) return;
    let openItem = null;
    let openTimer = null;
    let closeTimer = null;

    function triggerOf(item) { return item.querySelector('.mn-link'); }
    function setExpanded(item, on) {
      const t = triggerOf(item);
      if (t) t.setAttribute('aria-expanded', on ? 'true' : 'false');
    }

    function openDropdown(item) {
      if (openItem && openItem !== item) {
        openItem.classList.remove('dd-open');
        setExpanded(openItem, false);
      }
      openItem = item;
      item.classList.add('dd-open');
      setExpanded(item, true);
    }

    function closeDropdown() {
      if (openItem) {
        openItem.classList.remove('dd-open');
        setExpanded(openItem, false);
        openItem = null;
      }
    }

    if (window.matchMedia('(hover: hover)').matches) {
      ddItems.forEach(function (item) {
        item.addEventListener('mouseenter', function () {
          clearTimeout(openTimer);
          clearTimeout(closeTimer);
          if (openItem) {
            openDropdown(item); // a menu is already open — switch instantly
          } else {
            openTimer = setTimeout(function () { openDropdown(item); }, 70);
          }
        });
        item.addEventListener('mouseleave', function () {
          clearTimeout(openTimer);
          clearTimeout(closeTimer);
          closeTimer = setTimeout(closeDropdown, 180);
        });
      });
    }

    /* keyboard / focus */
    ddItems.forEach(function (item) {
      item.addEventListener('focusin', function () {
        ddItems.forEach(function (other) {
          if (other !== item) {
            other.classList.remove('dd-open');
            setExpanded(other, false);
          }
        });
        if (!item.classList.contains('dd-esc')) setExpanded(item, true);
      });
      item.addEventListener('focusout', function (e) {
        if (item.contains(e.relatedTarget)) return;
        item.classList.remove('dd-esc');
        setExpanded(item, item.classList.contains('dd-open'));
      });
      item.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        const wasInside = item.contains(document.activeElement);
        item.classList.remove('dd-open');
        setExpanded(item, false);
        openItem = null;
        /* suppress the :focus-within rule until focus moves on */
        item.classList.add('dd-esc');
        if (wasInside) triggerOf(item).focus();
      });
    });
  })();

  /* --------------------------------------------------------
     MOBILE ACCORDION
  -------------------------------------------------------- */
  document.querySelectorAll('[data-mob-acc]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const key = btn.dataset.mobAcc;
      const sub = document.getElementById('mob-' + key);
      const isOpen = sub.classList.contains('is-open');
      document.querySelectorAll('.mn-mob-sub').forEach(function (s) { s.classList.remove('is-open'); });
      document.querySelectorAll('[data-mob-acc]').forEach(function (b) {
        b.classList.remove('is-open');
        b.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        sub.classList.add('is-open');
        btn.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
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

      window.scrollTo({ top: top, behavior: (document.body.classList.contains('calm-motion') && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 'auto' : 'smooth' });

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
      document.querySelectorAll('.mf-pill').forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
        b.setAttribute('tabindex', '-1');
      });
      document.querySelectorAll('.mf-panel').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      btn.setAttribute('tabindex', '0');
      const panel = document.getElementById('mf-' + key);
      if (panel) panel.classList.add('active');
    });
    // tablist keyboard: Arrow keys / Home / End move between tabs
    btn.addEventListener('keydown', function (e) {
      var tabs = Array.prototype.slice.call(btn.parentNode.querySelectorAll('.mf-pill'));
      var i = tabs.indexOf(btn), j = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = tabs.length - 1;
      if (j < 0) return;
      e.preventDefault();
      tabs[j].focus();
      tabs[j].click();
    });
  });

  /* --------------------------------------------------------
     NAV ACTIVE STATE — highlight current page link
  -------------------------------------------------------- */
  (function () {
    /* Normalize a path to a comparable page name: strips query/hash,
       directories, the .html extension (Netlify serves extensionless
       pretty URLs), and case — so "/sigma-la" matches "sigma_la.html". */
    function pageName(path) {
      path = path.split('#')[0].split('?')[0].replace(/\/+$/, '');
      var name = path.split('/').pop();
      name = name.replace(/\.html?$/i, '');
      return (name === '' ? 'index' : name).toLowerCase();
    }
    var page = pageName(decodeURIComponent(window.location.pathname));
    document.querySelectorAll('.mn-dropdown a.dd-product[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href !== '#' && pageName(href) === page) {
        link.classList.add('is-active');
        var mnLink = link.closest('.mn-item') && link.closest('.mn-item').querySelector('.mn-link');
        if (mnLink) mnLink.classList.add('is-active');
      }
    });
    document.querySelectorAll('.mn-nav .mn-item > .mn-link[href]').forEach(function (mnLink) {
      var href = mnLink.getAttribute('href');
      if (href && href !== '#' && pageName(href) === page) mnLink.classList.add('is-active');
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
        if (document.body.classList.contains('calm-motion')) revealIO.unobserve(entry.target); /* IoT/IT pages: one-shot */
      } else if (!document.body.classList.contains('calm-motion')) {
        entry.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(function (el) { revealIO.observe(el); });

  /* Auto-stagger cards inside grid containers */
  document.querySelectorAll('.hl-grid, .uc-cards, .rel-grid').forEach(function (grid) {
    grid.querySelectorAll('.hl-card, .uc-card, .rel-card').forEach(function (card, i) {
      card.classList.add('reveal');
      card.style.transitionDelay = (document.body.classList.contains('calm-motion') ? Math.min(i * 0.12, 0.24) : (i * 0.12)) + 's';
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
    // keyboard: Enter / Space activate the accordion header (div[role=button])
    q.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); q.click(); }
    });
  });

  /* --------------------------------------------------------
     DEVICE TYPES ACCORDION (sigma_one.html .dt-head)
  -------------------------------------------------------- */
  document.querySelectorAll('.dt-head').forEach(function (head) {
    head.addEventListener('click', function () {
      var item = this.closest('.dt-item');
      var isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.dt-item').forEach(function (i) {
        i.classList.remove('is-open');
        var ih = i.querySelector('.dt-head');
        if (ih) ih.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) { item.classList.add('is-open'); this.setAttribute('aria-expanded', 'true'); }
    });
    head.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); head.click(); }
    });
  });

  /* --------------------------------------------------------
     SCROLLABLE TABLES — keyboard access
     Wrappers that scroll horizontally get tabindex/role/label
     (invisible attributes) only while they actually overflow.
  -------------------------------------------------------- */
  var scrollers = document.querySelectorAll('.tt-box, .rl-table, .wl-table, .cl-table-wrap, .lgc-compare');
  function syncScrollers() {
    scrollers.forEach(function (el) {
      var overflowing = el.scrollWidth > el.clientWidth + 1;
      if (overflowing) {
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'region');
        el.setAttribute('aria-label', 'Scrollable table');
      } else if (el.getAttribute('aria-label') === 'Scrollable table') {
        el.removeAttribute('tabindex');
        el.removeAttribute('role');
        el.removeAttribute('aria-label');
      }
    });
  }
  if (scrollers.length) {
    syncScrollers();
    window.addEventListener('resize', syncScrollers);
    window.addEventListener('load', syncScrollers);
  }

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

/* ============================================================
   MEGA MENU FOOTER — highlight the link for the open page
   ============================================================ */
(function () {
  var here = decodeURIComponent((location.pathname.split('/').pop() || 'index.html'));
  document.querySelectorAll('.dd-explore[href]').forEach(function (a) {
    var target = a.getAttribute('href').split('#')[0];
    if (target && target === here) a.classList.add('is-active');
  });
})();
