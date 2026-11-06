/*
 * Compact "masonry" for a CSS grid whose items have different heights, without a library.
 * Each item gets a row span equal to its own height, so the next item slides up into the gap.
 *
 *   const masonry = GalleryMasonry.create({
 *     container: '#grid',                 // the grid element
 *     getItems: () => [...elements],      // grid items (hidden ones are skipped by the grid)
 *     gap: 15                             // px between items, rows and columns
 *   });
 *   masonry.enable()  masonry.disable()
 */
(function () {
  function create(options) {
    const container = typeof options.container === 'string' ? document.querySelector(options.container) : options.container;
    const gap = options.gap ?? 15;

    // Items are re-measured whenever their size changes (images loading, details hidden, filter applied, resize)
    const observer = new ResizeObserver(entries => entries.forEach(entry => place(entry.target)));

    function place(item) {
      const height = item.getBoundingClientRect().height;
      item.style.gridRowEnd = height ? 'span ' + (Math.ceil(height) + gap) : '';
    }

    return {
      enable() {
        container.classList.add('is-masonry');
        options.getItems().forEach(item => {
          item.style.alignSelf = 'start';
          observer.observe(item);
          place(item);
        });
      },
      disable() {
        observer.disconnect();
        container.classList.remove('is-masonry');
        options.getItems().forEach(item => {
          item.style.alignSelf = '';
          item.style.gridRowEnd = '';
        });
      }
    };
  }

  window.GalleryMasonry = { create };
})();
