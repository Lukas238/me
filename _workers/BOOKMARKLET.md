# 📚 Wishlist Bookmarklet

Un bookmarklet para agregar productos a tu wishlist desde cualquier página web con un solo click.

## 🚀 Instalación

1. Crea un nuevo marcador/favorito en tu navegador
2. Nómbralo: "Add to Wishlist" (o como prefieras)
3. Como URL, pega el código que imprime `node scripts/build-bookmarklet.js` (empieza con `javascript:`; ver el [README](./README.md#bookmarklet---add-to-wishlist))

El bookmarklet es autocontenido: no carga scripts externos, así que funciona incluso en sitios con CSP estricta como MercadoLibre.

## 📖 Uso

### Paso 1: Navega a un producto

Ve a cualquier página de producto (Amazon, MercadoLibre, tienda online, etc.)

### Paso 2: Click en el bookmarklet

Haz click en el bookmarklet "Add to Wishlist" en tu barra de marcadores

### Paso 3: Usa los botones 🎯 Target

El widget aparecerá con estos campos:

- **Product URL**: Se detecta automáticamente (la URL actual)
- **Title**: Usa el botón 🎯 para seleccionar el título del producto en la página
- **Notes**: Usa el botón 🎯 para capturar descripción o notas (o escribe manualmente)
- **Image URL**: Usa el botón 🎯 para seleccionar la imagen del producto
- **Image Preview**: Verás un preview de 250x250 de la imagen seleccionada

### ¿Cómo funciona el botón 🎯?

1. **Click en 🎯** junto al campo que quieres completar
2. El botón se pone rojo y el cursor cambia a cruz
3. **Pasa el mouse** sobre elementos de la página - se resaltan en azul
4. **Click en el elemento** que quieres capturar:
   - **Para Title/Notes**: Captura el texto del elemento
   - **Para Image**: Captura la URL de la imagen (src, data-src, o background)
5. El campo se completa automáticamente

### Paso 4: Edita si es necesario

Todos los campos son editables. Si el 🎯 no capturó exactamente lo que querías, simplemente edítalo manualmente.

### Paso 5: Guarda

Click en "💾 Save to Wishlist" para guardar el producto en tu Google Sheet (tab "others").

## 🎨 Características

### ✅ Auto-detección
- URL del producto se detecta automáticamente
- No necesitas copiar/pegar la URL

### 🎯 Target Mode
- Click en elementos de la página para capturar su contenido
- Resaltado visual de elementos al pasar el mouse
- Funciona con imágenes, texto, y elementos complejos

### 🖼️ Preview de Imágenes
- Preview en tiempo real de 250x250
- Se actualiza mientras editas el Image URL

### ⌨️ Shortcuts
- **ESC**: Cerrar el widget (o salir del target mode)
- Click fuera del widget para cerrar

### 🔄 Edición Manual
- Todos los campos son editables
- Puedes combinar target mode con edición manual

## 📱 Compatibilidad

- ✅ Chrome / Chromium / Edge
- ✅ Firefox
- ✅ Safari
- ✅ Brave / Opera / Vivaldi

## 🛠️ Troubleshooting

### El bookmarklet no funciona

1. **Verifica que copiaste el código completo** (~16KB, debe empezar con `javascript:`)
2. **Algunos navegadores eliminan `javascript:`** cuando pegas - agrégalo manualmente
3. **Prueba en modo incógnito** para descartar extensiones que bloqueen scripts
4. **El bookmarklet es completamente autocontenido** - no necesita cargar scripts externos, funciona incluso en sitios con CSP estricta (MercadoLibre, Amazon, etc.)

### El Target Mode no captura la imagen

1. **Prueba haciendo click directamente en la imagen**
2. Si no funciona, **busca la URL de la imagen en la página**:
   - Click derecho > Inspeccionar elemento
   - Busca el atributo `src` o `data-src`
   - Cópialo manualmente al campo Image URL

### "Title is required" error

El campo Title es obligatorio. Asegúrate de completarlo antes de guardar.

## 🔧 Arquitectura Técnica

El bookmarklet es **completamente autocontenido** (~16KB minificado):
1. **No carga scripts externos** - Todo el código (HTML, CSS, JS) está inline en el bookmarklet
2. **Compatible con CSP estricta** - Funciona en MercadoLibre, Amazon, etc.
3. Inyecta un `<style>` tag con todo el CSS minificado
4. Inyecta un `<div>` con el widget HTML
5. El widget se posiciona con `z-index: 999999` para estar siempre visible
6. El target mode usa event listeners de `mouseover` y `click` en capture phase
7. Al guardar, hace un `POST /` al worker con los datos del producto
8. El worker agrega el producto al principio de `_data/wishlist.json` en GitHub

### Estructura del Bookmarklet

```
bookmarklet-source.js     ← Código fuente
└─ scripts/build-bookmarklet.js pide la clave e imprime `javascript:(...)`
     ├─ HTML del widget (~1KB)
     ├─ CSS del widget (~8KB)
     └─ JavaScript (~7KB)
         ├─ Widget controller
         ├─ Event listeners
         ├─ Target mode logic
         └─ Save to API
```

### Código del Bookmarklet (estructura simplificada)

El bookmarklet minificado (~16KB) contiene todo este código comprimido:

```javascript
(function() {
  'use strict';
  
  if (window.wishlistWidget) {
    window.wishlistWidget.toggle();
    return;
  }
  
  const WORKER_URL = 'https://wishlist-sync.dassolucas.workers.dev/';
  
  // HTML del widget (inline)
  const widgetHTML = `...`; // ~70 líneas de HTML
  
  // CSS del widget (inline)
  const widgetCSS = `...`;   // ~300 líneas de CSS minificado
  
  // Inyectar CSS y HTML
  const styleEl = document.createElement('style');
  styleEl.textContent = widgetCSS;
  document.head.appendChild(styleEl);
  
  const widgetEl = document.createElement('div');
  widgetEl.innerHTML = widgetHTML;
  document.body.appendChild(widgetEl);
  
  // Lógica del widget (widget controller, event listeners, etc.)
  const widget = { /* ... */ };
  
  // Auto-show
  widget.show();
})();
```

**Ventajas del enfoque autocontenido:**
- ✅ No requiere red (después de cargarse la primera vez)
- ✅ Funciona en sitios con CSP estricta
- ✅ No depende de la disponibilidad del worker para el JS
- ✅ Más rápido (no hay round-trip para cargar el script)
- ❌ Bookmarklet más largo (~16KB vs ~200 bytes versión con load externo)

## 📝 Notas

- Los productos agregados con el bookmarklet van al tab **"others"** de tu Google Sheet
- Si usas el bookmarklet en una página de Amazon, considera usar el scraper automático en su lugar (tiene mejor formato)
- El bookmarklet funciona en **cualquier página web** (no solo tiendas online)

## 🎯 Ejemplos de Uso

### Amazon

1. Navega a un producto: `https://www.amazon.com/dp/B08N5WRWNW`
2. Click en bookmarklet
3. 🎯 Title → Click en el nombre del producto
4. 🎯 Image → Click en la imagen principal
5. Edita notes si quieres (ej: "Size: Large")
6. Save

### MercadoLibre

1. Navega a un producto: `https://articulo.mercadolibre.com.ar/MLA-...`
2. Click en bookmarklet
3. 🎯 Title → Click en el título
4. 🎯 Image → Click en la imagen principal
5. 🎯 Notes → Click en el precio o descripción
6. Save

### Tienda Online Genérica

1. Navega a un producto
2. Click en bookmarklet
3. Usa 🎯 para capturar título e imagen
4. Escribe notas manualmente (precio, color, talla, etc.)
5. Save

## 🚀 Próximas Features (Ideas)

- [ ] Detectar automáticamente precio en la página
- [ ] Soporte para seleccionar múltiples imágenes
- [ ] History/historial de productos agregados
- [ ] Drag & drop para reordenar campos
- [ ] Themes (dark mode)
- [ ] Keyboard shortcuts para target mode (T para title, I para image, etc.)

---

**URL del Worker:** https://wishlist-sync.dassolucas.workers.dev/
