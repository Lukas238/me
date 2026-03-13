# 📚 Wishlist Bookmarklet

Un bookmarklet para agregar productos a tu wishlist desde cualquier página web con un solo click.

## 🚀 Instalación

### Opción 1: Arrastra el botón (Fácil)

1. Abre el archivo [`bookmarklet.html`](./bookmarklet.html) en tu navegador
2. Arrastra el botón "➕ Add to Wishlist" a tu barra de marcadores

### Opción 2: Crea el marcador manualmente

1. Crea un nuevo marcador/favorito en tu navegador
2. Nómbralo: "Add to Wishlist" (o como prefieras)
3. Como URL, pega este código **completo** (es largo, ~16KB, completamente autocontenido):

```javascript
javascript:(function()%7B'use%20strict'%3Bif(window.wishlistWidget)%7Bwindow.wishlistWidget.toggle()%3Breturn%7Dconst%20WORKER_URL%3D'https%3A%2F%2Fwishlist-sync.dassolucas.workers.dev%2F'%3Bconst%20widgetHTML%3D%60%3Cdiv%20id%3D%22wishlist-widget-overlay%22%3E%3Cdiv%20id%3D%22wishlist-widget%22%3E%3Cdiv%20class%3D%22widget-header%22%3E%3Ch2%3E%F0%9F%93%9A%20Add%20to%20Wishlist%3C%2Fh2%3E%3Cbutton%20class%3D%22close-btn%22%20id%3D%22wishlist-close%22%3E%E2%9C%95%3C%2Fbutton%3E%3C%2Fdiv%3E%3Cdiv%20class%3D%22widget-body%22%3E%3Cdiv%20class%3D%22form-row%22%3E%3Clabel%3EProduct%20URL%3C%2Flabel%3E%3Cinput%20type%3D%22text%22%20id%3D%22product_url%22%20readonly%2F%3E%3C%2Fdiv%3E%3Cdiv%20class%3D%22form-row%22%3E%3Clabel%3ETitle%20*%3C%2Flabel%3E%3Cdiv%20class%3D%22input-group%22%3E%3Cinput%20type%3D%22text%22%20id%3D%22title%22%20placeholder%3D%22Product%20title%22%2F%3E%3Cbutton%20class%3D%22target-btn%22%20data-field%3D%22title%22%3E%F0%9F%8E%AF%3C%2Fbutton%3E%3C%2Fdiv%3E%3C%2Fdiv%3E%3Cdiv%20class%3D%22form-row%22%3E%3Clabel%3ENotes%3C%2Flabel%3E%3Cdiv%20class%3D%22input-group%22%3E%3Ctextarea%20id%3D%22notes%22%20placeholder%3D%22Optional%20notes%22%20rows%3D%222%22%3E%3C%2Ftextarea%3E%3Cbutton%20class%3D%22target-btn%22%20data-field%3D%22notes%22%3E%F0%9F%8E%AF%3C%2Fbutton%3E%3C%2Fdiv%3E%3C%2Fdiv%3E%3Cdiv%20class%3D%22form-row%22%3E%3Clabel%3EImage%20URL%3C%2Flabel%3E%3Cdiv%20class%3D%22input-group%22%3E%3Cinput%20type%3D%22text%22%20id%3D%22image_url%22%20placeholder%3D%22Product%20image%20URL%22%2F%3E%3Cbutton%20class%3D%22target-btn%22%20data-field%3D%22image_url%22%3E%F0%9F%8E%AF%3C%2Fbutton%3E%3C%2Fdiv%3E%3C%2Fdiv%3E%3Cdiv%20class%3D%22image-preview-container%22%3E%3Clabel%3EImage%20Preview%3C%2Flabel%3E%3Cdiv%20id%3D%22image-preview%22%20class%3D%22image-preview%22%3E%3Cspan%20class%3D%22preview-placeholder%22%3ENo%20image%20selected%3C%2Fspan%3E%3C%2Fdiv%3E%3C%2Fdiv%3E%3C%2Fdiv%3E%3Cdiv%20class%3D%22widget-footer%22%3E%3Cbutton%20class%3D%22btn%20btn-cancel%22%20id%3D%22wishlist-cancel%22%3ECancel%3C%2Fbutton%3E%3Cbutton%20class%3D%22btn%20btn-save%22%20id%3D%22wishlist-save%22%3E%F0%9F%92%BE%20Save%20to%20Wishlist%3C%2Fbutton%3E%3C%2Fdiv%3E%3Cdiv%20id%3D%22wishlist-status%22%20class%3D%22status-message%22%3E%3C%2Fdiv%3E%3C%2Fdiv%3E%3C%2Fdiv%3E%60%3Bconst%20widgetCSS%3D%60%23wishlist-widget-overlay%7Bposition%3Afixed%3Btop%3A0%3Bleft%3A0%3Bwidth%3A100%25%3Bheight%3A100%25%3Bbackground%3Argba(0%2C0%2C0%2C.7)%3Bz-index%3A999999%3Bdisplay%3Aflex%3Balign-items%3Acenter%3Bjustify-content%3Acenter%3Banimation%3AfadeIn%20.2s%7D%40keyframes%20fadeIn%7Bfrom%7Bopacity%3A0%7Dto%7Bopacity%3A1%7D%7D%23wishlist-widget%7Bbackground%3A%23fff%3Bborder-radius%3A12px%3Bbox-shadow%3A0%2020px%2060px%20rgba(0%2C0%2C0%2C.3)%3Bwidth%3A90%25%3Bmax-width%3A500px%3Bmax-height%3A90vh%3Boverflow-y%3Aauto%3Banimation%3AslideUp%20.3s%7D%40keyframes%20slideUp%7Bfrom%7Btransform%3AtranslateY(20px)%3Bopacity%3A0%7Dto%7Btransform%3AtranslateY(0)%3Bopacity%3A1%7D%7D.widget-header%7Bbackground%3Alinear-gradient(135deg%2C%23667eea%200%25%2C%23764ba2%20100%25)%3Bcolor%3A%23fff%3Bpadding%3A20px%3Bborder-radius%3A12px%2012px%200%200%3Bdisplay%3Aflex%3Bjustify-content%3Aspace-between%3Balign-items%3Acenter%7D.widget-header%20h2%7Bmargin%3A0%3Bfont-size%3A20px%3Bfont-weight%3A600%7D.close-btn%7Bbackground%3Argba(255%2C255%2C255%2C.2)%3Bborder%3Anone%3Bcolor%3A%23fff%3Bfont-size%3A24px%3Bwidth%3A32px%3Bheight%3A32px%3Bborder-radius%3A50%25%3Bcursor%3Apointer%3Btransition%3Abackground%20.2s%3Bline-height%3A1%7D.close-btn%3Ahover%7Bbackground%3Argba(255%2C255%2C255%2C.3)%7D.widget-body%7Bpadding%3A20px%7D.form-row%7Bmargin-bottom%3A15px%7D.form-row%20label%7Bdisplay%3Ablock%3Bmargin-bottom%3A5px%3Bfont-weight%3A600%3Bcolor%3A%23333%3Bfont-size%3A14px%7D.input-group%7Bdisplay%3Aflex%3Bgap%3A8px%7D.input-group%20input%2C.input-group%20textarea%7Bflex%3A1%7D%23wishlist-widget%20input%2C%23wishlist-widget%20textarea%7Bwidth%3A100%25%3Bpadding%3A10px%3Bborder%3A2px%20solid%20%23e0e0e0%3Bborder-radius%3A6px%3Bfont-size%3A14px%3Bfont-family%3A-apple-system%2CBlinkMacSystemFont%2C%22Segoe%20UI%22%2CRoboto%2Csans-serif%3Btransition%3Aborder-color%20.2s%7D%23wishlist-widget%20input%3Afocus%2C%23wishlist-widget%20textarea%3Afocus%7Boutline%3Anone%3Bborder-color%3A%23667eea%7D%23wishlist-widget%20input%5Breadonly%5D%7Bbackground%3A%23f5f5f5%3Bcolor%3A%23666%7D.target-btn%7Bbackground%3A%23667eea%3Bborder%3Anone%3Bcolor%3A%23fff%3Bfont-size%3A20px%3Bwidth%3A44px%3Bheight%3A44px%3Bborder-radius%3A6px%3Bcursor%3Apointer%3Btransition%3Aall%20.2s%3Bflex-shrink%3A0%7D.target-btn%3Ahover%7Bbackground%3A%235568d3%3Btransform%3Ascale(1.05)%7D.target-btn.active%7Bbackground%3A%23ff6b6b%3Banimation%3Apulse%201s%20infinite%7D%40keyframes%20pulse%7B0%25%2C100%25%7Btransform%3Ascale(1)%7D50%25%7Btransform%3Ascale(1.1)%7D%7D.image-preview-container%7Bmargin-top%3A20px%7D.image-preview%7Bwidth%3A250px%3Bheight%3A250px%3Bborder%3A2px%20dashed%20%23e0e0e0%3Bborder-radius%3A8px%3Bdisplay%3Aflex%3Balign-items%3Acenter%3Bjustify-content%3Acenter%3Bmargin-top%3A10px%3Boverflow%3Ahidden%3Bbackground%3A%23f9f9f9%7D.image-preview%20img%7Bmax-width%3A100%25%3Bmax-height%3A100%25%3Bobject-fit%3Acontain%7D.preview-placeholder%7Bcolor%3A%23999%3Bfont-size%3A14px%7D.widget-footer%7Bpadding%3A20px%3Bborder-top%3A1px%20solid%20%23e0e0e0%3Bdisplay%3Aflex%3Bgap%3A10px%3Bjustify-content%3Aflex-end%7D.btn%7Bpadding%3A12px%2024px%3Bborder%3Anone%3Bborder-radius%3A6px%3Bfont-size%3A14px%3Bfont-weight%3A600%3Bcursor%3Apointer%3Btransition%3Aall%20.2s%7D.btn-cancel%7Bbackground%3A%23e0e0e0%3Bcolor%3A%23666%7D.btn-cancel%3Ahover%7Bbackground%3A%23d0d0d0%7D.btn-save%7Bbackground%3Alinear-gradient(135deg%2C%23667eea%200%25%2C%23764ba2%20100%25)%3Bcolor%3A%23fff%7D.btn-save%3Ahover%7Btransform%3AtranslateY(-2px)%3Bbox-shadow%3A0%204px%2012px%20rgba(102%2C126%2C234%2C.4)%7D.btn-save%3Adisabled%7Bopacity%3A.5%3Bcursor%3Anot-allowed%7D.status-message%7Bpadding%3A0%2020px%2020px%3Bfont-size%3A14px%3Btext-align%3Acenter%3Bdisplay%3Anone%7D.status-message.success%7Bcolor%3A%234caf50%3Bdisplay%3Ablock%7D.status-message.error%7Bcolor%3A%23f44336%3Bdisplay%3Ablock%7D.status-message.info%7Bcolor%3A%232196F3%3Bdisplay%3Ablock%7D.wishlist-target-highlight%7Boutline%3A3px%20solid%20%23667eea!important%3Boutline-offset%3A2px%3Bcursor%3Acrosshair!important%3Bbox-shadow%3A0%200%200%204px%20rgba(102%2C126%2C234%2C.2)!important%7Dbody.wishlist-target-mode%2Cbody.wishlist-target-mode%20*%7Bcursor%3Acrosshair!important%7D%60%3Bconst%20s%3Ddocument.createElement('style')%3Bs.textContent%3DwidgetCSS%3Bdocument.head.appendChild(s)%3Bconst%20w%3Ddocument.createElement('div')%3Bw.innerHTML%3DwidgetHTML%3Bdocument.body.appendChild(w)%3Bconst%20widget%3D%7Boverlay%3Adocument.getElementById('wishlist-widget-overlay')%2Ccontainer%3Adocument.getElementById('wishlist-widget')%2Cfields%3A%7Bproduct_url%3Adocument.getElementById('product_url')%2Ctitle%3Adocument.getElementById('title')%2Cnotes%3Adocument.getElementById('notes')%2Cimage_url%3Adocument.getElementById('image_url')%7D%2Cpreview%3Adocument.getElementById('image-preview')%2Cstatus%3Adocument.getElementById('wishlist-status')%2CtargetMode%3A!1%2CcurrentTargetField%3Anull%2Cshow()%7Bthis.overlay.style.display%3D'flex'%3Bthis.fields.product_url.value%3Dwindow.location.href%3Bthis.updatePreview()%7D%2Chide()%7Bthis.overlay.style.display%3D'none'%3Bthis.exitTargetMode()%7D%2Ctoggle()%7B'none'%3D%3D%3Dthis.overlay.style.display%3Fthis.show()%3Athis.hide()%7D%2CupdatePreview()%7Bconst%20e%3Dthis.fields.image_url.value.trim()%3Be%3Fthis.preview.innerHTML%3D%60%3Cimg%20src%3D%22%24%7Be%7D%22%20alt%3D%22Preview%22%2F%3E%60%3Athis.preview.innerHTML%3D'%3Cspan%20class%3D%22preview-placeholder%22%3ENo%20image%20selected%3C%2Fspan%3E'%7D%2CenterTargetMode(e)%7Bthis.exitTargetMode()%2Cthis.targetMode%3D!0%2Cthis.currentTargetField%3De%2Cdocument.body.classList.add('wishlist-target-mode')%2Cdocument.querySelector(%60%5Bdata-field%3D%22%24%7Be%7D%22%5D%60)%3F.classList.add('active')%2Cthis.showStatus('Click%20on%20an%20element%20to%20capture...'%2C'info')%7D%2CexitTargetMode()%7Bthis.targetMode%3D!1%2Cthis.currentTargetField%3Dnull%2Cdocument.body.classList.remove('wishlist-target-mode')%2Cdocument.querySelectorAll('.wishlist-target-highlight').forEach(e%3D%3Ee.classList.remove('wishlist-target-highlight'))%2Cdocument.querySelectorAll('.target-btn.active').forEach(e%3D%3Ee.classList.remove('active'))%7D%2CcaptureElement(e)%7Bif(!this.currentTargetField)return%3Bconst%20t%3Dthis.currentTargetField%2Cc%3Dthis.fields%5Bt%5D%3Bif('image_url'%3D%3D%3Dt)%7Blet%20t%3Dnull%3Bif('IMG'%3D%3D%3De.tagName)t%3De.src%7C%7Ce.dataset.src%3Belse%7Bconst%20c%3Dwindow.getComputedStyle(e).backgroundImage.match(%2Furl%5C(%5B'%22%5D%3F(%5B%5E'%22%5D%2B)%5B'%22%5D%3F%5C)%2F)%3Bif(c)t%3Dc%5B1%5D%3Belse%7Bconst%20c%3De.querySelector('img')%3Bc%26%26(t%3Dc.src%7C%7Cc.dataset.src)%7D%7Dt%3F(c.value%3Dt%2Cthis.updatePreview()%2Cthis.showStatus('%E2%9C%93%20Image%20captured!'%2C'success'))%3Athis.showStatus('%E2%9C%97%20No%20image%20found'%2C'error')%7Delse%7Bconst%20t%3De.innerText%3F.trim()%7C%7Ce.textContent%3F.trim()%7C%7C''%3Bt%3F(c.value%3Dt%2Cthis.showStatus(%60%E2%9C%93%20%24%7Bt%7D%20captured!%60%2C'success'))%3Athis.showStatus('%E2%9C%97%20No%20text%20found'%2C'error')%7Dthis.exitTargetMode()%7D%2CshowStatus(e%2Ct)%7Bthis.status.textContent%3De%2Cthis.status.className%3D%60status-message%20%24%7Bt%7D%60%2C'info'!%3D%3Dt%26%26setTimeout(()%3D%3Ethis.status.style.display%3D'none'%2C3e3)%7D%2Casync%20save()%7Bconst%20e%3D%7Btitle%3Athis.fields.title.value.trim()%2Cproduct_url%3Athis.fields.product_url.value.trim()%2Cnotes%3Athis.fields.notes.value.trim()%2Cimage_url%3Athis.fields.image_url.value.trim()%7D%3Bif(!e.title)return%20void%20this.showStatus('%E2%9C%97%20Title%20is%20required'%2C'error')%3Bconst%20t%3Ddocument.getElementById('wishlist-save')%3Bt.disabled%3D!0%2Ct.textContent%3D'Saving...'%3Btry%7Bconst%20c%3Dawait%20fetch(WORKER_URL%2C%7Bmethod%3A'POST'%2Cheaders%3A%7B'Content-Type'%3A'application%2Fjson'%7D%2Cbody%3AJSON.stringify(e)%7D)%2Cs%3Dawait%20c.json()%3Bc.ok%26%26s.success%3F(this.showStatus('%E2%9C%93%20Saved%20to%20wishlist!'%2C'success')%2CsetTimeout(()%3D%3E%7Bthis.fields.title.value%3D''%2Cthis.fields.notes.value%3D''%2Cthis.fields.image_url.value%3D''%2Cthis.updatePreview()%2Cthis.hide()%7D%2C1500))%3Athis.showStatus(%60%E2%9C%97%20Error%3A%20%24%7Bs.error%7C%7C'Failed%20to%20save'%7D%60%2C'error')%7Dcatch(e)%7Bthis.showStatus(%60%E2%9C%97%20Network%20error%3A%20%24%7Be.message%7D%60%2C'error')%7Dfinally%7Bt.disabled%3D!1%2Ct.textContent%3D'%F0%9F%92%BE%20Save%20to%20Wishlist'%7D%7D%7D%3Bdocument.getElementById('wishlist-close').addEventListener('click'%2C()%3D%3Ewidget.hide())%2Cdocument.getElementById('wishlist-cancel').addEventListener('click'%2C()%3D%3Ewidget.hide())%2Cdocument.getElementById('wishlist-save').addEventListener('click'%2C()%3D%3Ewidget.save())%2Cwidget.fields.image_url.addEventListener('input'%2C()%3D%3Ewidget.updatePreview())%2Cdocument.querySelectorAll('.target-btn').forEach(e%3D%3E%7Be.addEventListener('click'%2Ce%3D%3E%7Be.preventDefault()%2Cwidget.enterTargetMode(e.target.dataset.field)%7D)%7D)%2Cdocument.addEventListener('mouseover'%2Ce%3D%3E%7Bif(!widget.targetMode%7C%7Cwidget.container.contains(e.target))return%3Bdocument.querySelectorAll('.wishlist-target-highlight').forEach(t%3D%3E%7Bt!%3D%3De.target%26%26t.classList.remove('wishlist-target-highlight')%7D)%2Ce.target.classList.add('wishlist-target-highlight')%7D)%2Cdocument.addEventListener('click'%2Ce%3D%3E%7Bwidget.targetMode%26%26!widget.container.contains(e.target)%26%26(e.preventDefault()%2Ce.stopPropagation()%2Cwidget.captureElement(e.target))%7D%2C!0)%2Cwidget.overlay.addEventListener('click'%2Ce%3D%3E%7Be.target%3D%3D%3Dwidget.overlay%26%26widget.hide()%7D)%2Cdocument.addEventListener('keydown'%2Ce%3D%3E%7B'Escape'%3D%3D%3De.key%26%26(widget.targetMode%3Fwidget.exitTargetMode()%3A'none'!%3D%3Dwidget.overlay.style.display%26%26widget.hide())%7D)%2Cwindow.wishlistWidget%3Dwidget%2Cwidget.show()%7D)()
```

**Nota:** El bookmarklet es completamente autocontenido (~16KB minificado). No carga ningún script externo, por lo que funciona incluso en sitios con CSP estricta como MercadoLibre.

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
1. **No carga scripts externos** - Todo el código (HTML, CSS, JS) está inline
2. **Compatible con CSP estricta** - Funciona en MercadoLibre, Amazon, etc.
3. Inyecta un `<style>` tag con todo el CSS minificado
4. Inyecta un `<div>` con el widget HTML
5. El widget se posiciona con `z-index: 999999` para estar siempre visible
6. El target mode usa event listeners de `mouseover` y `click` en capture phase
7. Al guardar, hace un `POST /` al worker con los datos del producto
8. El worker guarda en Google Sheet (tab "others")

### Código del Bookmarklet (sin minificar)

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

**Archivo de demostración:** [bookmarklet.html](./bookmarklet.html)
