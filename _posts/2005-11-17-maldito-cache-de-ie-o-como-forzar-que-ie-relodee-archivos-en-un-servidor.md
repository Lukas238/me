---
layout: post
title: '"Maldito Cache de IE" o  "Cómo forzar que IE relodee archivos en un servidor"'
author: Lukas238
date: 2005-11-17T15:04:54-03:00
categories:
  - tecnologia
tags:
  - web
  - internet-explorer
  - cache
image: ''
description: El otro día alguien me comento que tenia problemas para actualizar una imagen una vez que el IE (Internet Explorer) la hubiera bajado (Link). Por más que actualizaba la página (con
legacy: true
legacy_id: '47'
legacy_path: 2005/11/maldito-cache-d.html
redirect_from:
  - /2005/11/maldito-cache-d.html
  - /blog/2005/11/17/maldito-cache-de-ie-o-como-forzar-que-ie-relodee-archivos-en-un-servidor.html
---

El otro día alguien me comento que tenia problemas para actualizar una imagen una vez que el IE (Internet Explorer) la hubiera bajado ([Link](http://www.todoexpertos.com/categorias/tecnologia_e_internet/programacion/respuestas/1308661/)). Por más que actualizaba la página (con F5 e incluso Ctrl-F5) seguia viendo la imagen originál, apesar de que en el servidor estaba la imagen nueva. Esto me hizo recordar cuando tube el mismo problema, y -por supuesto- cómo lo resolvi.

Hay mucho en internet hacerca de este problema, que en realidad no es una falla o error del IE, es algo llamado cache, que es justamente eso, un cache de los archivos que ya hemos bajado. Si mal no recuerdo, el cache se limpia solo cada 30 minutos aproximadamente. Nunca logre entender bien bien el problema, pues nadie parece tampoco entenderlo bien. Pero una cosa es segura, no se arregla con F5 (refresh).

La típica solución pasaria por incluir ciertos meta tags en el código de la página que le indican al IE cómo comportarse en relación al cache de archivos e imágenes; como por ejemplo los siguientes:


```html
<meta http-equiv="Expires" content="0"\>
<meta http-equiv="Last-Modified" content="0"\>
<meta http-equiv="Cache-Control" content="no-cache, mustrevalidate"\>
<meta http-equip="Pragma" content="no-cache"\>
```

Cuando yo me encontre con este problema, estaba armando un sitio web donde una animación de flash cargaba lsos textos desde un archivo txt. La idea era poder cambiar los textos sin necesidad de re-editar todo el flash. Si bien en mi casa funcionaba sin problemas, cuando lo probe en el servidor, encontre que la primera vez que cargaba los textos estaba todo bien, pero si modificab el texto y actualizaba el servidor, no se actualizaba en el IE, seguia viendo el texto viejo, al menos hasta que pasaran 30 minutos.\
Prove todos los meta tag que pude encontrar sin exito hasta que di con la solución en algun sitio, no recuerdo dónde.

Basicamente el problema con el IE es que cuando intentamos bajar -por ejemplo- la "imagen1.jpg", la primera vez no hay problema, pero a la segunda vez, el IE se da cuenta de que ya la habia bajado antes, y por tanto se encuentra en la PC y no hace falta volver a bajarla. Y como se guia por el nombre, no importa que la foto cambie adentro, para el IE es la misma foto y no lla va a bajar 2 veces.\
La solución es _enganar_ al IE y hacerle creer que se trata de una imagen nueva. Para hacer eso no , hay que modificar la URL del archivo que deseamos bajar del sioguiente modo:

\-------------------------------------------------------\
URL real: http://www.miservidor.com/imagenes/myimagen01.jpg

## URL modificada: http://www.miservidor.com/imagenes/myimagen01.jpg?12345678\\

El IE ignora todo lo que se encuentre tras el _?_. Pero en la práctica cree que el archivo se llama _myimagen01.jpg?12345678_ y por lo tanto que se trata de un archivo nuevo que va a bajar por primera ves.\
Claro que agregarle _12345678_ sp;p funcionaria una vez. ¿Cómo hago que este truco funcione siempre?, basicamente usando un poco de código.\
La idea es que en la hoja HTML, donde esta el código que llama a nuestra imagen, usemos un poco de programación para agregarle _?[fecha]_ (es decir, concatenarle un valor que siempre cambie) , y como la fecha siempre cambia, el nombre siembre sera diferente.

A continuación el código de esta solución, en PHP, Java Script y ActionScript (Flash).

## -[PHP]------------------------------------------------\ \<img src=\<?\ echo "'http://www.miservidor.com/files/myimage01.jpg?" . date('Y-m-d') . "'"\ ?> >\\

## -[ActionScript]---------------------------------------\ mydate = new Date();\ trace("'http://www.miservidor.com/files/myimage01.jpg?id=" + mydate.getTime());\\

## -[JavaScript]----------------------------------------\ \<script language="javascript" type="text/javascript">\ var mydate = new Date();\ document.write("\<img src='http://www.miservidor.com/files/myimage01.jpg?" + mydate.getTime() + "' />")\ \</script>\\

Como ven no es tan complicado. Y funciona siempre. Espero que les alla sido de ayuda, ciertamente me solucionó un problema.

;)
