  /* Service family filter */
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
