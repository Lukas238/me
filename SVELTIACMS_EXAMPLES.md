# SveltiaCMS - Ejemplos de uso

## 🎯 Caso de uso 1: Editar una página existente

### Pasos:
1. Abre http://localhost:4000/admin/
2. En el menú izquierdo, selecciona **Páginas**
3. Haz clic en **Wishlist**
4. Edita el título o contenido
5. Haz clic en **Guardar**

**Resultado**: Los cambios se guardan en `_pages/wishlist.md`

---

## 📝 Caso de uso 2: Crear un nuevo post

### Pasos:
1. Abre http://localhost:4000/admin/
2. En el menú izquierdo, selecciona **Posts**
3. Haz clic en **Crear nuevo post**
4. Completa los campos:
   ```
   Título: Mi primer viaje a...
   Autor: Tu nombre
   Fecha: 2026-11-11 18:00:00
   Categorías: viajes
   Etiquetas: aventura, naturaleza
   Contenido: Escribe tu artículo aquí...
   ```
5. Haz clic en **Guardar**

**Resultado**: Se crea un nuevo archivo en `_posts/2026-11-11-mi-primer-viaje-a....md`

---

## 🖼️ Caso de uso 3: Subir una imagen

### Dentro del editor de post:

1. Haz clic en el icono de **imagen** (📷)
2. Selecciona una imagen de tu computadora
3. La imagen se subirá a `assets/uploads/`
4. Se insertará automáticamente el código Markdown

**Markdown generado**:
```markdown
![Descripción](../assets/uploads/mi-imagen.jpg)
```

---

## 🔧 Caso de uso 4: Editar configuración del sitio

### Pasos:
1. Abre http://localhost:4000/admin/
2. En el menú izquierdo, selecciona **Configuración del sitio**
3. Edita cualquier campo:
   - Título del sitio
   - URL
   - Google Analytics ID
4. Haz clic en **Guardar**

**Resultado**: Los cambios se guardan en `_config.yml`

---

## 📊 Caso de uso 5: Actualizar la página Backgrounds

### Pasos:
1. Abre `/admin/`
2. Selecciona **Páginas** → **Backgrounds**
3. Edita la descripción o contenido
4. Sube nuevas imágenes de fondo
5. Haz clic en **Guardar**

**Resultado**: Cambios en `_pages/backgrounds.md` y nuevas imágenes en `assets/uploads/`

---

## 🌐 Caso de uso 6: Crear una nueva colección

Si quieres agregar una nueva colección (ej: "Proyectos"), edita `admin/index.html`:

```javascript
{
  name: 'projects',
  label: 'Proyectos',
  folder: '_projects',
  format: 'frontmatter',
  create: true,
  fields: [
    {
      name: 'title',
      label: 'Nombre del proyecto',
      widget: 'string'
    },
    {
      name: 'description',
      label: 'Descripción',
      widget: 'text'
    },
    {
      name: 'image',
      label: 'Captura de pantalla',
      widget: 'image'
    },
    {
      name: 'link',
      label: 'Enlace del proyecto',
      widget: 'string'
    },
    {
      name: 'body',
      label: 'Detalles',
      widget: 'markdown'
    }
  ]
}
```

Luego crea la carpeta `_projects/` y ¡listo!

---

## ✏️ Campos disponibles en el editor

| Campo | Widget | Uso |
|-------|--------|-----|
| Título | `string` | Texto corto (una línea) |
| Descripción | `text` | Texto largo (múltiples líneas) |
| Contenido | `markdown` | Editor con soporte para Markdown |
| Imagen | `image` | Subidor de archivos |
| Fecha | `datetime` | Selector de fecha y hora |
| Categorías | `list` | Lista de opciones |
| Etiquetas | `list` | Lista de palabras clave |
| URL | `string` | Validación de URL |
| Autor | `string` | Nombre del autor |
| Layout | `hidden` | Campo invisible (valor por defecto) |

---

## 🔄 Flujo de trabajo recomendado

```
1. CREAR
   └─ Abre /admin/
      └─ Selecciona colección (Páginas, Posts, etc.)
      └─ Haz clic en "Crear"

2. EDITAR
   └─ Completa los campos
   └─ Sube imágenes si es necesario
   └─ Previsualiza (si disponible)

3. GUARDAR
   └─ Haz clic en "Guardar"
   └─ Git registra automáticamente el cambio

4. VERIFICAR
   └─ Ve a tu sitio (http://localhost:4000/)
   └─ Recarga la página
   └─ Verifica que se ve correctamente

5. PUBLICAR
   └─ Haz push a tu repositorio
   └─ El servidor se despliega automáticamente
```

---

## 🎨 Tips avanzados

### 1. Markdown en el editor

Puedes usar Markdown estándar:

```markdown
# Título principal
## Subtítulo
- Punto 1
- Punto 2

**Negrita** e *itálica*

[Enlace](https://ejemplo.com)

![Imagen](../assets/uploads/imagen.jpg)

> Cita importante

`código en línea`

```código en bloque```
```

### 2. Agregar código HTML

Si necesitas HTML, cambia a la vista "raw" del editor:

```html
<div class="custom-class">
  <p>Contenido HTML personalizado</p>
</div>
```

### 3. Front matter personalizado

Los campos se guardan como Front matter:

```yaml
---
layout: post
title: Mi artículo
author: Lucas Dasso
date: 2026-11-11 18:00:00
categories: [blog]
tags: [ejemplo]
---

Contenido aquí...
```

### 4. Sincronización con Git

Todos los cambios se guardan en Git automáticamente con commits. Ver historial:

```bash
git log --oneline admin/
git log --oneline _posts/
git log --oneline _pages/
```

---

## 🚨 Resolución de problemas comunes

### "El CMS no carga"
- Verifica que Jekyll esté corriendo (`jekyll serve`)
- Abre la consola (F12) y busca errores
- Recarga la página

### "No puedo crear un post"
- Verifica que `_posts/` existe
- Comprueba permisos de carpeta
- Revisa que no haya conflictos de Git

### "Las imágenes no se suben"
- Verifica que `assets/uploads/` existe
- Comprueba permisos de escritura
- Borra caché del navegador

### "Los cambios no se guardan"
- Abre la consola (F12) para ver errores
- Verifica que tienes conexión
- Intenta de nuevo

---

## 📞 Soporte

- **Documentación oficial**: https://sveltiacms.app/
- **Issues de GitHub**: https://github.com/Lukas238/me/issues
- **Guía completa**: Ver `SVELTIACMS_GUIDE.md`

---

¡Disfruta gestionando tu contenido! 🎉
