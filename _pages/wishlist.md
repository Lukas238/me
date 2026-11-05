---
layout: base
title: Wishlist
permalink: /wishlist/
---

<h1>Wishlist</h1>
<p class="lead">My ever-growing list of wants and desires. Browse at your own risk!</p>
<p class="wishlist-summary" id="wishlist-summary"></p>

<div id="wishlist-tags" class="wishlist-tags" hidden></div>

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



<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<script>
  // Items live in _data/wishlist.json, embedded at build time
  const wishlistItems = {{ site.data.wishlist | jsonify }} || [];

  const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const safeUrl = u => /^https?:\/\//i.test(u || '') ? escapeHtml(u) : '';
  const tagKey = tag => tag.toLowerCase();

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

  // View state lives in the URL hash so it can be shared: #tag=garden&group=1
  function readState() {
    const params = new URLSearchParams(location.hash.slice(1));
    return { tag: params.get('tag') || '', group: params.get('group') === '1' };
  }

  function stateHref(state) {
    const params = new URLSearchParams();
    if (state.tag) params.set('tag', state.tag);
    if (state.group) params.set('group', '1');
    return '#' + params.toString();
  }

  // Unique tags (case-insensitive) with counts: most used first, then alphabetical
  function buildTagIndex(products) {
    const index = new Map();
    products.forEach(product => {
      new Set(product.tags.map(tagKey)).forEach(key => {
        const name = product.tags.find(t => tagKey(t) === key);
        const entry = index.get(key) || { key, name, count: 0 };
        entry.count++;
        index.set(key, entry);
      });
    });
    return [...index.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }

  function renderTagBar(tagIndex, total, state) {
    const bar = document.getElementById('wishlist-tags');
    bar.hidden = tagIndex.length === 0;
    if (tagIndex.length === 0) return;

    const chip = (label, count, href, active, extraClass = '') =>
      `<a href="${href}" class="wishlist-tag ${extraClass} ${active ? 'is-active' : ''}">${escapeHtml(label)}${count === null ? '' : ` <span>${count}</span>`}</a>`;

    bar.innerHTML =
      chip('All', total, stateHref({ tag: '', group: state.group }), state.tag === '') +
      tagIndex.map(t => chip(t.name, t.count, stateHref({ tag: t.name, group: state.group }), tagKey(state.tag) === t.key)).join('') +
      chip('Group by tag', null, stateHref({ tag: state.tag, group: !state.group }), state.group, 'wishlist-tag--toggle');
  }

  function buildCard(product, template, state) {
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
      ? `<div class="wishlist-item__tags">${product.tags.map(t => `<a href="${stateHref({ tag: t, group: state.group })}" class="wishlist-item__tag">${escapeHtml(t)}</a>`).join('')}</div>`
      : '';

    // Replacement callbacks avoid "$&"-style patterns in titles being interpreted
    return template
      .replace('@@title@@', () => product.title || 'Untitled')
      .replace('@@image@@', () => imageHtml)
      .replace('@@metaItems@@', () => metaItems)
      .replace('@@tags@@', () => tagsHtml)
      .replace(/@@link@@/g, () => product.link || '#');
  }

  // Groups to render: one per tag (an item shows under each of its tags), plus untagged
  function buildGroups(visible, tagIndex, state) {
    if (state.tag) {
      return [{ name: state.tag, items: visible }];
    }
    const groups = tagIndex.map(t => ({
      name: t.name,
      items: visible.filter(p => p.tags.some(x => tagKey(x) === t.key))
    }));
    const untagged = visible.filter(p => p.tags.length === 0);
    if (untagged.length) groups.push({ name: 'Untagged', items: untagged });
    return groups;
  }

  function renderProductList() {
    const wishlistContainer = document.getElementById('wishlist-container__list');
    if (!wishlistContainer) {
      console.error("Element with ID 'wishlist-container__list' not found.");
      return;
    }

    try {
      const products = processWishlistData();
      const state = readState();

      // Newest first; items without a date go last
      products.sort((a, b) => {
        const dateA = parseDate(a.date_added);
        const dateB = parseDate(b.date_added);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB - dateA;
      });

      const tagIndex = buildTagIndex(products);
      renderTagBar(tagIndex, products.length, state);

      const visible = state.tag
        ? products.filter(p => p.tags.some(t => tagKey(t) === tagKey(state.tag)))
        : products;

      const summaryEl = document.getElementById('wishlist-summary');
      if (summaryEl) {
        const lastUpdate = products.find(p => p.date_added)?.date_added;
        let summaryText = `${visible.length} item${visible.length !== 1 ? 's' : ''}`;
        if (state.tag) summaryText += ` tagged "${state.tag}"`;
        const formattedDate = lastUpdate && formatDate(lastUpdate);
        if (formattedDate) summaryText += ` - Last update: ${formattedDate}`;
        summaryEl.textContent = summaryText;
      }

      const template = document.getElementById('product-card-template').textContent;
      const cards = items => items.map(p => buildCard(p, template, state)).join('');

      wishlistContainer.classList.toggle('is-grouped', state.group);
      if (visible.length === 0) {
        wishlistContainer.innerHTML = '<p>No items found.</p>';
      } else if (state.group) {
        wishlistContainer.innerHTML = buildGroups(visible, tagIndex, state).map(group =>
          `<section class="wishlist-group"><h2 class="wishlist-group__title">${escapeHtml(group.name)} <small>${group.items.length}</small></h2><div class="wishlist-list">${cards(group.items)}</div></section>`
        ).join('');
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

  window.addEventListener('hashchange', renderProductList);
  renderProductList();
</script>
