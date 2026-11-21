/* 文章图片放大：点图展开、可缩放拖动、带关闭按钮 */
(function () {
  var CSS = [
    '.iz{position:fixed;inset:0;z-index:200;display:none;background:rgba(4,4,8,.95);',
    '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);}',
    '.iz.on{display:flex;align-items:center;justify-content:center}',
    '.iz-bar{position:absolute;top:16px;right:18px;display:flex;align-items:center;gap:7px;z-index:3}',
    '.iz-bar button{width:38px;height:38px;display:grid;place-items:center;background:rgba(12,12,18,.88);',
    'border:1px solid rgba(255,255,255,.16);color:#d8d8de;font:400 15px/1 system-ui,sans-serif;',
    'cursor:pointer;border-radius:4px;transition:.18s;padding:0}',
    '.iz-bar button:hover{color:#fcee0a;border-color:#fcee0a}',
    '.iz-bar button.iz-x{color:#ff8080;border-color:rgba(255,120,120,.35)}',
    '.iz-bar button.iz-x:hover{color:#ff2a3d;border-color:#ff2a3d;background:rgba(255,42,61,.12)}',
    '.iz-pct{font:400 10px "Cascadia Mono",Consolas,monospace;color:#8a8a94;letter-spacing:.08em;',
    'min-width:46px;text-align:center}',
    '.iz-img{max-width:94vw;max-height:86vh;object-fit:contain;display:block;',
    'box-shadow:0 24px 70px rgba(0,0,0,.65);cursor:grab;user-select:none;-webkit-user-drag:none}',
    '.iz-img.drag{cursor:grabbing}',
    '.iz-tip{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);',
    'font:400 9.5px "Cascadia Mono",Consolas,monospace;letter-spacing:.12em;color:#6f6f78;white-space:nowrap}'
  ].join('');

  var st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);

  var box = null, pic, pctEl, zoom = 1, tx = 0, ty = 0, rot = 0;

  function paint() {
    pic.style.transform = 'translate(' + tx + 'px,' + ty + 'px) rotate(' + rot + 'deg) scale(' + zoom + ')';
    pctEl.textContent = Math.round(zoom * 100) + '%';
  }

  function setZoom(v) {
    zoom = Math.max(0.25, Math.min(5, Math.round(v * 100) / 100));
    if (zoom <= 1) { tx = 0; ty = 0; }
    paint();
  }

  function reset() {
    zoom = 1; tx = 0; ty = 0; rot = 0;
    paint();
  }

  function build() {
    box = document.createElement('div');
    box.className = 'iz';
    box.innerHTML =
      '<div class="iz-bar">' +
        '<button data-a="out" title="缩小（-）">\u2212</button>' +
        '<span class="iz-pct">100%</span>' +
        '<button data-a="in" title="放大（+）">+</button>' +
        '<button data-a="rot" title="旋转（R）">\u21bb</button>' +
        '<button data-a="reset" title="还原（0）">\u27f2</button>' +
        '<button data-a="close" class="iz-x" title="关闭（Esc）">\u2715</button>' +
      '</div>' +
      '<img class="iz-img" alt="">' +
      '<div class="iz-tip">\u6eda\u8f6e\u7f29\u653e \u00b7 \u62d6\u52a8\u5e73\u79fb \u00b7 Esc \u5173\u95ed</div>';
    document.body.appendChild(box);
    pic = box.querySelector('.iz-img');
    pctEl = box.querySelector('.iz-pct');

    box.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button') : null;
      if (b) {
        var a = b.getAttribute('data-a');
        if (a === 'out') setZoom(zoom - 0.25);
        else if (a === 'in') setZoom(zoom + 0.25);
        else if (a === 'rot') { rot = (rot + 90) % 360; tx = 0; ty = 0; paint(); }
        else if (a === 'reset') reset();
        else close();
        return;
      }
      if (e.target === box) close();
    });

    box.addEventListener('wheel', function (e) {
      e.preventDefault();
      setZoom(zoom + (e.deltaY < 0 ? 0.25 : -0.25));
    }, { passive: false });

    pic.addEventListener('pointerdown', function (e) {
      if (zoom <= 1) return;
      e.preventDefault();
      var sx = e.clientX - tx, sy = e.clientY - ty;
      pic.classList.add('drag');
      if (pic.setPointerCapture) { try { pic.setPointerCapture(e.pointerId); } catch (err) {} }
      var move = function (ev) { tx = ev.clientX - sx; ty = ev.clientY - sy; paint(); };
      var up = function () {
        pic.classList.remove('drag');
        pic.removeEventListener('pointermove', move);
        pic.removeEventListener('pointerup', up);
        pic.removeEventListener('pointercancel', up);
      };
      pic.addEventListener('pointermove', move);
      pic.addEventListener('pointerup', up);
      pic.addEventListener('pointercancel', up);
    });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('on')) return;
      if (e.key === 'Escape') close();
      else if (e.key === '+' || e.key === '=') setZoom(zoom + 0.25);
      else if (e.key === '-' || e.key === '_') setZoom(zoom - 0.25);
      else if (e.key === 'r' || e.key === 'R') { rot = (rot + 90) % 360; paint(); }
      else if (e.key === '0') reset();
    });
  }

  function open(src, alt) {
    if (!box) build();
    pic.src = src;
    pic.alt = alt || '';
    reset();
    box.classList.add('on');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    box.classList.remove('on');
    document.body.style.overflow = '';
    pic.removeAttribute('src');
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('figure a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (!/\.(jpe?g|png|webp|gif)$/i.test(href)) return;
    e.preventDefault();
    var img = a.querySelector('img');
    open(href, img ? img.alt : '');
  });
})();
