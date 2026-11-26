---
layout: post
title: Swift 3D - Del 3D a Flash
author: Lukas238
date: '2007-04-18T19:29:00-03:00'
categories:
- proyectos
tags:
- 3d
- flash
- animacion
description: Como todo buen diseñador que se precie siempre estoy buscando la manera
  de sobresalir, inovar, o simplemente encontra nuevaa formas de hacer las cosas.
  Un problema que comunmente v
legacy: true
legacy_id: '86'
legacy_path: 2007/04/del-3d-a-flash.html
redirect_from:
- "/2007/04/del-3d-a-flash.html"
- "/archives/2007/04/del_3d_a_flash.html"
- "/blog/2007/04/18/swift-3d-del-3d-a-flash.html"
---

<script src="https://unpkg.com/@ruffle-rs/ruffle"></script>

Como todo buen diseñador que se precie siempre estoy buscando la manera de sobresalir, inovar, o simplemente encontra nuevaa formas de hacer las cosas.

Un problema que comunmente veo en diseño Flash, es que -apesar de estar muy logrados- muchos diseños paresen una demostracion de los efectos 'de fbrica' de Flash.

No pretendo entrar a discutir las capacidades del ActionScript 2.0 (el idioma de programacion de Flash), pero si aportar una idea interesante: animaciones en 3D.

Pues resulta que Flash no tiene capacidad para dibujo 3D (en parte pr su complejidad, en parte por el peso que implicaria para el player a la hora de bajarlo de la web para instalar), lo cual es una lastima.

Como ya mencione anteriormente, mu gusta mesclar programas para lograr lo que a mi se me ocurra y no lo que el programa haga, y con ese espiritu es que aprendi a modelar y animar en 3D Studio Max 8, lo cual me da un muy buen punto de partida.

La pregunta es como llevar nuestra animacion a flash. Y hay dos formas basicamente:\
A. *Renderear en 3DSMax a archivos .PNG:*\
Estos son archivos que guardan el canal Alpha (fondo tranparente en este caso).

En todo caso este metodo nos permitira incluir en Flash la animacion que se nos ocurra.

B. *Instalar Swift 3D Max 3 Plug-In para 3DSMax 8:*\
El plugin nos permite renderizar nuestra animacion a un unico archivo SWFT que podremos importar a Flash (si copiamos un archivo que viene con el Swift, en la carpeta de plugins del Flash). Al importar el archivo de swif encontraremos todos los cuadros de nuestra animacion 3D convertidos a frames de Flash, y los colores y las lineas separados en layers diferentes.

Evidentemente la ventaja que este metodo tiene sobre el primero, es que nos permite no solo modificar en flash cada cuadro, sino que -con un poco de imaginacion y ActinScrip) programar alguna interesante interactividad.

Este es un ejemplo de una caja que se habre, animada en 3DSMax 8 y llevada a flash con el segundo metodo.

<!-- Ruffle automatically converts this into a playable Flash container -->
<embed src="/assets/blog/legacy/3D%20Box.swf" width="600" height="420" type="application/x-shockwave-flash">

Esta es una animacion de 30 cuadros (que se repiten una ves y es ciclica)\
tambien en 3DSMax 8 pasada a Flash, con efecto 'Pen' en las lineas (pero no se nota mucho).

<!-- Ruffle automatically converts this into a playable Flash container -->
<embed src="/assets/blog/legacy/3D%20PingPong.swf" width="600" height="420" type="application/x-shockwave-flash">

