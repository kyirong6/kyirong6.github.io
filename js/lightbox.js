document.addEventListener('DOMContentLoaded', function () {
  var items = [];
  var currentIndex = 0;
  var overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML =
    '<button class="lightbox-close">&times;</button>' +
    '<button class="lightbox-prev">&lsaquo;</button>' +
    '<button class="lightbox-next">&rsaquo;</button>' +
    '<div class="lightbox-content">' +
      '<img class="lightbox-img" src="" alt="">' +
      '<p class="lightbox-caption"></p>' +
    '</div>';
  document.body.appendChild(overlay);

  var img = overlay.querySelector('.lightbox-img');
  var caption = overlay.querySelector('.lightbox-caption');

  function show(index) {
    if (index < 0 || index >= items.length) return;
    currentIndex = index;
    img.src = items[index].src;
    img.alt = items[index].alt;
    caption.textContent = items[index].caption || '';
    caption.style.display = items[index].caption ? '' : 'none';
    overlay.classList.add('active');
  }

  function hide() {
    overlay.classList.remove('active');
  }

  function collectItems(container) {
    items = [];
    container.querySelectorAll('.photo-item').forEach(function (el) {
      items.push({
        src: el.href,
        alt: el.querySelector('img').alt,
        caption: el.dataset.caption || ''
      });
    });
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('.photo-item');
    if (link) {
      e.preventDefault();
      collectItems(link.closest('.photo-grid'));
      var idx = Array.prototype.indexOf.call(
        link.closest('.photo-grid').querySelectorAll('.photo-item'), link
      );
      show(idx);
    }
  });

  overlay.querySelector('.lightbox-close').addEventListener('click', hide);
  overlay.querySelector('.lightbox-prev').addEventListener('click', function () { show(currentIndex - 1); });
  overlay.querySelector('.lightbox-next').addEventListener('click', function () { show(currentIndex + 1); });
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) hide();
  });

  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') hide();
    if (e.key === 'ArrowLeft') show(currentIndex - 1);
    if (e.key === 'ArrowRight') show(currentIndex + 1);
  });
});
