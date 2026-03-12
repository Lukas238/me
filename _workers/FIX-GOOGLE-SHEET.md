# Fix: Google Sheet con Columnas Incorrectas

## Problema

El Google Sheet de Amazon tiene columnas incorrectas (price, source, currency) porque el Apps Script deployeado es una versión vieja.

## Solución

### Opción A: Redeploy del Apps Script (Recomendado)

1. **Abre el Google Sheet:** https://docs.google.com/spreadsheets/d/1KrrTKZGPQ8CI4NrWIBVSL8EvueVZOpo4xSXkjeX2mtI/

2. **Ve a Extensions > Apps Script**

3. **Reemplaza TODO el código:**
   - Selecciona todo el código existente (Cmd+A)
   - Elimina (Cmd+X)
   - Abre: `/Users/ldasso/Work/personal/me/_workers/google-apps-script-template.js`
   - Copia TODO el contenido
   - Pega en el editor de Apps Script

4. **Actualiza el deployment existente:**
   - Click en **Deploy > Manage deployments**
   - Click en el ícono ✏️ (edit) del deployment existente
   - En "Version", selecciona **"New version"**
   - Agrega descripción: `Fix: Remove old columns (price, source, currency)`
   - Click **Deploy**
   
   **Ventaja:** La URL no cambia, no necesitas actualizar el secret.

5. **Trigger un sync manual para limpiar el sheet:**
   ```bash
   curl "https://wishlist-sync.dassolucas.workers.dev/sync/amazon"
   ```

El sheet se limpiará y escribirá con las columnas correctas:
- date_added
- title
- notes
- image_url
- product_url

### Opción B: Limpiar manualmente el Google Sheet

Si no quieres tocar el Apps Script ahora:

1. Abre el tab **amazon** del Google Sheet
2. **Elimina las columnas incorrectas:**
   - Columna F (price) - Click derecho > Delete column
   - Columna G (source) - Click derecho > Delete column
   - Columna H (currency) - Click derecho > Delete column

3. **Reorganiza si es necesario:**
   - El orden correcto es: date_added, title, notes, image_url, product_url
   - Arrastra los headers si están en orden incorrecto

Pero esto es temporal - el próximo sync volverá a escribir mal si el Apps Script no está actualizado.

## Verificar Fix

Después del fix, ejecuta:
```bash
curl "https://wishlist-sync.dassolucas.workers.dev/sync/amazon" | jq
```

Abre el Google Sheet y verifica:
- ✅ Solo 5 columnas: date_added, title, notes, image_url, product_url
- ✅ En ese orden exacto
- ✅ Sin columnas price, source, currency

## Porque Pasó

El Apps Script viejo (antes de nuestra refactor) escribía columnas adicionales que ya no se usan. Al actualizar el código del worker pero no redeploy del Apps Script, quedó desincronizado.

