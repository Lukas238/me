// Backgrounds page: view (sections by year or one masonry wall), sidebar jumps and the Fancybox viewer.
(function () {
  const gallery = document.getElementById('bg-gallery');
  const thumbs = Array.from(gallery.querySelectorAll('.bg-thumb'));
  const masonry = GalleryMasonry.create({ container: gallery.querySelector('.bg-years'), getItems: () => thumbs });
  const isWall = () => gallery.classList.contains('is-flat');

  const apply = (mode) => {
    gallery.classList.toggle('is-flat', mode === 'wall');
    if (mode === 'wall') masonry.enable(); else masonry.disable();
  };

  const saved = localStorage.getItem('bgView');
  if (saved) {
    const radio = document.querySelector(`input[name="viewMode"][value="${saved}"]`);
    if (radio) radio.checked = true;
  }
  apply(document.querySelector('input[name="viewMode"]:checked').value);

  document.querySelectorAll('input[name="viewMode"]').forEach(radio => {
    radio.addEventListener('change', () => {
      localStorage.setItem('bgView', radio.value);
      apply(radio.value);
    });
  });

  // In the wall there are no year sections to scroll to, so a year jumps to its first background
  document.getElementById('navbar-years').addEventListener('click', (e) => {
    const link = e.target.closest('a');
    const year = link && document.querySelector(link.hash);
    if (!year) return;
    e.preventDefault();
    const target = isWall() ? year.querySelector('.bg-thumb') : year;
    target?.scrollIntoView({ behavior: 'smooth', block: isWall() ? 'center' : 'start' });
  });
})();

Fancybox.bind("[data-fancybox]", {
  Carousel: {
    Toolbar: {
      display: {
        left: ["counter"],
        middle: [],
        right: ["zoom", "play", "download", "thumbs", "close"],
      },
    },
  },
  on: {
    "Carousel.ready Carousel.change": (fancyboxRef, eventName) => {
      // Tile backgrounds are shown repeated, centered
      const slide = Fancybox.getSlide();
      const src = slide.src;
      const filename = src.split('/').pop().toLowerCase();
      if (filename.includes("_tile")) {
        slide.el.style.backgroundImage = `url(${src})`;
        slide.el.style.backgroundRepeat = 'repeat';
        slide.el.style.backgroundSize = 'auto';
        slide.el.style.backgroundPosition = 'center';
      }
    },
  },
});
