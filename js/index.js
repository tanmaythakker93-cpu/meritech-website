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

  /* ── WHAT WE BUILD: tab + scroll spy ── */
  var buildTabs = document.querySelectorAll('.hp-build-tab');
  var divSections = document.querySelectorAll('.hp-division');

  var buildImg = document.querySelector('.hp-build-img-box img');
  var divImages = {
    'div-01': 'images/home_page_imgs/magnific_macro-closeup-photograph-_MXNtWe1DCm.png',
    'div-02': 'images/home_page_imgs/wireless services.png',
    'div-03': 'images/home_page_imgs/IoT Products.png',
    'div-04': 'images/home_page_imgs/IOT Services.png',
    'div-05': 'images/home_page_imgs/IT_services.png'
  };
  // preload so hard swaps never flash while the file decodes
  Object.keys(divImages).forEach(function (k) {
    var img = new Image();
    img.src = divImages[k];
  });

  function setBuildImage(divId) {
    if (!buildImg || !divImages[divId]) return;
    var next = divImages[divId];
    if (buildImg.getAttribute('src') === next) return;
    buildImg.src = next;
  }

  // while a click-driven smooth scroll is in flight, the scroll spy must not
  // swap tabs/images for every division it passes on the way
  var spyLocked = false;
  var spyLockTimer = null;
  function lockSpy() {
    spyLocked = true;
    clearTimeout(spyLockTimer);
    spyLockTimer = setTimeout(function () { spyLocked = false; }, 400);
  }

  // scroll offset must clear the fixed navbar plus the sticky headline/intro
  // block, which stays pinned above the divisions while they scroll
  var rhead = document.querySelector('.hp-build-rhead');
  function buildOffset() {
    var pinned = rhead && getComputedStyle(rhead).position === 'sticky' ? rhead.offsetHeight : 0;
    return 80 + pinned + 16;
  }
  // expose the offset so CSS can pin the last division right below the header
  function setBuildOffsetVar() {
    document.documentElement.style.setProperty('--build-offset', buildOffset() + 'px');
  }
  setBuildOffsetVar();
  window.addEventListener('resize', setBuildOffsetVar);

  buildTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var targetId = tab.dataset.div;
      var target = document.getElementById(targetId);
      if (!target) return;
      var top = target.getBoundingClientRect().top + window.pageYOffset - buildOffset();
      window.scrollTo({ top: top, behavior: 'smooth' });
      buildTabs.forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
      divSections.forEach(function (sec) { sec.classList.toggle('is-current', sec.id === targetId); });
      lockSpy();
      setBuildImage(targetId);
    });
  });

  function updateBuildTabs() {
    if (spyLocked) { lockSpy(); return; } // keep lock alive until scrolling settles
    var offset = buildOffset() + 8;
    var current = null;
    divSections.forEach(function (sec) {
      var rect = sec.getBoundingClientRect();
      if (rect.top <= offset) current = sec.id;
    });
    if (current) {
      buildTabs.forEach(function (tab) {
        tab.classList.toggle('is-active', tab.dataset.div === current);
      });
      divSections.forEach(function (sec) { sec.classList.toggle('is-current', sec.id === current); });
      setBuildImage(current);
    }
  }
  window.addEventListener('scroll', updateBuildTabs, { passive: true });
  if (divSections.length) divSections[0].classList.add('is-current');
  updateBuildTabs();

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
