/**
 * Google Apps Script para sincronizar productos al Google Sheet
 *
 * INSTRUCCIONES DE INSTALACIÓN:
 * 1. Abrí tu Google Sheet
 * 2. Ve a Extensions > Apps Script
 * 3. Pegá este código en Code.gs
 * 4. Deploy > New deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copiá la URL del deployment
 * 6. Configurá el secret en Wrangler: wrangler secret put GOOGLE_APPS_SCRIPT_URL
 *    (pegá la URL directamente, sin conversión)
 *
 * ESTRUCTURA DEL SHEET:
 * - Tab "amazon": Productos de Amazon
 * - Tab "mercadolibre": Productos de MercadoLibre
 * - Tab "others": Otros productos
 * - Tab "config": Configuración (tokens, etc.)
 *
 * COLUMNAS (productos):
 * A: date_added
 * B: title
 * C: notes
 * D: image_url
 * E: product_url
 *
 * COLUMNAS (config):
 * A: key
 * B: value
 */

function doPost(e) {
  try {
    // Parsear datos del request
    const data = JSON.parse(e.postData.contents);
    const source = data.source;

    if (!source) {
      return createResponse({
        error: 'Invalid data format. Missing "source" field.'
      }, 400);
    }

    // Obtener el spreadsheet activo
    const sheet = SpreadsheetApp.getActiveSpreadsheet();

    // Buscar o crear el tab según el source
    let targetSheet = sheet.getSheetByName(source);
    if (!targetSheet) {
      targetSheet = sheet.insertSheet(source);
    }

    // Manejar config de manera especial
    if (source === 'config') {
      const config = data.config;
      if (!config || !Array.isArray(config)) {
        return createResponse({
          error: 'Invalid config format. Expected: { source: "config", config: [{key, value}, ...] }'
        }, 400);
      }

      return handleConfig(targetSheet, config);
    }

    // Manejar productos (amazon, mercadolibre, others)
    const products = data.products;
    if (!products || !Array.isArray(products)) {
      return createResponse({
        error: 'Invalid data format. Expected: { source: string, products: array }'
      }, 400);
    }

    return handleProducts(targetSheet, source, products);

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return createResponse({
      error: error.toString()
    }, 500);
  }
}

/**
 * Manejar actualización de config
 */
function handleConfig(sheet, configArray) {
  // Limpiar contenido existente
  sheet.clear();

  // Escribir header
  const headers = ['key', 'value'];
  sheet.appendRow(headers);

  // Formatear header
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#f3f3f3');

  // Escribir config
  if (configArray.length > 0) {
    configArray.forEach(item => {
      sheet.appendRow([
        item.key || '',
        item.value || ''
      ]);
    });

    // Auto-resize columnas
    sheet.autoResizeColumn(1);
    sheet.autoResizeColumn(2);

    // Congelar fila de header
    sheet.setFrozenRows(1);
  }

  Logger.log(`Updated config with ${configArray.length} entries`);

  return createResponse({
    success: true,
    source: 'config',
    count: configArray.length,
    timestamp: new Date().toISOString()
  });
}

/**
 * Manejar actualización de productos
 */
function handleProducts(sheet, source, products) {
  // Limpiar contenido existente
  sheet.clear();

  // Escribir header
  const headers = ['date_added', 'title', 'notes', 'image_url', 'product_url'];
  sheet.appendRow(headers);

  // Formatear header (negrita, fondo gris)
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#f3f3f3');

  // Escribir productos
  if (products.length > 0) {
    products.forEach(product => {
      sheet.appendRow([
        product.date_added || new Date().toISOString().split('T')[0],
        product.title || '',
        product.notes || '',
        product.image_url || '',
        product.product_url || ''
      ]);
    });

    // Auto-resize columnas
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }

    // Congelar fila de header
    sheet.setFrozenRows(1);
  }

  // Registrar en log
  Logger.log(`Updated ${source} with ${products.length} products`);

  return createResponse({
    success: true,
    source: source,
    count: products.length,
    timestamp: new Date().toISOString()
  });
}

/**
 * Crear respuesta HTTP
 */
function createResponse(data, status = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Función de test (ejecutar desde el editor para probar)
 */
function testDoPost() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        source: 'test',
        products: [
          {
            date_added: '2026-03-10',
            title: 'Test Product',
            notes: 'Test note',
            image_url: 'https://example.com/image.jpg',
            product_url: 'https://example.com/product'
          }
        ]
      })
    }
  };

  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
