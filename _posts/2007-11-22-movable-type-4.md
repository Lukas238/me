---
layout: post
title: 'Movable Type 4: Static pero ahora con PHP'
author: Lukas238
date: '2007-11-22T23:15:42-03:00'
categories:
- tecnologia
tags:
- movable-type
- php
- blog
description: El otro día s eme ocurrio que seria intereante convertir el blog de .html
  a .php, de manera que me permita escribir en los templates cualquier código o script
  en php que se me dese
legacy: true
legacy_id: '107'
legacy_path: 2007/11/movable-type-4.html
redirect_from:
- "/2007/11/movable-type-4.html"
---

El otro día s eme ocurrio que seria intereante convertir el blog de .html a .php, de manera que me permita escribir en los templates cualquier código o script en php que se me desee, pero con el contenido estático, es decir, el contenido es estático pero los templates en lugarde tener extención .html tienen .php, lo cual no es lo mismo que publicar el blog de forma dinámica (donde cada página que uno navega es creada en ese mismo instante por MT).

A continuación las instrucciones paso a paso para que lo hagan ustedes mismos.

**Convertir templates de MT4 a PHP**

1.  Cambiar el tipo de extencion para las páginas de archivos. Para eso vamos al menu *Preferences* y luego a *Publishing* y en la opcion *File Extension for Archive Files* cambiamos **html** por **php** (IMPORTANTE: solo poner '*php*', sin nungún punto). Y guardamos los cambios.
2.  Setear los templates que deseamos usen php. Vamos al menu *Design*, *Templates* y editamos un template. **Master archive Index** y **Main Index** son nuestros candidatos. Al editarlos vamos a *Output File* y cambiamos la extencion a php (ej.: si el output era "index.html" lo cambiamos a "index.php").
3.  Ahora si, re-publicamo todo el blog.
4.  Finalmente no hay que olvidar que ahora vamos a tener dos archivos index -entre otros- uno con la extención HTML y otro con PHP... dependiendo de la configuración del servidor web las extención HTML tiene preferencia y es la que se va a mostrar al visitar el blog. Por eso debemos borrar todos los archivos con .html que tengan un duplicado con extención php (cuidado de no borrar archivos que solo existen con extención .php, no convertimos todos los templates del blog a PHP).

> **TIP:** Ya que estamos podemos hacer otra modificación. La opción *Link to File* nos permite indicar la ruta en el servidor donde MT4 puede guardar el template que estamos editando en forma de archivo (por ejemplo con el nombre *"index_principal.tpl"*). MT4 normalmente guardaría el template solo en la base de datos. La ventaja de hacer esto es que si queremos modificar un template y MT4 nos resulta muy lento, podremos editar el archivo del template -*index_principal.tpl*- con nuestro editor de texto favorito -como el [Notepad++](http://notepad-plus.sourceforge.net/)- y luego con solo guardar el archivo MT4 -comparando las fecha de edición- sabrá cual version del template es más reciente (si el del la base de datos o el archivo .tpl) y sera el template más reciente el que usara al republicar el sitio la proxima ves.
