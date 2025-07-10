---
layout: base
title: Whishlist
---

<br/>

# Wishlist
My ever-growing list of wants and desires. Browse at your own risk! (You might find something you want too.)



<div id="wishlist-container">
  <div id="wishlist-container__list" class="row">  
    <div class="col-auto mx-auto my-5">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>
    </div>
</div>


<!-- Template for the product card -->
<script id="product-card-template" type="text/template">
    <div class="col-auto">
        <div class="card mb-3" style="width: 18rem;">
            <a href="@@productUrl@@" target="_blank" style="min-height: 200px; display: inline-flex;">@@imageHtml@@</a>
            <div class="card-body">
                <h5 class="card-title h6">@@title@@</h5>
                <p class="card-text">@@description@@</p>
                <a class="icon-link icon-link-hover fs-6" style="--bs-icon-link-transform: translate3d(0, -.125rem, 0);" href="@@productUrl@@" target="_blank">View Product</a>
            </div>
        </div>
    </div>
</script>



<script src="https://unpkg.com/axios@1.6.7/dist/axios.min.js"></script>

<script>
  const boardUrl = 'https://trello.com/b/NjOxqya1.json';
  const awsWishlistUrl = 'https://aws-wishlist-scrapper-worker.dassolucas.workers.dev/?url=https://www.amazon.com/hz/wishlist/ls/35A8QWIZ90CH?type=wishlist&filter=unpurchased&sort=priority&viewType=list';

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

  // Function to process AWS wishlist data
  async function processAwsWishlistData() {
    try {
      // Fetch the HTML content from the AWS wishlist URL avoid CORS issues
      const response = await fetch(awsWishlistUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();
      return html;
    } catch (error) {
      console.error('Error fetching or processing AWS wishlist data:', error);
      return [];
    }
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
      console.log(trelloProducts);
      const awsProducts = await processAwsWishlistData();
      console.log(awsProducts);

      // Merge the two product lists
      const combinedProducts = [...trelloProducts, ...awsProducts];

      // Get the template
      const template = document.getElementById('product-card-template').textContent;

      // Render the products as HTML
      let cardsListHtml = '';
      combinedProducts.forEach(product => {
        // Create the image tag
        const imageHtml = product.img ? `<img src="${product.img}" class="card-img-top" alt="${product.title}" style="align-self: center;">` : '';

        // Populate the template with data
        let cardHtml = template.replace('@@imageHtml@@', imageHtml)
                               .replace('@@title@@', product.title || '')
                               .replace(/@@productUrl@@/g, product.link);

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
