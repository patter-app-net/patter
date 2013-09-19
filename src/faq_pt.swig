{% extends 'faq_base.swig' %}
{% block html_lang %}pt{% endblock %}
{% block title %}FAQ{% endblock %}

{% block body %}
  <script>window.document.getElementById('lang_pt').className = 'active';</script>
  <div class="container">
    <div class="page-header">
      <h1>Patter FAQ</h1>
    </div>
    <div class="jumbotron"><div class="container">
      <div class="page-header">
        <h1>Geral</h1>
      </div>
      <h2>O que é o Patter?</h2>
      <p>Patter é um cliente web de mensagens. Corre inteiramente no serviço app.net e disponibiliza salas de chat tanto públicas como privadas. Quando postas para uma dessas salas de chat as tuas mensagens não aparecem na tua stream principal do app.net, aparecem apenas na sala em que estás a participar.</p>
      <p>Como o Patter está implementado inteiramente como um protocolo por cima do app.net, qualquer cliente ou app pode comunicar com o cliente web. Ver abaixo os actuais clientes que suportam salas Patter.</p>
      <h2>Como é que funciona?</h2>
      <p>O cliente web Patter corre inteiramente no teu browser e posta as tuas mensagens para canais no app.net. Cada um deste canais guarda uma conversa de Mensagens Privadas (PMs) como uma sala Patter. Estas mensagens são guardadas permanentemente até serem apagadas por quem as criou. Isto possibilita ao Patter operar tanto como um cliente chat 'real-time' como guardar as mensagens para a outra pessoa a poder ler uma semana depois.</p>
      <h2>Qual é a diferença entre salas Patter privadas e públicas?</h2>
      <p>Salas Patter públicas permitem que qualquer pessoa possa ver e participar. Salas privadas apenas podem ser vistas pelos seus participantes. O Patter também permite salas de apenas leitura pública, estas são salas que podem ser vistas por qualquer pessoas mas apenas algumas podem participar.</p>
      <p>Algumas salas públicas ou de leitura pública podem ser publicitadas (promoted). Uma sala publicitada aparece no directório Patter com uma pequena descrição da mesma. Se creaste uma sala pública mas não a publicitaste, outros podem vê-la e participar na mesma.</p>
    <h2>Qual é a diferença entre Mensagens Privadas (PMs) e salas Patter privadas?</h2>
      <p>Mensagens Privadas são uma espécie de salas especiais oferecidas pelo próprio app.net, cada grupo de pessoas têm uma sala de Mensagens Privadas única com o seu nome. Não é possível mudar os membros da sala mais tarde ou torna-la pública. Para adicionar uma nova pessoa à conversa é necessário criar um novo grupo de Mensagens Privadas para incluir a nova pessoa.</p>
      <p>Em contraste, salas Patter são sempre alteráveis. O dono da sala por adicionar ou remover pessoas de uma sala privada ou altera-la de privada para pública mais tarde. Também podes criar mais do que uma sala Patter dentro do mesmo grupo de pessoas ou ainda criar uma sala apenas para ti.</p>
      <h2>Quanto privada é <i>Privada</i>?</h2>
      <p>Mensagens Privadas e salas Patter são guardads em *plaintext* nos servidores do app.net. Qualquer aplicação que autorizes com o alcance para 'mensagens' pode aceder às tuas mensagens privadas. Isto põe Mensagens Privadas e salas Patter igualáveis a email em termos de privacidade. Eles são razoávelmente privadas mas deves evitar incluir os teus planos para dominar o mundo e o teu número de cartão de crédito no chat.</p>

      <p>Mensagens Privadas são um bocadinho mais privadas que salas Patter, isto porque o dono de uma sala privada pode mais tarde a mudar para uma sala pública. Isto fará com que todas as mensagens prévias se tornem publicamente visíveis.</p>

    <h2>Não vejo ninguém numa sala, isto é uma cidade fantasma?</h2>
      <p>A lista de pessoas na barra lateral direita são os posters recentes. Muitas mais pessoas podem estar subscritas à sala. Publica uma pergunta ou comentário e muito provavelmente vais receber uma resposta quando um deles for ver as suas mensagens. Lembra-te que as mensagens no Patter são guardadas para sempre, por isso não tens de te preocupar se elas vão desaparecer se ninguém estiver por perto para as receber.</p>
      <p>Muitas salas Patter permaneçem <i>adormecidas</i> por horas até que alguém diga alguma coisa, o que pode despoletar uma conversa em tempo real, outras apenas recebem mensagens ocasionais tendo em conta que as pessoas que a estão a usar podem ser de diferentes <i>time zones</i> ou terem diferentes agendas e horários.</p>
      <p>Atira-te para uma sala e diz qualquer coisa, vais ficar surpreendido com a frequência que recebes resposta.</p>
      <h2>Que clientes suportam Patter?</h2>
      <p>iOS: <a href="https://directory.app.net/app/125/happy/">hAppy</a>, <a href="https://directory.app.net/app/185/chimp/">Chimp</a>, <a href="https://directory.app.net/app/46/felix/">Felix</a> (apenas para salas privadas), e <a href="https://directory.app.net/app/189/patter-for-ios/">Patter para iOS</a>.</p>
      <p>Mac: <a href="https://directory.app.net/app/166/amy/">Project Amy</a></p>
      <p>Android: <a href="https://directory.app.net/app/144/robin/">Robin</a></p>
      <p>Web: <a href="http://patter-app.net">patter-app.net</a>, <a href="http://appnetizens.com">appnetizens.com</a>, <a href="http://treeview.us/">TreeView</a></p>
      <p>Windows: <a href="https://directory.app.net/app/143/chapper/">Chapper</a>, <a href="https://alpha.app.net/projectrory">Project Rory</a></p>
      <p>Windows Phone: <a href="https://directory.app.net/app/27/dotdot/">DotDot</a></p>
      <h2>Como é que eu recebo notificações do Patter?</h2>
      <p>Para iOS, Felix suporta notificações para salas privadas Patter.</p>
      <p>Para Android, Robin suporta notificações.</p>
      <p><a href="http://patter-app.net/patter-notify.html">Patter Notify</a> é uma extensão para o Chrome que te notifica de novas PMs e updates do Patter.</p>
    </div></div>
    <div class="jumbotron"><div class="container">
      <div class="page-header">
        <h1>Chatting</h1>
      </div>
      <h2>O que faz o <i>send?</i> O que faz o <i>broadcast</i>?</h2>
      <p>Send adiciona a mensagem que escreveste à sala actual. Isto é a opção predefinida associada ao botão 'enter'. Broadcast tanto cria a mensagem na sala actual como a publica na tua stream principal. Esta publicação inclui um link para a sala que estás e é uma excelente maneira de promover e convidar outros a juntarem-se ao grupo. Broadcasts são apenas permitidos em salas públicas ou de leitura pública.</p>
      <h2>O que faz o <i>subscribe</i>?</h2>
      <p>Subscrever uma sala vai fazer com que ela apareça na lista de 'My Rooms' no lobby. As tuas subscrições também serve para te notificar se possuires um cliente que as suporte. Muitos clientes que suportam o Patter não mostram o directório ou não possuem a opção para gerir subscrições, em vez disso eles apenas te mostram as salas que subscreveste. Nesses casos podes subscrever a novas salas através do cliente web ou através de outras apps.</p>
      <h2>Como é que eu uso Emoji?</h2>
      <p>Todos os emoji listados em http://www.emoji-cheat-sheet.com/ são suportados. Simplesmente escreve o nome dentro de parênteses e o emoji aparecerá no cliente web. Se a outra pessoas não possui um cliente que suporta emoji apenas vê o nome do emoji.</p>
      <p>Estes emoji são propriedade da Apple e a sua licença é duvidosa. O cliente principal do Patter irá mudar-se para o Phantom Open Emoji quando existirem suficientes. http://www.kickstarter.com/projects/374397522/phantom-open-emoji</p>
      <h2>Como é que eu publico imagens?</h2>
      <p>Se inserir um URL que acaba em .png, .jpg, ou .gif a imagem será automaticamente adicionada na stream.</p>
      <h2>Qual é o significado das cores?</h2>
      <p>No lobby as salas verdes possui mensagens não lidas.</p>
      <p>Dentro de uma sala, a lista de utilizadores irá desvaneçer os usernames que não postaram nada nos últimos minutos. Depois de 10 minutos eles serão removidos da lista.</p>
      <p>Publicações que te mencionam e posts que tu criaste estão apresentados com cores de fundo diferente para maior facilidade de navegação.</p>
      <p>@michelelewis é verde. Porque sim.</p>
    </div></div>
    <div class="jumbotron"><div class="container">
      <div class="page-header">
        <h1>Salas</h1>
      </div>
      <h2>Eu quero mudar a minha sala, como é que o faço?</h2>
      <p>Só podes mudar uma sala se fores o proprietário da mesma. Quando estás na sala clica em 'Edit Room' na barra de menu no topo, e podes adicionar ou remover utilizadores, mudar as permissões, tratar da promoção da sala e editar o nome.</p>
      <h2>Posso apagar a minha sala?</h2>
      <p>Não podes apagar uma sala neste momento devido a limitações na API do app.net. Se quiseres simplesmente esqueçer a sala edita as permissões para privado e mais ninguém pode entrar, depois simplesmente deixa de a subscrever. Se uma sala possuir mensagens sensíveis ou outras informações terás que remover essas mensagens separadamente. Não há nenhuma maneira fácil para apagar um grande número de mensagens de uma vez, mas se a necessidade aumentar contacta o @duerig e eu posso trabalhar para adicionar esta funcionalidade.</p>
    </div></div>
    <div class="jumbotron"><div class="container">
      <div class="page-header">
        <h1>Suporte</h1>
      </div>
      <h2>Alguém me está a chatear, o que é que posso fazer?</h2>
      <p>Deves fazer mute, bloquear ou reportar essa pessoa. Podes ir ao perfil da pessoa no Alpha para fazer mute ou block. Se necessário, contacta o suporte do app.net. Como o Patter é simplesmente um cliente construido em cima do app.net todos estes conflitos terão de se resolver no app.net em si.</p>
      <p>Depois de fazer mute ou bloqueares um utilizador não poderás mais ver mensagens ou canais criados por essa pessoa.</p>
      <h2>Continuo a re-subscrever-me a uma sala, o que é que posso fazer?</h2>
      <p>Quando uma mensagem privada é enviada, re-subscreve todos os participantes a uma sala. Se existir uma sala ou conversa privada em particular que queres evitar podes clicar no botão 'mute' ao lado dessa sala no lobby. Se fizeres isto não poderás re-subscrever a essa sala no futuro.</p>
      <p>Também existe uma definição em account.app.net/settings/ que te permite limitar quem é que te pode re-subscrever a uma sala. Clica em 'Privacy' e depois seleciona qual grupo de pessoas que te pode enviar mensagens. Esta definição não irá afectar salas existentes a que já estás subscrito, mas pode prevenir outros a subscrever-te a salas novas que eles criarem.</p>
      <h2>Algo não está a funcionar, com quem é que eu falo?</h2>
      <p>Deverás primeiro contactar o autor do cliente que estéas a usar (Patter para iOS é de @boxenjim). Se tiveres algum problema com o cliente web ou se for um problema que não pode ser resolvido de outra maneira fica à vontade de me contactar (@duerig). Diverte-te a usar o Patter!</p>
    </div></div>
  </div>
{% endblock %}
