# 🚀 SveltiaCMS Setup - ¡Completado!

Tu sitio Jekyll ahora tiene **SveltiaCMS** integrado. Aquí está todo lo que necesitas saber para empezar.

## 📍 Acceso al CMS

### Desarrollo local
```bash
# 1. Inicia Jekyll
bundle exec jekyll serve

# 2. Abre en tu navegador
http://localhost:4000/admin/
```

### Producción
```
https://me.c238.com.ar/admin/
```

## 🎯 Lo que se instaló

✅ **Panel de administración** en `/admin/`
✅ **Gestor de páginas** - edita tus páginas existentes
✅ **Gestor de posts** - crea y edita artículos de blog
✅ **Gestor de medios** - sube imágenes y archivos
✅ **Configuración del sitio** - edita metadatos
✅ **Post de ejemplo** - para que veas cómo funciona

## 📁 Estructura creada

```
tu-proyecto/
├── admin/
│   ├── index.html          # 🎛️ Panel de CMS
│   └── config.yml          # ⚙️ Configuración del CMS
├── _posts/                 # 📝 Archivos de posts (nuevo)
│   └── 2026-11-11-bienvenida-sveltiacms.md
├── assets/
│   └── uploads/            # 📸 Carpeta para medios (nuevo)
├── SVELTIACMS_GUIDE.md     # 📖 Guía completa de uso
└── _config.yml             # (actualizado con 'admin' en includes)
```

## 🚦 Primer uso

### Opción 1: Editar una página existente
1. Ve a `/admin/`
2. Haz clic en **Páginas**
3. Selecciona "Wishlist", "Backgrounds" o cualquier otra
4. Edita y guarda

### Opción 2: Crear un post
1. Ve a `/admin/`
2. Haz clic en **Posts**
3. Haz clic en **Crear**
4. Completa título, contenido, fecha, etc.
5. Guarda

### Opción 3: Subir una imagen
1. Mientras editas, haz clic en el icono de imagen
2. Selecciona una imagen de tu computadora
3. Se guardará en `assets/uploads/` automáticamente

## ⚙️ Personalizar colecciones

El archivo `admin/index.html` tiene toda la configuración del CMS. Si quieres:

- **Agregar más campos** a páginas/posts (ej: autor, tags)
- **Crear nuevas colecciones** (ej: proyectos, portfolio)
- **Cambiar validaciones** (ej: campos obligatorios)

Edita la sección `window.CMS_CONFIG` en `admin/index.html`

## 🔐 Seguridad

- **Backend local**: Sin servidor externo (perfecto para Git)
- **Sin autenticación requerida**: Abierto para uso local
- **Todos los cambios quedan en Git**: Historial completo y reversible

## 📖 Documentación completa

Ver [SVELTIACMS_GUIDE.md](./SVELTIACMS_GUIDE.md) para:
- Solución de problemas
- Configuración avanzada
- Flujos de trabajo recomendados
- Recursos útiles

## 🎓 Próximos pasos

1. **Prueba localmente**: Corre `jekyll serve` y ve a `/admin/`
2. **Edita algo**: Cambia un post existente para probar
3. **Crea un post**: Escribe algo nuevo desde el CMS
4. **Personaliza**: Agrega campos o colecciones que necesites
5. **Desplega**: Todos los cambios se guardan en Git automáticamente

## 💡 Pro tips

- Los cambios se guardan como commits Git automáticamente
- Puedes revertir cualquier cambio desde Git
- Las imágenes se optimizan y se sirven desde `assets/uploads/`
- El CMS funciona sin conexión a internet (backend local)
- Compatible con GitHub Pages, Netlify, Vercel, etc.

---

¿Preguntas? Ver **SVELTIACMS_GUIDE.md** o la [documentación oficial](https://sveltiacms.app/)

¡Que disfrutes! 🎉
