---
layout: post
title: Google Analytics en Movable Type y cómo excluir nuestras propias visitas
author: Lukas238
date: '2007-09-21T23:06:01-03:00'
categories:
- tecnologia
tags:
- google-analytics
- movable-type
- blog
description: 'Desde el principio de este blog, he tenido un compañero inseparable:
  mi contador de visitas y estadísticas Webstats. Pero un día, comenzó a aparecer
  un misterioso popup en mi blog,'
legacy: true
legacy_id: '94'
legacy_path: 2007/09/webstats-is-out.html
redirect_from:
- "/2007/09/webstats-is-out.html"
---

Desde el principio de este blog, he tenido un compañero inseparable: mi contador de visitas y estadísticas [Webstats](http://webstats.motigo.com/).

Pero un día, comenzó a aparecer un misterioso popup en mi blog, y rastree el banner hasta webstats. Aparentemente ahora que se hacen llamar *Motigo* decidieron cambiar su antes excelente servicio gratuito, y ahora nos encajan un abusivo popup sin que podamos hacer nada.

Buscando por internet encontré una manera de modificar el script que ponemos en nuestra página para bloquear el popup. Pero eso no va a arreglar la ofensa -la desvergüenza- de mete una publicidad no solicitada en *MI* página.

Así que webstats puede meterse su contador donde no le de el sol, porque webstats se va, y [Google Analytics](http://www.google.com/analytics/) entra.

Para el que no conozca el Google Analytics solo voy a decir que es un sistema de seguimiento y análisis estadístico de paginas web. Mucho más completo y útil que el webstats, y -por supuesto- es gratuito. Solo basta con tener una cuenta de GMail y dar de alta el servicio. Pero lejos esta de mis intenciones el ponerme a explicar cómo funciona el servicio.

Hoy quiero mostrarle cómo incorporar Google Analytics a Movable Type y además configurar un filtro para que no queden registradas nuestras propias visitas.

1\. Primero debemos incluir el javascript de segumiento que nos da google analytics en cada una de las páginas que deseamos monitorear. Para eso basta con cortar y pegar el código en los diferentes templates de MT (index, individual entry, etc.)

El código de google analytics es como este (con el código de su propia cuenta de google analytics en lugar de XX-XXXXXXX-X):

\<script src="http://www.google-analytics.com/urchin.js" type="text/javascript"\> \</script\> \<script type="text/javascript"\> \_uacct = "XX-XXXXXXX-X"; urchinTracker(); \</script\>

Con este código colocado -y teniendo la página agregada en google analytics claro- ya es suficiente para comenzar a monitorear el sitio.

2\. Personalmente encuentro muy molesto a la hora de analizar las visitas encontrar las propias. La solución es crear un filtro en google analytics y excluirme del seguimiento.

Hay varias formas de lograrlo. Una es crear un filtro que excluya las visitas de mi IP, pero eso solo funcionara si cuento con una IP fija. Con una IP dinámica solo funcionara hasta el próximo cambio de dirección. Además qué pasa si estoy visitando mi blog desde una PC que no esta en mi casa, o si escribo un post desde un cybercafe, por ejemplo?

La solución es crear una **página especial**, la cual crea una *Cookie* -en la PC en la que me encuentre, cualquiera que sea- y que le dice a google analytics que no registre las visitas de esa PC. Les dejo el ejemplo a continuación (recuerden cambiar los XX-XXXXXXX-X por su propio número de google analytics) :

\<head\> \<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" /\> \<title\>Google Analytics: Excluding Cookie\</title\> \<meta name=”robots” content=”noindex, nofollow”\> \</head\>

\<body onLoad="javascript:\_\_utmSetVar('**no_report**')"\>\
\<p\>This page use a JavaScript function to set a cookie on your computer, and then filter all visitors with this cookies from appearing on your Analytics reports.\</p\>\
\<p\>You can now close this page.\</p\>\
\<script src="http://www.google-analytics.com/urchin.js" type="text/javascript"\>\
\</script\>\
\<script type="text/javascript"\>\
\_uacct = "XX-XXXXXXX-X";\
urchinTracker();\
\</script\>\
\</body\>\
\</html\>\

Para que funcione esta página debemos crear un filtro y configurarlo de la siguiente manera:

- Filter Type: Custom filter - Exclude.
- Filter Field: User Defined.
- Filter Pattern: **no_report** (puden usar cualquier texto que quieran con tal que pongan lo mismo en el *onLoad* del body la página).
- Case Sensitive: No.

Eso es todo. Antes de visitar su sitio web, entren en esta página y luego navegen su sitio web tranquilo de que no seran registrados por google, al menos hasta que caduque la cookie o la borren.
