document.addEventListener('DOMContentLoaded', function () {

  /* ── SUITE ACCORDION TOGGLE ── */
  document.querySelectorAll('.sa-card-top').forEach(function (top) {
    top.addEventListener('click', function () {
      var item = this.closest('.sa-item');
      var isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !isOpen);
      var btn = item.querySelector('.sa-btn');
      if (btn) btn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });
  });

  /* ── OPEN & SCROLL TO ACCORDION PANEL FROM URL HASH ── */
  function openSectionFromHash() {
    var hash = window.location.hash;
    if (!hash) return;
    var target = document.querySelector(hash + '.sa-item');
    if (!target) return;
    target.classList.add('is-open');
    var btn = target.querySelector('.sa-btn');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    setTimeout(function () {
      var top = target.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }, 50);
  }
  openSectionFromHash();
  window.addEventListener('hashchange', openSectionFromHash);

  /* ── FAQ ACCORDION (iot-faq scoped) ── */
  document.querySelectorAll('.iot-faq .faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = this.closest('.faq-item');
      var isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !isOpen);
      q.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });
  });

  /* ── ECOSYSTEM PRODUCT FILTER ── */
  (function () {
    var tabs  = document.querySelectorAll('.eco-tab');
    var cards = document.querySelectorAll('.eco-card');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var filter = this.getAttribute('data-filter');
        tabs.forEach(function (t) { t.classList.remove('is-active'); });
        this.classList.add('is-active');
        cards.forEach(function (card) {
          card.style.display = (filter === 'all' || card.getAttribute('data-category') === filter) ? '' : 'none';
        });
      });
    });
  })();

});
