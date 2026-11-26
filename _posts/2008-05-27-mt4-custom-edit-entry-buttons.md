---
layout: post
title: 'MT4: Custom edit entry buttons'
author: Lukas238
date: '2008-05-27T11:47:49-03:00'
categories:
- tecnologia
tags:
- movable-type
- javascript
- blog
description: En la versión 3 de Movable Type agregué un par de botones a la barra
  de herramientas de estilos de la página Crear Entrada y Editar Entrada, con el objetivo
  de simplificar la tarea
legacy: true
legacy_id: '120'
legacy_path: 2008/05/mt4-custom-edit.html
redirect_from:
- "/2008/05/mt4-custom-edit.html"
- "/2008/05/mt4-custom-edit.php"
- "/archives/2008/05/mt4_custom_edit.php"
- "/blog/2008/05/27/mt4-custom-edit-entry-buttons.html"
---

En la versión 3 de Movable Type agregué un par de botones a la barra de herramientas de estilos de la página Crear Entrada y Editar Entrada, con el objetivo de simplificar la tarea de insertar repetidas veces código html creado por mi.

Pero con la actualización a la versión 4 de Movable Type, perdí esos botones, y no pude encontrar la manera de implementar algo similar. **Hasta ahora**.

En MT4 la forma en que se implementan los botones de estilos cambió y no encontraba la manera de replicar el metodo, pero luego de buscar encontre este [post](http://forums.sixapart.com/lofiversion/index.php/t63536.html) y pude crear mi propio script usando un poco de javascript.

1.  Primero creamos un archivo con todos los scripts de nuestros botones. Para eso Creamos un archivo llamado "custom_buttons.js" en el directorio "/mt-static/js/common/Editor/".

2.  Dentro copiamos el siguiente código:\
    \


        function custombutton(action) {
            var textArea = app.editor.textarea;
            var text = textArea.getSelectedText();
            var n_text = '';
            if (!defined(text)){
                text = '';
            };
            
            switch (action){
                        /*Boton de ejemplo que incerta una imagen con link*/
                case "exampleAction":
                    var v_img = prompt("imageName.ext:","");
                    if (v_img != '' && v_img != null) {
                        n_text = text + '<a href="' + v_img + '" target="_blank"><img src="' + v_img + '" width="350" class="mt-image-center" /></a>';
                    }
                    break;
            };

            textArea.setSelection(n_text);
            textArea.editor.setChanged();
        };

    \

3.  Segundo, debemos hacer el archivo que acabamos de crear sea cargado por la página de "Edit Entry" de MT. Para eso editamos el archivo "tmpl/cms/include/archetype_editor.tmpl" y alrededor de la linea 12 agregamos este código:\
    \

        <script type='text/javascript' src="<$mt:var name='static_uri'$>js/common/Editor/custom_buttons_238.js?v=<$mt:var name='mt_version_id' escape='url'$>"></script>

    \

4.  Tercero, debemos crear al menos un botón que llame a nuestro código. Para eso, alrededor de la linea 43, agregamos este codigo:\
    \

        <a href="#" onclick="custombutton('exampleAction')" title="Insert Image" class="command-insert-image toolbar button">Image</a>

    \

En este ejemplo creamos solo un botón, el cual llama a nuestro código (en el archivo custom_buttons.js) pasando como acción la variable "exampleAction". Usando la variable, nuestro código elige cual acción debe realizar del Swich. La idea es que podemos agregar nuevos case y llamarlos desde distintos botones para que realicen lo nosotros programemos:

    switch (action){
            case "imageSize":
                var srvURL = 'http://www.misitioweb.com/blog/images/';
                var v_img = prompt("imageName.ext:","");
                if (v_img != '' && v_img != null) {         
                    var img_w = prompt("Inserte el ancho:","350");
                    var img_h = prompt("Inserte el alto:","240");   
                    n_text = text + '<a href="' + srvURL + v_img + '" target="_blank"><img src="' + srvURL + v_img + '" width="' + img_w+ '" height="' + img_h +'" class="mt-image-center" /></a>';
                }
                break;
            case "image":
                /* Imagenes externas */
                var v_img = prompt("imageName.ext:","");
                if (v_img != '' && v_img != null) {
                    n_text = text + '<a href="' + v_img + '" target="_blank"><img src="' + v_img + '" class="mt-image-center" /></a>';
                }
                break;
        };

Y el código de los botones seria así:

    <a href="#" onclick="custombutton('imageSize')" title="Image Size" class="command-insert-image toolbar button">Image</a>

    <a href="#" onclick="custombutton('image')" title="Insert Image" class="command-insert-image toolbar button">Image</a>

Funciona de maravilla en mi MT4. Espero les halla sido útil como a mí.
