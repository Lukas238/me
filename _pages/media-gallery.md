---
layout: base
permalink: /media-gallery/
title: Media Gallery
---

<!-- Bootstrap 5 -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

<style>
  .year-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
    position: relative;
  }

  .year-gallery header {
    grid-column: 1 / -1;
    width: 100%;
    margin: 30px 0 20px 0;
    font-size: 1.5rem;
    color: #495057;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 8px;
  }

  .media-item {
    text-align: center;
    position: relative;
    transition: all 0.3s ease;
  }

  .media-item .poster {
    width: 100%;
    aspect-ratio: 2/3;
    background-color: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
    transition: transform 0.2s ease;
    cursor: pointer;
  }

  .media-item .poster:hover {
    transform: translateY(-2px);
  }

  .media-item .poster img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Entries without a poster yet (only title + year) */
  .poster-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px;
    color: #adb5bd;
    font-size: 0.8rem;
    line-height: 1.3;
    overflow: hidden;
  }

  .poster-placeholder i {
    font-size: 2.2rem;
  }

  .media-item .title {
    margin-top: 8px;
    font-size: 0.875rem;
    color: #495057;
    line-height: 1.3;
  }

  .media-item .title .age-rating-inline {
    color: #adb5bd;
    font-size: 0.75rem;
    margin-left: 4px;
  }

  /* Ocultar card-container en vista normal */
  .media-item .card-container {
    display: none;
  }

  /* Card expandido - Desktop */
  .media-item.expanded {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    z-index: 1051;
    width: auto;
    max-width: 90vw;
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    text-align: left;
  }

  .media-item.expanded .poster {
    display: none;
  }

  .media-item.expanded .title {
    display: none;
  }

  .media-item.expanded .card-container {
    display: grid;
    grid-template-columns: 350px 400px;
    grid-template-rows: auto 1fr;
    height: 525px;
  }

  .media-item.expanded .card-poster-section {
    grid-column: 1;
    grid-row: 1 / 3;
    width: 350px;
    height: 525px;
  }

  .media-item.expanded .card-poster-section .poster {
    width: 100%;
    height: 100%;
    border-radius: 8px 0 0 8px;
    cursor: default;
    display: block;
    margin: 0 auto;
  }

  .media-item.expanded .card-poster-section .poster:hover {
    transform: none;
  }

  .media-item.expanded .card-poster-section .poster img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .media-item.expanded .card-info-section {
    grid-column: 2;
    grid-row: 1;
    padding: 24px 24px 0 24px;
  }

  .media-item.expanded .card-comments-section {
    grid-column: 2;
    grid-row: 2;
    padding: 0 24px 24px 24px;
    overflow-y: auto;
  }

  .media-item.expanded .card-comments-section::-webkit-scrollbar {
    width: 6px;
  }

  .media-item.expanded .card-comments-section::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .media-item.expanded .card-comments-section::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  .media-item.expanded .card-comments-section::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  .card-close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    border: none;
    background: #f8f9fa;
    border-radius: 50%;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    color: #495057;
    font-size: 1.25rem;
    line-height: 1;
    transition: all 0.2s ease;
    z-index: 10;
  }

  .media-item.expanded .card-close-btn {
    display: flex;
  }

  .card-close-btn:hover {
    background: #e9ecef;
    color: #212529;
  }

  .card-info-section {
    display: none;
  }

  .media-item.expanded .card-info-section {
    display: block;
  }

  .card-header-info {
    padding-right: 40px;
    padding-bottom: 8px;
  }

  .card-header-info h3 {
    font-size: 1.25rem;
    color: #212529;
    margin-bottom: 8px;
    font-weight: 600;
  }

  .card-comments-section {
    display: none;
  }

  .media-item.expanded .card-comments-section {
    display: block;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
    font-size: 0.875rem;
    color: #6c757d;
  }

  .card-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #495057;
  }

  .tmdb-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background-color: #f8f9fa;
    border-radius: 4px;
    color: #6c757d;
    text-decoration: none;
    font-size: 0.75rem;
    transition: all 0.2s ease;
  }

  .tmdb-link:hover {
    background-color: #e9ecef;
    color: #495057;
  }

  .add-comment-link {
    font-size: 0.75rem;
    color: #6c757d;
    text-decoration: underline;
    display: inline-block;
    transition: color 0.2s ease;
  }

  .add-comment-link:hover {
    color: #495057;
    text-decoration: underline;
  }

  .age-rating {
    display: inline-block;
    padding: 2px 6px;
    background-color: #f8f9fa;
    border-radius: 3px;
    font-size: 0.75rem;
    font-weight: 500;
    color: #6c757d;
  }

  .tags-section {
    padding-top: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f1f1f1;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tags-section h6 {
    font-size: 0.7rem;
    color: #adb5bd;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0;
    flex-shrink: 0;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }

  .tag-item {
    display: inline-block;
    padding: 1px 5px;
    background-color: #e9ecef;
    border-radius: 2px;
    font-size: 0.65rem;
    color: #6c757d;
    line-height: 1.4;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .tag-item:hover {
    background-color: #dee2e6;
    color: #495057;
    text-decoration: none;
  }

  .comments-section {
    padding-top: 12px;
  }

  .comment-item {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f1f1f1;
  }

  .comment-item:last-child {
    border-bottom: none;
  }

  .comment-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .comment-author {
    font-weight: 600;
    font-size: 0.875rem;
    color: #495057;
  }

  .comment-date {
    font-size: 0.75rem;
    color: #adb5bd;
    font-weight: normal;
  }

  .comment-rating {
    color: #ffc107;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .comment-rating .stars {
    display: flex;
    gap: 1px;
    line-height: 1;
  }

  .comment-rating .star-filled {
    color: #ffc107;
  }

  .comment-rating .star-empty {
    color: #dee2e6;
  }

  .comment-rating .rating-text {
    color: #6c757d;
    font-size: 0.75rem;
    margin-left: 2px;
  }

  .comment-text {
    font-size: 0.875rem;
    color: #6c757d;
    line-height: 1.5;
  }

  /* Overlay */
  .media-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1050;
    cursor: pointer;
    overflow: hidden;
  }

  .media-overlay.active {
    display: block;
  }

  body.modal-open {
    overflow: hidden;
  }

  .loading {
    text-align: center;
    padding: 60px 20px;
    color: #6c757d;
  }

  .year-count {
    font-size: 0.9rem;
    color: #6c757d;
    font-weight: normal;
    margin-left: 10px;
  }

  #navbar-years a.active {
    font-weight: bold;
    text-decoration: none;
  }

  .filter-active-message {
    font-size: 0.8rem;
    color: #6c757d;
    margin-bottom: 0;
    margin-top: 16px;
    padding: 12px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .filter-active-message .message-text {
    flex: 1;
  }

  .filter-active-message .icon {
    margin-right: 6px;
    color: #adb5bd;
  }

  /* Pantalla completa con 1 columna - cuando el ancho es pequeño O el alto es menor a 525px */
  @media (max-width: 768px), (max-height: 525px) {
    .media-item.expanded {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      transform: none !important;
      width: 100vw;
      height: 100vh;
      max-width: 100vw;
      border-radius: 0;
    }

    .media-item.expanded .card-container {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: auto;
      height: 100vh;
      overflow-y: auto;
      padding: 60px 20px 20px 20px;
      justify-items: center;
      align-content: start;
    }

    .media-item.expanded .card-close-btn {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 100;
      width: 40px;
      height: 40px;
      font-size: 1.5rem;
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    /* Orden con grid-row: info, poster, comentarios */
    .media-item.expanded .card-info-section {
      grid-row: 1;
      grid-column: 1;
      width: 100%;
      max-width: 425px;
      padding: 0;
    }

    .media-item.expanded .card-poster-section {
      grid-row: 2;
      grid-column: 1;
      width: 100%;
      max-width: 350px;
      height: auto;
      margin: 20px 0;
    }

    .media-item.expanded .card-poster-section .poster {
      width: 100%;
      height: auto;
      aspect-ratio: 2/3;
      border-radius: 8px;
    }

    .media-item.expanded .card-comments-section {
      grid-row: 3;
      grid-column: 1;
      width: 100%;
      max-width: 425px;
      padding: 0;
      overflow-y: visible;
    }

    .comments-section {
      min-height: 200px;
    }

    .year-gallery {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 15px;
    }

    body.modal-open {
      overflow: hidden;
    }

    .media-overlay {
      display: none !important;
    }
  }

  @media (max-width: 480px) {
    .year-gallery {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 12px;
    }

    .media-item.expanded .poster {
      max-width: 300px;
    }

    .card-header-info h3 {
      font-size: 1.1rem;
    }

    .card-meta {
      font-size: 0.8rem;
    }
  }
</style>

<h1 class="mb-2">Media Gallery</h1>
<p class="mb-4">Our collection of movies and series to watch together, organized your way.</p>

<div class="media-overlay" id="mediaOverlay"></div>

<div class="container-xxl d-flex">
  <div class="flex-grow-1">
    <div class="gallery-controls">
      <div class="gallery-control">
        <span class="gallery-control__label">Type</span>
        <div class="btn-group btn-group-sm" role="group" aria-label="Media type selector">
          <input type="radio" class="btn-check" name="mediaType" id="typeMovies" value="movie" autocomplete="off" checked>
          <label class="btn btn-outline-secondary" for="typeMovies">Movies</label>
          <input type="radio" class="btn-check" name="mediaType" id="typeSeries" value="series" autocomplete="off">
          <label class="btn btn-outline-secondary" for="typeSeries">Series</label>
        </div>
      </div>
      <div class="gallery-control">
        <span class="gallery-control__label">Show</span>
        <div class="btn-group btn-group-sm" role="group" aria-label="Watched filter">
          <input type="radio" class="btn-check" name="watchedFilter" id="watchedAll" value="all" autocomplete="off" checked>
          <label class="btn btn-outline-secondary" for="watchedAll">All</label>
          <input type="radio" class="btn-check" name="watchedFilter" id="watchedYes" value="yes" autocomplete="off">
          <label class="btn btn-outline-secondary" for="watchedYes">Watched</label>
          <input type="radio" class="btn-check" name="watchedFilter" id="watchedNo" value="no" autocomplete="off">
          <label class="btn btn-outline-secondary" for="watchedNo">To watch</label>
        </div>
      </div>
      <div class="gallery-control">
        <span class="gallery-control__label">Rating</span>
        <select class="form-select form-select-sm" id="ratingFilter" aria-label="Age rating"></select>
      </div>
      <div class="gallery-control">
        <span class="gallery-control__label">Sort by</span>
        <div class="btn-group btn-group-sm" role="group" aria-label="Sort by">
          <input type="radio" class="btn-check" name="sortBy" id="sortYear" value="year" autocomplete="off" checked>
          <label class="btn btn-outline-secondary" for="sortYear">Year</label>
          <input type="radio" class="btn-check" name="sortBy" id="sortTitle" value="title" autocomplete="off">
          <label class="btn btn-outline-secondary" for="sortTitle">Title</label>
        </div>
      </div>
      <div class="gallery-control">
        <span class="gallery-control__label">Tags</span>
        <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#tags-panel" aria-expanded="false" aria-controls="tags-panel">
          Browse <i class="bi bi-chevron-down"></i>
        </button>
      </div>
    </div>

    <div id="active-filters"></div>

    <div class="collapse" id="tags-panel">
      <div id="media-tags"></div>
    </div>

    <div class="filter-active-message" id="filterActiveMessage">
      <div class="message-text">
        <span class="icon">›</span>
        <span id="filterMessageText">Loading...</span>
      </div>
    </div>

    <div class="loading" id="mediaLoading">Loading...</div>
    <div id="mediaGallery"></div>
  </div>

  <aside class="py-4 order-2 ps-4 pt-4">
    <nav id="navbar-years" class="sticky-top text-end">
      <h5 class="mb-3">Years</h5>
      <ul class="fw-light ps-0 list-unstyled" id="yearsList">
      </ul>
    </nav>
  </aside>
</div>

<p class="text-center text-muted small mt-5">
  Movie and series information and posters come from <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">The Movie Database (TMDB)</a>. This site uses the TMDB API but is not endorsed or certified by TMDB.
</p>

<!-- JS: jQuery -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="{{ '/assets/js/gallery-tags.js' | relative_url }}"></script>

<script>
let mediaList = ({{ site.data.media | jsonify }}).map(item => ({ ...item, type: item.type || 'movie' }));
let feedbackList = Object.values({{ site.data.comments.media | jsonify }} || {});

const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

// Spanish title when there is one, otherwise the original
const displayTitle = item => item.title_es || item.title;

// Stand-in for the poster while TMDb data is missing
const posterPlaceholder = item =>
  `<div class="poster-placeholder"><i class="bi ${item.type === 'series' ? 'bi-tv' : 'bi-film'}"></i><span>${escapeHtml(displayTitle(item))}</span></div>`;

const currentType = () => $('input[name="mediaType"]:checked').val();
const tagsOf = item => item.tags ? item.tags.split(';').map(t => t.trim()).filter(Boolean) : [];
const hashParams = () => new URLSearchParams(location.hash.includes('=') ? location.hash.slice(1) : '');

// Items that the Type / Show / Group controls let through, before any tag is applied
function itemsInScope() {
  const mode = $('input[name="sortBy"]:checked').val() || 'year';
  return mediaList.filter(item => item.type === currentType() && (mode !== 'year' || item.year) && matchesWatched(item) && matchesRating(item));
}

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

// Year sort: each item belongs to exactly one group (its year). Title sort: a single list.
function buildGroups(items, mode) {
  if (mode === 'year') {
    const byYear = {};
    items.forEach(item => (byYear[item.year] = byYear[item.year] || []).push(item));
    return Object.keys(byYear).sort((a, b) => b - a).map(year => ({ id: `year-${year}`, label: year, items: byYear[year] }));
  }

  return [{ id: 'group-all', label: null, items }];
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
  $item.append(`<div class="title">${displayTitle(item)}${ageRatingText}</div>`);

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

  // Year navigation (hidden when there are no groups)
  $('#navbar-years').toggle(mode === 'year' && groups.length > 0);
  const $nav = $('#yearsList');
  $nav.empty();
  groups.filter(group => group.label !== null).forEach(group => {
    $nav.append(`<li class="ps-0"><a href="#${group.id}" data-target="${group.id}">${escapeHtml(group.label)}</a></li>`);
  });

  $('#mediaLoading').hide();
  const $container = $('#mediaGallery');
  $container.empty();

  if (filtered.length === 0) {
    $container.html(selectedTags.length
      ? `<p class="text-muted text-center py-5">No ${typeLabel} found tagged "${escapeHtml(selectedTags.join(' + '))}".</p>`
      : '<p class="text-muted text-center py-5">No content available.</p>');
  }

  groups.forEach(group => {
    const items = group.items.slice().sort((a, b) => displayTitle(a).localeCompare(displayTitle(b)));

    const $group = $('<div class="year-gallery"></div>').attr('id', group.id);
    if (group.label !== null) {
      const count = items.length;
      const itemLabel = type === 'movie' ? (count > 1 ? 'movies' : 'movie') : 'series';
      $group.append(`<header><h2 class="year-gallery-title fw-light d-inline">${escapeHtml(group.label)}</h2><span class="year-count">${count} ${itemLabel}</span></header>`);
    }

    items.forEach(item => $group.append(buildItemElement(item)));
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

  $('input[name="sortBy"]').on('change', function() {
    localStorage.setItem('mediaSortBy', $(this).val());
    renderGallery();
  });

  // Sidebar links scroll in place so an active tag filter stays in the URL
  $(document).on('click', '#yearsList a', function(e) {
    e.preventDefault();
    document.getElementById($(this).data('target'))?.scrollIntoView({ behavior: 'smooth' });
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
  if (tmdbLink) metaParts.push(tmdbLink);
  const metaHtml = metaParts.join(' <span style="color: #adb5bd;">•</span> ');
  
  const tags = item.tags ? item.tags.split(';').map(tag => tag.trim()).filter(tag => tag) : [];
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

</script>
