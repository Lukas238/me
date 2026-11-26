---
layout: post
title: 'Hotmail desde Thunderbird: WebMail Add-On'
author: Lukas238
date: '2007-09-02T17:27:49-03:00'
categories:
- tecnologia
tags:
- thunderbird
- email
- software
description: Principalmente me manejo con dos cuantas de Gmail, pero me canse de tener
  dos Gmail Notifiers para chequear ambas cuentas. Así que desde hace un buen tiempo
  estoy usando el Thunder
legacy: true
legacy_id: '92'
legacy_path: 2007/09/hotmail-desde-t.html
redirect_from:
- "/2007/09/hotmail-desde-t.html"
---

Principalmente me manejo con dos cuantas de Gmail, pero me canse de tener dos [Gmail Notifiers](http://toolbar.google.com/gmail-helper/notifier_windows.html) para chequear ambas cuentas. Así que desde hace un buen tiempo estoy usando el [Thunderbird](http://www.mozilla.com/en-US/thunderbird/) para administrar mis mails y la verdad es que estoy muy satisfecho.

Antes de Gmail tenia -y aun tengo- una cuenta de hotmail gratuita (Live o como quieran llamarla ahora). No la chequeo con frecuencia pero la utilizo para administrar ciertos servicios por lo que seria muy útil agregarla al Thunderbird. Lamentablemente hotmail ya no permite utilizar ningún administrador de mails para chequear las cuentas (ni siquiera el viejo Outlook Express) a menos claro que paguemos por una cuenta Plus lo cual no va a suceder nunca.

Buscando por la red encontré al [WebMail add-on](http://webmail.mozdev.org/) que es una extensión para Thunderbird que nos permite configurar no solo cuentas de hotmail sino también de yahoo y otros.

**Instalación:**

Necesitamos descargar dos archivos:

[Web-Mail-1.2.4](http://downloads.mozdev.org/webmail/web-mail-1-2-4.xpi) - Es el add-on principal y hay que instalarlo primero y reiniciar thunderbird.\
[Hotmail-1.2.9](http://download.mozdev.org/webmail/hotmail-1-2-9.xpi) - Es el add-on para hotmail y se debe instalar luego del Web-Mail-1.2.4, y reiniciar thunderbird.

\
**Setup:**

Luego de instalarlos y reiniciar thunderbird vamos a *Tools\Add-on*s y buscamos add-on de *WebMail*. EN la ventana que se abre vamos a la ficha *Servers* y verificamos que al menos el servicio de POP este corriendo (*Running*). De lo contrario deberemos revisar si nuestro firewall esta bloqueando los puertos 110 (para POP) y el 21 (para SMTP).

Luego vamos al add-on de *WebMail - Hotmail* y en la ficha *Mode* elegimos la opción *Hotmail Live* (o la que corresponda con nuestro tipo de cuenta de hotmail. Live es la más probable, en ultima instancia sera cosa de ir probando cada una hasta encontrar la que funcione).

Finalmente vamos a *Tools\Account Settings* y clikeamos el botón *Add Account*. En la ventana que se abre elegimos el tipo de cuenta *Email Account*, y completamos los datos. Tanto para el servicio POP como para el SMTP debemos poner como dirección *localhost*, y recuerden que le nombre de usuario es el mismo que ponemos en la web de hotmail: *nombre@hotmail.com*. Si tienen alguna duda pueden leer el tutorial de Setup en [WebMail](http://webmail.mozdev.org/setup.html).

Y eso es todo. Ya tienen Hotmail en su administrador de mails.

> *Lo imposible esta en la mente de los cómodos.*
