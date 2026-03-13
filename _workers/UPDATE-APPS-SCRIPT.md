# Actualizar Google Apps Script

## Cambios realizados:

1. **Renombrado**: `others` → `user_list`
2. **Comportamiento de escritura**:
   - `amazon` y `mercadolibre`: **sobrescriben** toda la hoja en cada sync
   - `user_list`: **agrega al final** (append) cada vez que se envía un producto desde el bookmarklet

## Instrucciones para actualizar:

### 1. Renombrar la hoja existente

En tu Google Sheet:
1. Hacé click derecho en la pestaña "others"
2. Seleccioná "Rename"
3. Cambiá el nombre a: `user_list`

### 2. Actualizar el código de Apps Script

1. Abrí tu Google Sheet
2. Ve a **Extensions > Apps Script**
3. Reemplazá TODO el contenido de `Code.gs` con el código actualizado de:
   `/Users/ldasso/Work/personal/me/_workers/google-apps-script-template.js`
4. Guardá (Ctrl/Cmd + S)
5. **No necesitas hacer un nuevo deployment** - el deployment existente se actualiza automáticamente

### 3. Verificar funcionamiento

Después de actualizar:
- Probá agregar un producto desde el bookmarklet
- Verificá que se agregue al final de la lista en `user_list`
- Verificá que NO se borren los productos anteriores

## Qué cambió en el código:

### Apps Script (`handleProducts` function):

```javascript
if (source === 'user_list') {
  // MODO APPEND: Agregar productos al final de la lista
  
  // Si la hoja está vacía, crear el header
  if (isEmptySheet) {
    sheet.appendRow(headers);
    // ... formatear header
  }
  
  // Agregar productos al final (NO hace clear())
  products.forEach(product => {
    sheet.appendRow([...]);
  });
  
} else {
  // MODO SOBRESCRITURA para amazon y mercadolibre
  sheet.clear(); // Borra todo antes de escribir
  // ... escribir header y productos
}
```

### Cloudflare Worker:

- Cambió `'others'` → `'user_list'` en:
  - `index.js`: constante `ALL_SOURCES` y función `handleManualProduct`
  - `googlesheets.js`: constante `ALL_SOURCES`

## Notas:

- El worker ya fue desplegado con los cambios
- Los productos existentes en la hoja "others" no se perderán si la renombrás a "user_list"
- Una vez actualizado, cada producto del bookmarklet se agregará al final sin borrar los anteriores
