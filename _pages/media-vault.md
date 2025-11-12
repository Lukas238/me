---
layout: base
permalink: /media-vault/
title: Media Vault
---

<div class="media-vault">
  <div class="media-header">
    <h1>Media Vault Collection</h1>
    <div class="media-controls">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="movie">Movies</button>
      <button class="filter-btn" data-filter="series">Series</button>
    </div>
  </div>

  <div class="media-stats">
    <div class="stat-item">
      <span class="stat-value" id="total-count">0</span>
      <span class="stat-label">Total</span>
    </div>
    <div class="stat-item">
      <span class="stat-value" id="movie-count">0</span>
      <span class="stat-label">Movies</span>
    </div>
    <div class="stat-item">
      <span class="stat-value" id="series-count">0</span>
      <span class="stat-label">Series</span>
    </div>
  </div>

  <div class="media-loading">
    <i class="fas fa-spinner fa-spin"></i> Loading collection...
  </div>

  <div class="media-grid" style="display: none;">
    <!-- Items will be populated by JavaScript -->
  </div>

  <div class="media-error" style="display: none;">
    <i class="fas fa-exclamation-triangle"></i>
    <p>Error loading collection. Please try again later.</p>
  </div>
</div>

<script>
// Configuration - REPLACE WITH YOUR GOOGLE SHEETS URL
const SHEET_URL = 'YOUR_GOOGLE_SHEETS_JSON_URL_HERE';

let mediaData = [];
let currentFilter = 'all';

// Template for media card
function createMediaCard(item) {
  const card = document.createElement('div');
  card.className = `media-card ${item.type}`;
  card.dataset.type = item.type;

  const typeIcon = item.type === 'movie' ? 'fa-film' : 'fa-tv';
  const typeLabel = item.type === 'movie' ? 'Movie' : 'Series';

  card.innerHTML = `
    <div class="media-card-header">
      <span class="media-type">
        <i class="fas ${typeIcon}"></i> ${typeLabel}
      </span>
    </div>
    <div class="media-card-body">
      <h3 class="media-title">${item.title}</h3>
      ${item.year ? `<div class="media-year">${item.year}</div>` : ''}
      ${item.genre ? `<div class="media-genre">${item.genre}</div>` : ''}
      ${item.rating ? `<div class="media-rating">⭐ ${item.rating}/10</div>` : ''}
    </div>
  `;

  return card;
}

// Filter media items
function filterMedia(type) {
  currentFilter = type;
  const cards = document.querySelectorAll('.media-card');

  cards.forEach(card => {
    if (type === 'all' || card.dataset.type === type) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });

  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === type) {
      btn.classList.add('active');
    }
  });
}

// Update statistics
function updateStats() {
  const movies = mediaData.filter(item => item.type === 'movie').length;
  const series = mediaData.filter(item => item.type === 'series').length;

  document.getElementById('total-count').textContent = mediaData.length;
  document.getElementById('movie-count').textContent = movies;
  document.getElementById('series-count').textContent = series;
}

// Load data from Google Sheets
async function loadMediaData() {
  const loadingEl = document.querySelector('.media-loading');
  const gridEl = document.querySelector('.media-grid');
  const errorEl = document.querySelector('.media-error');

  try {
    loadingEl.style.display = 'block';
    errorEl.style.display = 'none';

    const response = await fetch(SHEET_URL);

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();

    // Adjust this based on your Google Sheets structure
    // Expected format: [{type: 'movie', title: '...', year: '...', genre: '...', rating: '...'}, ...]
    mediaData = data;

    // Clear grid
    gridEl.innerHTML = '';

    // Populate grid
    mediaData.forEach(item => {
      const card = createMediaCard(item);
      gridEl.appendChild(card);
    });

    // Update stats
    updateStats();

    // Show grid, hide loading
    loadingEl.style.display = 'none';
    gridEl.style.display = 'grid';

  } catch (error) {
    console.error('Error loading media data:', error);
    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Setup filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterMedia(btn.dataset.filter);
    });
  });

  // Load data
  loadMediaData();
});
</script>
