---
layout: base
permalink: /media-comments/
title: Comment-A-Media
---

<!-- Bootstrap 5 y Select2 -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
<link href="https://cdn.jsdelivr.net/npm/@ttskch/select2-bootstrap4-theme@1.5.2/dist/select2-bootstrap4.min.css" rel="stylesheet" />
<style>
  .rating-btn {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
  }
  .rating-option {
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    width: fit-content;
  }
  .rating-option span.text-muted {
    font-size: 0.9rem;
  }
  .rating-option:hover {
    background-color: #fff3cd;
  }
  .rating-option:hover .text-muted {
    color: #856404 !important;
  }
  .rating-option input:checked ~ .rating-btn {
    background-color: #ffc107;
    border-color: #ffc107;
    color: #000;
  }
  .star-display {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  .star-item {
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.3s ease;
  }
  .star-item svg {
    width: 100%;
    height: 100%;
    fill: #e9ecef;
    stroke: #dee2e6;
    stroke-width: 1;
    transition: all 0.3s ease;
  }
  .star-item.filled svg {
    fill: #ffc107;
    stroke: #ffc107;
  }
  .star-item span {
    position: absolute;
    font-size: 0.875rem;
    font-weight: bold;
    color: #6c757d;
    pointer-events: none;
    top: 56%;
    transform: translateY(-50%);
  }
  .star-item.filled span {
    color: #000;
  }
  .star-item {
    cursor: pointer;
  }
  .star-item:hover:not(.disabled) svg {
    fill: #ffe69c;
    stroke: #ffc107;
  }
  .star-display.disabled .star-item {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }
  #ratingGroup.disabled {
    opacity: 0.4;
    pointer-events: none;
  }
  #comment:disabled, #author:disabled {
    opacity: 0.5;
    background-color: #f8f9fa;
    cursor: not-allowed;
  }
  #comment:disabled ~ .small,
  #comment:disabled + .small {
    opacity: 0.4;
  }
  .comment-section.disabled {
    opacity: 0.4;
    pointer-events: none;
  }
  button[type="submit"]:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  /* Integrar Select2 con input-group */
  .input-group .select2-container {
    flex: 1 1 auto;
    width: 1% !important;
  }
  .input-group .select2-container .select2-selection {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    height: 100%;
  }
  /* Ajustar botones del tipo de media para que se vean más integrados */
  .input-group .btn-group label.btn {
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-color: #dee2e6;
    color: #495057;
  }
  .input-group .btn-group .btn-check:checked + label.btn {
    background-color: #495057;
    border-color: #495057;
    color: #fff;
  }
  .input-group .btn-group label.btn:hover {
    background-color: #6c757d;
    border-color: #6c757d;
    color: #fff;
  }
  .input-group .btn-group label.btn:first-of-type {
    border-top-left-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
  }
  .input-group .btn-group label.btn:last-of-type {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
</style>

<h1 class="mb-2">Comment-A-Media 🎥✨</h1>
<p class="mb-4">Dejá tu opinión sobre las películas que ves. Cada comentario queda guardado para que podamos recordarlo y compartirlo más adelante.</p>

<div style="max-width:700px;">
  <form id="commentForm" class="needs-validation" novalidate>
    <div class="mb-4">
      <label for="title" class="form-label fw-semibold fs-5">Título <span class="text-danger">*</span></label>
      <div class="input-group">
        <div class="btn-group" role="group" aria-label="Tipo de media">
          <input type="radio" class="btn-check" name="type" id="typeMovie" value="movie" autocomplete="off" checked>
          <label class="btn btn-outline-dark" for="typeMovie">🎬 Película</label>
          <input type="radio" class="btn-check" name="type" id="typeSeries" value="series" autocomplete="off">
          <label class="btn btn-outline-dark" for="typeSeries">📺 Serie</label>
        </div>
        <select id="title" name="title" class="form-select" required>
          <option value="">Seleccioná una película...</option>
        </select>
      </div>
      <input type="hidden" id="mediaId" name="mediaId" value="">
      <div class="form-text" id="titleHelper"></div>
    </div>
    <div class="mb-4">
      <label class="form-label fw-semibold fs-5">Calificación <span class="text-danger">*</span></label>
      <div class="star-display disabled" id="starDisplay">
        <div class="star-item" data-star="1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
          </svg>
          <span>1</span>
        </div>
        <div class="star-item" data-star="2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
          </svg>
          <span>2</span>
        </div>
        <div class="star-item" data-star="3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
          </svg>
          <span>3</span>
        </div>
        <div class="star-item" data-star="4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
          </svg>
          <span>4</span>
        </div>
        <div class="star-item" data-star="5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
          </svg>
          <span>5</span>
        </div>
      </div>
      <div class="d-flex flex-column gap-1 disabled" id="ratingGroup">
        <label class="rating-option">
          <input type="radio" class="btn-check" name="rating" id="star5" value="5" autocomplete="off" required disabled>
          <span class="btn btn-outline-warning rating-btn d-flex align-items-center justify-content-center">🤩</span>
          <span class="text-muted">¡Me encantó y la vería otra vez!</span>
        </label>
        <label class="rating-option">
          <input type="radio" class="btn-check" name="rating" id="star4" value="4" autocomplete="off" disabled>
          <span class="btn btn-outline-warning rating-btn d-flex align-items-center justify-content-center">😄</span>
          <span class="text-muted">¡Me gustó mucho!</span>
        </label>
        <label class="rating-option">
          <input type="radio" class="btn-check" name="rating" id="star3" value="3" autocomplete="off" disabled>
          <span class="btn btn-outline-warning rating-btn d-flex align-items-center justify-content-center">🙂</span>
          <span class="text-muted">Me gustó, pero no fue mi favorita</span>
        </label>
        <label class="rating-option">
          <input type="radio" class="btn-check" name="rating" id="star2" value="2" autocomplete="off" disabled>
          <span class="btn btn-outline-warning rating-btn d-flex align-items-center justify-content-center">�</span>
          <span class="text-muted">Estuvo más o menos</span>
        </label>
        <label class="rating-option">
          <input type="radio" class="btn-check" name="rating" id="star1" value="1" autocomplete="off" disabled>
          <span class="btn btn-outline-warning rating-btn d-flex align-items-center justify-content-center">�</span>
          <span class="text-muted">No me gustó nada</span>
        </label>
      </div>
    </div>
    <div class="mb-4 comment-section disabled" id="commentSection">
      <label for="comment" class="form-label fw-semibold fs-5">Contame qué te pareció 💬</label>
      <div class="small mb-2 p-3 rounded" style="background-color:#f8f9fa;">
        <p class="mb-1"><strong>💖 Sentimientos:</strong> ¿Qué te hizo sentir? (alegría, miedo, ternura, sorpresa…)</p>
        <p class="mb-1"><strong>🌟 Personajes:</strong> ¿Hubo alguno que te gustó o te dio bronca? ¿Por qué?</p>
        <p class="mb-0"><strong>💡 Enseñanzas:</strong> ¿Aprendiste algo o te dejó pensando en algo?</p>
      </div>
      <textarea id="comment" name="comment" class="form-control" rows="5" placeholder="Escribí acá tu comentario..." required disabled></textarea>
    </div>
    <div class="mb-4 comment-section disabled" id="authorSection">
      <label for="author" class="form-label fw-semibold fs-5">Tu Nombre</label>
      <input type="text" id="author" name="author" class="form-control" placeholder="Anónimo" disabled>
    </div>
    <div class="d-grid">
      <button type="submit" class="btn btn-dark btn-lg" disabled>
        Enviar Comentario
      </button>
    </div>
    <div class="alert alert-success mt-3 d-none" id="successMessage">
      ¡Gracias! Tu comentario ha sido guardado.
    </div>
    <div class="alert alert-danger mt-3 d-none" id="errorMessage">
      Error al enviar. Por favor, intentá de nuevo.
    </div>
  </form>
</div>

<!-- JS: Bootstrap, jQuery, Select2 -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>

<script>
const MEDIA_LIST_URL = 'https://sheets.googleapis.com/v4/spreadsheets/1v73TEfD1V4ndy3COZ93_bG9uNj-04AyaT62sVueSTqU/values/MediaList!A4:I?key=AIzaSyDRHquLZE6dgnCqLideV0gFmaEqhjGKzqI';
// URL ofuscada con Base64
const ENCODED_SUBMIT_URL = 'aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J3bWpyc1g1WGhtYVRrUTEwQkVYWWZIX0NfNzVrZlo1ak4xc25CUjNZWmhLZWxENmVUcUNpczFZVEkxVzBmbE1vZU0vZXhlYw==';


function decodeUrl(encoded) {
  return atob(encoded);
}
let mediaList = [];

async function loadMediaList() {
  try {
    const response = await fetch(MEDIA_LIST_URL);
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    if (data.values && data.values.length > 0) {
      mediaList = data.values.map(row => ({
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
      
      // Verificar si hay ID en la URL
      const urlParams = new URLSearchParams(window.location.search);
      const mediaId = urlParams.get('id');
      
      if (mediaId) {
        // Buscar el item por ID
        const item = mediaList.find(m => m.id === mediaId);
        if (item) {
          // Seleccionar el tipo correcto
          $(`input[name="type"][value="${item.type}"]`).prop('checked', true);
          // Cargar dropdown del tipo correcto
          updateTitleDropdown(item.type);
          // Esperar un poco para que Select2 se inicialice
          setTimeout(() => {
            // Seleccionar el título
            $('#title').val(item.title).trigger('change');
          }, 100);
        } else {
          // ID no encontrado, cargar películas por defecto
          updateTitleDropdown('movie');
        }
      } else {
        // Sin ID en URL, cargar películas por defecto
        updateTitleDropdown('movie');
      }
    }
  } catch (error) {
    console.error('Error loading media list:', error);
  }
}

function updateTitleDropdown(type) {
  const $select = $('#title');
  const filtered = mediaList.filter(item => item.type === type);
  filtered.sort((a, b) => a.title.localeCompare(b.title));
  
  const placeholder = type === 'movie' ? 'Seleccioná una película...' : 'Seleccioná una serie...';
  $select.empty().append('<option value=""></option>');
  
  filtered.forEach(item => {
    const text = item.year ? item.title +' (' + item.year + ')' : item.title;
    const option = new Option(text, item.title);
    option.dataset.id = item.id;
    $select.append(option);
  });
  
  // Reinicializar Select2
  if ($select.data('select2')) {
    $select.select2('destroy');
  }
  $select.select2({
    theme:'bootstrap4',
    width:'100%',
    placeholder: placeholder,
    allowClear: true
  });
  
$('#titleHelper').html(`<span class="text-success">${filtered.length} disponibles</span>`);
    // Habilitar rating solo cuando se selecciona un título
  $select.on('change', function() {
    if ($(this).val()) {
      // Actualizar el ID oculto con el data-id de la opción seleccionada
      const selectedOption = $(this).find('option:selected');
      $('#mediaId').val(selectedOption.data('id') || '');
      
      $('#starDisplay').removeClass('disabled');
      $('#ratingGroup').removeClass('disabled');
      $('#commentSection, #authorSection').removeClass('disabled');
      $('#ratingGroup input, #comment, #author, button[type="submit"]').prop('disabled', false);
    } else {
      // Resetear form si se limpia el título
      $('#mediaId').val('');
      $('#starDisplay').addClass('disabled');
      $('#ratingGroup').addClass('disabled');
      $('#commentSection, #authorSection').addClass('disabled');
      $('.star-item').removeClass('filled');
      $('input[name="rating"]').prop('checked', false);
      $('#comment').val('');
      $('#author').val('');
      $('#ratingGroup input, #comment, #author, button[type="submit"]').prop('disabled', true);
    }
  });
}

function showMessage(type, text) {
  $('#successMessage, #errorMessage').addClass('d-none');
  if (type === 'success') {
    $('#successMessage').removeClass('d-none').text(text);
  } else {
    $('#errorMessage').removeClass('d-none').text(text);
  }
  setTimeout(() => {
    $('#successMessage, #errorMessage').addClass('d-none');
  }, 5000);
}

async function submitForm(formData) {
  try {
    const submitUrl = decodeUrl(ENCODED_SUBMIT_URL);
    
    const response = await fetch(submitUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error en submit:', error);
    return { success: false, error: error.message };
  }
}

$(function() {
  loadMediaList();
  $('input[name="type"]').on('change', function() {
    updateTitleDropdown($(this).val());
  });
  
  // Sync rating cuando se cambia desde emojis
  $('input[name="rating"]').on('change', function() {
    const value = parseInt($(this).val());
    updateStarDisplay(value);
  });
  
  // Permitir click en estrellas para seleccionar rating
  $(document).on('click', '.star-item:not(.disabled)', function() {
    const value = $(this).data('star');
    $(`#star${value}`).prop('checked', true).trigger('change');
  });
  
  function updateStarDisplay(value) {
    $('.star-item').each(function() {
      const starNum = parseInt($(this).data('star'));
      $(this).toggleClass('filled', starNum <= value);
    });
  }
  
  $('#commentForm').on('submit', async function(e) {
    e.preventDefault();
    
    const $btn = $(this).find('button[type="submit"]');
    $btn.prop('disabled', true).text('Enviando...');
    
    // Deshabilitar todo el formulario durante el envío
    $('input[name="type"], #title, input[name="rating"], #comment, #author').prop('disabled', true);
    $('#starDisplay').addClass('disabled');
    
    const formData = {
      type: $('input[name="type"]:checked').val(),
      title: $('#title option:selected').text(),
      author: $('#author').val() || 'Anónimo',
      comment: $('#comment').val() || '',
      rating: $('input[name="rating"]:checked').val(),
      id: $('#mediaId').val()
    };
    
    const result = await submitForm(formData);
    
    $btn.text('Enviar Comentario');
    if (result.success) {
      showMessage('success','¡Gracias! Tu comentario ha sido guardado.');
      this.reset();
      $('.star-item').removeClass('filled');
      $('#starDisplay').addClass('disabled');
      $('#ratingGroup').addClass('disabled');
      $('#commentSection, #authorSection').addClass('disabled');
      $('#ratingGroup input, #ratingGroup label, #comment, #author, button[type="submit"]').prop('disabled',true);
      
      // Recargar dropdown con títulos del tipo actual y rehabilitarlo
      const currentType = $('input[name="type"]:checked').val();
      $('#title').val(null).trigger('change');
      updateTitleDropdown(currentType);
      $('#title').prop('disabled', false);
      
      // Rehabilitar los radio buttons de tipo
      $('input[name="type"]').prop('disabled', false);
    } else {
      showMessage('error','Error al enviar. Por favor, intentá de nuevo.');
      // Rehabilitar todo si hubo error
      $('input[name="type"], #title, input[name="rating"], #comment, #author').prop('disabled', false);
      $('#starDisplay').removeClass('disabled');
      $btn.prop('disabled',false);
    }
  });
});
</script>
