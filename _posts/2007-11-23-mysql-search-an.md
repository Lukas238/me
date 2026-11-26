---
layout: post
title: mySQL search and replace
author: Lukas238
date: '2007-11-23T00:25:43-03:00'
categories:
- tecnologia
tags:
- mysql
- sql
- blog
description: Siguiendo con los cambios en el blog decidi que era hora de corregir
  una situación con mi base de datos y reemplazar cada "ny" por una linda ñ. Y por
  supuesto que no lo voy a hacer
legacy: true
legacy_id: '108'
legacy_path: 2007/11/mysql-search-an.html
redirect_from:
- "/2007/11/mysql-search-an.html"
---

Siguiendo con los cambios en el blog decidi que era hora de corregir una situación con mi base de datos y reemplazar cada "ny" por una linda ñ. Y por supuesto que no lo voy a hacer uno por uno, sino con SQL.

Habrimos [mySQL Query Browser](http://www.mysql.com/products/tools/query-browser/) y ejecutamos este query (con nuestros datos):

> update \[nombre de la tabla\] set \[combre del campo\] = replace(\[nombre del campo\],'\[cadena a buscar\]','\[cadena de remplazo\]');

Lo bueno de esta sentencia es que buscara en todas las entradas de la tabla el texto idicado y lo reemplazara si tocar el resto del texto. Excelente.

Esporadicamente escribo un post en mi palm y lo posteo por wifi. Para esto utilizo el [u\*Blog](http://pam-ya.com/palmware/index-en.html#uBlog) un programa para Palm OS 4 y posterior que -por supuesto- es gratuito, pequeño y no tiene nada que envidiar a los pagos.\
El unico inconveniente es que no soporta caracteres especiales (acentos o la eñe por ejemplo). Los acentos -bueno- vaya y pase, pero la eñe es indispensable. Lo unico que pude hacer fue en lugar de la eñe poner *"ny"*.

Usando la consulta SQL anteriormente mencionada, busque y reemplaze el texto "ny" por "ñ" (que es equivalente de la letra **ñ** en codificación latin-1 que es como trabaja la base de datos y MT4).
