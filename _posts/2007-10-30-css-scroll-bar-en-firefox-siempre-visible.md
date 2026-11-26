---
layout: post
title: 'CSS: Scroll Bar en Firefox siempre visible'
author: Lukas238
date: '2007-10-30T11:22:48-03:00'
categories:
- tecnologia
tags:
- css
- firefox
- web
description: Firefox solo muestra la barra lateral de scroll cuando es necesaria.
  Esto hace que -dependiendo de la extención vertical del contenido de la página-
  la barra aparezca y desaparezca
legacy: true
legacy_id: '99'
legacy_path: 2007/10/css-scroll-bar.html
redirect_from:
- "/2007/10/css-scroll-bar.html"
- "/blog/2007/10/30/css-scroll-bar-en-firefox-siempre-visible.html"
---

Firefox solo muestra la barra lateral de scroll cuando es necesaria. Esto hace que -dependiendo de la extención vertical del contenido de la página- la barra aparezca y desaparezca, a diferencia de IE donde la barra siempre esta visible, y solo se desactiva si no es necesaria.

Si tenemos una web con página centrada, que aparezca y desaparezca la barra lateral produce que la página ajuste su ancho y se desplace casi 11 pixels, lo que crea un feo efecto donde la página parpade o parece romperse al ir pasar por las distintas áreas de la web.

La solución más sencilla es aplicar un estilo que solo se ejecute en firefox y darle a la página web un alto de 100% más 1 pixel:

\

html\>body {\
height: 100%;\
margin-bottom: 1px;\
}
