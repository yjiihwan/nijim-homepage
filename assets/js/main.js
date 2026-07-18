// 니짐내짐 홈페이지 — 진입 애니메이션 (스크롤 reveal, 순차 stagger)
(function () {
  var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      // 같은 그룹(data-stagger 부모) 내 순서에 따라 지연
      var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
      setTimeout(function () { el.classList.add('is-in'); }, delay);
      io.unobserve(el);
    });
  }, { threshold: 0.15 });

  els.forEach(function (el) { io.observe(el); });
})();
