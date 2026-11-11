// Media gallery page. Data comes from window.mediaGalleryData (see _pages/media-gallery.md).
let mediaList = window.mediaGalleryData.media.map(item => ({ ...item, type: item.type || 'movie' }));
let feedbackList = window.mediaGalleryData.feedback;
const commentedIds = new Set(feedbackList.map(f => f.media_id));

const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

// Spanish title when there is one, otherwise the original
const displayTitle = item => item.title_es || item.title;

// Index letter of a title: A-Z, or 0 for numbers and symbols
const letterOf = item => {
  const first = displayTitle(item).normalize('NFD').replace(/[\u0300-\u036f]/g, '').charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : '0';
};
const INDEX_LETTERS = ['0', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

// Stand-in for the poster while TMDb data is missing
const posterPlaceholder = item =>
  `<div class="poster-placeholder"><i class="bi ${item.type === 'series' ? 'bi-tv' : 'bi-film'}"></i><span>${escapeHtml(displayTitle(item))}</span></div>`;

const currentType = () => $('input[name="mediaType"]:checked').val();
const tagsOf = item => {
  if (!item.tags) return [];
  // Handle both array and string formats
  if (Array.isArray(item.tags)) {
    return item.tags.map(t => t.trim()).filter(Boolean);
  }
  // Legacy string format: "tag1; tag2; tag3"
  return item.tags.split(';').map(t => t.trim()).filter(Boolean);
};
const hashParams = () => new URLSearchParams(location.hash.includes('=') ? location.hash.slice(1) : '');

// Items that the Type / Show / Rating / Sort / Search controls let through, before any tag is applied
function itemsInScope() {
  const mode = $('input[name="sortBy"]:checked').val() || 'year';
  return mediaList.filter(item => item.type === currentType() && (mode !== 'year' || item.year) && matchesWatched(item) && matchesFavorite(item) && matchesCommented(item) && matchesRating(item) && matchesSearch(item));
}

// Accent- and case-insensitive match on the shown title and the original one
const plain = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function matchesSearch(item) {
  const query = plain($('#mediaSearch').val().trim());
  return !query || plain(`${displayTitle(item)} ${item.title}`).includes(query);
}

const viewValue = () => $('input[name="viewMode"]:checked').val() || 'sections';

const ratingValue = () => $('#ratingFilter').val() || 'all';

function matchesRating(item) {
  const value = ratingValue();
  if (value === 'all') return true;
  return value === 'none' ? !item.rating : item.rating === value;
}

// The rating list follows the current type; a rating that type doesn't have falls back to All
function populateRatings() {
  const wanted = GalleryState.get('rating') || 'all';
  const ofType = mediaList.filter(item => item.type === currentType());
  const ratings = [...new Set(ofType.map(item => item.rating).filter(Boolean))].sort((a, b) => parseInt(a) - parseInt(b));
  const options = [['all', 'All ratings'], ...ratings.map(r => [r, r]), ...(ofType.some(item => !item.rating) ? [['none', 'No rating']] : [])];

  $('#ratingFilter').html(options.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join(''));
  const valid = options.some(([value]) => value === wanted);
  $('#ratingFilter').val(valid ? wanted : 'all');
  if (!valid) GalleryState.set('rating', null);
}

// Shared tag filter (assets/js/gallery-tags.js); created once the page is ready
let tagFilter;

// Type / Show / Group changed: the tag counts follow, then the list is redrawn
function renderGallery() {
  tagFilter.refresh();
  renderMedia();
}

function applyTypeFromHash() {
  const type = hashParams().get('type') === 'series' ? 'series' : 'movie';
  $(`input[name="mediaType"][value="${type}"]`).prop('checked', true);
}

function closeExpandedCard() {
  $('.media-item.expanded').remove();
  $('#mediaOverlay').removeClass('active');
  $('body').removeClass('modal-open');
}

// The group an item belongs to follows the sort: its year, or the first letter of its title
const groupKeyOf = (item, sort) => sort === 'year' ? String(item.year) : letterOf(item);

// Groups in sort order (years newest first, letters 0-9 then A-Z); items inside a group are by title
function buildGroups(items, sort) {
  const byKey = new Map();
  items.forEach(item => {
    const key = groupKeyOf(item, sort);
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(item);
  });

  const keys = [...byKey.keys()].sort(sort === 'year' ? (a, b) => b - a : (a, b) => INDEX_LETTERS.indexOf(a) - INDEX_LETTERS.indexOf(b));
  return keys.map(key => ({
    key,
    label: sort === 'year' || key !== '0' ? key : '0-9',
    items: byKey.get(key).slice().sort((a, b) => displayTitle(a).localeCompare(displayTitle(b)))
  }));
}

function buildItemElement(item) {
  const posterUrl = item.tmdb_poster_url
    ? `https://image.tmdb.org/t/p/w500/${item.tmdb_poster_url}`
    : '';

  const $item = $('<div class="media-item"></div>');
  const $poster = $('<div class="poster"></div>');

  if (posterUrl) {
    $poster.append(`<img src="${posterUrl}" alt="${displayTitle(item)}" loading="lazy">`);
  } else {
    $poster.append(posterPlaceholder(item));
  }

  $item.append($poster);

  // Agregar rating de edad si existe
  const ageRatingText = item.rating ? `<span style="color: #dee2e6; margin: 0 4px;">•</span><span class="age-rating-inline">${item.rating}</span>` : '';
  const favMark = item.favorite === true ? '<i class="bi bi-heart-fill fav-mark" title="Favorite"></i> ' : '';
  $item.append(`<div class="title">${favMark}${displayTitle(item)}${ageRatingText}</div>`);

  // Usar helper para construir el card
  buildMediaCard($item, item);
  return $item;
}

function renderMedia() {
  const type = currentType();
  const mode = $('input[name="sortBy"]:checked').val() || 'year';
  const typeLabel = type === 'movie' ? 'movies' : 'series';
  const selectedTags = tagFilter.selected;

  const filtered = itemsInScope().filter(item => tagFilter.matches(tagsOf(item)));

  updateFilterMessage(type, filtered.length, selectedTags);

  const groups = buildGroups(filtered, mode);

  // Sidebar index: years when sorted by year, 0-9 and A-Z when sorted by title
  $('#navbar-years').toggle(groups.length > 0);
  $('#navbar-years h5').text(mode === 'year' ? 'Years' : 'Index');
  const $nav = $('#yearsList');
  $nav.empty();
  if (mode === 'year') {
    groups.forEach(group => {
      $nav.append(`<li class="ps-0"><a href="#" data-key="${escapeHtml(group.key)}">${escapeHtml(group.label)}</a></li>`);
    });
  } else {
    const present = new Set(groups.map(group => group.key));
    INDEX_LETTERS.forEach(letter => {
      const label = letter === '0' ? '0-9' : letter;
      $nav.append(present.has(letter)
        ? `<li class="ps-0"><a href="#" data-key="${letter}">${label}</a></li>`
        : `<li class="ps-0 text-muted opacity-25">${label}</li>`);
    });
  }

  $('#mediaLoading').hide();
  const $container = $('#mediaGallery');
  $container.empty();

  if (filtered.length === 0) {
    const query = $('#mediaSearch').val().trim();
    $container.html(selectedTags.length
      ? `<p class="text-muted text-center py-5">No ${typeLabel} found tagged "${escapeHtml(selectedTags.join(' + '))}".</p>`
      : query
        ? `<p class="text-muted text-center py-5">No ${typeLabel} match "${escapeHtml(query)}".</p>`
        : '<p class="text-muted text-center py-5">No content available.</p>');
  }

  // Sections: one block per group with its header. Wall: everything in a single grid, in the same order.
  const blocks = viewValue() === 'sections'
    ? groups
    : [{ key: null, label: null, items: groups.flatMap(group => group.items) }];

  blocks.forEach(group => {
    const $group = $('<div class="year-gallery"></div>');
    if (group.key !== null) $group.attr('data-key', group.key);
    if (group.label !== null) {
      const count = group.items.length;
      const itemLabel = type === 'movie' ? (count > 1 ? 'movies' : 'movie') : 'series';
      $group.append(`<header><h2 class="year-gallery-title fw-light d-inline">${escapeHtml(group.label)}</h2><span class="year-count">${count} ${itemLabel}</span></header>`);
    }

    // The first item of each group is where the sidebar index jumps to in the wall view
    const seen = new Set();
    group.items.forEach(item => {
      const $el = buildItemElement(item);
      const key = groupKeyOf(item, mode);
      if (!seen.has(key)) {
        seen.add(key);
        $el.attr('data-anchor', key);
      }
      $group.append($el);
    });
    $container.append($group);
  });

  // Click en overlay para cerrar
  $('#mediaOverlay').off('click').on('click', function() {
    $('.media-item.expanded').remove();
    $(this).removeClass('active');
    $('body').removeClass('modal-open');

    // Quitar ID de la URL
    const currentHash = window.location.hash.substring(1);
    const params = new URLSearchParams(currentHash);
    params.delete('id');
    const newHash = params.toString();
    window.history.pushState(null, '', newHash ? `#${newHash}` : window.location.pathname);
  });
}

$(function() {
  const savedGroup = localStorage.getItem('mediaSortBy');
  if (savedGroup) $(`input[name="sortBy"][value="${savedGroup}"]`).prop('checked', true);
  const savedView = localStorage.getItem('mediaView');
  if (savedView) $(`input[name="viewMode"][value="${savedView}"]`).prop('checked', true);
  $('#mediaSearch').val(GalleryState.get('q') || '');
  applyTypeFromHash();
  populateRatings();

  tagFilter = GalleryTags.create({
    mount: '#media-tags',
    chipsMount: '#active-filters',
    getItems: () => itemsInScope().map(tagsOf),
    onChange: () => renderMedia()
  });

  renderMedia();
  checkAndOpenCardFromUrl();

  $('input[name="mediaType"]').on('change', function() {
    GalleryState.set('type', $(this).val() === 'movie' ? null : $(this).val());
    populateRatings();
    renderGallery();
  });

  $('#ratingFilter').on('change', function() {
    GalleryState.set('rating', $(this).val() === 'all' ? null : $(this).val());
    renderGallery();
  });

  $('input[name="watchedFilter"]').on('change', renderGallery);
  // Favorites and comments are alternative views of the list, so turning one on turns the other off
  $('#favoriteFilter, #commentedFilter').on('change', function() {
    if (this.checked) $('#favoriteFilter, #commentedFilter').not(this).prop('checked', false);
    renderGallery();
  });

  $('input[name="sortBy"]').on('change', function() {
    localStorage.setItem('mediaSortBy', $(this).val());
    renderGallery();
  });

  $('input[name="viewMode"]').on('change', function() {
    localStorage.setItem('mediaView', $(this).val());
    renderMedia();
  });

  let searchTimer;
  $('#mediaSearch').on('input', function() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      GalleryState.set('q', $('#mediaSearch').val().trim() || null);
      renderGallery();
    }, 150);
  });

  // Sidebar links scroll in place so an active tag filter stays in the URL
  $(document).on('click', '#yearsList a', function(e) {
    e.preventDefault();
    const key = $(this).attr('data-key');
    const target = viewValue() === 'sections'
      ? document.querySelector(`#mediaGallery .year-gallery[data-key="${key}"]`)
      : document.querySelector(`#mediaGallery .media-item[data-anchor="${key}"]`);
    target?.scrollIntoView({ behavior: 'smooth' });
  });

  // A tag on an open card adds itself to the filter
  $(document).on('click', '.tag-item', function(e) {
    e.preventDefault();
    e.stopPropagation();
    closeExpandedCard();
    GalleryState.set('id', null);
    tagFilter.select($(this).attr('data-tag'));
  });

  // Back / forward
  $(window).on('hashchange', function() {
    const params = hashParams();

    // An id but no open card: open it. No id but an open card: close it.
    if (params.has('id') && !$('.media-item.expanded').length) {
      checkAndOpenCardFromUrl();
      return;
    }
    if (!params.has('id')) closeExpandedCard();

    applyTypeFromHash();
    populateRatings();
    $('#mediaSearch').val(GalleryState.get('q') || '');
    tagFilter.syncFromHash();
    renderGallery();
  });
});

function checkAndOpenCardFromUrl() {
  const hash = window.location.hash.substring(1);
  if (!hash) return;

  const params = new URLSearchParams(hash);
  const itemId = params.get('id');

  if (!itemId) return;

  // Buscar el item en mediaList
  const item = mediaList.find(i => i.id === itemId);
  if (!item) {
    console.warn(`Item with ID ${itemId} not found`);
    return;
  }

  // Cambiar al tipo correcto (movie/series)
  $(`input[name="mediaType"][value="${item.type}"]`).prop('checked', true);
  GalleryState.set('type', item.type === 'movie' ? null : item.type);
  populateRatings();

  // Un item oculto por el filtro de rating tampoco se podría abrir
  if (!matchesRating(item)) {
    GalleryState.set('rating', null);
    populateRatings();
  }

  // Un item oculto por el filtro de watched no se podría abrir
  if (!matchesWatched(item)) $('#watchedAll').prop('checked', true);
  if (!matchesFavorite(item)) $('#favoriteFilter').prop('checked', false);
  if (!matchesCommented(item)) $('#commentedFilter').prop('checked', false);

  tagFilter.syncFromHash();
  renderGallery();

  // Esperar a que se renderice la galería y luego abrir el card
  setTimeout(() => {
    // Cerrar cualquier card abierto primero
    $('.media-item.expanded').remove();
    $('#mediaOverlay').removeClass('active');
    $('body').removeClass('modal-open');

    // Buscar el elemento en el DOM por ID exacto
    const $items = $('.media-item');
    let found = false;

    $items.each(function() {
      if (found) return false;

      const $this = $(this);
      const $cardContainer = $this.find('.card-container');

      if ($cardContainer.length) {
        // Verificar el ID comparando con el título
        const cardTitle = $cardContainer.find('.card-header-info h3').text();
        if (displayTitle(item) === cardTitle) {
          // Hacer click para abrir
          $this.find('.poster').first().trigger('click');
          found = true;
          return false;
        }
      }
    });

    if (!found) {
      console.warn(`Could not find DOM element for item ${itemId}`);
    }
  }, 200);
}

function matchesFavorite(item) {
  return !$('#favoriteFilter').is(':checked') || item.favorite === true;
}

function matchesCommented(item) {
  return !$('#commentedFilter').is(':checked') || commentedIds.has(item.id);
}

function matchesWatched(item) {
  const mode = $('input[name="watchedFilter"]:checked').val();
  if (mode === 'yes') return item.watched === true;
  if (mode === 'no') return item.watched !== true;
  return true;
}

function updateFilterMessage(type, count, tags) {
  const itemLabel = type === 'movie' ? (count > 1 ? 'movies' : 'movie') : 'series';
  const message = tags.length
    ? `Showing <strong>${count}</strong> ${itemLabel} tagged with "<strong>${escapeHtml(tags.join(' + '))}</strong>"`
    : `Showing <strong>${count}</strong> ${itemLabel}`;
  $('#filterMessageText').html(message);
}

function buildMediaCard($item, item) {
  // Código duplicado de renderGallery - construir card info
  const itemComments = feedbackList.filter(f => f.media_id === item.id);
  const avgRating = itemComments.length > 0
    ? `⭐ ${Math.round(itemComments.reduce((sum, c) => sum + c.rating, 0) / itemComments.length)}/5 (${itemComments.length} ${itemComments.length === 1 ? 'vote' : 'votes'})`
    : '<span style="color: #adb5bd; font-size: 0.875rem;">No ratings yet</span>';

  const statusBadge = getStatusBadge(item);
  const tmdbUrl = item.tmdb_id ? `https://www.themoviedb.org/${item.type === 'movie' ? 'movie' : 'tv'}/${item.tmdb_id}` : '';
  const tmdbLink = tmdbUrl ? `<a href="${tmdbUrl}" target="_blank" rel="noopener noreferrer" class="tmdb-link" title="View on TMDb"><i class="bi bi-eye"></i></a>` : '';
  const ageRating = item.rating ? `<span class="age-rating">${item.rating}</span>` : '';

  // Construir metadata con bullets
  const metaParts = [];
  if (ageRating) metaParts.push(ageRating);
  if (item.year) metaParts.push(`<span>${item.year}</span>`);
  metaParts.push(`<span class="card-rating">${avgRating}</span>`);
  if (statusBadge) metaParts.push(statusBadge);
  if (item.favorite === true) metaParts.push('<i class="bi bi-heart-fill fav-mark" title="Favorite"></i>');
  if (tmdbLink) metaParts.push(tmdbLink);
  const metaHtml = metaParts.join(' <span style="color: #adb5bd;">•</span> ');

  const tags = !item.tags ? [] : Array.isArray(item.tags) ? item.tags : item.tags.split(';').map(tag => tag.trim());
  const tagsHtml = tags.length > 0 ? `
    <div class="tags-section">
      <h6><i class="bi bi-tags"></i></h6>
      <div class="tags-container">${tags.map(tag => `<a href="#tag=${encodeURIComponent(tag)}" class="tag-item" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</a>`).join('')}</div>
    </div>
  ` : '';

  // Separar header info y comentarios
  const headerInfoHtml = `
    <div class="card-header-info">
      <h3>${displayTitle(item)}</h3>
      <div class="card-meta">
        ${metaHtml}
      </div>
    </div>
    ${tagsHtml}
  `;

  // Comments need an id, which entries still being completed don't have yet
  const commentLink = (cls, label) => item.id ? `<a href="/media-comments/?id=${item.id}" class="${cls}">${label}</a>` : '';

  const commentsHtml = `
    <div class="comments-section">
    ${itemComments.length > 0 ? `
      <div class="d-flex justify-content-between align-items-baseline mb-3">
        <h6 class="mb-0" style="font-size: 0.875rem; color: #6c757d;">Comments (${itemComments.length})</h6>
        ${commentLink('add-comment-link', '+ Add yours')}
      </div>
      ${itemComments.map(comment => {
        const date = comment.timestamp ? new Date(comment.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
        const rating = comment.rating || 0;

        // Crear estrellas llenas y vacías
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
          if (i <= rating) {
            starsHtml += '<i class="bi bi-star-fill star-filled"></i>';
          } else {
            starsHtml += '<i class="bi bi-star-fill star-empty"></i>';
          }
        }

        const ratingDisplay = `<span class="stars">${starsHtml}</span><span class="rating-text">(${rating}/5)</span>`;
        const dateSeparator = date ? '<span style="color: #adb5bd; margin: 0 4px;">•</span>' : '';

        return `
        <div class="comment-item">
          <div class="comment-meta">
            <div>
              <span class="comment-author">${escapeHtml(comment.author)}</span>${dateSeparator}${date ? `<span class="comment-date">${date}</span>` : ''}
            </div>
            <span class="comment-rating">${ratingDisplay}</span>
          </div>
          <div class="comment-text">${escapeHtml(comment.comment)}</div>
        </div>
        `;
      }).join('')}
    ` : `
      <div class="text-center py-3">
        <p class="text-muted mb-2" style="font-size: 0.875rem;">No comments yet.</p>
        ${commentLink('add-comment-link', 'Be the first to comment')}
      </div>
    `}
    </div>
  `;

  // Estructura nueva: poster, info y comentarios como hermanos
  const posterUrl = item.tmdb_poster_url
    ? `https://image.tmdb.org/t/p/w500/${item.tmdb_poster_url}`
    : '';

  const posterHtml = posterUrl
    ? `<img src="${posterUrl}" alt="${displayTitle(item)}" loading="lazy">`
    : posterPlaceholder(item);

  const $cardContainer = $(`
    <div class="card-container">
      <button class="card-close-btn" title="Close">&times;</button>
      <div class="card-poster-section">
        <div class="poster">${posterHtml}</div>
      </div>
      <div class="card-info-section">
        <div class="card-header-info">
          <h3>${displayTitle(item)}</h3>
          <div class="card-meta">
            ${metaHtml}
          </div>
        </div>
        ${tagsHtml}
      </div>
      <div class="card-comments-section">
        ${commentsHtml}
      </div>
    </div>
  `);

  $item.append($cardContainer);

  // Click en poster para expandir
  $item.find('.poster').on('click', function(e) {
    e.stopPropagation();

    // Cerrar cualquier card existente primero
    $('.media-item.expanded').remove();

    const $clone = $item.clone(true);
    $clone.addClass('expanded');
    $('body').append($clone);
    $('#mediaOverlay').addClass('active');
    $('body').addClass('modal-open');

    // Agregar ID a la URL (entries without an id yet have no link)
    if (item.id) {
      const currentHash = window.location.hash.substring(1);
      const params = new URLSearchParams(currentHash);
      params.set('id', item.id);
      window.history.pushState(null, '', `#${params.toString()}`);
    }

    $clone.find('.poster').off('click');

    $clone.find('.card-close-btn').on('click', function(e) {
      e.stopPropagation();
      $clone.remove();
      $('#mediaOverlay').removeClass('active');
      $('body').removeClass('modal-open');

      // Quitar ID de la URL
      const currentHash = window.location.hash.substring(1);
      const params = new URLSearchParams(currentHash);
      params.delete('id');
      const newHash = params.toString();
      window.history.pushState(null, '', newHash ? `#${newHash}` : window.location.pathname);
    });
  });
}

function getStatusBadge(item) {
  if (item.watched === true) return '<span class="badge bg-success">Watched</span>';
  if (item.status === 'watching') return '<span class="badge bg-primary">Watching</span>';
  return '<span class="badge bg-secondary">Yet to see</span>';
}
