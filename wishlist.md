---
layout: base
---

<div id="wishlist"></div>


<script>

const boardUrl = 'https://trello.com/b/NjOxqya1.json';

fetch(boardUrl)
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
})
.then(boardData => {
  const wishlist = document.getElementById('wishlist');
  if (!wishlist) {
    console.error("Element with ID 'wishlist' not found.");
    return;
  }

  if (boardData.lists && boardData.lists.length > 0) {
    const firstListId = boardData.lists[0].id;
    const cards = boardData.cards.filter(card => card.idList === firstListId);

    let ulHtml = '';

    cards.forEach(card => {
      let description = card.desc || '';
      let url = '';
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urlMatch = description.match(urlRegex);

      if (urlMatch && urlMatch.length > 0) {
        url = urlMatch[0];
        description = description.replace(url, '').trim();
      }

      let imageHtml = '';
      if (card.attachments && card.attachments.length > 0) {
        const imageAttachment = card.attachments.find(attachment => attachment.url && attachment.name);

        if (imageAttachment){
          imageHtml = `<img src="${imageAttachment.url}" class="card-img-top shadowl" alt="${card.name}" style="object-fit: contain; height: 150px; width: 100%;">`;
        }
      }

      const cardHtml = `
        <div class="card" style="width:300px;">
          ${imageHtml}
          <div class="card-body">
            <h5 class="card-title">${card.name}</h5>
            <p class="card-text">${description}</p>
          </div>
        </div>
      `;

      const linkedCardHtml = url ? `<a href="${url}" target="_blank" class="text-decoration-none text-reset">${cardHtml}</a>` : cardHtml;

      ulHtml += `<li class="mb-3">${linkedCardHtml}</li>`;
    });

    wishlist.innerHTML = `<ul class="list-unstyled">${ulHtml}</ul>`;

  } else {
    wishlist.innerHTML = `<p>No lists found on the board.</p>`;
  }
})
.catch(error => {
  console.error('Error fetching or processing Trello data:', error);
  const wishlist = document.getElementById('wishlist');
  if (wishlist) {
    wishlist.innerHTML = `<p>Error loading wishlist. Check the console for details.</p>`;
  } else {
    console.error("Element with ID 'wishlist' not found to display error message.");
  }
});






</script>
