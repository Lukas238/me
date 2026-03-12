# 📚 Wishlist Bookmarklet

Un bookmarklet para agregar productos a tu wishlist desde cualquier página web con un solo click.

## 🚀 Instalación

### Opción 1: Arrastra el botón (Fácil)

1. Abre el archivo [`bookmarklet.html`](./bookmarklet.html) en tu navegador
2. Arrastra el botón "➕ Add to Wishlist" a tu barra de marcadores

### Opción 2: Crea el marcador manualmente

1. Crea un nuevo marcador/favorito en tu navegador
2. Nómbralo: "Add to Wishlist" (o como prefieras)
3. Como URL, pega este código:

```javascript
javascript:(function()%7Bif(window.wishlistWidget)%7Bwindow.wishlistWidget.toggle()%3Breturn%7D%3Bconst%20s%3Ddocument.createElement('script')%3Bs.src%3D'https%3A%2F%2Fwishlist-sync.dassolucas.workers.dev%2Fbookmarklet.js'%3Bs.onload%3D()%3D%3Ewindow.wishlistWidget.show()%3Bdocument.head.appendChild(s)%7D)()
```

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

1. **Verifica que copiaste el código completo** (debe empezar con `javascript:`)
2. **Algunos navegadores eliminan `javascript:`** cuando pegas - agrégalo manualmente
3. **Prueba en modo incógnito** para descartar extensiones que bloqueen scripts

### El Target Mode no captura la imagen

1. **Prueba haciendo click directamente en la imagen**
2. Si no funciona, **busca la URL de la imagen en la página**:
   - Click derecho > Inspeccionar elemento
   - Busca el atributo `src` o `data-src`
   - Cópialo manualmente al campo Image URL

### "Title is required" error

El campo Title es obligatorio. Asegúrate de completarlo antes de guardar.

## 🔧 Arquitectura Técnica

El bookmarklet:
1. Inyecta un `<script>` tag que carga `/bookmarklet.js` desde el worker
2. El script crea un widget modal con CSS y HTML dinámicos
3. El widget se posiciona con `z-index: 999999` para estar siempre visible
4. El target mode usa event listeners de `mouseover` y `click` en capture phase
5. Al guardar, hace un `POST /` al worker con los datos del producto
6. El worker guarda en Google Sheet (tab "others")

### Código del Bookmarklet (sin minificar)

```javascript
(function() {
  if (window.wishlistWidget) {
    window.wishlistWidget.toggle();
    return;
  }
  
  const s = document.createElement('script');
  s.src = 'https://wishlist-sync.dassolucas.workers.dev/bookmarklet.js';
  s.onload = () => window.wishlistWidget.show();
  document.head.appendChild(s);
})()
```

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

**Archivo de demostración:** [bookmarklet.html](./bookmarklet.html)
