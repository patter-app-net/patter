{% extends 'faq_base.swig' %}
{% block html_lang %}es{% endblock %}
{% block title %}FAQ{% endblock %}

{% block body %}
  <script>window.document.getElementById('lang_es').className = 'active';</script>
  <div class="container">
    <div class="page-header">
      <h1>Patter FAQ</h1>
    </div>
    <div class="jumbotron"><div class="container">
      <div class="page-header">
        <h1>General</h1>
      </div>

      <h2>¿Que es Patter?</h2>
      <p>Patter es un cliente web de mensajería. Funciona completamente en app.net y ofrece salas de chat públicas como tanto privadas. Al interactuar en dichas salas de chat, sus mensajes no aparecerán en el stream principal de app.net y en su lugar sólo aparecerán en la sala en la que está teniendo la conversación.</p>
      <p>Debido a que Patter es implementado enteramente como un protocolo encima de app.net, cualquier cliente o aplicación puede interoperar con el cliente web de Patter. Véase más abajo para la lista de clientes actuales que soportan las salas de Patter.</p>

      <h2>¿Cómo funciona?</h2>
      <p>El cliente web de Patter funciona por completo en su navegador web y publica sus mensajes a los canales de app.net. Cada uno de estos canales almacena una conversación de Mensaje Privado o una sala Patter. Los mensajes son almacenados permanentemente al menos que éstos sean eliminados por sus respectivos propietarios. Esto permite a Patter operar tanto como un cliente de chat en tiempo real así como también de mensajería dónde la otra persona podrá regresar y leer su mensaje una semana después.</p>

      <h2>¿Cuál es la diferencia entre las salas Patter públicas y privadas?</h2>
      <p>Las salas Públicas de Patter permiten a cualquier persona leer y participar; mientras que las salas Privadas pueden ser vistas sólo por sus participantes. Patter también permite salas públicas de sólo lectura; estas salas pueden ser leídas por cualquier persona más sin embargo, sólo algunas personas podrán publicar mensajes en ella.</p>
      <p>Algunas salas públicas o públicas de sólo lectura son también salas promovidas. Una sala promovida aparecerá en el directorio de Patter con una breve descripción del uso de la sala. Si usted crea una sala pública y no la promueve, otras personas aún podrán verla y participar en ella.</p>

      <h2>¿Cuál es la diferencia entre Mensajes Privados y las salas privadas de Patter?</h2>
      <p>Los Mensajes Privados son un tipo especial de sala proporcionada por la propia app.net. Cada grupo de personas tiene una sala privada de mensajería el cuál no posee un nombre y del cual no puede cambiar la composición de los miembros y mucho menos hacerla pública. Para poder agregar otra persona se requiere crear otro grupo de mensajería privada que incluya dicha persona.</p>
      <p>Por contraste, las salas de Patter son siempre mutables. El propietario puede agregar o eliminar personas de una sala privada en cualquier momento o cambiarlo de sala privada a pública si así lo desea. A su vez puede crear más de una sala Patter entre el mismo grupo de personas o incluso crear una sala privada de Patter con usted como único miembro.</p>

      <h2>¿Cómo es que Privado es privado?</h2>
      <p>Los Mensajes Privados y las salas Patter son almacenados en simple texto en los servidores de app.net. Por tanto, cualquier aplicación que autorice con el ámbito de 'mensajes' será capaz de obtener sus mensajes privados. Esto pone los mensajes privados y las salas Patter al mismo nivel que los correos electrónicos en términos de privacidad. Son razonablemente privados, sin embargo deberá evitar conspiraciones de dominación mundial o proporcionar su número de tarjeta de crédito en el chat.</p>
      <p>Los Mensajes Privados son un poco más privados que una sala Patter; esto es debido a que el propietario de la sala privada de Patter puede cambiarlo en cualquier momento a una sala pública de Patter lo que hará que todos los mensajes anteriores sean públicamente disponibles. Los Mensajes Privados no pueden ser otra cosa más que Mensajes Privados.</p>

      <h2>No puedo ver a nadie en la sala. ¿Es esto un pueblo fantasma?</h2>
      <p>La lista de los usuarios que se muestra en la barra lateral son las personas que han publicado recientemente. Habrá mucho más personas suscritas a la sala. Escriba una pregunta o comentario y seguramente recibirás una respuesta cuando alguno de los miembros vea sus mensajes. Recuerde que los mensajes de Patter son almacenados de por vida por lo que no tendrá que preocuparse de que su mensaje desaparezca en caso de que no haya nadie para recibirlo.</p>
      <p>Muchas salas de Patter permanecen latentes durante horas hasta que alguien escribe algo y luego de que algunas personas conversen en tiempo real por un tiempo. Algunos sólo reciben mensajes ocasionales debido a que la mayoría de las personas que se encuentran en las sala viven en diferentes zonas horarias o simplemente porque tienen diferentes horarios.</p>
      <p>Entre en las conversaciones y diga algo, se sorprenderá de la frecuencia en la que obtiene una respuesta.</p>

      <h2>¿Que clientes soporta Patter?</h2>
      <p>iOS: hAppy, Chimp, Felix (para salas privadas), y Patter para iOS.</p>
      <p>Mac: Project Amy</p>
      <p>Android: Robin</p>
      <p>Web: patter-app.net, appnetizens.com, TreeView</p>
      <p>Windows: Chapper, Project Rory</p>
      <p>Windows Phone: DotDot</p>

      <h2>¿Cómo obtengo notificaciones para las salas de Patter?</h2>
      <p>En iOS, Felix soporta notificaciones para salas privadas de Patter.</p>
      <p>En Android, Robin soporta notificaciones.</p>
      <p>Patter Notify es una extensión de Chrome que le notificará cuando haya un nuevo mensaje privado y actualizaciones Patter.</p>
    </div></div>
    <div class="jumbotron"><div class="container">
      <div class="page-header">
        <h1>Chateando</h1>
      </div>

      <h2>¿Qué es Enviar? ¿Qué es Transmitir (Broadcast)?</h2>
      <p>Enviar agrega el mensaje escrito a la sala actual. Éste es el comportamiento predeterminado al pulsar Enter. Transmitir crea un mensaje en la sala actual y al mismo tiempo la publica en su stream. La publicación incluye un enlace de la sala en la que se encuentra por lo que es una excelente manera de invitar a otras personas a que se unan a la sala o simplemente para llamar la atención de otras personas. Las Transmisiones son permitidas solamente para las salas públicas o para las salas públicas de sólo lectura.</p>

      <h2>¿Qué es lo que hace el suscribirse?</h2>
      <p>Suscribirse a una sala hará que ésta aparezca en la lista de 'Mis Salas' en el lobby. Sus suscripciones son usadas para notificarle en caso de que su cliente soporte notificaciones. Muchos clientes que soportan Patter no muestran el directorio o manejan sus suscripciones; en su lugar, sólo muestran las salas a las que está suscrito. En estos casos, podrá suscribirse a las salas vía el cliente web y después leer e interactuar con la otra app.</p>

      <h2>¿Cómo puedo hacer uso de los emoticonos ó Emoji?</h2>
      <p>Todos los emoticonos enlistados en http://www.emoji-cheat-sheet.com/ se encuentran soportados. Simplemente escriba la palabra rodeado por los dos puntos y el emoticono aparecerá en el cliente web. Si la otra persona no posee un cliente que soporte emoticonos, ellos de cualquier forma podrán ver el nombre el emoticono.</p>
      <p>Éstos emoticonos son propiedad y creación de Apple por lo tanto su licencia es dudosa. El cliente principal de Patter migrará a Phantom Open Emoji cuando ésta alcance un número considerable de emoticonos. http://www.kickstarter.com/projects/374397522/phantom-open-emoji</p>

      <h2>¿Cómo puedo publicar imágenes?</h2>
      <p>Al pegar un enlace con terminación .png, .jpg, or .gif será integrada automáticamente en el stream.</p>

      <h2>¿Qué significan los colores?</h2>
      <p>En el lobby, las salas de color verde significan que hay mensajes sin leer.</p>
      <p>Dentro de una sala, la lista de usuarios desvanecerá los nombres de usuarios que no han publicado en los últimos minutos. Después de 10 minutos de inactividad, serán borrados de la lista.</p>
      <p>Publicaciones que lo mencionen a usted y publicaciones creadas por usted son representadas con un distinto color de fondo para fácil identificación.</p>
      <p>@michelelewis es de color verde. Simplemente porque sí.</p>
    </div></div>
    <div class="jumbotron"><div class="container">
      <div class="page-header">
        <h1>Salas</h1>
      </div>

      <h2>¿Quiero cambiar mi sala, cómo lo hago?</h2>
      <p>Puede cambiar la sala sólo si es el propietario de dicha sala y si es una sala Patter. Mientras visualiza la sala, de click en 'Editar Sala' en la barra de menú localizada en la parte superior donde podrá agregar/eliminar usuarios, cambiar permisos, promover la sala y editar el nombre.</p>

      <h2>¿Puedo eliminar mi sala?</h2>
      <p>No es posible eliminar una sala debido a las limitaciones del API de app.net. Si desea simplemente olvidarse de una sala, edite la sala para que sea privada y nadie pueda entrar y dé de baja su suscripción a ella. Si la sala tiene mensajes importantes u otra información en ella, tendrá que eliminar dichos mensajes separadamente. Por el momento no hay forma sencilla de eliminar múltiples mensajes a su vez pero en caso de que surja la necesidad, contacte a @duerig y podré trabajar en agregar dicha característica.</p>
    </div></div>
    <div class="jumbotron"><div class="container">
      <div class="page-header">
        <h1>Soporte</h1>
      </div>

      <h2>Alguien me está acosando. ¿Qué puedo hacer?</h2>
      <p>Puede silenciar, bloquear, o reportarlos. Puede ir al perfil de usuario del acosador en Alpha y silenciarlo o bloquearlo. En caso necesario, contactar al soporte de app.net. Debido a que Patter es sólo un cliente encima de app.net, toda resolución debe de suceder en el propio app.net.</p>
      <p>Después de silenciar o bloquear un usuario, los mensajes y canales creados por dicho usuario no le serán mostrados.</p>

      <h2>Sigo re-suscribiéndome a una sala. ¿Qué puedo hacer?</h2>
      <p>Cuando un mensaje privado es enviado, automáticamente re-suscribe a todos los participantes de la sala. Si hay alguna sala o mensaje privado en particular que desee evitar, puede dar click en el botón de silenciar que se encuentra a un lado de la conversación en el lobby. Si hace esto, no será suscrito nuevamente a la sala por ninguna otra persona.</p>
      <p>También se encuentra disponible una opción en app.net en account.app.net/settings/ él cuál permite limitar a las personas que pueden re-suscribirlo a la sala. De click en Privacidad y seleccione que grupo de personas pueden enviarle mensajes. Ésta opción no afectará las salas en las que se encuentra actualmente suscrito, pero puede prevenir a otras personas que los suscriban a las salas que ellos creen.</p>

      <h2>Algo no funciona. ¿Con quién tengo que hablar?</h2>
      <p>Primero deberá contactar con el autor del cliente que se encuentra usando (Patter para iOS es creado por @boxenjim). Si tiene un problema con el cliente web o es un problema que no puede ser resuelto por dicha vía, siéntase libre de contactarme (@duerig). ¡Diviértase usando Patter!</p>
    </div></div>
  </div>
{% endblock %}
