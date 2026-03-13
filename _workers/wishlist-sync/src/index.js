/**
 * Cloudflare Worker: Wishlist Sync
 *
 * Unified worker for managing wishlist with modular scrapers and storage
 *
 * API Endpoints:
 * - GET /                  → Read all products from storage
 * - GET /:source           → Read products from specific source (amazon, others)
 * - GET /sync              → Scrape all sources and save to storage
 * - GET /sync/:source      → Scrape specific source and save to storage
 * - POST /                 → Add manual product to "others"
 */

import * as amazonScraper from './scrapers/amazon.js';
import { readProducts, writeProducts } from './storage/index.js';

const SCRAPERS = {
  amazon: amazonScraper
};

const ALL_SOURCES = ['amazon', 'others'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    try {
      // POST / → Add manual product to "others"
      if (request.method === 'POST' && path === '/') {
        return await handleManualProduct(request, env);
      }

      // GET requests
      if (request.method === 'GET') {
        // GET /sync or /sync/:source → Scrape and write
        if (path.startsWith('/sync')) {
          const source = path.split('/')[2]; // /sync/amazon → "amazon"
          return await handleSync(source, env);
        }

        // GET /:source → Read from storage
        if (path.length > 1) {
          const source = path.substring(1); // /amazon → "amazon"
          return await handleRead(source, env);
        }

        // GET / → Read all from storage
        return await handleRead(null, env);
      }

      return jsonResponse({ error: 'Method not allowed' }, 405);

    } catch (error) {
      console.error('Error:', error);
      return jsonResponse({
        error: error.message,
        stack: error.stack
      }, 500);
    }
  },

  /**
   * Scheduled handler - Triggered by cron
   * Automatically syncs all sources on schedule
   */
  async scheduled(event, env, ctx) {
    console.log('Cron triggered:', event.cron, new Date().toISOString());

    try {
      // Sync all sources
      const results = await handleSyncInternal(null, env);

      console.log('Cron sync completed:', results);
    } catch (error) {
      console.error('Cron sync error:', error);
    }
  }
};

/**
 * GET / or GET /:source
 * Read products from storage
 */
async function handleRead(source, env) {
  try {
    const sources = source ? [source] : ALL_SOURCES;

    // Validate source
    if (source && !ALL_SOURCES.includes(source)) {
      return jsonResponse({ error: `Invalid source: ${source}. Must be one of: ${ALL_SOURCES.join(', ')}` }, 400);
    }

    const products = await readProducts(sources, env.GOOGLE_SHEET_ID);

    // If specific source requested, return only that source's products
    if (source) {
      return jsonResponse(products[source] || []);
    }

    // Otherwise return full object
    return jsonResponse(products);

  } catch (error) {
    console.error('Error reading products:', error);
    return jsonResponse({
      error: 'Failed to read products',
      details: error.message
    }, 500);
  }
}

/**
 * GET /sync or /sync/:source
 * Scrape websites and write to storage (HTTP handler)
 */
async function handleSync(source, env) {
  try {
    const results = await handleSyncInternal(source, env);

    return jsonResponse({
      message: 'Sync completed',
      results
    });

  } catch (error) {
    console.error('Sync error:', error);
    return jsonResponse({
      error: 'Failed to sync',
      details: error.message
    }, 500);
  }
}

/**
 * Internal sync logic (used by both HTTP and cron)
 * @returns {Promise<Array>} - Array of sync results
 */
async function handleSyncInternal(source, env) {
  // Determine which sources to sync
  const sourcesToSync = source ? [source] : Object.keys(SCRAPERS);

  // Validate source
  if (source && !SCRAPERS[source]) {
    throw new Error(`Invalid source: ${source}. Must be one of: ${Object.keys(SCRAPERS).join(', ')}`);
  }

  const results = [];

  for (const sourceName of sourcesToSync) {
    try {
      console.log(`[${sourceName}] Starting scrape...`);

      // Scrape products (pass env for scrapers that need it, like MercadoLibre)
      const scraper = SCRAPERS[sourceName];
      const products = await scraper.scrape(env);

      console.log(`[${sourceName}] Scraped ${products.length} products`);

      // Write to storage
      if (products.length > 0) {
        const writeResult = await writeProducts(
          sourceName,
          products,
          env.GOOGLE_APPS_SCRIPT_URL
        );

        results.push({
          source: sourceName,
          success: true,
          count: products.length,
          storageResponse: writeResult
        });
      } else {
        results.push({
          source: sourceName,
          success: true,
          count: 0,
          message: 'No products found'
        });
      }

    } catch (error) {
      console.error(`[${sourceName}] Sync error:`, error);
      results.push({
        source: sourceName,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * POST /
 * Add manual product to "others" source
 */
async function handleManualProduct(request, env) {
  try {
    const data = await request.json();

    if (!data.title) {
      return jsonResponse({ error: 'title is required' }, 400);
    }

    // Normalize product
    const product = {
      date_added: data.date_added || new Date().toISOString().split('T')[0],
      title: data.title,
      notes: data.notes || '',
      image_url: data.image_url || '',
      product_url: data.product_url || ''
    };

    // Write to "others" source
    const result = await writeProducts(
      'others',
      [product],
      env.GOOGLE_APPS_SCRIPT_URL
    );

    return jsonResponse({
      success: true,
      message: 'Product added to wishlist',
      product,
      storageResponse: result
    });

  } catch (error) {
    console.error('Error adding manual product:', error);
    return jsonResponse({
      error: 'Failed to add product',
      details: error.message
    }, 500);
  }
}

/**
 * CORS headers
 */
function handleCORS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

/**
 * Helper: JSON response with CORS
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
