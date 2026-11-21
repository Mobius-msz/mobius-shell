/* 文章阅读计数：用 abacus 免费计数器，每篇一个 key */
(function () {
  var el = document.getElementById('pv');
  if (!el) return;

  var NS = 'mobius-wang';
  var slug = el.getAttribute('data-slug') || location.pathname.replace(/^.*\//, '').replace(/\.html?$/, '');
  if (!slug) slug = 'home';

  var seen = sessionStorage.getItem('pv-' + slug) === '1';
  var url = 'https://abacus.jasoncameron.dev/' + (seen ? 'get' : 'hit') + '/' + NS + '/' + encodeURIComponent(slug);

  var paint = function (n) {
    if (typeof n !== 'number' || !isFinite(n)) return;
    el.textContent = '\u9605\u8bfb ' + n.toLocaleString('en-US');
    el.hidden = false;
  };

  fetch(url, { cache: 'no-store' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d && typeof d.value === 'number') {
        paint(d.value);
        sessionStorage.setItem('pv-' + slug, '1');
      }
    })
    .catch(function () {
      // 计数器不可用时就不显示，别留个「—」
      el.hidden = true;
    });
})();
