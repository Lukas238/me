# SveltiaCMS - Guía de Uso

## ¿Qué es SveltiaCMS?

SveltiaCMS es un gestor de contenidos headless que te permite editar tu sitio Jekyll de forma visual sin tocar el código. Funciona completamente en el navegador usando el backend local.

## Acceso al CMS

1. **Local**: Ve a `http://localhost:4000/admin/` (mientras ejecutas `jekyll serve`)
2. **Producción**: Ve a `https://me.c238.com.ar/admin/`

## Características

### ✨ Características principales

- **Editor visual** para páginas y posts
- **Gestor de medios** para cargar imágenes y archivos
- **Markdown y HTML** soportados
- **Versionado automático** (Git)
- **Previsualizacion en vivo** del contenido

### 📝 Colecciones disponibles

1. **Páginas** (`_pages/`)
   - Wishlist
   - Backgrounds
   - Media Gallery
   - Bidassoa
   - Crear nuevas páginas

2. **Posts** (`_posts/`)
   - Crear nuevos artículos de blog
   - Fechas automáticas
   - Categorías y etiquetas

3. **Configuración del sitio**
   - Editar título, descripción, URL
   - Google Analytics
   - Datos del autor

## Flujo de trabajo

### Crear una nueva página

1. Abre `/admin/`
2. Ve a **Páginas**
3. Haz clic en **Nuevo**
4. Completa los campos:
   - Título
   - Permalink (ej: `/nueva-pagina/`)
   - Descripción (opcional)
   - Contenido
5. Haz clic en **Guardar**

### Crear un nuevo post

1. Abre `/admin/`
2. Ve a **Posts**
3. Haz clic en **Nuevo**
4. Completa los campos:
   - Título
   - Fecha
   - Categorías (opcional)
   - Etiquetas (opcional)
   - Imagen destacada (opcional)
   - Contenido
5. Haz clic en **Guardar**

### Subir imágenes

1. En cualquier editor, haz clic en el icono de imagen
2. Selecciona una imagen de tu computadora
3. La imagen se guardará en `assets/uploads/`
4. Se insertará automáticamente el código de la imagen

## Configuración

El CMS está configurado en `admin/index.html` con las siguientes colecciones:

- **Backend**: Local (no requiere servidor externo)
- **Medios**: `assets/uploads/`
- **Idioma**: Español
- **Formato**: Frontmatter (YAML + contenido)

## Notas importantes

### ⚠️ Consideraciones

1. **Cambios locales**
   - Los cambios se guardan directamente en los archivos
   - Se crea un commit automático en Git

2. **Sincronización**
   - Los archivos se guardan en la rama actual
   - Asegúrate de estar en `main` o `develop`

3. **Respaldos**
   - Git mantiene el historial completo
   - Puedes revertir cambios si es necesario

## Solución de problemas

### El CMS no carga

1. Verifica que Jekyll esté sirviendo en `http://localhost:4000`
2. Abre la consola (F12) y revisa errores
3. Asegúrate de que `admin/` esté en la carpeta pública

### Los cambios no se guardan

1. Verifica que Git está inicializado
2. Comprueba permisos de archivo en `_pages/` y `_posts/`
3. Revisa que no haya conflictos de Git

### Las imágenes no se cargan

1. Asegúrate de que `assets/uploads/` existe
2. Verifica permisos de escritura
3. Comprueba que no esté en `.gitignore`

## Próximos pasos

1. **Personalización**: Edita `admin/index.html` para agregar más campos
2. **Autenticación**: Configura GitHub/GitLab para ediciones remotas
3. **Automatización**: Configura despliegues automáticos con GitHub Actions

## Recursos

- [Documentación oficial de SveltiaCMS](https://sveltiacms.app/)
- [Documentación de Jekyll](https://jekyllrb.com/)
- [GitHub Copilot para CMS](https://copilot.github.com/)
