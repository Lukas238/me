---
layout: post
title: Javascript Popup mejorado
author: Lukas238
date: '2007-09-21T22:10:17-03:00'
categories:
- tecnologia
tags:
- javascript
- web
description: Hay muchos javascripts en internet disponibles para bajar, pero ninguno
  como este. Despues de probar infinidad de scripts, termine adaptando y reescribiendo
  el mío propio y tiene u
legacy: true
legacy_id: '93'
legacy_path: 2007/09/javascript-popu.html
redirect_from:
- "/2007/09/javascript-popu.html"
- "/blog/2007/09/21/javascript-popup-mejorado.html"
---

Hay muchos javascripts en internet disponibles para bajar, pero ninguno como este. Despues de probar infinidad de scripts, termine adaptando y reescribiendo el mío propio y tiene un par de opciones muy interesantes que hacen de este script algo especial.

**Características:**\

- La ventana del popup se centra al medio de la pantalla.
- Se puede cambiar el título de la ventana.
- La ventana no abre una págin, le escribe código html en el momento.

Primero necesitamos incorporar a las fotos o links el siguiente código:

```html
<img src='images/foto1.jpg' width='150' height='110' border='0' onclick="htmlPopup('URL IMAGEN','ANCHO POPUP', 'ALTO POPUP', 'TITULO POPUP')">
```

Y luego agregar en la página el código del javascript:

```js
function htmlPopup(img,w,h,title) { //v2.0
    var winl = (screen.width-w)/2; var wint = (screen.height-h)/2; settings= 'height=' + h +',width=' + w + ',top=' + wint + ',left=' + winl + ',scrollbars=no,toolbar=no';

    mypopup = window.open("",title,settings);
    mypopup.document.open();
    mypopup.document.write("<head>\<meta http-equiv='Content-Type' content='text/html; charset=iso-8859-1' />");
    mypopup.document.write("<title>" + title + "</title>");
    mypopup.document.write("<style type='text/css'>\<!--body {margin: 0px;}-->\</style>\</head>\<body>");
    mypopup.document.write("<table width='100%' height='100%' border='0' cellpadding='0' cellspacing='0'>");
    mypopup.document.write("<tr>\<td align='center' valign='middle'>");

    mypopup.document.write("<img src=" + img+ " onclick=\\javascript:window.close();\\>");

    mypopup.document.write("</td>\</tr>\</table>\</body>\</html>");
    mypopup.document.close();
}
```

**Explicación:**

1. Lo primero que hace el script es centrar el popup:
    ```js
    var winl = (screen.width-w)/2; var wint = (screen.height-h)/2; settings= 'height=' + h +',width=' + w + ',top=' + wint + ',left=' + winl + ',scrollbars=no,toolbar=no';
    ```

2. Despues crea una ventana de popup con el nombre de "mypopup":
    ```js
    mypopup = window.open("",title,settings);
    ```

3. Finalmente escribe cualquier cosa que deseemos dentro, en este caso código html:
    ```js
    mypopup.document.open(); mypopup.document.write("<head>\<meta http-equiv='Content-Type' content='text/html; charset=iso-8859-1' />"); mypopup.document.write("<title>" + title + "</title>"); mypopup.document.write("<style type='text/css'>\<!--body {margin: 0px;}-->\</style>\</head>\<body>"); mypopup.document.write("<table width='100%' height='100%' border='0' cellpadding='0' cellspacing='0'>"); mypopup.document.write("<tr>\<td align='center' valign='middle'>");

    mypopup.document.write("<img src=" + img + " onclick=javascript:window.close();>");

    mypopup.document.write("</td>\</tr>\</table>\</body></html>");
    mypopup.document.close();
    ```
El html solo es una tabla al 100% de ancho y alto, con una imagen centrad en el centro, la cual a su ves tiene un pequeño codigo javascript que hace que la ventana se cierre al hacer click en la imagen.

En resumen este script permite abrir un popup -centrado- e incluir cualquier código que deseemos. Ideal para popups en páginas dinámicas.
