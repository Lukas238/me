---
layout: post
title: Custom Movable Type edit-entry tag buttons!
author: Lukas238
date: '2005-10-03T19:02:14-03:00'
categories:
- tecnologia
tags:
- movable-type
- javascript
- blog
description: Desde ya bastante tiempo es que migre de Blogger a Mobavle Type. Principalmente
  pues queria tener control de mi blog t ya que tengo un servidor casero, porqué no
  dejar todo entre c
legacy: true
legacy_id: '37'
legacy_path: 2005/10/custom-movable.html
redirect_from:
- "/2005/10/custom-movable.html"
- "/blog/2005/10/03/custom-movable-type-edit-entry-tag-buttons.html"
---

Desde ya bastante tiempo es que migre de Blogger a Mobavle Type. Principalmente pues queria tener control de mi blog t ya que tengo un servidor casero, porqué no dejar todo entre casa?. Asi que me conseguí el Movable Type de licencia gratuita para al menos un usuario. Y ahí lo ven, este es el blog. El programa tiene como función el archivar los post de acuerdo a algun criterio que yo decida, y en este caso es mensualmente, pero además me da a mí como autor la opción de crear nuevos post en una interfase 'bastante' amigable.

Me refiero a la ventana de "New Entry". Basicamente tenemos un area de texto llamada "Entry Body" y un area llamada "Extended Entry". Y en cada una de ellas hay botones para insertar código HTML. Por ejemplo hay un boton para insertar el código que hace que el texto se vea **bold**, otro para que se vea en *itálica*, y asi un par más.

Sin embargo siempre he hechado de menos un boton para insertar imágenes. Simplemente no esta. Y buscando por todos lados finalmente di con un tutorial que me sirvio de ayuda para comprender en dónde estaba y cómo funciona el código responsable de estos botones, de forma que pudiera crear los mios propios. Y con muy poca modestia dire que al comensar no conocía nada del tema, tan solo algunas buenas nociones de programación, aunque no especificamente en JavaScript que es el idioma en que esta programado este ejemplo, pero a puro sentido comun se puede sacar.

En mi caso particular yo deseaba un boton que automaticamente insertara una imagen y le diera un tamaño relativamente pequeño (320x240), pero ademas deseaba que al mismo tiempo creara un vínculo con esa imagen, un vínculo que se habriera en una hoja nueva, mostrando la imagen en su tamaño original.\
Bastante complicado lo mio, no?. Imaginense tener que escribir todo ese código cuando yo sabia que debia de haber una forma de programar un botón y ya.

Este ejemplo trabaja con Movable Type 3.2. La idea es crear un boton que nos permita insertar una imagen, agregarlo a la barra de herrmanientas de Movable Type, y luego insertar el código nesesario.

*Archivos a modificar (es recomendable hacerles un backup a cada uno)*\
edit_entry.tmpl - en la carpeta tmpl\cms\\\
mt.js - en la carpeta mt-static\\

*El botón:*\
1. Primero debemos crear una imagen en formato.gif para usar como boton. Pueden bajarse la mía haciendo click [aquí](mt/mt-static/images/html-image.gif).

*El código:*\
2. Ahora es tiempo de incertar el código. Hay dós lugares donde debemos incertar dos códigos lijeramente diferentes, ya que hay que poner un boton en el area de "Entry Body" y el area de "Extended Entry".

Para agregar el primer boton en "Entry Body", habrimos el archivo edit_entry.tmpl y buscamos la cadena:

```js
write('&lta title="&ltMT_TRANS phrase="Quote"&gt" href="#" onclick="return formatStr(document.entry_form.text, \'blockquote\')"&gt&ltimg src="&ltTMPL_VAR NAME=STATIC_URI&gtimages/html-quote.gif" alt="&ltMT_TRANS phrase="Quote"&gt" width="22" height="16" /&gt&lt/a&gt');
```

Éste es el último boton que vienen en Mobavle Type, el boton de "insertar comillas", y es a continuación de este que deseamos poner nuestro nuevo botón, asi que en el renglon siguiente ponemos el nuevo código:

```js
write('&lta title="&ltMT_TRANS phrase="Image"&gt" href="#" onclick="return insertImage(document.entry_form.text)"&gt&ltimg src="&ltTMPL_VAR NAME=STATIC_URI&gtimages/html-image.gif" alt="&ltMT_TRANS phrase="Image"&gt" width="22" height="16" /&gt&lt/a&gt');
```

Noten que ademas de cambiar el nombre de la imagen del boton tambien cambie el nombre de la función que llamo al precionarlo ("insertImage").

Para el boton de imagen pero del campo "Extended Entry", buscamos más a bajo el código:

```js
write('&lta title="&ltMT_TRANS phrase="Quote"&gt" href="#" onclick="return formatStr(document.entry_form.text_more, \'blockquote\')"&gt&ltimg src="&ltTMPL_VAR NAME=STATIC_URI&gtimages/html-quote.gif" alt="&ltMT_TRANS phrase="Quote"&gt" width="22" height="16" /&gt&lt/a&gt');
```

E inserto el siguiente código a continuación:

```js
write('&lta title="&ltMT_TRANS phrase="Image"&gt" href="#" onclick="return insertImage(document.entry_form.text_more)"&gt&ltimg src="&ltTMPL_VAR NAME=STATIC_URI&gtimages/html-image.gif" alt="&ltMT_TRANS phrase="Image"&gt" width="22" height="16" /&gt&lt/a&gt');
```

Uso la misma imagen que antes, la misma función, pero hago referencia al nuevo cuadro de texto (`document.entry_form.text_more`, en lugar de `document.entry_form.text`).


1. Ahora es momento de crear las funciones que efectivmenten crearan el código html de la imagen.

Para eso habrimos el archivo mt.js y al final del documento insertamos el siguiente código:

```js
function insertImage (e) { /*Obtengo el nombr de la imagen*/
    var myValue = prompt('Ingrese la URL de la imagen:', 'http://');

    if (!myValue ) return;

    /* Si no puse nada finalizo */
    var str = getSelected(e);

    /* Obtengo el texto seleccionado, si lo hay */

    if (!str ) { /* Si no seleccione ningun texto, inserto la imagen y un link a la imagen*/
        myValue= '&lta href="'+ myValue + '" target="\_blank"&gt&ltimg width=320 height=240 src="'+ myValue +'"&gt&lt/a&gt';
    } else { /* Si hay un texto seleccionado inserto un link a la imagen */
        myValue= '&lta href="' + myValue + '" target="\_blank"&gt'+ str +'&lt/a&gt';
    }

    setSelection(e, myValue); /*Mando a imprimir el resultado */
    return false;
}
```

Este código én sí mismo solo crea la cadena de código HTML, para imprimirlo en el campo de texto uso la misma función que ya viene con Mobavle Type que usan el resto de las funciones, asi ahorramos código.

Como interesante al precionar el boton de imagen, una ventana emergente nos pide la dirección de la imagen que deseamos insertar. Luego automaticamente crea el código nesesario y por ultimo lo manda a imprimir por la función "setSelection". Cabe destacar que si seleccionamos un texto y luego precionamos el boton de imagen, este texo se convierte en un vinculo a la imagen, y si no hay ningun texto seleccionado al presionar el boton, se inserta la imagen, que a su ves es un link a la imagen de tamaño completo. ¿Qué más se puede pedir?


1. Para terminar guardamos los cambios y ya podemos probar Mobavle Type, y ver si nuestro nuevo boton funciona apropiadamente.

Espero que les haya sido util, lo fue para mi. Suerte.
