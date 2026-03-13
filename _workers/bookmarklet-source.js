// Wishlist Bookmarklet - Source Code (Readable Version)
// 
// HOW TO ADD NEW SITES TO AUTO-DETECTION:
// 1. Open this file (bookmarklet-source.js)
// 2. Find the SITES_CONFIG object below
// 3. Add new entry with the base domain as key
// 4. Provide CSS selectors for title and image
// 5. Run: node regenerate-bookmarklet.js
// 6. Commit and push changes
//
// Example:
// 'newsite.com': {
//   title: '.product-name',        // CSS selector for title
//   image: '.product-photo img',   // CSS selector for image
//   imageAttr: 'data-src'          // optional: attribute to use for image URL
// }
//
(function() {
  'use strict';

  // Toggle existing widget
  if (window.wishlistWidget) {
    window.wishlistWidget.toggle();
    return;
  }

  const WORKER_URL = 'https://wishlist-sync.dassolucas.workers.dev/';

  // Sites configuration dictionary
  // Add new sites here with CSS selectors or custom functions
  const SITES_CONFIG = {
    // MercadoLibre Argentina
    'mercadolibre.com.ar': {
      title: '.ui-pdp-title',
      image: '.ui-pdp-gallery__figure__image[data-index="0"]'
    },
    // Amazon
    'amazon.com': {
      title: '#productTitle',
      image: '#landingImage'
    },
    'amazon.com.ar': {
      title: '#productTitle',
      image: '#landingImage'
    },
    // Add more sites as needed
    // 'example.com': {
    //   title: '.product-title',
    //   image: '.product-image img',
    //   imageAttr: 'data-src' // optional custom extractor
    //   titleFn: (el) => el.textContent.trim(), // optional custom extractor
    //   imageFn: (el) => el.src // optional custom extractor
    // }
  };

  // Get base domain from URL
  function getBaseDomain(url) {
    try {
      const hostname = new URL(url).hostname;
      // Match domain.tld or subdomain.domain.tld
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        return parts.slice(-2).join('.');
      }
      return hostname;
    } catch (e) {
      return null;
    }
  }

  // Auto-detect and fill fields based on site configuration
  function autoDetectFields() {
    const baseDomain = getBaseDomain(window.location.href);
    if (!baseDomain || !SITES_CONFIG[baseDomain]) {
      return null; // No config for this site
    }

    const config = SITES_CONFIG[baseDomain];
    const result = { title: null, image: null };

    // Try to get title
    if (config.title) {
      const titleEl = document.querySelector(config.title);
      if (titleEl) {
        result.title = config.titleFn 
          ? config.titleFn(titleEl)
          : titleEl.textContent?.trim() || titleEl.innerText?.trim();
      }
    }

    // Try to get image
    if (config.image) {
      const imageEl = document.querySelector(config.image);
      if (imageEl) {
        if (config.imageFn) {
          result.image = config.imageFn(imageEl);
        } else if (imageEl.tagName === 'IMG') {
          result.image = imageEl.getAttribute(config.imageAttr || 'src') || imageEl.src;
        } else {
          // Try to find img inside element
          const img = imageEl.querySelector('img');
          if (img) {
            result.image = img.getAttribute(config.imageAttr || 'src') || img.src;
          }
        }
      }
    }

    return result;
  }

  // Widget HTML
  const widgetHTML = `
    <div id="wishlist-widget">
      <div class="widget-header" id="wishlist-header">
        <h2>+ Wishlist</h2>
        <button class="close-btn" id="wishlist-close">✕</button>
      </div>
      <div class="widget-body">
        <div class="form-row">
          <label>URL</label>
          <input type="text" id="product_url" readonly/>
        </div>
        <div class="form-row">
          <label>Title</label>
          <div class="input-group">
            <input type="text" id="title" placeholder="Title"/>
            <button class="target-btn" data-field="title"><svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="8" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/></svg></button>
          </div>
        </div>
        <div class="form-row">
          <label>Notes</label>
          <div class="input-group">
            <textarea id="notes" placeholder="Notes" rows="2"></textarea>
            <button class="target-btn" data-field="notes"><svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="8" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/></svg></button>
          </div>
        </div>
        <div class="form-row">
          <label>Image</label>
          <div class="input-group">
            <input type="text" id="image_url" placeholder="URL"/>
            <button class="target-btn" data-field="image_url"><svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="8" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/></svg></button>
          </div>
        </div>
        <div class="image-preview-container">
          <div id="image-preview" class="image-preview">
            <span class="preview-placeholder">No image</span>
          </div>
        </div>
      </div>
      <div class="widget-footer">
        <button class="btn btn-cancel" id="wishlist-cancel">Cancel</button>
        <button class="btn btn-save" id="wishlist-save">Save</button>
      </div>
      <div id="wishlist-status" class="status-message"></div>
    </div>
  `;

  // Widget CSS
  const widgetCSS = `
    #wishlist-widget {
      position: fixed;
      top: 10px;
      right: 10px;
      background: #fff;
      border: 2px solid #000;
      width: 280px;
      max-height: calc(100vh - 20px);
      overflow: hidden;
      z-index: 999999;
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      box-shadow: 4px 4px 0 #000;
    }

    #wishlist-widget.collapsed {
      width: 280px;
      height: auto;
      max-height: 32px;
      overflow: hidden;
    }

    #wishlist-widget.collapsed .widget-body,
    #wishlist-widget.collapsed .widget-footer,
    #wishlist-widget.collapsed #wishlist-status {
      display: none !important;
    }

    .widget-header {
      background: #fff;
      color: #000;
      padding: 6px 10px;
      border-bottom: 2px solid #000;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      user-select: none;
    }

    #wishlist-widget.collapsed .widget-header {
      border-bottom: none;
    }

    .widget-header h2 {
      margin: 0;
      font-size: 11px;
      font-weight: bold;
      pointer-events: none;
      letter-spacing: 0.5px;
    }

    #wishlist-widget.collapsed .widget-header h2 {
      font-size: 10px;
    }

    .close-btn {
      background: transparent;
      border: 1px solid #000;
      color: #000;
      font-size: 14px;
      width: 20px;
      height: 20px;
      cursor: pointer;
      line-height: 1;
      pointer-events: auto;
      padding: 0;
    }

    .close-btn:hover {
      background: #000;
      color: #fff;
    }

    .widget-body {
      padding: 10px;
      max-height: calc(100vh - 100px);
      overflow-y: auto;
      background: #fff;
    }

    .form-row {
      margin-bottom: 8px;
    }

    .form-row label {
      display: block;
      margin-bottom: 2px;
      font-weight: bold;
      color: #000;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .input-group {
      display: flex;
      gap: 4px;
    }

    .input-group input,
    .input-group textarea {
      flex: 1;
    }

    #wishlist-widget input,
    #wishlist-widget textarea {
      width: 100%;
      padding: 4px 6px;
      border: 1px solid #000;
      background: #fff;
      font-size: 10px;
      font-family: 'Courier New', Courier, monospace;
    }

    #wishlist-widget input:focus,
    #wishlist-widget textarea:focus {
      outline: 1px solid #000;
      outline-offset: 0;
    }

    #wishlist-widget input[readonly] {
      background: #f0f0f0;
      color: #666;
    }

    .target-btn {
      background: #fff;
      border: 1px solid #000;
      color: #000;
      font-size: 12px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      flex-shrink: 0;
      padding: 0;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .target-btn svg {
      display: block;
    }

    .target-btn:hover {
      background: #000;
      color: #fff;
    }

    .target-btn.active {
      background: #000;
      color: #fff;
      animation: blink 1s infinite;
    }

    @keyframes blink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0.5; }
    }

    .image-preview-container {
      margin-top: 8px;
    }

    .image-preview {
      width: 100%;
      height: 80px;
      border: 1px solid #000;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #f5f5f5;
    }

    .image-preview img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .preview-placeholder {
      color: #999;
      font-size: 9px;
      text-transform: uppercase;
    }

    .widget-footer {
      padding: 8px 10px;
      border-top: 2px solid #000;
      display: flex;
      gap: 6px;
      justify-content: flex-end;
      background: #fff;
    }

    .btn {
      padding: 4px 10px;
      border: 1px solid #000;
      font-size: 10px;
      font-weight: bold;
      cursor: pointer;
      font-family: 'Courier New', Courier, monospace;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .btn-cancel {
      background: #fff;
      color: #000;
    }

    .btn-cancel:hover {
      background: #f0f0f0;
    }

    .btn-save {
      background: #000;
      color: #fff;
    }

    .btn-save:hover {
      background: #333;
    }

    .btn-save:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .status-message {
      padding: 6px 10px;
      font-size: 9px;
      text-align: center;
      display: none;
      font-family: 'Courier New', Courier, monospace;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-message.success {
      background: #d4edda;
      color: #155724;
      border-top: 1px solid #c3e6cb;
      display: block;
    }

    .status-message.error {
      background: #f8d7da;
      color: #721c24;
      border-top: 1px solid #f5c6cb;
      display: block;
    }

    .status-message.info {
      background: #d1ecf1;
      color: #0c5460;
      border-top: 1px solid #bee5eb;
      display: block;
    }

    .wishlist-target-highlight {
      outline: 2px solid #000 !important;
      outline-offset: 2px;
      cursor: crosshair !important;
      background: rgba(0,255,0,0.1) !important;
    }

    body.wishlist-target-mode,
    body.wishlist-target-mode * {
      cursor: crosshair !important;
    }
  `;

  // Inject CSS
  const style = document.createElement('style');
  style.textContent = widgetCSS;
  document.head.appendChild(style);

  // Inject HTML
  const wrapper = document.createElement('div');
  wrapper.innerHTML = widgetHTML;
  document.body.appendChild(wrapper);

  // Widget controller
  const widget = {
    container: document.getElementById('wishlist-widget'),
    header: document.getElementById('wishlist-header'),
    fields: {
      product_url: document.getElementById('product_url'),
      title: document.getElementById('title'),
      notes: document.getElementById('notes'),
      image_url: document.getElementById('image_url')
    },
    preview: document.getElementById('image-preview'),
    status: document.getElementById('wishlist-status'),
    targetMode: false,
    currentTargetField: null,
    collapsed: false,
    dragState: {
      isDragging: false,
      startX: 0,
      startY: 0,
      initialX: 0,
      initialY: 0
    },

    show() {
      this.container.style.display = 'block';
      this.fields.product_url.value = window.location.href;
      
      // Auto-detect fields if site is configured
      const detected = autoDetectFields();
      if (detected) {
        if (detected.title && !this.fields.title.value) {
          this.fields.title.value = detected.title;
          this.showStatus('✓ Auto-detected from site', 'success');
        }
        if (detected.image && !this.fields.image_url.value) {
          this.fields.image_url.value = detected.image;
        }
      }
      
      this.updatePreview();
      this.expand();
    },

    hide() {
      this.container.style.display = 'none';
      this.exitTargetMode();
      this.clearFields();
    },

    clearFields() {
      this.fields.title.value = '';
      this.fields.notes.value = '';
      this.fields.image_url.value = '';
      this.updatePreview();
    },

    toggle() {
      if (this.container.style.display === 'none' || !this.container.style.display) {
        this.show();
      } else {
        this.hide();
      }
    },

    collapse() {
      this.collapsed = true;
      this.container.classList.add('collapsed');
    },

    expand() {
      this.collapsed = false;
      this.container.classList.remove('collapsed');
    },

    updatePreview() {
      const url = this.fields.image_url.value.trim();
      if (url) {
        this.preview.innerHTML = `<img src="${url}" alt="Preview"/>`;
      } else {
        this.preview.innerHTML = '<span class="preview-placeholder">No image selected</span>';
      }
    },

    enterTargetMode(field) {
      this.exitTargetMode();
      this.targetMode = true;
      this.currentTargetField = field;
      document.body.classList.add('wishlist-target-mode');
      document.querySelector(`[data-field="${field}"]`)?.classList.add('active');
      this.showStatus('Click on an element to capture...', 'info');
    },

    exitTargetMode() {
      this.targetMode = false;
      this.currentTargetField = null;
      document.body.classList.remove('wishlist-target-mode');
      document.querySelectorAll('.wishlist-target-highlight').forEach(el => {
        el.classList.remove('wishlist-target-highlight');
      });
      document.querySelectorAll('.target-btn.active').forEach(btn => {
        btn.classList.remove('active');
      });
    },

    captureElement(element) {
      if (!this.currentTargetField) return;

      const field = this.currentTargetField;
      const input = this.fields[field];

      if (field === 'image_url') {
        let imageUrl = null;
        if (element.tagName === 'IMG') {
          imageUrl = element.src || element.dataset.src;
        } else {
          const bgImage = window.getComputedStyle(element).backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (bgImage) {
            imageUrl = bgImage[1];
          } else {
            const img = element.querySelector('img');
            if (img) {
              imageUrl = img.src || img.dataset.src;
            }
          }
        }

        if (imageUrl) {
          input.value = imageUrl;
          this.updatePreview();
          this.showStatus('✓ Image captured!', 'success');
        } else {
          this.showStatus('✗ No image found', 'error');
        }
      } else {
        const text = element.innerText?.trim() || element.textContent?.trim() || '';
        if (text) {
          input.value = text;
          this.showStatus(`✓ ${field} captured!`, 'success');
        } else {
          this.showStatus('✗ No text found', 'error');
        }
      }

      this.exitTargetMode();
    },

    showStatus(message, type) {
      this.status.textContent = message;
      this.status.className = `status-message ${type}`;
      if (type !== 'info') {
        setTimeout(() => {
          this.status.style.display = 'none';
        }, 3000);
      }
    },

    async save() {
      const data = {
        title: this.fields.title.value.trim(),
        product_url: this.fields.product_url.value.trim(),
        notes: this.fields.notes.value.trim(),
        image_url: this.fields.image_url.value.trim()
      };

      if (!data.title) {
        this.showStatus('✗ Title is required', 'error');
        return;
      }

      const saveBtn = document.getElementById('wishlist-save');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      try {
        const response = await fetch(WORKER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          this.showStatus('✓ Saved to wishlist!', 'success');
          setTimeout(() => {
            this.fields.title.value = '';
            this.fields.notes.value = '';
            this.fields.image_url.value = '';
            this.updatePreview();
            this.hide();
          }, 1500);
        } else {
          this.showStatus(`✗ Error: ${result.error || 'Failed to save'}`, 'error');
        }
      } catch (error) {
        this.showStatus(`✗ Network error: ${error.message}`, 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Save to Wishlist';
      }
    },

    initDrag() {
      this.header.addEventListener('mousedown', (e) => {
        // Don't start drag if clicking on close button
        if (e.target.classList.contains('close-btn')) return;

        this.dragState.isDragging = true;
        this.dragState.startX = e.clientX;
        this.dragState.startY = e.clientY;

        const rect = this.container.getBoundingClientRect();
        this.dragState.initialX = rect.right;
        this.dragState.initialY = rect.top;

        e.preventDefault();
      });

      document.addEventListener('mousemove', (e) => {
        if (!this.dragState.isDragging) return;

        const deltaX = e.clientX - this.dragState.startX;
        const deltaY = e.clientY - this.dragState.startY;

        const newRight = window.innerWidth - this.dragState.initialX - deltaX;
        const newTop = this.dragState.initialY + deltaY;

        this.container.style.right = `${newRight}px`;
        this.container.style.top = `${newTop}px`;
      });

      document.addEventListener('mouseup', () => {
        if (this.dragState.isDragging) {
          this.dragState.isDragging = false;
        }
      });
    }
  };

  // Initialize drag functionality
  widget.initDrag();

  // Event listeners
  document.getElementById('wishlist-close').addEventListener('click', () => widget.hide());
  document.getElementById('wishlist-cancel').addEventListener('click', () => widget.hide());
  document.getElementById('wishlist-save').addEventListener('click', () => widget.save());
  widget.fields.image_url.addEventListener('input', () => widget.updatePreview());

  // Target buttons
  document.querySelectorAll('.target-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      widget.enterTargetMode(e.target.dataset.field);
    });
  });

  // Hover highlighting
  document.addEventListener('mouseover', (e) => {
    if (!widget.targetMode || widget.container.contains(e.target)) return;

    document.querySelectorAll('.wishlist-target-highlight').forEach(el => {
      if (el !== e.target) {
        el.classList.remove('wishlist-target-highlight');
      }
    });

    e.target.classList.add('wishlist-target-highlight');
  });

  // Click to capture
  document.addEventListener('click', (e) => {
    if (widget.targetMode && !widget.container.contains(e.target)) {
      e.preventDefault();
      e.stopPropagation();
      widget.captureElement(e.target);
    }
  }, true);

  // ESC key handling
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (widget.targetMode) {
        widget.exitTargetMode();
      } else if (widget.container.style.display !== 'none') {
        widget.hide();
      }
    }
  });

  // Expose widget globally
  window.wishlistWidget = widget;

  // Show widget
  widget.show();
})();
