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

  .media-item .title {
    margin-top: 8px;
    font-size: 0.875rem;
    color: #495057;
    line-height: 1.3;
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
    margin-left: 8px;
    font-weight: normal;
  }

  .comment-rating {
    color: #ffc107;
    font-size: 0.875rem;
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

  .media-type-toggle {
    margin-bottom: 0;
  }

  .media-type-toggle .btn-check:checked + .btn {
    background-color: #495057;
    border-color: #495057;
    color: #fff;
  }

  #navbar-years a.active {
    font-weight: bold;
    text-decoration: none;
  }

  .filter-toggle-btn {
    background-color: transparent;
    border: none;
    color: #6c757d;
    padding: 0;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: underline;
  }

  .filter-toggle-btn:hover {
    color: #495057;
    text-decoration: underline;
  }

  .filter-section {
    background-color: transparent;
    border-top: 1px solid #e9ecef;
    border-bottom: 1px solid #e9ecef;
    border-radius: 0;
    padding: 12px 0;
    margin-bottom: 20px;
    display: none;
  }

  .filter-section.show {
    display: block;
  }

  .filter-tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .filter-tag-btn {
    padding: 2px 8px;
    background-color: #fff;
    border: 1px solid #dee2e6;
    border-radius: 3px;
    font-size: 0.7rem;
    color: #6c757d;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .filter-tag-btn:hover {
    background-color: #e9ecef;
    color: #495057;
    border-color: #adb5bd;
  }

  .filter-tag-btn.active {
    background-color: #495057;
    color: #fff !important;
    border-color: #495057;
  }

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .filter-header h6 {
    margin: 0;
    font-size: 0.7rem;
    color: #adb5bd;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .filter-header a {
    font-size: 0.7rem;
    color: #adb5bd;
    text-decoration: none;
  }

  .filter-header a:hover {
    color: #6c757d;
    text-decoration: underline;
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

  .filter-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .filter-separator {
    color: #dee2e6;
    font-size: 0.8rem;
  }

  .clear-filter-btn {
    font-size: 0.8rem;
    color: #6c757d;
    text-decoration: none;
    padding: 0;
    transition: all 0.2s ease;
  }

  .clear-filter-btn:hover {
    color: #495057;
    text-decoration: underline;
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
<p class="mb-4">Our collection of movies and series to watch together, organized by year.</p>

<div class="media-overlay" id="mediaOverlay"></div>

<div class="container-xxl d-flex">
  <div class="flex-grow-1">
    <div class="text-center media-type-toggle">
      <div class="btn-group" role="group" aria-label="Media type selector">
        <input type="radio" class="btn-check" name="mediaType" id="typeMovies" value="movie" autocomplete="off" checked>
        <label class="btn btn-outline-secondary" for="typeMovies">Movies</label>
        <input type="radio" class="btn-check" name="mediaType" id="typeSeries" value="series" autocomplete="off">
        <label class="btn btn-outline-secondary" for="typeSeries">Series</label>
      </div>
    </div>

    <div class="filter-active-message" id="filterActiveMessage">
      <div class="message-text">
        <span class="icon">›</span>
        <span id="filterMessageText">Loading...</span>
      </div>
      <div class="filter-controls">
        <a href="#" class="clear-filter-btn" id="clearFilterBtnTop" style="display: none;">Clear</a>
        <span class="filter-separator" id="filterSeparator" style="display: none;">|</span>
        <a href="#" class="filter-toggle-btn" id="filterToggleBtn">Filter by Tags</a>
      </div>
    </div>

    <div class="filter-section" id="filterSection">
      <div class="filter-tags-list" id="filterTagsList">
        <!-- Tags will be populated here -->
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

<!-- JS: Bootstrap, jQuery -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

<script>
// URLs ofuscadas con Base64
const ENCODED_MEDIA_LIST_URL = 'aHR0cHM6Ly9zaGVldHMuZ29vZ2xlYXBpcy5jb20vdjQvc3ByZWFkc2hlZXRzLzF2NzNURWZEMVY0bmR5M0NPWjkzX2JHOXVOai0wNEF5YVQ2MnNWdWVTVHFVL3ZhbHVlcy9NZWRpYUxpc3QhQTQ6ST9rZXk9QUl6YVN5RFJIcXVMWkU2ZGduQ3FMaWRlVjBnRm1hRXFoakdLenFJ';
const ENCODED_FEEDBACK_URL = 'aHR0cHM6Ly9zaGVldHMuZ29vZ2xlYXBpcy5jb20vdjQvc3ByZWFkc2hlZXRzLzF2NzNURWZEMVY0bmR5M0NPWjkzX2JHOXVOai0wNEF5YVQ2MnNWdWVTVHFVL3ZhbHVlcy9GZWVkYmFjayFBMjpHP2tleT1BSXphU3lEUkhxdUxaRTZkZ25DcUxpZGVWMGdGbWFFcWhqR0t6cUk=';

function decodeUrl(encoded) {
  return atob(encoded);
}

let mediaList = [];
let feedbackList = [];

async function loadMediaList() {
  try {
    // Cargar lista de media
    const mediaResponse = await fetch(decodeUrl(ENCODED_MEDIA_LIST_URL));
    if (!mediaResponse.ok) throw new Error('Failed to fetch media list');
    const mediaData = await mediaResponse.json();
    
    // Cargar feedback
    const feedbackResponse = await fetch(decodeUrl(ENCODED_FEEDBACK_URL));
    if (!feedbackResponse.ok) throw new Error('Failed to fetch feedback');
    const feedbackData = await feedbackResponse.json();
    
    if (mediaData.values && mediaData.values.length > 0) {
      mediaList = mediaData.values.map(row => ({
        id: row[0] || '',
        type: row[1] || '',
        status: row[2] || '',
        title: row[3] || '',
        year: row[4] || '',
        rating: row[5] || '',
        tags: row[6] || '',
        tmdb_id: row[7] || '',
        tmdb_poster_url: row[8] || ''
      }));
    }
    
    if (feedbackData.values && feedbackData.values.length > 0) {
      feedbackList = feedbackData.values.map(row => ({
        id: row[0] || '',
        type: row[1] || '',
        title: row[2] || '',
        rating: parseInt(row[3]) || 0,
        comment: row[4] || '',
        author: row[5] || '',
        timestamp: row[6] || ''
      }));
    }
    
    // Verificar si hay filtro en la URL al cargar
    if (window.location.hash && window.location.hash.includes('tag=')) {
      // Esperar un poco y aplicar el filtro
      setTimeout(() => {
        applyFilterFromHash();
        updateActiveFilterTag();
      }, 50);
    } else {
      // Sin filtro, mostrar galería normal
      renderGallery('movie');
      populateFilterTags();
    }
    
    // Verificar si hay un ID en la URL para abrir automáticamente
    checkAndOpenCardFromUrl();
  } catch (error) {
    console.error('Error loading data:', error);
    $('#mediaLoading').text('Error loading data.');
  }
}

function populateFilterTags() {
  const currentType = $('input[name="mediaType"]:checked').val();
  const filtered = mediaList.filter(item => item.type === currentType);
  
  // Obtener todos los tags únicos
  const tagsSet = new Set();
  filtered.forEach(item => {
    if (item.tags) {
      item.tags.split(';').forEach(tag => {
        const trimmed = tag.trim();
        if (trimmed) tagsSet.add(trimmed);
      });
    }
  });
  
  const tags = Array.from(tagsSet).sort();
  
  const $tagsList = $('#filterTagsList');
  $tagsList.empty();
  
  if (tags.length === 0) {
    $tagsList.html('<p class="text-muted mb-0" style="font-size: 0.75rem;">No tags available</p>');
    return;
  }
  
  tags.forEach(tag => {
    const $btn = $(`<a href="#tag=${encodeURIComponent(tag)}&type=${currentType}" class="filter-tag-btn" data-tag="${tag}" data-type="${currentType}">${tag}</a>`);
    $tagsList.append($btn);
  });
  
  // Marcar tag activo si hay filtro
  updateActiveFilterTag();
}

function updateActiveFilterTag() {
  $('.filter-tag-btn').removeClass('active');
  const hash = window.location.hash.substring(1);
  if (hash.startsWith('tag=')) {
    const params = new URLSearchParams(hash);
    const tag = decodeURIComponent(params.get('tag'));
    $(`.filter-tag-btn[data-tag="${tag}"]`).addClass('active');
  }
}

function renderGallery(type) {
  const filtered = mediaList.filter(item => item.type === type && item.year);
  
  // Actualizar mensaje de filtro
  updateFilterMessage(type, filtered.length, null);
  
  // Agrupar por año
  const byYear = {};
  filtered.forEach(item => {
    if (!byYear[item.year]) {
      byYear[item.year] = [];
    }
    byYear[item.year].push(item);
  });
  
  // Ordenar años descendente
  const years = Object.keys(byYear).sort((a, b) => b - a);
  
  // Actualizar sidebar de años
  const $yearsList = $('#yearsList');
  $yearsList.empty();
  years.forEach(year => {
    $yearsList.append(`<li class="ps-0"><a href="#year-${year}">${year}</a></li>`);
  });
  
  $('#mediaLoading').hide();
  const $container = $('#mediaGallery');
  $container.empty();
  
  if (years.length === 0) {
    $container.html('<p class="text-muted text-center py-5">No content available.</p>');
    return;
  }
  
  years.forEach(year => {
    const items = byYear[year];
    items.sort((a, b) => a.title.localeCompare(b.title));
    
    const $yearDiv = $('<div class="year-gallery"></div>').attr('id', `year-${year}`);
    const count = items.length;
    const itemLabel = type === 'movie' ? (count > 1 ? 'movies' : 'movie') : (count > 1 ? 'series' : 'series');
    const $header = $(`<header><h2 class="year-gallery-title fw-light d-inline">${year}</h2><span class="year-count">${count} ${itemLabel}</span></header>`);
    $yearDiv.append($header);
    
    items.forEach(item => {
      const posterUrl = item.tmdb_poster_url 
        ? `https://image.tmdb.org/t/p/w500/${item.tmdb_poster_url}` 
        : '';
      
      const $item = $('<div class="media-item"></div>');
      const $poster = $('<div class="poster"></div>');
      
      if (posterUrl) {
        $poster.append(`<img src="${posterUrl}" alt="${item.title}" loading="lazy">`);
      }
      
      $item.append($poster);
      $item.append(`<div class="title">${item.title}</div>`);
      
      // Usar helper para construir el card
      buildMediaCard($item, item);
      
      $yearDiv.append($item);
    });
    
    $container.append($yearDiv);
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
  loadMediaList();
  
  $('input[name="mediaType"]').on('change', function() {
    const type = $(this).val();
    renderGallery(type);
    populateFilterTags();
    // Limpiar filtro al cambiar tipo
    window.location.hash = '';
  });
  
  // Toggle filter section
  $('#filterToggleBtn').on('click', function(e) {
    e.preventDefault();
    $('#filterSection').toggleClass('show');
  });
  
  // Clear filter
  $('#clearFilterBtnTop').on('click', function(e) {
    e.preventDefault();
    window.location.hash = '';
    $('.filter-tag-btn').removeClass('active');
    $('#filterSection').removeClass('show');
  });
  
  // Click en filter tags
  $(document).on('click', '.filter-tag-btn', function(e) {
    e.preventDefault();
    const tag = $(this).data('tag');
    const type = $(this).data('type');
    
    // Si ya está activo, limpiar filtro
    if ($(this).hasClass('active')) {
      window.location.hash = '';
      return;
    }
    
    // Cerrar card expandida si está abierta
    $('.media-item.expanded').remove();
    $('#mediaOverlay').removeClass('active');
    $('body').removeClass('modal-open');
    
    // Actualizar URL
    window.location.hash = `tag=${encodeURIComponent(tag)}&type=${type}`;
    
    // Filtrar galería
    filterGalleryByTag(tag, type);
    updateActiveFilterTag();
  });
  
  // Manejar click en tags dentro de cards
  $(document).on('click', '.tag-item', function(e) {
    e.preventDefault();
    e.stopPropagation();
    const tag = $(this).data('tag');
    const type = $(this).data('type');
    
    // Cerrar card expandida si está abierta
    $('.media-item.expanded').remove();
    $('#mediaOverlay').removeClass('active');
    $('body').removeClass('modal-open');
    
    // Actualizar URL
    window.location.hash = `tag=${encodeURIComponent(tag)}&type=${type}`;
    
    // Filtrar galería
    filterGalleryByTag(tag, type);
    updateActiveFilterTag();
  });
  
  // Manejar cambios en el hash (navegación atrás/adelante)
  $(window).on('hashchange', function() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    // Si hay un ID pero no hay card abierta, abrir
    if (params.has('id') && !$('.media-item.expanded').length) {
      checkAndOpenCardFromUrl();
    }
    // Si no hay ID pero hay card abierta, cerrar
    else if (!params.has('id') && $('.media-item.expanded').length) {
      $('.media-item.expanded').remove();
      $('#mediaOverlay').removeClass('active');
      $('body').removeClass('modal-open');
    }
    
    applyFilterFromHash();
    updateActiveFilterTag();
  });
});

function applyFilterFromHash() {
  const hash = window.location.hash.substring(1);
  if (hash.startsWith('tag=')) {
    const params = new URLSearchParams(hash);
    const tag = decodeURIComponent(params.get('tag'));
    const type = params.get('type');
    
    if (tag && type) {
      // Cambiar toggle si es necesario
      $(`input[name="mediaType"][value="${type}"]`).prop('checked', true);
      filterGalleryByTag(tag, type);
      populateFilterTags();
    }
  } else {
    // Sin filtro, mostrar todo
    const currentType = $('input[name="mediaType"]:checked').val();
    renderGallery(currentType);
    populateFilterTags();
  }
}

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
  
  // Renderizar galería si hay filtro de tag
  if (params.has('tag')) {
    const tag = decodeURIComponent(params.get('tag'));
    filterGalleryByTag(tag, item.type);
  } else {
    renderGallery(item.type);
  }
  
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
        if (item.title === cardTitle) {
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

function filterGalleryByTag(tag, type) {
  const filtered = mediaList.filter(item => 
    item.type === type && 
    item.year &&
    item.tags && 
    item.tags.toLowerCase().includes(tag.toLowerCase())
  );
  
  // Actualizar mensaje de filtro
  updateFilterMessage(type, filtered.length, tag);
  
  // Usar la misma lógica de renderGallery pero con datos filtrados
  const byYear = {};
  filtered.forEach(item => {
    if (!byYear[item.year]) {
      byYear[item.year] = [];
    }
    byYear[item.year].push(item);
  });
  
  const years = Object.keys(byYear).sort((a, b) => b - a);
  
  // Actualizar sidebar
  const $yearsList = $('#yearsList');
  $yearsList.empty();
  years.forEach(year => {
    $yearsList.append(`<li class="ps-0"><a href="#year-${year}">${year}</a></li>`);
  });
  
  $('#mediaLoading').hide();
  const $container = $('#mediaGallery');
  $container.empty();
  
  if (years.length === 0) {
    $container.html(`<p class="text-muted text-center py-5">No ${type === 'movie' ? 'movies' : 'series'} found with tag "${tag}".</p>`);
    return;
  }
  
  years.forEach(year => {
    const items = byYear[year];
    items.sort((a, b) => a.title.localeCompare(b.title));
    
    const $yearDiv = $('<div class="year-gallery"></div>').attr('id', `year-${year}`);
    const count = items.length;
    const itemLabel = type === 'movie' ? (count > 1 ? 'movies' : 'movie') : (count > 1 ? 'series' : 'series');
    const $header = $(`<header><h2 class="year-gallery-title fw-light d-inline">${year}</h2><span class="year-count">${count} ${itemLabel}</span></header>`);
    $yearDiv.append($header);
    
    items.forEach(item => {
      const posterUrl = item.tmdb_poster_url 
        ? `https://image.tmdb.org/t/p/w500/${item.tmdb_poster_url}` 
        : '';
      
      const $item = $('<div class="media-item"></div>');
      const $poster = $('<div class="poster"></div>');
      
      if (posterUrl) {
        $poster.append(`<img src="${posterUrl}" alt="${item.title}" loading="lazy">`);
      }
      
      $item.append($poster);
      $item.append(`<div class="title">${item.title}</div>`);
      
      // Reutilizar la lógica de construcción del card
      buildMediaCard($item, item);
      
      $yearDiv.append($item);
    });
    
    $container.append($yearDiv);
  });
}

function updateFilterMessage(type, count, tag) {
  const itemLabel = type === 'movie' ? (count > 1 ? 'movies' : 'movie') : (count > 1 ? 'series' : 'series');
  const $messageText = $('#filterMessageText');
  const $clearBtn = $('#clearFilterBtnTop');
  const $separator = $('#filterSeparator');
  
  if (tag) {
    $messageText.html(`Showing <strong>${count}</strong> ${itemLabel} tagged with "<strong>${tag}</strong>"`);
    $clearBtn.show();
    $separator.show();
  } else {
    $messageText.html(`Showing <strong>${count}</strong> ${itemLabel}`);
    $clearBtn.hide();
    $separator.hide();
  }
}

function buildMediaCard($item, item) {
  // Código duplicado de renderGallery - construir card info
  const itemComments = feedbackList.filter(f => f.id === item.id);
  const avgRating = itemComments.length > 0 
    ? `⭐ ${Math.round(itemComments.reduce((sum, c) => sum + c.rating, 0) / itemComments.length)}/5 (${itemComments.length} ${itemComments.length === 1 ? 'vote' : 'votes'})`
    : '<span style="color: #adb5bd; font-size: 0.875rem;">No ratings yet</span>';
  
  const statusBadge = getStatusBadge(item.status);
  const tmdbUrl = item.tmdb_id ? `https://www.themoviedb.org/${item.type === 'movie' ? 'movie' : 'tv'}/${item.tmdb_id}` : '';
  const tmdbLink = tmdbUrl ? `<a href="${tmdbUrl}" target="_blank" rel="noopener noreferrer" class="tmdb-link" title="View on TMDb"><i class="bi bi-eye"></i></a>` : '';
  const ageRating = item.rating ? `<span class="age-rating">${item.rating}</span>` : '';
  
  // Construir metadata con bullets
  const metaParts = [];
  if (ageRating) metaParts.push(ageRating);
  metaParts.push(`<span>${item.year}</span>`);
  metaParts.push(`<span class="card-rating">${avgRating}</span>`);
  if (statusBadge) metaParts.push(statusBadge);
  if (tmdbLink) metaParts.push(tmdbLink);
  const metaHtml = metaParts.join(' <span style="color: #adb5bd;">•</span> ');
  
  const tags = item.tags ? item.tags.split(';').map(tag => tag.trim()).filter(tag => tag) : [];
  const tagsHtml = tags.length > 0 ? `
    <div class="tags-section">
      <h6><i class="bi bi-tags"></i></h6>
      <div class="tags-container">${tags.map(tag => `<a href="#tag=${encodeURIComponent(tag)}&type=${item.type}" class="tag-item" data-tag="${tag}" data-type="${item.type}">${tag}</a>`).join('')}</div>
    </div>
  ` : '';
  
  // Separar header info y comentarios
  const headerInfoHtml = `
    <div class="card-header-info">
      <h3>${item.title}</h3>
      <div class="card-meta">
        ${metaHtml}
      </div>
    </div>
    ${tagsHtml}
  `;
  
  const commentsHtml = `
    <div class="comments-section">
    ${itemComments.length > 0 ? `
      <div class="d-flex justify-content-between align-items-baseline mb-3">
        <h6 class="mb-0" style="font-size: 0.875rem; color: #6c757d;">Comments (${itemComments.length})</h6>
        <a href="/media-comments/?id=${item.id}" class="add-comment-link">+ Add yours</a>
      </div>
      ${itemComments.map(comment => {
        const date = comment.timestamp ? new Date(comment.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
        return `
        <div class="comment-item">
          <div class="comment-meta">
            <div>
              <span class="comment-author">${comment.author}</span>
              ${date ? `<span class="comment-date">${date}</span>` : ''}
            </div>
            <span class="comment-rating">${'⭐'.repeat(comment.rating)}</span>
          </div>
          <div class="comment-text">${comment.comment}</div>
        </div>
        `;
      }).join('')}
    ` : `
      <div class="text-center py-3">
        <p class="text-muted mb-2" style="font-size: 0.875rem;">No comments yet.</p>
        <a href="/media-comments/?id=${item.id}" class="add-comment-link">Be the first to comment</a>
      </div>
    `}
    </div>
  `;
  
  // Estructura nueva: poster, info y comentarios como hermanos
  const posterUrl = item.tmdb_poster_url 
    ? `https://image.tmdb.org/t/p/w500/${item.tmdb_poster_url}` 
    : '';
  
  const posterHtml = posterUrl 
    ? `<img src="${posterUrl}" alt="${item.title}" loading="lazy">`
    : '';
  
  const $cardContainer = $(`
    <div class="card-container">
      <button class="card-close-btn" title="Close">&times;</button>
      <div class="card-poster-section">
        <div class="poster">${posterHtml}</div>
      </div>
      <div class="card-info-section">
        <div class="card-header-info">
          <h3>${item.title}</h3>
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
    
    // Agregar ID a la URL
    const currentHash = window.location.hash.substring(1);
    const params = new URLSearchParams(currentHash);
    params.set('id', item.id);
    window.history.pushState(null, '', `#${params.toString()}`);
    
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

function getStatusBadge(status) {
  const statusMap = {
    'watched': '<span class="badge bg-success">Watched</span>',
    'watching': '<span class="badge bg-primary">Watching</span>',
    'pending': '<span class="badge bg-secondary">Pending</span>'
  };
  return statusMap[status] || '<span class="badge bg-secondary">Yet to see</span>';
}

$(function() {
  loadMediaList();
  
  $('input[name="mediaType"]').on('change', function() {
    renderGallery($(this).val());
  });
});
</script>
