---
layout: base
title: Whishlist
---

<br/>

# Wishlist
My ever-growing list of wants and desires. Browse at your own risk! (You might find something you want too.)



<div id="wishlist-container">
  <div id="wishlist-container__list" class="row">  
    <div class="col-auto w-75">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>
    </div>
</div>


<!-- Template for the product card -->
<script id="product-card-template" type="text/template">
  <div class="col-auto">
  <div class="card mb-3" style="max-width: 540px;">
    <div class="row g-0">
      <div class="col-md-4">
        <a href="{{productUrl}}" target="_blank">
          {{imageHtml}}
          </a>
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title h6">{{title}}</h5>
            <p class="card-text">{{description}}</p>
            <a class="icon-link icon-link-hover fs-6" style="--bs-icon-link-transform: translate3d(0, -.125rem, 0);" href="{{productUrl}}" target="_blank">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-seam" viewBox="0 0 16 16">
  <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2zm3.564 1.426L5.596 5 8 5.961 14.154 3.5zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464z"/>
</svg>
              Go to product page
            </a>


          </div>
        </div>
      </div>
  </div>
  </div>
</script>


<script>
  const boardUrl = 'https://trello.com/b/NjOxqya1.json';
  const awsWishlistUrl = 'https://get-my-whishlist.dassolucas.workers.dev/';

  // Function to fetch JSON data
  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  }

  // Function to fetch HTML data
  async function fetchHtml(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.text();
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
            description: description,
            url: url,
            thumb: thumb
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

  // Function to process AWS wishlist data
  async function processAwsWishlistData() {
    try {
      const html = await fetchHtml(awsWishlistUrl);
      return parseWishlistItems(html);
    } catch (error) {
      console.error('Error fetching or processing AWS wishlist data:', error);
      return [];
    }
  }

  // Function to parse AWS wishlist HTML
  function parseWishlistItems(html) {
    const items = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const productList = doc.getElementById('wl-item-view');
    if (!productList) {
      console.log('Could not find <div id="wl-item-view"');
      return items;
    }

    const itemElements = productList.querySelectorAll('li.g-item-sortable');

    itemElements.forEach(itemElement => {
      const item = {};

      // Extract image URL and title
      const imgElement = itemElement.querySelector('img');
      if (imgElement) {
        item.thumb = imgElement.getAttribute('src');
        item.title = imgElement.getAttribute('alt');

        // Cleanup the image URL
        if (item.thumb) {
          const dotIndex = item.thumb.indexOf('._');
          if (dotIndex !== -1) {
            item.thumb = item.thumb.substring(0, dotIndex) + item.thumb.substring(item.thumb.lastIndexOf('.'));
          }
        }
      } else {
        item.thumb = null;
        item.title = null;
      }

      // Extract product URL
      const linkElement = itemElement.querySelector('a.a-link-normal');
      if (linkElement) {
        item.url = linkElement.getAttribute('href');
        item.url = item.url.startsWith('/') ? `https://www.amazon.com${item.url}` : item.url;
      } else {
        item.url = null;
      }

      item.description = null; // Description is not available

      items.push({ title: item.title, description: item.description, url: item.url, thumb: item.thumb });
    });

    return items;
  }

  // Function to render the combined product list
  async function renderProductList() {
    const wishlistContainer = document.getElementById('wishlist-container__list');
    if (!wishlistContainer) {
      console.error("Element with ID 'wishlist-container' not found.");
      return;
    }

    try {
      const trelloProducts = await processTrelloData();
      const awsProducts = await processAwsWishlistData();

      // Merge the two product lists
      const combinedProducts = [...trelloProducts, ...awsProducts];

      // Get the template
      const template = document.getElementById('product-card-template').textContent;

      // Render the products as HTML
      let cardsListHtml = '';
      combinedProducts.forEach(product => {
        // Create the image tag
        const imageHtml = product.thumb ? `<img src="${product.thumb}" class="card-img-left w-100" alt="${product.title}" style="max-height: 170px;">` : '';

        // Populate the template with data
        let cardHtml = template.replace('{{imageHtml}}', imageHtml)
                               .replace('{{title}}', product.title || '')
                               .replace('{{description}}', product.description || '')
                               .replace('{{productUrl}}', product.url);

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