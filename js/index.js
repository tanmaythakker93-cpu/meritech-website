document.addEventListener('DOMContentLoaded', function () {

  /* ── ACCORDION SLIDER ── */
  var slides = document.querySelectorAll('.hp-slide');
  slides.forEach(function (slide) {
    slide.addEventListener('click', function () {
      slides.forEach(function (s) { s.classList.remove('is-active'); });
      slide.classList.add('is-active');
    });
    slide.addEventListener('mouseenter', function () {
      slides.forEach(function (s) { s.classList.remove('is-active'); });
      slide.classList.add('is-active');
    });
  });

  /* ── WHAT WE BUILD: tab + scroll spy ── */
  var buildTabs = document.querySelectorAll('.hp-build-tab');
  var divSections = document.querySelectorAll('.hp-division');

  buildTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var targetId = tab.dataset.div;
      var target = document.getElementById(targetId);
      if (!target) return;
      var offset = 96 + 16;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
      buildTabs.forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
    });
  });

  function updateBuildTabs() {
    var offset = 120;
    var current = null;
    divSections.forEach(function (sec) {
      var rect = sec.getBoundingClientRect();
      if (rect.top <= offset) current = sec.id;
    });
    if (current) {
      buildTabs.forEach(function (tab) {
        tab.classList.toggle('is-active', tab.dataset.div === current);
      });
    }
  }
  window.addEventListener('scroll', updateBuildTabs, { passive: true });

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
