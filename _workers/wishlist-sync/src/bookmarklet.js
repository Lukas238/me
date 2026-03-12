// Wishlist Widget Bookmarklet
// Usage: Load this script from the bookmarklet to inject the widget

(function() {
  'use strict';

  // Avoid duplicate injection
  if (window.wishlistWidget) {
    window.wishlistWidget.toggle();
    return;
  }

  const WORKER_URL = 'https://wishlist-sync.dassolucas.workers.dev/';

  // Create widget HTML
  const widgetHTML = `
    <div id="wishlist-widget-overlay">
      <div id="wishlist-widget">
        <div class="widget-header">
          <h2>📚 Add to Wishlist</h2>
          <button class="close-btn" id="wishlist-close">✕</button>
        </div>
        
        <div class="widget-body">
          <div class="form-row">
            <label>Product URL</label>
            <input type="text" id="product_url" readonly />
          </div>

          <div class="form-row">
            <label>Title *</label>
            <div class="input-group">
              <input type="text" id="title" placeholder="Product title" />
              <button class="target-btn" data-field="title" title="Click to select element">🎯</button>
            </div>
          </div>

          <div class="form-row">
            <label>Notes</label>
            <div class="input-group">
              <textarea id="notes" placeholder="Optional notes" rows="2"></textarea>
              <button class="target-btn" data-field="notes" title="Click to select element">🎯</button>
            </div>
          </div>

          <div class="form-row">
            <label>Image URL</label>
            <div class="input-group">
              <input type="text" id="image_url" placeholder="Product image URL" />
              <button class="target-btn" data-field="image_url" title="Click to select image">🎯</button>
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
    </div>
  `;

  // Create widget CSS
  const widgetCSS = `
    #wishlist-widget-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    #wishlist-widget {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .widget-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .widget-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .close-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      font-size: 24px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.2s;
      line-height: 1;
    }

    .close-btn:hover {
      background: rgba(255,255,255,0.3);
    }

    .widget-body {
      padding: 20px;
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
      color: white;
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
      color: white;
    }

    .btn-save:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
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

    /* Element highlighting during target mode */
    .wishlist-target-highlight {
      outline: 3px solid #667eea !important;
      outline-offset: 2px;
      cursor: crosshair !important;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2) !important;
    }

    body.wishlist-target-mode {
      cursor: crosshair !important;
    }

    body.wishlist-target-mode * {
      cursor: crosshair !important;
    }
  `;

  // Inject CSS
  const styleEl = document.createElement('style');
  styleEl.textContent = widgetCSS;
  document.head.appendChild(styleEl);

  // Inject HTML
  const widgetEl = document.createElement('div');
  widgetEl.innerHTML = widgetHTML;
  document.body.appendChild(widgetEl);

  // Widget controller
  const widget = {
    overlay: document.getElementById('wishlist-widget-overlay'),
    container: document.getElementById('wishlist-widget'),
    
    fields: {
      product_url: document.getElementById('product_url'),
      title: document.getElementById('title'),
      notes: document.getElementById('notes'),
      image_url: document.getElementById('image_url'),
    },

    preview: document.getElementById('image-preview'),
    status: document.getElementById('wishlist-status'),

    targetMode: false,
    currentTargetField: null,

    show() {
      this.overlay.style.display = 'flex';
      this.fields.product_url.value = window.location.href;
      this.updatePreview();
    },

    hide() {
      this.overlay.style.display = 'none';
      this.exitTargetMode();
    },

    toggle() {
      if (this.overlay.style.display === 'none') {
        this.show();
      } else {
        this.hide();
      }
    },

    updatePreview() {
      const imageUrl = this.fields.image_url.value.trim();
      if (imageUrl) {
        this.preview.innerHTML = `<img src="${imageUrl}" alt="Preview" />`;
      } else {
        this.preview.innerHTML = '<span class="preview-placeholder">No image selected</span>';
      }
    },

    enterTargetMode(fieldName) {
      this.exitTargetMode();
      this.targetMode = true;
      this.currentTargetField = fieldName;
      document.body.classList.add('wishlist-target-mode');
      
      // Highlight active button
      const btn = document.querySelector(`[data-field="${fieldName}"]`);
      btn?.classList.add('active');

      // Show status
      this.showStatus('Click on an element to capture...', 'info');
    },

    exitTargetMode() {
      this.targetMode = false;
      this.currentTargetField = null;
      document.body.classList.remove('wishlist-target-mode');
      
      // Remove all highlights
      document.querySelectorAll('.wishlist-target-highlight').forEach(el => {
        el.classList.remove('wishlist-target-highlight');
      });

      // Deactivate all target buttons
      document.querySelectorAll('.target-btn.active').forEach(btn => {
        btn.classList.remove('active');
      });
    },

    captureElement(element) {
      if (!this.currentTargetField) return;

      const fieldName = this.currentTargetField;
      const field = this.fields[fieldName];

      if (fieldName === 'image_url') {
        // Capture image URL
        let imageUrl = null;
        
        if (element.tagName === 'IMG') {
          imageUrl = element.src || element.dataset.src;
        } else {
          // Try to find image in background
          const bgImage = window.getComputedStyle(element).backgroundImage;
          const match = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (match) {
            imageUrl = match[1];
          } else {
            // Find first img child
            const img = element.querySelector('img');
            if (img) {
              imageUrl = img.src || img.dataset.src;
            }
          }
        }

        if (imageUrl) {
          field.value = imageUrl;
          this.updatePreview();
          this.showStatus('✓ Image captured!', 'success');
        } else {
          this.showStatus('✗ No image found', 'error');
        }
      } else {
        // Capture text content
        const text = element.innerText?.trim() || element.textContent?.trim() || '';
        if (text) {
          field.value = text;
          this.showStatus(`✓ ${fieldName} captured!`, 'success');
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
      const product = {
        title: this.fields.title.value.trim(),
        product_url: this.fields.product_url.value.trim(),
        notes: this.fields.notes.value.trim(),
        image_url: this.fields.image_url.value.trim(),
      };

      // Validation
      if (!product.title) {
        this.showStatus('✗ Title is required', 'error');
        return;
      }

      // Disable save button
      const saveBtn = document.getElementById('wishlist-save');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      try {
        const response = await fetch(WORKER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          this.showStatus('✓ Saved to wishlist!', 'success');
          
          // Clear form after 1 second
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
  };

  // Event listeners
  document.getElementById('wishlist-close').addEventListener('click', () => widget.hide());
  document.getElementById('wishlist-cancel').addEventListener('click', () => widget.hide());
  document.getElementById('wishlist-save').addEventListener('click', () => widget.save());

  // Image URL input change -> update preview
  widget.fields.image_url.addEventListener('input', () => widget.updatePreview());

  // Target buttons
  document.querySelectorAll('.target-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const fieldName = btn.dataset.field;
      widget.enterTargetMode(fieldName);
    });
  });

  // Global event listeners for target mode
  document.addEventListener('mouseover', (e) => {
    if (!widget.targetMode) return;
    
    // Don't highlight the widget itself
    if (widget.container.contains(e.target)) return;

    // Remove previous highlight
    document.querySelectorAll('.wishlist-target-highlight').forEach(el => {
      if (el !== e.target) {
        el.classList.remove('wishlist-target-highlight');
      }
    });

    // Highlight current element
    e.target.classList.add('wishlist-target-highlight');
  });

  document.addEventListener('click', (e) => {
    if (!widget.targetMode) return;

    // Don't capture clicks on the widget itself
    if (widget.container.contains(e.target)) return;

    e.preventDefault();
    e.stopPropagation();

    widget.captureElement(e.target);
  }, true); // Use capture phase

  // Close on overlay click
  widget.overlay.addEventListener('click', (e) => {
    if (e.target === widget.overlay) {
      widget.hide();
    }
  });

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (widget.targetMode) {
        widget.exitTargetMode();
      } else if (widget.overlay.style.display !== 'none') {
        widget.hide();
      }
    }
  });

  // Expose globally
  window.wishlistWidget = widget;

  // Auto-show on first load
  widget.show();

})();
