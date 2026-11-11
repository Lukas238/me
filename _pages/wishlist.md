---
layout: base
title: Wishlist
permalink: /wishlist/
---

<h1>Wishlist</h1>
<p class="lead">My ever-growing list of wants and desires. Browse at your own risk!</p>
<p class="wishlist-summary" id="wishlist-summary"></p>

<div class="gallery-controls">
  <div class="gallery-control">
    <span class="gallery-control__label">Sort by</span>
    <div class="btn-group btn-group-sm" role="group" aria-label="Sort by">
      <input type="radio" class="btn-check" name="wishlistSort" id="wishlistSortAdded" value="added" autocomplete="off" checked>
      <label class="btn btn-outline-secondary" for="wishlistSortAdded" title="Sort by date added" aria-label="Sort by date added"><i class="bi bi-clock-history"></i></label>
      <input type="radio" class="btn-check" name="wishlistSort" id="wishlistSortTitle" value="title" autocomplete="off">
      <label class="btn btn-outline-secondary" for="wishlistSortTitle" title="Sort by title" aria-label="Sort by title"><i class="bi bi-sort-alpha-down"></i></label>
    </div>
  </div>
  <div class="gallery-control">
    <span class="gallery-control__label">Tags</span>
    <button class="btn btn-sm btn-outline-secondary" type="button" title="Browse tags" aria-label="Browse tags" data-bs-toggle="collapse" data-bs-target="#wishlist-tags-panel" aria-expanded="false" aria-controls="wishlist-tags-panel"><i class="bi bi-tags"></i></button>
  </div>
</div>

<div id="active-filters"></div>

<div class="collapse" id="wishlist-tags-panel">
  <div id="wishlist-tags"></div>
</div>

<div id="wishlist-container">
  <div id="wishlist-container__list">  
    <div class="spinner-wrapper">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>
  </div>
</div>


<!-- Template for the product card -->
<script id="product-card-template" type="text/template">
    <div class="wishlist-item">
        <a href="@@link@@" target="_blank" rel="noopener" class="wishlist-item__link">
            @@image@@
            <h3 class="wishlist-item__title">@@title@@</h3>
        </a>
        <div class="wishlist-item__meta">
            <ul>
                @@metaItems@@
            </ul>
        </div>
        @@tags@@
    </div>
</script>



<script src="{{ '/assets/js/gallery-tags.js' | relative_url }}"></script>

<script>
  // Items live in _data/wishlist/, one file each, embedded at build time
  const wishlistItems = Object.values({{ site.data.wishlist | jsonify }} || {});

  const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const safeUrl = u => /^https?:\/\//i.test(u || '') ? escapeHtml(u) : '';

  // YYYY-MM-DD is read as local time so the day doesn't shift with the timezone
  function parseDate(dateString) {
    const m = String(dateString || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m === null) return null;
    return new Date(+m[1], +m[2] - 1, +m[3]).getTime();
  }

  function formatDate(dateString) {
    const time = parseDate(dateString);
    if (time === null) return null;
    return new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function processWishlistData() {
    return wishlistItems
      .filter(product => product.received !== true)
      .map(product => ({
        title: escapeHtml(product.title),
        link: safeUrl(product.product_url),
        img: safeUrl(product.image_url),
        description: product.notes || '',
        date_added: product.date_added || null,
        tags: (Array.isArray(product.tags) ? product.tags : []).map(t => String(t).trim()).filter(Boolean)
      }));
  }

  // Sort order and the tag filter both live in the URL hash: #tag=garden,tools&sort=title
  const readSort = () => GalleryState.get('sort') === 'title' ? 'title' : 'added';

  const tagFilter = GalleryTags.create({
    mount: '#wishlist-tags',
    chipsMount: '#active-filters',
    getItems: () => processWishlistData().map(product => product.tags),
    onChange: () => renderProductList()
  });

  function buildCard(product, template) {
    const hasNotes = product.description && product.description.trim() !== '';

    const imageHtml = product.img
      ? `<div class="wishlist-item__image-wrapper"><img src="${product.img}" alt="${product.title}" class="wishlist-item__image" loading="lazy"></div>`
      : `<div class="wishlist-item__no-image">No image</div>`;

    let metaItems = '';
    const formattedDate = formatDate(product.date_added);
    if (formattedDate) {
      metaItems += `<li class="date-added">${formattedDate}</li>`;
    }

    if (hasNotes) {
      metaItems += `<li class="info-button-container"><button class="wishlist-item__info-button" data-bs-toggle="popover" data-bs-trigger="click" data-bs-placement="top" data-bs-content="${escapeHtml(product.description)}" data-bs-html="false" tabindex="0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg></button></li>`;
    }

    const tagsHtml = product.tags.length
      ? `<div class="wishlist-item__tags">${product.tags.map(t => `<button type="button" class="wishlist-item__tag" data-add-tag="${escapeHtml(t)}">${escapeHtml(t)}</button>`).join('')}</div>`
      : '';

    // Replacement callbacks avoid "$&"-style patterns in titles being interpreted
    return template
      .replace('@@title@@', () => product.title || 'Untitled')
      .replace('@@image@@', () => imageHtml)
      .replace('@@metaItems@@', () => metaItems)
      .replace('@@tags@@', () => tagsHtml)
      .replace(/@@link@@/g, () => product.link || '#');
  }

  function renderProductList() {
    const wishlistContainer = document.getElementById('wishlist-container__list');
    if (!wishlistContainer) {
      console.error("Element with ID 'wishlist-container__list' not found.");
      return;
    }

    try {
      const products = processWishlistData();
      const sort = readSort();

      // Added: newest first, items without a date last. Title: alphabetical.
      products.sort((a, b) => {
        if (sort === 'title') return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        const dateA = parseDate(a.date_added);
        const dateB = parseDate(b.date_added);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB - dateA;
      });

      const visible = products.filter(p => tagFilter.matches(p.tags));

      const summaryEl = document.getElementById('wishlist-summary');
      if (summaryEl) {
        const lastUpdate = products.find(p => p.date_added)?.date_added;
        let summaryText = `${visible.length} item${visible.length !== 1 ? 's' : ''}`;
        if (tagFilter.selected.length) summaryText += ` tagged "${tagFilter.selected.join(' + ')}"`;
        const formattedDate = lastUpdate && formatDate(lastUpdate);
        if (formattedDate) summaryText += ` - Last update: ${formattedDate}`;
        summaryEl.textContent = summaryText;
      }

      const template = document.getElementById('product-card-template').textContent;
      const cards = items => items.map(p => buildCard(p, template)).join('');

      document.querySelector(`input[name="wishlistSort"][value="${sort}"]`).checked = true;
      if (visible.length === 0) {
        wishlistContainer.innerHTML = '<p>No items found.</p>';
      } else {
        wishlistContainer.innerHTML = cards(visible);
      }

      // Handle image loading
      wishlistContainer.querySelectorAll('.wishlist-item__image').forEach(img => {
        const wrapper = img.closest('.wishlist-item__image-wrapper');

        if (img.complete) {
          img.classList.add('loaded');
          if (wrapper) wrapper.classList.add('loaded');
        } else {
          img.addEventListener('load', () => {
            img.classList.add('loaded');
            if (wrapper) wrapper.classList.add('loaded');
          });
          img.addEventListener('error', () => {
            if (wrapper) wrapper.classList.add('loaded');
          });
        }
      });

      // Popovers are attached to <body>, so clear leftovers from the previous render
      document.querySelectorAll('.popover').forEach(el => el.remove());
      wishlistContainer.querySelectorAll('[data-bs-toggle="popover"]').forEach(popoverTriggerEl => {
        // Prevent click propagation to parent link
        popoverTriggerEl.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });

        new bootstrap.Popover(popoverTriggerEl, {
          container: 'body',
          trigger: 'focus'
        });
      });

    } catch (error) {
      console.error('Error rendering product list:', error);
      wishlistContainer.innerHTML = `<p>Error loading wishlist. Check the console for details.</p>`;
    }
  }

  document.querySelectorAll('input[name="wishlistSort"]').forEach(radio => {
    radio.addEventListener('change', () => {
      GalleryState.set('sort', radio.value === 'added' ? null : radio.value);
      renderProductList();
    });
  });

  // A tag on a card adds itself to the filter
  document.getElementById('wishlist-container').addEventListener('click', (e) => {
    const tag = e.target.closest('[data-add-tag]');
    if (tag) tagFilter.select(tag.dataset.addTag);
  });

  window.addEventListener('hashchange', () => {
    tagFilter.syncFromHash();
    renderProductList();
  });
  renderProductList();
</script>
