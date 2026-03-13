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
  }

  .wishlist-item__link {
    display: block;
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .wishlist-item__link:hover {
    transform: translateY(-2px);
  }

  .wishlist-item__image-wrapper {
    position: relative;
    overflow: hidden;
    background: #f5f5f5;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .wishlist-item__image {
    width: 100%;
    height: auto;
    display: block;
    transition: opacity 0.3s ease;
  }

  .wishlist-item__link:hover .wishlist-item__image {
    opacity: 0.9;
  }

  .wishlist-item__title {
    font-size: 0.875rem;
    line-height: 1.4;
    margin: 0;
    padding: 0 4px;
    color: #333;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
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
    background: #e9ecef;
    color: #6c757d;
    font-size: 0.875rem;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  /* Loading spinner */
  #wishlist-container .spinner-wrapper {
    text-align: center;
    padding: 60px 0;
  }
</style>

<h1>Wishlist</h1>
<p class="lead">My ever-growing list of wants and desires. Browse at your own risk! (You might find something you want too.)</p>

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
    </div>
</script>



<script src="https://unpkg.com/axios@1.6.7/dist/axios.min.js"></script>

<script>
  const boardUrl = 'https://trello.com/b/NjOxqya1.json';
  const wishlistWorkerUrl = 'https://wishlist-sync.dassolucas.workers.dev/';
  
  // Function to fetch JSON data
  async function fetchJson(url) {
    // Use axios here
    const response = await axios.get(url);
    return response.data;
  }

  // Function to process Trello data
  async function processTrelloData() {
    try {
      const boardData = await fetchJson(boardUrl);
      if (boardData.lists && boardData.lists.length > 0) {
        const firstListId = boardData.lists[0].id;
        return boardData.cards.filter(card => card.idList === firstListId).map(card => {
          let description = card.desc || '';
          let url = '';
          const urlRegex = /(https?:\/\/[^\s]+)/g;
          const urlMatch = description.match(urlRegex);

          if (urlMatch && urlMatch.length > 0) {
            url = urlMatch[0];
            description = description.replace(url, '').trim();
          }

          let thumb = null;
          if (card.attachments && card.attachments.length > 0) {
            const imageAttachment = card.attachments.find(attachment => attachment.url && attachment.name);
            if (imageAttachment) {
              thumb = imageAttachment.url;
            }
          }

          return {
            title: card.name,
            link: url,
            img: thumb,
            description: description
          };
        });
      } else {
        console.warn("No lists found on the Trello board.");
        return [];
      }
    } catch (error) {
      console.error('Error fetching or processing Trello data:', error);
      return [];
    }
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
      
      // Transform to match our template format
      return allProducts.map(product => ({
        title: product.title || '',
        link: product.product_url || '',
        img: product.image_url || '',
        description: product.notes || ''
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
      const trelloProducts = await processTrelloData();
      console.log('Trello products:', trelloProducts);
      
      const wishlistProducts = await processWishlistWorkerData();
      console.log('Wishlist worker products:', wishlistProducts);

      // Merge all product lists (Trello + Amazon + user_list)
      const combinedProducts = [...trelloProducts, ...wishlistProducts];
      console.log('Combined products:', combinedProducts.length);

      // Get the template
      const template = document.getElementById('product-card-template').textContent;

      // Render the products as HTML
      let cardsListHtml = '';
      combinedProducts.forEach(product => {
        // Generate image HTML
        let imageHtml = '';
        if (product.img && product.img.trim() !== '') {
          imageHtml = `<div class="wishlist-item__image-wrapper"><img src="${product.img}" alt="${product.title}" class="wishlist-item__image" loading="lazy"></div>`;
        } else {
          imageHtml = `<div class="wishlist-item__no-image">No image</div>`;
        }

        // Populate the template with data
        let cardHtml = template
            .replace('@@title@@', product.title || 'Untitled')
            .replace('@@image@@', imageHtml)
            .replace(/@@link@@/g, product.link || '#');

        cardsListHtml += cardHtml;
      });

      wishlistContainer.innerHTML = cardsListHtml;

    } catch (error) {
      console.error('Error rendering product list:', error);
      wishlistContainer.innerHTML = `<p>Error loading wishlist. Check the console for details.</p>`;
    }
  }

  // Call the render function
  renderProductList();
</script>
