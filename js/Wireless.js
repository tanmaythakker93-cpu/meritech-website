  /* Platform family filter */
  document.addEventListener('DOMContentLoaded', function () {
    var tabs  = document.querySelectorAll('.wl-fam-tab');
    var cards = document.querySelectorAll('.wl-pcard[data-category]');
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
  });
