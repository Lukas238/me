# Wishlist Worker

Worker unificado para gestionar una wishlist personal con scraping automático y almacenamiento en Google Sheet.

## 🔐 Credenciales y Seguridad

Las credenciales sensibles están en **`credentials.json`** (encriptado con git-crypt).

- **Archivo:** `_workers/credentials.json`
- **Contiene:** Google Sheet ID y Apps Script URL
- **Encriptación:** git-crypt (ver [GIT-CRYPT.md](./GIT-CRYPT.md) para setup)
- **Backup:** La key de git-crypt está en `~/Dropbox/git-crypt-keys/personal-me.key`

**⚠️ Importante:** Las credenciales NO están en los .md files para evitar leaks en GitHub.

## Links

- **Worker:** https://wishlist-sync.dassolucas.workers.dev/
- **Google Sheet:** https://docs.google.com/spreadsheets/d/1KrrTKZGPQ8CI4NrWIBVSL8EvueVZOpo4xSXkjeX2mtI/
- **Amazon Wishlist:** https://www.amazon.com/hz/wishlist/ls/35A8QWIZ90CH

## 📚 Bookmarklet - Add to Wishlist

**Agrega productos desde cualquier página web con un click. Completamente autocontenido, funciona incluso con CSP estricta (MercadoLibre, Amazon, etc.).**

Ver guía completa: [BOOKMARKLET.md](./BOOKMARKLET.md) | Demo: [bookmarklet.html](./bookmarklet.html)

### Quick Start

1. Abre [bookmarklet.html](./bookmarklet.html) en tu navegador
2. Arrastra el botón "➕ Add to Wishlist" a tu barra de marcadores
3. Navega a cualquier página de producto
4. Click en el bookmarklet
5. Usa los botones 🎯 para capturar título, imagen, notas
6. Save → Los productos van al tab "user_list" de tu Google Sheet

**Features:**
- 🎯 Target mode para seleccionar elementos de la página
- 🖼️ Preview de imagen 250x250 en tiempo real
- ✏️ Edición manual de todos los campos
- 🔗 Auto-detección de URL del producto
- ⌨️ Shortcuts (ESC para cerrar)
- ✅ Completamente autocontenido (~16KB inline, no carga scripts externos)
- 🔒 Compatible con CSP estricta (funciona en MercadoLibre, Amazon, etc.)
- 📝 Los productos van al tab "user_list" de tu Google Sheet

## Arquitectura

Un solo worker (`wishlist-sync`) con arquitectura modular:

```
wishlist-sync/
  src/
    index.js              # Routing y orquestación
    storage/
      index.js            # Abstracción de storage
      googlesheets.js     # Implementación Google Sheets
    scrapers/
      amazon.js           # Scraper de Amazon
```

**Ventajas:**
- ✅ Sin Error 1042 (no hay worker-to-worker calls)
- ✅ Storage abstraction (fácil migrar a Postgres/Supabase)
- ✅ Scrapers modulares (fácil agregar nuevos sources)

## API Reference

### GET / - Leer todos los productos

```bash
curl "https://wishlist-sync.dassolucas.workers.dev/"
```

Response:
```json
{
  "amazon": [
    {
      "date_added": "Date(2026,2,12)",
      "title": "Product Name",
      "notes": "",
      "image_url": "https://...",
      "product_url": "https://..."
    }
  ],
  "user_list": []
}
```

### GET /:source - Leer productos de un source específico

```bash
curl "https://wishlist-sync.dassolucas.workers.dev/amazon"
```

Response (array directo):
```json
[
  {
    "date_added": "Date(2026,2,12)",
    "title": "Product Name",
    "notes": "",
    "image_url": "https://...",
    "product_url": "https://..."
  }
]
```

Sources válidos: `amazon`, `user_list`

### GET /sync/:source - Scrape y guarda un source

```bash
curl "https://wishlist-sync.dassolucas.workers.dev/sync/amazon"
```

Response:
```json
{
  "message": "Sync completed",
  "results": [
    {
      "source": "amazon",
      "success": true,
      "count": 20,
      "storageResponse": {
        "success": true,
        "source": "amazon",
        "count": 20,
        "timestamp": "2026-03-12T17:24:47.126Z"
      }
    }
  ]
}
```

### GET /sync - Scrape y guarda todos los sources

```bash
curl "https://wishlist-sync.dassolucas.workers.dev/sync"
```

Response: Similar al anterior pero con todos los sources en `results`.

### POST / - Agregar producto manual

```bash
curl -X POST "https://wishlist-sync.dassolucas.workers.dev/" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Product Name",
    "product_url": "https://example.com",
    "notes": "Optional notes",
    "image_url": "https://..."
  }'
```

Response:
```json
{
  "success": true,
  "message": "Product added to wishlist",
  "product": {
    "date_added": "2026-03-12",
    "title": "Product Name",
    "notes": "Optional notes",
    "image_url": "https://...",
    "product_url": "https://example.com"
  },
  "storageResponse": {
    "success": true,
    "source": "user_list",
    "count": 1,
    "timestamp": "2026-03-12T17:24:47.126Z"
  }
}
```

Los productos manuales se guardan en el source `user_list`.

## Setup

### Storage (Google Sheets)

El worker guarda los productos en Google Sheets. Para configurarlo:

**📝 Ver guía completa:** [SETUP-STORAGE.md](./SETUP-STORAGE.md)

**Pasos rápidos:**
1. Crear Google Sheet con tabs: `amazon`, `user_list` (y opcionalmente `mercadolibre` vacío)
2. Deploy Google Apps Script desde `google-apps-script-template.js`
3. Configurar secrets: `GOOGLE_SHEET_ID` y `GOOGLE_APPS_SCRIPT_URL`

**Sheet actual:** [Ver en Google Sheets](https://docs.google.com/spreadsheets/d/1KrrTKZGPQ8CI4NrWIBVSL8EvueVZOpo4xSXkjeX2mtI/)

## Cron Job Automático

El worker está configurado para ejecutarse **automáticamente el día 1 de cada mes a las 8:00 UTC** (5:00 AM Argentina).

Esto actualiza todas las wishlists automáticamente.

Para cambiar la frecuencia, edita `wrangler.toml`:
```toml
[triggers]
crons = [
  "0 8 1 * *"     # Mensual (actual)
  # "0 8 1,15 * *"  # Dos veces al mes (día 1 y 15)
  # "0 8 * * 0"     # Semanal (domingos)
]
```

Después redeploy: `npx wrangler deploy`

## Testing Rápido

### 1. Ver todos los productos
```bash
curl "https://wishlist-sync.dassolucas.workers.dev/" | jq
```

### 2. Ver solo productos de Amazon
```bash
curl "https://wishlist-sync.dassolucas.workers.dev/amazon" | jq
```

### 3. Contar productos de Amazon
```bash
curl "https://wishlist-sync.dassolucas.workers.dev/amazon" | jq 'length'
```

### 4. Sincronizar Amazon (scrape + save)
```bash
curl "https://wishlist-sync.dassolucas.workers.dev/sync/amazon" | jq
```

### 5. Agregar producto manual
```bash
curl -X POST "https://wishlist-sync.dassolucas.workers.dev/" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Product", "product_url": "https://example.com"}' | jq
```

### 6. Ver productos manuales
```bash
curl "https://wishlist-sync.dassolucas.workers.dev/user_list" | jq
```

## Deploy

```bash
cd wishlist-sync
npx wrangler deploy
```

## Desarrollo Local

```bash
cd wishlist-sync

# Instalar dependencias
npm install

# Desarrollo local
npx wrangler dev

# Ver logs en producción
npx wrangler tail
```

## Notas

- **Arquitectura unificada:** Un solo worker con módulos internos (storage/, scrapers/)
- **Sin Error 1042:** No hay worker-to-worker calls, todo está en el mismo worker
- **Amazon Scraper:** Web scraping con Cheerio, ~20 productos (ver URL en Links)
- **Cron Job:** Sync automático mensual (día 1 de cada mes a las 8:00 UTC)
- **Storage abstraction:** Fácil migrar de Google Sheets a otra DB (cambiar import en storage/index.js)
- **Formato normalizado:** `{ date_added, title, notes, image_url, product_url }`
- **Entrada manual:** POST / para agregar productos de cualquier fuente al tab "user_list"
- **CORS:** Abierto (`Access-Control-Allow-Origin: *`)
- **Plan Gratuito:** Todo funciona con el plan gratuito de Cloudflare Workers
