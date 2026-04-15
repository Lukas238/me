---
layout: base
title: Wishlist
permalink: /wishlist/
---

<style>
  /* Masonry grid layout */
  #wishlist-container__list {
    column-count: 4;
    column-gap: 20px;
    padding: 0;
  }

  @media (max-width: 1200px) {
    #wishlist-container__list {
      column-count: 3;
    }
  }

  @media (max-width: 768px) {
    #wishlist-container__list {
      column-count: 2;
      column-gap: 15px;
    }
  }

  @media (max-width: 480px) {
    #wishlist-container__list {
      column-count: 1;
    }
  }

  /* Product card styling */
  .wishlist-item {
    break-inside: avoid;
    margin-bottom: 20px;
    display: inline-block;
    width: 100%;
    border: 1px solid #2a2a2a;
    position: relative;
  }

  .wishlist-item__link {
    display: block;
    text-decoration: none;
    color: inherit;
    position: relative;
  }

  .wishlist-item__image-wrapper {
    position: relative;
    overflow: hidden;
    background: #f5f5f5;
    border-bottom: 1px solid #2a2a2a;
    min-height: 150px;
    max-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .wishlist-item__image-wrapper::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 48px;
    height: 48px;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ccc"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>');
    background-size: contain;
    background-repeat: no-repeat;
    opacity: 1;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .wishlist-item__image-wrapper.loaded::before {
    opacity: 0;
  }

  .wishlist-item__meta {
    border-top: 1px solid #2a2a2a;
    padding: 0;
    margin: 0;
  }

  .wishlist-item__meta ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .wishlist-item__meta li {
    padding: 0.4em 0.8em;
    font-size: 0.7em;
    color: #666;
  }

  .wishlist-item__meta li:not(:first-child) {
    border-left: 1px solid #2a2a2a;
  }

  .wishlist-item__meta li.date-added {
    margin-right: auto;
  }

  .wishlist-item__info-button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    transition: opacity 0.2s ease;
  }

  .wishlist-item__info-button:hover {
    opacity: 0.7;
  }

  .wishlist-item__info-button svg {
    width: 16px;
    height: 16px;
    fill: #2a2a2a;
  }

  .wishlist-item__image {
    width: 100%;
    height: auto;
    max-height: 400px;
    display: block;
    transition: opacity 0.3s ease;
    margin-bottom: 0;
    position: relative;
    z-index: 1;
    opacity: 0;
    object-fit: contain;
  }

  .wishlist-item__image.loaded {
    opacity: 1;
  }

  .wishlist-item__link:hover .wishlist-item__image.loaded {
    opacity: 0.95;
  }

  .wishlist-item__title {
    font-size: 0.8em;
    line-height: 1.4;
    margin: 0;
    padding: 0.4em .8em;
    color: #333;
  min-height: 1em;
  font-family: "Helvetica Neue","Segoe UI",Helvetica,Arial,sans-serif;
  font-weight: 300;
  }

  .wishlist-item__link:hover .wishlist-item__title {
    color: #000;
  }

  /* Placeholder for items without images */
  .wishlist-item__no-image {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    color: #adb5bd;
    font-size: 0.875rem;
    border-radius: 8px;
    margin-bottom: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08);
    border: 1px solid #e9ecef;
  }

  /* Loading spinner */
  #wishlist-container .spinner-wrapper {
    text-align: center;
    padding: 60px 0;
  }

  /* Summary info */
  .wishlist-summary {
    font-size: 0.85em;
    color: #666;
    margin-top: 0.5em;
    margin-bottom: 1.5em;
  }
</style>

<h1>Wishlist</h1>
<p class="lead">My ever-growing list of wants and desires. Browse at your own risk!</p>
<p class="wishlist-summary" id="wishlist-summary"></p>

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
          metaItems += `<li><button class="wishlist-item__info-button" data-bs-toggle="popover" data-bs-trigger="click" data-bs-placement="top" data-bs-content="${product.description.replace(/"/g, '&quot;')}" data-bs-html="true" tabindex="0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg></button></li>`;
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
