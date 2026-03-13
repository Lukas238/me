// Wishlist Bookmarklet - Source Code (Readable Version)
(function() {
  'use strict';

  // Toggle existing widget
  if (window.wishlistWidget) {
    window.wishlistWidget.toggle();
    return;
  }

  const WORKER_URL = 'https://wishlist-sync.dassolucas.workers.dev/';

  // Widget HTML
  const widgetHTML = `
    <div id="wishlist-widget-overlay"></div>
    <div id="wishlist-widget">
      <div class="widget-header" id="wishlist-header">
        <h2>📚 Add to Wishlist</h2>
        <button class="close-btn" id="wishlist-close">✕</button>
      </div>
      <div class="widget-body">
        <div class="form-row">
          <label>Product URL</label>
          <input type="text" id="product_url" readonly/>
        </div>
        <div class="form-row">
          <label>Title *</label>
          <div class="input-group">
            <input type="text" id="title" placeholder="Product title"/>
            <button class="target-btn" data-field="title">🎯</button>
          </div>
        </div>
        <div class="form-row">
          <label>Notes</label>
          <div class="input-group">
            <textarea id="notes" placeholder="Optional notes" rows="2"></textarea>
            <button class="target-btn" data-field="notes">🎯</button>
          </div>
        </div>
        <div class="form-row">
          <label>Image URL</label>
          <div class="input-group">
            <input type="text" id="image_url" placeholder="Product image URL"/>
            <button class="target-btn" data-field="image_url">🎯</button>
          </div>
        </div>
        <div class="image-preview-container">
          <label>Image Preview</label>
          <div id="image-preview" class="image-preview">
            <span class="preview-placeholder">No image selected</span>
          </div>
        </div>
      </div>
      <div class="widget-footer">
        <button class="btn btn-cancel" id="wishlist-cancel">Cancel</button>
        <button class="btn btn-save" id="wishlist-save">💾 Save to Wishlist</button>
      </div>
      <div id="wishlist-status" class="status-message"></div>
    </div>
  `;

  // Widget CSS
  const widgetCSS = `
    #wishlist-widget-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      z-index: 999998;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    #wishlist-widget {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow: hidden;
      z-index: 999999;
      animation: slideUp 0.3s;
      transition: transform 0.3s ease, width 0.3s ease, height 0.3s ease;
    }

    #wishlist-widget.collapsed {
      width: 300px;
      height: auto;
      max-height: 52px;
      overflow: hidden;
    }

    #wishlist-widget.collapsed .widget-body,
    #wishlist-widget.collapsed .widget-footer,
    #wishlist-widget.collapsed #wishlist-status {
      display: none !important;
    }

    @keyframes slideUp {
      from { transform: translate(-50%, -50%) translateY(20px); opacity: 0; }
      to { transform: translate(-50%, -50%) translateY(0); opacity: 1; }
    }

    .widget-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 20px;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      user-select: none;
    }

    #wishlist-widget.collapsed .widget-header {
      border-radius: 12px;
      padding: 15px 20px;
    }

    .widget-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      pointer-events: none;
    }

    #wishlist-widget.collapsed .widget-header h2 {
      font-size: 16px;
    }

    .close-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      color: #fff;
      font-size: 24px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.2s;
      line-height: 1;
      pointer-events: auto;
    }

    .close-btn:hover {
      background: rgba(255,255,255,0.3);
    }

    .widget-body {
      padding: 20px;
      max-height: calc(90vh - 200px);
      overflow-y: auto;
    }

    .form-row {
      margin-bottom: 15px;
    }

    .form-row label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .input-group {
      display: flex;
      gap: 8px;
    }

    .input-group input,
    .input-group textarea {
      flex: 1;
    }

    #wishlist-widget input,
    #wishlist-widget textarea {
      width: 100%;
      padding: 10px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      transition: border-color 0.2s;
    }

    #wishlist-widget input:focus,
    #wishlist-widget textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    #wishlist-widget input[readonly] {
      background: #f5f5f5;
      color: #666;
    }

    .target-btn {
      background: #667eea;
      border: none;
      color: #fff;
      font-size: 20px;
      width: 44px;
      height: 44px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .target-btn:hover {
      background: #5568d3;
      transform: scale(1.05);
    }

    .target-btn.active {
      background: #ff6b6b;
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .image-preview-container {
      margin-top: 20px;
    }

    .image-preview {
      width: 250px;
      height: 250px;
      border: 2px dashed #e0e0e0;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 10px;
      overflow: hidden;
      background: #f9f9f9;
    }

    .image-preview img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .preview-placeholder {
      color: #999;
      font-size: 14px;
    }

    .widget-footer {
      padding: 20px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancel {
      background: #e0e0e0;
      color: #666;
    }

    .btn-cancel:hover {
      background: #d0d0d0;
    }

    .btn-save {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }

    .btn-save:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102,126,234,0.4);
    }

    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .status-message {
      padding: 0 20px 20px;
      font-size: 14px;
      text-align: center;
      display: none;
    }

    .status-message.success {
      color: #4caf50;
      display: block;
    }

    .status-message.error {
      color: #f44336;
      display: block;
    }

    .status-message.info {
      color: #2196F3;
      display: block;
    }

    .wishlist-target-highlight {
      outline: 3px solid #667eea !important;
      outline-offset: 2px;
      cursor: crosshair !important;
      box-shadow: 0 0 0 4px rgba(102,126,234,0.2) !important;
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
    overlay: document.getElementById('wishlist-widget-overlay'),
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
      this.overlay.style.display = 'flex';
      this.container.style.display = 'block';
      this.fields.product_url.value = window.location.href;
      this.updatePreview();
      this.expand();
    },

    hide() {
      this.overlay.style.display = 'none';
      this.container.style.display = 'none';
      this.exitTargetMode();
    },

    toggle() {
      if (this.overlay.style.display === 'none' || !this.overlay.style.display) {
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
      this.collapse(); // Collapse widget when entering target mode
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
      this.expand(); // Expand widget when exiting target mode
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
        this.dragState.initialX = rect.left + rect.width / 2 - window.innerWidth / 2;
        this.dragState.initialY = rect.top + rect.height / 2 - window.innerHeight / 2;

        e.preventDefault();
      });

      document.addEventListener('mousemove', (e) => {
        if (!this.dragState.isDragging) return;

        const deltaX = e.clientX - this.dragState.startX;
        const deltaY = e.clientY - this.dragState.startY;

        const newX = this.dragState.initialX + deltaX;
        const newY = this.dragState.initialY + deltaY;

        this.container.style.transform = `translate(calc(-50% + ${newX}px), calc(-50% + ${newY}px))`;
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

  // Close on overlay click
  widget.overlay.addEventListener('click', (e) => {
    if (e.target === widget.overlay) {
      widget.hide();
    }
  });

  // ESC key handling
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (widget.targetMode) {
        widget.exitTargetMode();
      } else if (widget.overlay.style.display !== 'none') {
        widget.hide();
      }
    }
  });

  // Expose widget globally
  window.wishlistWidget = widget;

  // Show widget
  widget.show();
})();
