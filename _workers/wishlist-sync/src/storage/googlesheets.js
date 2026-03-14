/**
 * Google Sheets Storage Adapter
 *
 * Read/Write operations for Google Sheets via:
 * - Reading: Direct gviz/tq endpoint (public read)
 * - Writing: Google Apps Script web app
 */

const ALL_SOURCES = ['amazon', 'user_list'];

/**
 * Read products from Google Sheet
 * @param {string|string[]} sources - Source name(s) to read ('amazon', 'user_list', or array of them)
 * @param {string} sheetId - Google Sheet ID
 * @returns {Promise<Object>} - { amazon: [...], user_list: [...] }
 */
export async function readProducts(sources, sheetId) {
  if (!sheetId) {
    throw new Error('GOOGLE_SHEET_ID not configured');
  }

  // Normalize sources to array
  const sourcesToRead = Array.isArray(sources)
    ? sources
    : (sources ? [sources] : ALL_SOURCES);

  const result = {};

  for (const source of sourcesToRead) {
    // Validate source
    if (!ALL_SOURCES.includes(source)) {
      console.warn(`Unknown source: ${source}`);
      continue;
    }

    try {
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${source}`;

      const response = await fetch(sheetUrl);
      const text = await response.text();

      // Parse Google's JSONP format: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
      let jsonText = text.replace(/^\/\*.*?\*\/\s*/, '');

      const match = jsonText.match(/google\.visualization\.Query\.setResponse\((.*)\);?$/s);
      if (match) {
        jsonText = match[1];
      }

      const data = JSON.parse(jsonText);

      // Google Sheets API already separates headers (in table.cols) from data (in table.rows)
      // No need to skip first row - it's already data, not a header
      const rows = data.table.rows;

      console.log(`[${source}] Total rows from sheet:`, rows.length);

      const products = rows.map((row, index) => {
        const cells = row.c || [];
        const product = {
          date_added: cells[0]?.v || '',
          title: cells[1]?.v || '',
          notes: cells[2]?.v || '',
          image_url: cells[3]?.v || '',
          product_url: cells[4]?.v || ''
        };

        // Log empty titles for debugging
        if (!product.title) {
          console.warn(`[${source}] Row ${index + 2} has empty title:`, {
            date_added: product.date_added,
            product_url: product.product_url,
            cells: cells.map(c => c?.v)
          });
        }

        return product;
      });

      // Don't filter out empty titles - return all rows, let the consumer decide
      result[source] = products;

    } catch (error) {
      console.error(`Error reading source ${source}:`, error);
      result[source] = [];
    }
  }

  return result;
}

/**
 * Write products to Google Sheet
 * @param {string} source - Source name ('amazon', 'user_list')
 * @param {Array} products - Array of products to write
 * @param {string} appsScriptUrl - Google Apps Script deployment URL
 * @returns {Promise<Object>} - Response from Apps Script
 */
export async function writeProducts(source, products, appsScriptUrl) {
  if (!appsScriptUrl) {
    throw new Error('GOOGLE_APPS_SCRIPT_URL not configured');
  }

  if (!ALL_SOURCES.includes(source)) {
    throw new Error(`Invalid source: ${source}. Must be one of: ${ALL_SOURCES.join(', ')}`);
  }

  if (!Array.isArray(products) || products.length === 0) {
    throw new Error('Products must be a non-empty array');
  }

  // Normalize products format
  const normalizedProducts = products.map(p => ({
    date_added: p.date_added || new Date().toISOString().split('T')[0],
    title: p.title || '',
    notes: p.notes || '',
    image_url: p.image_url || '',
    product_url: p.product_url || ''
  }));

  const payload = {
    source: source,
    products: normalizedProducts
  };

  const response = await fetch(appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    redirect: 'follow'
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Apps Script returned ${response.status}: ${text}`);
  }

  return await response.json();
}

/**
 * Read configuration from Google Sheet "config" tab
 * Config sheet format: key | value
 * @param {string} sheetId - Google Sheet ID
 * @returns {Promise<Object>} - { key: value, ... }
 */
export async function readConfig(sheetId) {
  if (!sheetId) {
    throw new Error('GOOGLE_SHEET_ID not configured');
  }

  try {
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=config`;

    const response = await fetch(sheetUrl);
    const text = await response.text();

    // Parse Google's JSONP format
    let jsonText = text.replace(/^\/\*.*?\*\/\s*/, '');
    const match = jsonText.match(/google\.visualization\.Query\.setResponse\((.*)\);?$/s);
    if (match) {
      jsonText = match[1];
    }

    const data = JSON.parse(jsonText);

    // Parse rows (skip header row)
    const rows = data.table.rows.slice(1);

    const config = {};
    rows.forEach(row => {
      const cells = row.c || [];
      const key = cells[0]?.v;
      const value = cells[1]?.v;
      if (key) {
        config[key] = value || '';
      }
    });

    return config;

  } catch (error) {
    console.error('Error reading config:', error);
    return {}; // Return empty config on error
  }
}

/**
 * Write configuration to Google Sheet "config" tab
 * @param {Object} config - { key: value, ... }
 * @param {string} appsScriptUrl - Google Apps Script deployment URL
 * @returns {Promise<Object>} - Response from Apps Script
 */
export async function writeConfig(config, appsScriptUrl) {
  if (!appsScriptUrl) {
    throw new Error('GOOGLE_APPS_SCRIPT_URL not configured');
  }

  if (!config || typeof config !== 'object') {
    throw new Error('Config must be an object');
  }

  // Convert config object to array of [key, value] pairs
  const configArray = Object.entries(config).map(([key, value]) => ({
    key,
    value: String(value || '')
  }));

  const payload = {
    source: 'config',
    config: configArray
  };

  const response = await fetch(appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    redirect: 'follow'
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Apps Script returned ${response.status}: ${text}`);
  }

  return await response.json();
}
