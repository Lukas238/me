---
layout: base
title: Wishlist
permalink: /wishlist/
---

<h1>Wishlist</h1>
<p class="lead">My ever-growing list of wants and desires. Browse at your own risk!</p>
<p class="wishlist-summary" id="wishlist-summary"></p>

<!-- Owner-only controls: hidden until the worker accepts the session token saved by /login/ -->
<div id="wishlist-admin" class="wishlist-admin" hidden>
  <a id="wishlist-admin__sheet" href="#" target="_blank" rel="noopener">Open sheet</a>
  <button type="button" data-sync="amazon">Sync Amazon</button>
  <button type="button" id="wishlist-admin__lock">Log out</button>
  <span id="wishlist-admin__status"></span>
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
    </div>
</script>



<script src="https://unpkg.com/axios@1.6.7/dist/axios.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<script>
  const wishlistWorkerUrl = 'https://wishlist-sync.dassolucas.workers.dev/';
  
  // Helper function to format dates
  function formatDate(dateString) {
    if (!dateString) return null;
    
    try {
      let dateObj;
      
      if (typeof dateString === 'number') {
        dateObj = new Date(dateString);
      } else if (typeof dateString === 'string') {
        // Check if it's in the format "Date(year,month,day)"
        const dateMatch = dateString.match(/Date\((\d+),(\d+),(\d+)\)/);
        if (dateMatch) {
          const [, year, month, day] = dateMatch;
          dateObj = new Date(parseInt(year), parseInt(month), parseInt(day));
        } else {
          // Try parsing as regular date string
          dateObj = new Date(dateString);
        }
      }
      
      // Check if date is valid
      if (!dateObj || isNaN(dateObj.getTime())) {
        console.warn('Invalid date:', dateString);
        return null;
      }
      
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return null;
    }
  }
  
  // Helper function to parse date to timestamp for sorting
  function parseDate(dateString) {
    if (!dateString) return null;
    
    try {
      let dateObj;
      
      if (typeof dateString === 'number') {
        dateObj = new Date(dateString);
      } else if (typeof dateString === 'string') {
        // Check if it's in the format "Date(year,month,day)"
        const dateMatch = dateString.match(/Date\((\d+),(\d+),(\d+)\)/);
        if (dateMatch) {
          const [, year, month, day] = dateMatch;
          dateObj = new Date(parseInt(year), parseInt(month), parseInt(day));
        } else {
          // Try parsing as regular date string
          dateObj = new Date(dateString);
        }
      }
      
      // Check if date is valid
      if (!dateObj || isNaN(dateObj.getTime())) {
        console.warn('Cannot parse date for sorting:', dateString);
        return null;
      }
      
      return dateObj.getTime();
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return null;
    }
  }
  
  // Function to fetch JSON data
  async function fetchJson(url) {
    // Use axios here
    const response = await axios.get(url);
    return response.data;
  }

  // Function to process wishlist worker data
  async function processWishlistWorkerData() {
    try {
      const data = await fetchJson(wishlistWorkerUrl);
      console.log('Wishlist worker data:', data);
      
      // Combine amazon and user_list arrays
      const allProducts = [
        ...(data.amazon || []),
        ...(data.user_list || [])
      ];
      
      // Log first product to see date format
      if (allProducts.length > 0) {
        console.log('First product sample:', allProducts[0]);
        console.log('Date format example:', allProducts[0].date_added, typeof allProducts[0].date_added);
      }
      
      // Transform to match our template format
      return allProducts.map(product => ({
        title: product.title || '',
        link: product.product_url || '',
        img: product.image_url || '',
        description: product.notes || '',
        date_added: product.date_added || null
      }));
    } catch (error) {
      console.error('Error fetching or processing wishlist worker data:', error);
      return [];
    }
  }


  // Function to render the combined product list
  async function renderProductList() {
    const wishlistContainer = document.getElementById('wishlist-container__list');
    if (!wishlistContainer) {
      console.error("Element with ID 'wishlist-container__list' not found.");
      return;
    }

    try {
      const products = await processWishlistWorkerData();
      console.log('Total products:', products.length);

      // Sort by date_added (newest first)
      // Products without date_added will be at the end
      products.sort((a, b) => {
        const dateA = parseDate(a.date_added);
        const dateB = parseDate(b.date_added);
        
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        // Sort descending (newest first) - note the order is reversed
        return dateB - dateA;
      });

      console.log('First 5 products after sort:', products.slice(0, 5).map(p => ({
        title: p.title?.substring(0, 30),
        date_added: p.date_added,
        parsed: parseDate(p.date_added)
      })));

      // Update summary info
      const summaryEl = document.getElementById('wishlist-summary');
      if (summaryEl) {
        const itemCount = products.length;
        const lastUpdate = products.find(p => p.date_added)?.date_added;
        let summaryText = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
        
        if (lastUpdate) {
          const formattedDate = formatDate(lastUpdate);
          if (formattedDate) {
            summaryText += ` - Last update: ${formattedDate}`;
          }
        }
        
        summaryEl.textContent = summaryText;
      }

      // Get the template
      const template = document.getElementById('product-card-template').textContent;

      // Render the products as HTML
      let cardsListHtml = '';
      products.forEach((product, index) => {
        // Generate image HTML
        let imageHtml = '';
        const hasNotes = product.description && product.description.trim() !== '';
        
        if (product.img && product.img.trim() !== '') {
          imageHtml = `<div class="wishlist-item__image-wrapper"><img src="${product.img}" alt="${product.title}" class="wishlist-item__image" loading="lazy"></div>`;
        } else {
          imageHtml = `<div class="wishlist-item__no-image">No image</div>`;
        }

        // Generate meta items
        let metaItems = '';
        
        // Added date (first item)
        if (product.date_added) {
          const formattedDate = formatDate(product.date_added);
          if (formattedDate) {
            metaItems += `<li class="date-added">${formattedDate}</li>`;
          }
        }
        
        // Info button (if has notes)
        if (hasNotes) {
          metaItems += `<li class="info-button-container"><button class="wishlist-item__info-button" data-bs-toggle="popover" data-bs-trigger="click" data-bs-placement="top" data-bs-content="${product.description.replace(/"/g, '&quot;')}" data-bs-html="true" tabindex="0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg></button></li>`;
        }

        // Populate the template with data
        let cardHtml = template
            .replace('@@title@@', product.title || 'Untitled')
            .replace('@@image@@', imageHtml)
            .replace('@@metaItems@@', metaItems)
            .replace(/@@link@@/g, product.link || '#');

        cardsListHtml += cardHtml;
      });

      wishlistContainer.innerHTML = cardsListHtml;

      // Handle image loading
      const images = wishlistContainer.querySelectorAll('.wishlist-item__image');
      images.forEach(img => {
        const wrapper = img.closest('.wishlist-item__image-wrapper');
        
        // If image is already loaded (cached)
        if (img.complete) {
          img.classList.add('loaded');
          if (wrapper) wrapper.classList.add('loaded');
        } else {
          // Add loaded class when image loads
          img.addEventListener('load', () => {
            img.classList.add('loaded');
            if (wrapper) wrapper.classList.add('loaded');
          });
          
          // Handle error case
          img.addEventListener('error', () => {
            if (wrapper) wrapper.classList.add('loaded');
          });
        }
      });

      // Initialize Bootstrap popovers
      const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
      [...popoverTriggerList].map(popoverTriggerEl => {
        // Prevent click propagation to parent link
        popoverTriggerEl.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
        
        return new bootstrap.Popover(popoverTriggerEl, {
          container: 'body',
          trigger: 'focus'
        });
      });

    } catch (error) {
      console.error('Error rendering product list:', error);
      wishlistContainer.innerHTML = `<p>Error loading wishlist. Check the console for details.</p>`;
    }
  }

  // Call the render function
  renderProductList();
</script>

<script>
  // Owner-only controls. The session token is saved by /login/.
  (function () {
    const TOKEN_KEY = 'wishlistAdminToken';

    if (!localStorage.getItem(TOKEN_KEY)) return;

    const bar = document.getElementById('wishlist-admin');
    const statusEl = document.getElementById('wishlist-admin__status');

    const authHeaders = () => ({ Authorization: 'Bearer ' + localStorage.getItem(TOKEN_KEY) });

    function lock() {
      localStorage.removeItem(TOKEN_KEY);
      bar.hidden = true;
    }

    // The worker decides whether the token is still valid
    async function showControls() {
      try {
        const res = await axios.get(wishlistWorkerUrl + 'admin/session', { headers: authHeaders() });
        document.getElementById('wishlist-admin__sheet').href = res.data.sheetUrl;
        bar.hidden = false;
      } catch (e) {
        lock();
      }
    }

    async function runSync(source) {
      const buttons = bar.querySelectorAll('button');
      buttons.forEach(b => b.disabled = true);
      statusEl.textContent = 'Syncing...';
      try {
        const res = await axios.get(wishlistWorkerUrl + 'sync/' + source, { headers: authHeaders() });
        statusEl.textContent = (res.data.results || [])
          .map(r => r.source + ': ' + (r.success ? r.count + ' items' : 'failed'))
          .join(', ');
        renderProductList();
      } catch (e) {
        if (e.response && e.response.status === 401) {
          lock();
        } else {
          statusEl.textContent = 'Sync failed';
        }
      } finally {
        buttons.forEach(b => b.disabled = false);
      }
    }

    bar.querySelectorAll('[data-sync]').forEach(btn => {
      btn.addEventListener('click', () => runSync(btn.dataset.sync));
    });
    document.getElementById('wishlist-admin__lock').addEventListener('click', lock);

    showControls();
  })();
</script>
