# Setup Storage - Google Sheets

Esta guía te lleva paso a paso por la configuración del sistema de almacenamiento usando Google Sheets.

## ¿Por qué Google Sheets?

Google Sheets funciona como base de datos gratis para almacenar los productos scraped:
- ✅ **Gratis** - Sin límites prácticos para este uso
- ✅ **Interfaz visual** - Ver y editar productos directamente
- ✅ **Backup automático** - Google Drive backup
- ✅ **Compartible** - Fácil de compartir con otros
- ✅ **API simple** - Read via JSONP, write via Apps Script
- ✅ **Sin servidor** - No necesitas base de datos

**Otras opciones futuras:** PostgreSQL, Supabase, Airtable (no implementadas aún)

---

## Paso 1: Crear Google Sheet

### 1.1. Crear nuevo Sheet

1. Ve a **[Google Drive](https://drive.google.com/)**
2. Click **"Nuevo"** → **"Hojas de cálculo de Google"** → **"Hoja de cálculo en blanco"**
3. Nombra el sheet (ejemplo: `Wishlist Database`)

### 1.2. Configurar permisos de lectura

Para que el worker pueda leer sin autenticación:

1. Click en **"Compartir"** (botón azul, esquina superior derecha)
2. Click en **"Cambiar a cualquier persona que tenga el enlace"**
3. Selecciona: **"Cualquier persona con el enlace"** + **"Lector"** (read-only)
4. Click **"Copiar enlace"** y **"Listo"**

⚠️ **Importante:** Solo permisos de **lectura** para "anyone". El write será via Apps Script con autenticación.

### 1.3. Crear tabs (hojas)

En el sheet, crea **3 tabs** con estos nombres exactos (case-sensitive):

- `amazon`
- `mercadolibre`
- `others`

**Cómo crear tabs:**
1. Click en el **`+`** en la parte inferior izquierda
2. Doble-click en el nombre del tab para renombrar
3. Repite 3 veces

### 1.4. Agregar headers (en cada tab)

En **cada uno de los 3 tabs**, agrega esta primera fila (headers):

| date_added | title | notes | image_url | product_url |
|------------|-------|-------|-----------|-------------|

**Importante:**
- Los nombres deben ser exactos (minúsculas, guiones bajos)
- Deben estar en la **fila 1** (primera fila)
- El orden no importa, pero estos 5 nombres son obligatorios

### 1.5. Obtener Sheet ID

De la URL del Google Sheet, copia el **Sheet ID**:

```
https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_SHEET_ID]/edit
```

**Ejemplo:**
```
https://docs.google.com/spreadsheets/d/1KrrTKZGPQ8CI4NrWIBVSL8EvueVZOpo4xSXkjeX2mtI/edit
                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                       Este es el Sheet ID
```

**📝 Guarda este Sheet ID** - Lo necesitarás en el paso 3.

---

## Paso 2: Deploy del Google Apps Script

El Apps Script maneja los writes al Google Sheet desde el worker.

### 2.1. Abrir el editor de Apps Script

1. En el Google Sheet, ve a **Extensions > Apps Script**
2. Se abre una nueva pestaña con el editor de código

### 2.2. Copiar el código

1. Borra todo el código existente (hay un template `function myFunction() {}`)
2. Abre el archivo: **`/Users/ldasso/Work/personal/me/_workers/google-apps-script-template.js`**
3. Copia **todo el contenido** del archivo
4. Pégalo en el editor de Apps Script

### 2.3. Deploy como Web App

1. En el editor de Apps Script, click en **"Deploy"** (esquina superior derecha)
2. Selecciona **"New deployment"** (o "Nueva implementación")
3. Configurar:
   - **Tipo:** Click en el ícono de ⚙️ → Selecciona **"Web app"**
   - **Description:** `Wishlist writer v1` (o cualquier descripción)
   - **Execute as:** **Me** (`tu-email@gmail.com`)
   - **Who has access:** **Anyone** (cualquiera)
4. Click **"Deploy"** (o "Implementar")
5. **Autorizar acceso:**
   - Si es la primera vez, verá "Autorización necesaria"
   - Click en **"Authorize access"** o **"Autorizar acceso"**
   - Selecciona tu cuenta de Google
   - Click **"Advanced"** → **"Go to [nombre del proyecto] (unsafe)"**
   - Click **"Allow"** o **"Permitir"**

### 2.4. Copiar Deployment URL

Una vez deployeado, verás una URL como:

```
https://script.google.com/macros/s/AKfycbx5UEXxc9pZacoWC7AhcygVu5xQSInveI7RkDO9qg6B9l3kBWSxUr8-0c4nh5WIvFop0g/exec
                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                       Esta es la Deployment URL
```

**⚠️ Importante:**
- La URL debe **terminar en `/exec`** (no `/dev`)
- Es una URL pública, pero solo tú puedes escribir al sheet (porque el script se ejecuta como "Me")

**📝 Guarda esta URL** - La necesitarás en el paso 3.

### 2.5. Actualizaciones futuras

Si modificas el código del Apps Script:

**Opción A: Nuevo deployment (URL cambia)**
1. Edit el código
2. **Deploy > New deployment**
3. Nueva URL → Actualizar secret `GOOGLE_APPS_SCRIPT_URL` en Cloudflare

**Opción B: Actualizar deployment existente (URL no cambia)**
1. Edit el código
2. **Deploy > Manage deployments**
3. Click en ✏️ (edit) del deployment existente
4. Cambiar **"Version"** → **"New version"**
5. Click **"Deploy"**
6. No necesitas actualizar el secret (misma URL)

---

## Paso 3: Configurar Secrets en Cloudflare

Los secrets son variables de entorno encriptadas que se inyectan en el worker en runtime.

### 3.1. Configurar GOOGLE_SHEET_ID

```bash
cd /Users/ldasso/Work/personal/me/_workers/wishlist-sync

# Configurar Sheet ID
npx wrangler secret put GOOGLE_SHEET_ID
```

Cuando te pida el valor, pega el **Sheet ID** del paso 1.5.

**Ejemplo:**
```
Enter a secret value: 1KrrTKZGPQ8CI4NrWIBVSL8EvueVZOpo4xSXkjeX2mtI
```

### 3.2. Configurar GOOGLE_APPS_SCRIPT_URL

```bash
# Configurar Apps Script URL
npx wrangler secret put GOOGLE_APPS_SCRIPT_URL
```

Cuando te pida el valor, pega la **Deployment URL** del paso 2.4.

**Ejemplo:**
```
Enter a secret value: https://script.google.com/macros/s/AKfycbx5UEXxc9pZacoWC7AhcygVu5xQSInveI7RkDO9qg6B9l3kBWSxUr8-0c4nh5WIvFop0g/exec
```

### 3.3. Verificar secrets

```bash
# Listar secrets configurados
npx wrangler secret list
```

Deberías ver:
```
GOOGLE_SHEET_ID
GOOGLE_APPS_SCRIPT_URL
MERCADOLIBRE_CLIENT_ID
MERCADOLIBRE_CLIENT_SECRET
```

---

## Paso 4: Deploy y Test

### 4.1. Deploy del worker

```bash
cd /Users/ldasso/Work/personal/me/_workers/wishlist-sync
npx wrangler deploy
```

### 4.2. Test de lectura

```bash
# Leer todos los productos (debería devolver arrays vacíos si no hay datos)
curl "https://wishlist-sync.dassolucas.workers.dev/" | jq

# Response esperado:
# {
#   "amazon": [],
#   "mercadolibre": [],
#   "others": []
# }
```

### 4.3. Test de escritura (agregar producto manual)

```bash
curl -X POST "https://wishlist-sync.dassolucas.workers.dev/" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Product",
    "product_url": "https://example.com",
    "notes": "Testing storage",
    "image_url": "https://via.placeholder.com/150"
  }' | jq

# Response esperado:
# {
#   "success": true,
#   "message": "Product added to wishlist",
#   "product": { ... },
#   "storageResponse": {
#     "success": true,
#     "source": "others",
#     "count": 1,
#     "timestamp": "2026-03-12T21:30:00.000Z"
#   }
# }
```

### 4.4. Verificar en Google Sheet

1. Abre tu Google Sheet
2. Ve al tab **`others`**
3. Deberías ver una nueva fila con:
   - `date_added`: Fecha actual
   - `title`: "Test Product"
   - `notes`: "Testing storage"
   - `image_url`: URL del placeholder
   - `product_url`: "https://example.com"

✅ **Si ves la fila, el storage funciona correctamente!**

---

## ✅ ¡Listo! Storage Configurado

Ahora el worker puede:
- ✅ **Leer** productos de Google Sheet (via JSONP, sin autenticación)
- ✅ **Escribir** productos al Google Sheet (via Apps Script, autenticado)
- ✅ **Organizar** por source (`amazon`, `mercadolibre`, `others`)
- ✅ **Ver y editar** productos directamente en el Sheet

---

## Troubleshooting

### Error: "Failed to fetch from Google Sheets"
**Causa:** El Sheet no es público o el Sheet ID es incorrecto.
**Solución:** 
1. Verifica permisos del Sheet: "Anyone with the link" + "Viewer"
2. Verifica que el Sheet ID sea correcto
3. Test manual:
   ```bash
   curl "https://docs.google.com/spreadsheets/d/TU_SHEET_ID/gviz/tq?tqx=out:json&sheet=amazon"
   ```
   Deberías ver JSON (aunque sea vacío)

### Error: "Failed to write to Google Sheets"
**Causa:** Apps Script URL incorrecta o no deployeado.
**Solución:**
1. Verifica que copiaste la URL completa (termina en `/exec`)
2. Verifica que hiciste "New deployment" (no solo "Test")
3. Test manual:
   ```bash
   curl -X POST "TU_APPS_SCRIPT_URL" \
     -H "Content-Type: application/json" \
     -d '{"source":"others","products":[{"date_added":"2026-03-12","title":"Test"}]}'
   ```
   Deberías ver `{"result":"success"}`

### Error: "Authorization needed" al deployar Apps Script
**Causa:** Primera vez usando Apps Script.
**Solución:**
1. En el paso de autorización, click **"Advanced"**
2. Click **"Go to [proyecto] (unsafe)"**
3. Click **"Allow"**
4. Retry deployment

### Products no aparecen en el Sheet
**Causa:** Headers incorrectos o faltantes.
**Solución:**
1. Verifica que la **fila 1** de cada tab tenga exactamente:
   ```
   date_added | title | notes | image_url | product_url
   ```
2. Los nombres deben ser exactos (minúsculas, guiones bajos)
3. No debe haber espacios extras o caracteres especiales

### Secret no se actualiza
**Causa:** Necesitas redeploy después de cambiar secrets.
**Solución:**
```bash
npx wrangler deploy
```
Los secrets solo se leen al deployear, no actualizan en runtime.

---

## Referencia Rápida

### Secrets Requeridos

| Secret | Ejemplo | Dónde obtenerlo |
|--------|---------|-----------------|
| `GOOGLE_SHEET_ID` | `1KrrTKZGPQ8CI4...` | URL del Google Sheet (paso 1.5) |
| `GOOGLE_APPS_SCRIPT_URL` | `https://script.google.com/macros/s/AKfycbx...` | Apps Script deployment (paso 2.4) |

### Comandos Útiles

```bash
# Ver secrets configurados
npx wrangler secret list

# Actualizar un secret
npx wrangler secret put GOOGLE_SHEET_ID

# Eliminar un secret
npx wrangler secret delete GOOGLE_SHEET_ID

# Deploy
npx wrangler deploy
```

### URLs de Referencia

- **Google Sheet:** `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
- **Apps Script:** Extensiones > Apps Script (dentro del Sheet)
- **Worker:** `https://wishlist-sync.dassolucas.workers.dev/`
