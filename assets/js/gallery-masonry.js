/*
 * Compact "masonry" for a CSS grid whose items have different heights, without a library.
 * Each item gets a row span equal to its own height, so the next item slides up into the gap.
 * Rows are `row` px tall (not 1px): browsers cap a grid at ~10,000 lines, and past that items pile up
 * on the last line.
 *
 *   const masonry = GalleryMasonry.create({
 *     container: '#grid',                 // the grid element
 *     getItems: () => [...elements],      // grid items (hidden ones are skipped by the grid)
 *     gap: 15,                            // px between items, rows and columns
 *     row: 8                              // px per grid row; the gap between items is gap to gap + row
 *   });
 *   masonry.enable()  masonry.disable()
 */
(function () {
  function create(options) {
    const container = typeof options.container === 'string' ? document.querySelector(options.container) : options.container;
    const gap = options.gap ?? 15;
    const row = options.row ?? 8;

    // Items are re-measured whenever their size changes (images loading, details hidden, filter applied, resize)
    const observer = new ResizeObserver(entries => entries.forEach(entry => place(entry.target)));

    function place(item) {
      const height = item.getBoundingClientRect().height;
      item.style.gridRowEnd = height ? 'span ' + Math.ceil((height + gap) / row) : '';
    }

    return {
      enable() {
        container.classList.add('is-masonry');
        container.style.gridAutoRows = row + 'px';
        options.getItems().forEach(item => {
          item.style.alignSelf = 'start';
          observer.observe(item);
          place(item);
        });
      },
      disable() {
        observer.disconnect();
        container.classList.remove('is-masonry');
        container.style.gridAutoRows = '';
        options.getItems().forEach(item => {
          item.style.alignSelf = '';
          item.style.gridRowEnd = '';
        });
      }
    };
  }

  window.GalleryMasonry = { create };
})();
