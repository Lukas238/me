/**
 * Amazon Wishlist Scraper
 *
 * Scrapes products from a hardcoded Amazon wishlist URL
 * Returns normalized product array
 */

import * as cheerio from 'cheerio';

const AMAZON_WISHLIST_URL = 'https://www.amazon.com/hz/wishlist/ls/35A8QWIZ90CH';

/**
 * Scrape Amazon wishlist
 * @param {Object} env - Worker environment (not used for Amazon, but kept for consistent interface)
 * @returns {Promise<Array>} - Array of products
 */
export async function scrape(env) {
  try {
    // Get wishlist page content
    const content = await getPageContent(AMAZON_WISHLIST_URL);

    if (typeof content === 'object' && content.error) {
      throw new Error(`Failed to fetch Amazon wishlist: ${content.error}`);
    }

    // Parse items from first page
    let items = await parseItems(content);

    if (items.length === 0) {
      console.warn('No items found on Amazon wishlist');
      return [];
    }

    // Check for "Show More" pagination
    const $ = cheerio.load(content);
    const showMoreUrlInput = $('input[name="showMoreUrl"]');

    if (showMoreUrlInput.length > 0) {
      let nextPageUrl = showMoreUrlInput.val();
      if (nextPageUrl) {
        nextPageUrl = 'https://www.amazon.com' + nextPageUrl;
        const additionalContent = await getPageContent(nextPageUrl);
        const additionalItems = await parseItems(additionalContent);

        if (additionalItems.length > 0) {
          items = items.concat(additionalItems);
        }
      }
    }

    // Normalize to standard product format
    const products = items.map(item => ({
      title: item.title || '',
      image_url: item.img || '',
      product_url: item.link || '',
      notes: '',
      date_added: new Date().toISOString().split('T')[0]
    }));

    return products;

  } catch (error) {
    console.error('Amazon scraper error:', error);
    throw error;
  }
}

/**
 * Parse items from HTML content
 */
async function parseItems(content) {
  const $ = cheerio.load(content);
  const items = [];

  $('li.g-item-sortable').each((index, element) => {
    const title = $(element).find('h2 > a').attr('title');
    const link = 'https://www.amazon.com' + $(element).find('h2 > a').attr('href');
    let img = $(element).find('a > img').attr('src');

    // Improve image quality: Amazon uses different size patterns in URLs
    // Patterns: ._SLxx_, ._SSxx_, ._AC_USxx_, etc.
    // Replace any size pattern with no size restriction to get largest available
    if (img) {
      // Remove size restrictions from Amazon image URLs
      // This gets the full-size image instead of thumbnails
      img = img
        .replace(/\._S[LSX]\d+_/g, '')  // Remove ._SL75_, ._SS135_, ._SX300_, etc.
        .replace(/\._AC_US\d+_/g, '._AC_')  // Remove ._AC_US40_ etc, keep ._AC_
        .replace(/\._SR\d+,\d+_/g, '');  // Remove ._SR135,135_, etc.
    }

    if (title && link && img) {
      items.push({ title, link, img });
    }
  });

  return items;
}

/**
 * Fetch page content
 */
async function getPageContent(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    return html;
  } catch (error) {
    return { error: error.message };
  }
}
