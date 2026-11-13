/* Sigma-AQ Boss — page-only script (paired with css/sigma-aq-boss.css).
   5 · Five steps: sizes the pinned rail photo so the rail always fits under
   the fixed header + subnav, ends the hairline at the last numeral, and drives
   the green progress fill + numeral colour on scroll (rAF-throttled, passive).
   prefers-reduced-motion: full line, all numerals green, no scroll listener. */
(function () {
  var section = document.getElementById('section-fivesteps');
  if (!section) return;
  var list = section.querySelector('.fs-steps');
  var rail = section.querySelector('.fs-top');
  var media = section.querySelector('.fs-rail-media');
  if (!list) return;
  var steps = Array.prototype.slice.call(list.querySelectorAll('.fs-step'));
  var nums = steps.map(function (s) { return s.querySelector('.fs-step-num'); });
  var pinMQ = window.matchMedia('(min-width: 992px) and (min-height: 700px)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PIN_TOP = 180, BOTTOM_AIR = 24, PHOTO_MIN = 120, PHOTO_MAX = 300, LINE_TOP = 12;

  function pageTop(el) { var y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; }

  function layout() {
    /* the hairline stops at the centre of the last numeral */
    /* offset* metrics ignore the .reveal entrance transform */
    var last = nums[nums.length - 1];
    var lastMid = pageTop(last) - pageTop(list) + last.offsetHeight / 2;
    list.style.setProperty('--fs-tail', Math.max(0, Math.round(list.offsetHeight - lastMid)) + 'px');
    /* rail photo height = what is left of the viewport under the pinned text */
    if (!rail || !media) return;
    if (!pinMQ.matches) { section.classList.remove('fs-nopin'); section.style.removeProperty('--fs-photo-h'); return; }
    var textH = pageTop(media) - pageTop(rail) + parseFloat(getComputedStyle(media).marginTop);
    var room = Math.floor(window.innerHeight - PIN_TOP - BOTTOM_AIR - textH);
    if (room < PHOTO_MIN) { section.classList.add('fs-nopin'); section.style.removeProperty('--fs-photo-h'); }
    else { section.classList.remove('fs-nopin'); section.style.setProperty('--fs-photo-h', Math.min(PHOTO_MAX, room) + 'px'); }
  }

  function progress() {
    var head = window.innerHeight * 0.6;
    var r = list.getBoundingClientRect();
    var tail = parseFloat(list.style.getPropertyValue('--fs-tail')) || 12;
    var top = r.top + LINE_TOP, len = Math.max(1, (r.bottom - tail) - top);
    var p = Math.max(0, Math.min(1, (head - top) / len));
    list.style.setProperty('--fs-p', p.toFixed(3));
    nums.forEach(function (n, i) {
      var nr = n.getBoundingClientRect();
      steps[i].classList.toggle('is-on', nr.top + nr.height / 2 <= head);
    });
  }

  var queued = false;
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; layout(); if (!reduced) progress(); }); } }

  if (reduced) {
    list.style.setProperty('--fs-p', 1);
    steps.forEach(function (s) { s.classList.add('is-on'); });
  } else {
    window.addEventListener('scroll', function () {
      if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; progress(); }); }
    }, { passive: true });
  }
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  layout();
  if (!reduced) progress();
})();
