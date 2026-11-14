/* 跨页续播：文章页没有播放器 UI，靠 sessionStorage 恢复首页的进度 */
(function () {
  var audio = document.getElementById('bgm');
  if (!audio) return;
  audio.volume = 0.45;
  var KEY = 'mb-music';

  function read() {
    try { var s = sessionStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }
  function write(o) {
    try { sessionStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {}
  }
  function save() {
    var src = audio.getAttribute('src');
    if (!src) return;
    write({ src: src, t: audio.currentTime || 0, playing: !audio.paused });
  }
  function paint() {
    var b = document.getElementById('mbgm');
    if (!b) return;
    b.hidden = false;
    b.classList.toggle('on', !audio.paused);
  }

  var st = read();
  if (st && st.src) {
    audio.src = st.src;
    audio.addEventListener('loadedmetadata', function () {
      try { audio.currentTime = st.t || 0; } catch (e) {}
      paint();
    }, { once: true });
    if (st.playing) {
      var p = audio.play();
      if (p && p.catch) p.catch(function () {});
    }
    paint();
  }

  audio.addEventListener('play', function () { paint(); save(); });
  audio.addEventListener('pause', function () { paint(); save(); });
  audio.addEventListener('timeupdate', (function () {
    var last = 0;
    return function () {
      var n = Date.now();
      if (n - last > 4000) { last = n; save(); }
    };
  })());
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', function () { if (document.hidden) save(); });

  var btn = document.getElementById('mbgm');
  if (btn) {
    btn.addEventListener('click', function () {
      if (!audio.getAttribute('src')) return;
      if (audio.paused) {
        var q = audio.play();
        if (q && q.catch) q.catch(function () {});
      } else {
        audio.pause();
      }
    });
  }
})();
