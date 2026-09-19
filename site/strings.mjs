// Every word the site says, in both languages, pairs adjacent — the same
// arrangement as src/lib/strings.ts in the app, and for the same reason: a
// reviewer reads the English and the Portuguese on consecutive lines. Lines
// the app already says are repeated here word for word rather than
// paraphrased, so the site and the app cannot drift apart in what they promise.

const L = (en, pt) => ({ en, pt });

export const S = {
  site: {
    name: L('Lua', 'Lua'),
    tagline: L('A question, once a day.', 'Uma pergunta por dia.'),
    description: L(
      'Lua is a shake-to-reveal reflection prompt. One honest question at a time, answered on paper, in your head or out loud. No account, nothing saved, nothing sent.',
      'A Lua é uma pergunta de reflexão que aparece quando você chacoalha. Uma pergunta honesta de cada vez, respondida no papel, na cabeça ou em voz alta. Sem conta, nada salvo, nada enviado.',
    ),
    skip: L('Skip to content', 'Pular para o conteúdo'),
    langSwitch: L('Português', 'English'),
    langSwitchAria: L('Read this page in Portuguese', 'Ler esta página em inglês'),
    langOffer: L('Ler em português?', 'Read in English?'),
    langOfferYes: L('Sim', 'Yes'),
    langOfferNo: L('Não', 'No'),
    madeSlowly: L('Made slowly.', 'Feito devagar.'),
  },
  nav: {
    why: L('Why Lua', 'Por que a Lua'),
    features: L('Features', 'Recursos'),
    tryIt: L('Try it now', 'Experimente'),
    privacy: L('Privacy', 'Privacidade'),
    terms: L('Terms', 'Termos'),
    support: L('Support', 'Ajuda'),
    open: L('Open Lua', 'Abrir a Lua'),
    menu: L('Menu', 'Menu'),
  },
  home: {
    title: L('Lua · Journaling, without the blank page', 'Lua · Diário, sem a página em branco'),
    kicker: L('A question, once a day', 'Uma pergunta por dia'),
    h1: L('Journaling, without the blank page.', 'Diário, sem a página em branco.'),
    lead: L(
      'Shake the moon and one honest question comes out. Answer it on paper, in your head, or out loud. Thirty seconds, and you know yourself a little better than yesterday.',
      'Chacoalhe a lua e uma pergunta honesta sai de dentro. Responda no papel, na cabeça ou em voz alta. Trinta segundos, e você se conhece um pouco melhor do que ontem.',
    ),
    cta: L('Get today’s question', 'Pegar a pergunta de hoje'),
    ctaNote: L('Free · No account · English & Português', 'Grátis · Sem conta · Português & English'),
    three: [
      {
        head: L('No blank page.', 'Sem página em branco.'),
        body: L(
          'Lua asks. You only answer. One question at a time, never a cursor blinking at you.',
          'A Lua pergunta. Você só responde. Uma pergunta de cada vez, nunca um cursor piscando para você.',
        ),
      },
      {
        head: L('Nothing to type.', 'Nada para digitar.'),
        body: L(
          'Say it on a walk, write it in the notebook you already have, or just think it through. Lua has no text box, on purpose.',
          'Diga numa caminhada, escreva no caderno que você já tem, ou só pense. A Lua não tem caixa de texto, de propósito.',
        ),
      },
      {
        head: L('Nothing kept.', 'Nada guardado.'),
        body: L(
          'No account, nothing saved, nothing sent. What you think stays where you thought it.',
          'Sem conta, nada salvo, nada enviado. O que você pensa fica onde você pensou.',
        ),
      },
    ],
    why: {
      kicker: L('Why so little', 'Por que tão pouco'),
      h2: L('Apps want more of you. Lua wants less.', 'Os apps querem mais de você. A Lua quer menos.'),
      p1: L(
        'Track your mood. Rate your sleep. Tick the boxes, answer the follow-ups, keep the streak alive. Somewhere along the way, reflection got turned into a form to fill in, and a form is the opposite of a quiet mind.',
        'Registre o humor. Avalie o sono. Marque as caixinhas, responda as perguntas seguintes, mantenha a sequência. Em algum momento, refletir virou um formulário para preencher, e formulário é o oposto de uma mente quieta.',
      ),
      p2: L(
        'Lua does the reverse. One question, a handful of features, and then it lets you go: back to the real world, and to the quiet place inside you where the answer actually is.',
        'A Lua faz o contrário. Uma pergunta, poucos recursos, e depois ela te solta: de volta ao mundo real, e ao lugar quieto dentro de você onde a resposta realmente está.',
      ),
    },
    proof: {
      kicker: L('Two thousand years', 'Dois mil anos'),
      h2: L('This isn’t new. It’s old.', 'Isso não é novo. É antigo.'),
      p1: L(
        'Answering an honest question about your own life, on purpose, is the oldest habit there is. Emperors did it, and so did people with nothing.',
        'Responder, de propósito, uma pergunta honesta sobre a própria vida é o hábito mais antigo que existe. Imperadores fizeram, e quem não tinha nada também.',
      ),
      p2: L(
        'Lua’s questions are written by hand and picked slowly. A few hundred of them, from light to heavy, none of them generated.',
        'As perguntas da Lua são escritas à mão e escolhidas sem pressa. Algumas centenas, do leve ao pesado, nenhuma gerada.',
      ),
      quote: L('The soul is dyed by the thoughts.', 'A alma é tingida pelos pensamentos.'),
      quoteBy: L('Marcus Aurelius, Meditations, V.16', 'Marco Aurélio, Meditações, V.16'),
      principle: L('The question is ours. The answer is yours.', 'A pergunta é nossa. A resposta é sua.'),
    },
    push: {
      line: L('Ready to know yourself better?', 'Quer se conhecer melhor?'),
    },
    inside: {
      kicker: L('How it feels', 'Como é'),
      h2: L('Shake. Read. Sit with it.', 'Chacoalhe. Leia. Fique com ela.'),
      lead: L(
        'This is Lua as it is on your phone today. The moon is the whole interface: hold it, and the glass opens on one question.',
        'Esta é a Lua como ela é no seu celular hoje. A lua é a interface inteira: segure, e o vidro se abre em uma pergunta.',
      ),
      moonAria: L('The moon: a grey cratered sphere with a round glass window, purple and gold swirling inside', 'A lua: uma esfera cinza com crateras e uma janela redonda de vidro, com um redemoinho roxo e dourado dentro'),
    },
    features: [
      {
        id: 'reveal',
        kicker: L('The reveal', 'A revelação'),
        head: L('One line, and nothing else on the screen.', 'Uma linha, e nada mais na tela.'),
        body: L(
          'Hold the moon, or shake the phone. What comes out is one question with nothing around it, and it stays until you close it. Sit with it as long as you like.',
          'Segure a lua, ou chacoalhe o celular. O que sai é uma pergunta só, sem nada em volta, e ela fica até você fechar. Fique com ela o tempo que quiser.',
        ),
        note: L('Not the one? Shake again for another.', 'Não era essa? Chacoalhe de novo para outra.'),
        screen: 'reveal',
        alt: L('A question open in the app: “What is one thing you are grateful for?”, with write, save and send actions beneath it', 'Uma pergunta aberta no app: “Qual é uma coisa pela qual você sente gratidão?”, com as ações de escrever, salvar e enviar embaixo'),
      },
      {
        id: 'choose',
        kicker: L('Where they come from', 'De onde elas vêm'),
        head: L('You choose how deep it goes.', 'Você escolhe até onde vai.'),
        body: L(
          'Three sources: you, your life, and the world beyond it. Three weights, from light to heavy. Change either whenever you like.',
          'Três origens: você, sua vida e o mundo ao seu redor. Três pesos, do leve ao pesado. Mude quando quiser.',
        ),
        note: L(
          'Self is open now. Life and Beyond You are being finished; leave an email inside the app and it will tell you when they open.',
          'Você está aberta agora. Vida e Ao seu redor estão sendo terminadas; deixe um e-mail no app e ele avisa quando abrirem.',
        ),
        screen: 'home',
        alt: L('The home screen: the moon, and beneath it the Self, Life and Beyond You pills and the Any, Light, Medium, Heavy weights', 'A tela inicial: a lua, e embaixo os botões Você, Vida e Ao seu redor e os pesos Qualquer, Leve, Médio, Pesado'),
      },
      {
        id: 'share',
        kicker: L('Send it to someone', 'Mande para alguém'),
        head: L('Send one to a friend. They don’t need the app.', 'Mande uma para alguém. A pessoa não precisa do app.'),
        body: L(
          'It arrives with one line saying somebody thought of them, and then the question, exactly as you saw it. Answer it together, or apart.',
          'Chega com uma linha dizendo que alguém pensou nela, e depois a pergunta, exatamente como você viu. Respondam juntos, ou cada um do seu lado.',
        ),
        screen: 'arrival',
        alt: L('The arrival screen a sent question opens on: a small astronaut portrait and the line “Someone thought of you”', 'A tela de chegada de uma pergunta enviada: um pequeno retrato de astronauta e a linha “Alguém pensou em você”'),
      },
      {
        id: 'streak',
        kicker: L('Coming back', 'Voltar'),
        head: L('Come back, and the moon fills.', 'Volte, e a lua enche.'),
        body: L(
          'There is no chart here, and nothing to lose. The object keeps the count for you: each day you come back, a little more of it is lit. Full at twenty-five days.',
          'Não tem gráfico aqui, e não tem nada a perder. A lua guarda a conta para você: a cada dia que você volta, um pouco mais dela se acende. Cheia aos vinte e cinco dias.',
        ),
        screen: 'streak',
        alt: L('The streak screen: “9 days in a row” beside the moon, with a row of dots filling toward twenty-five', 'A tela de sequência: “9 dias seguidos” ao lado da lua, com uma fileira de pontos enchendo até vinte e cinco'),
      },
    ],
    write: {
      kicker: L('Where the answer goes', 'Para onde vai a resposta'),
      h2: L('Still no text box. On purpose.', 'Continua sem caixa de texto. De propósito.'),
      p1: L(
        'Lua’s not built for typing. Paper works better for this. The write button copies the question to your clipboard, so you can paste it into your favourite notes app if you’d rather write there instead.',
        'A Lua não foi feita para digitar. Papel funciona melhor aqui. O botão de escrever copia a pergunta para a área de transferência, para você colar no seu app de notas favorito se preferir escrever lá.',
      ),
      p2: L(
        'Lua keeps none of it. No account, nothing saved, nothing sent.',
        'A Lua não guarda nada disso. Sem conta, nada salvo, nada enviado.',
      ),
      alt: L('The saved list: a few questions put aside for later, and one marked as reflected on', 'A lista de salvas: algumas perguntas deixadas para depois, e uma marcada como refletida'),
    },
    get: {
      kicker: L('Get Lua', 'Leve a Lua'),
      h2: L('Take the moon with you.', 'Leve a lua com você.'),
      body: L(
        'Works on any phone today as a web app. Add it to your home screen and it opens like one. App Store and Google Play are on their way.',
        'Funciona em qualquer celular hoje, como app de navegador. Adicione à tela inicial e ela abre como um app. App Store e Google Play estão a caminho.',
      ),
      langs: L('In English and Portuguese, written and translated by hand.', 'Em inglês e português, escrita e traduzida à mão.'),
      qr: L('Point your camera here', 'Aponte a câmera aqui'),
      qrAria: L('QR code that opens Lua at luadaily.com/app', 'Código QR que abre a Lua em luadaily.com/app'),
      openWeb: L('Open Lua in your browser', 'Abrir a Lua no navegador'),
    },
  },
  badges: {
    appStore: L('App Store', 'App Store'),
    playStore: L('Google Play', 'Google Play'),
    soon: L('Coming soon', 'Em breve'),
    on: L('Download on the', 'Baixar na'),
    onPlay: L('Get it on', 'Disponível no'),
    soonAria: L('Not on the App Store yet', 'Ainda não está na App Store'),
    soonAriaPlay: L('Not on Google Play yet', 'Ainda não está no Google Play'),
  },
  tryPage: {
    title: L('Try Lua now', 'Experimente a Lua agora'),
    description: L('Open Lua in your browser and hold the moon.', 'Abra a Lua no navegador e segure a lua.'),
    kicker: L('Try it now', 'Experimente'),
    h1: L('Press and hold the moon.', 'Segure a lua.'),
    desk: L(
      'This is the real app, running here. Hold the moon with your mouse and let go.',
      'Este é o app de verdade, rodando aqui. Segure a lua com o mouse e solte.',
    ),
    orPhone: L('Or open it on your phone', 'Ou abra no celular'),
    open: L('Open Lua', 'Abrir a Lua'),
    openNew: L('Open in a new tab', 'Abrir em uma nova aba'),
    homeHead: L('Keep it on your home screen', 'Deixe na sua tela inicial'),
    homeLead: L('It opens like an app, without the browser around it.', 'Ela abre como um app, sem o navegador em volta.'),
    ios: L('iPhone', 'iPhone'),
    iosSteps: L('In Safari, tap Share, then “Add to Home Screen”.', 'No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.'),
    android: L('Android', 'Android'),
    androidSteps: L('In Chrome, open the menu and tap “Add to Home screen”.', 'No Chrome, abra o menu e toque em “Adicionar à tela inicial”.'),
    frameAria: L('Lua, the app, running in a phone-sized frame', 'A Lua, o app, rodando em um quadro do tamanho de um celular'),
  },
  legal: {
    effective: L('Effective', 'Em vigor desde'),
    contents: L('Contents', 'Conteúdo'),
    contact: L('Contact', 'Contato'),
    contactBody: L(
      'Questions about any of this go to',
      'Dúvidas sobre qualquer parte disto vão para',
    ),
  },
  privacy: {
    title: L('Privacy Policy · Lua', 'Política de Privacidade · Lua'),
    description: L('What Lua keeps, what it does not, and what leaves your device.', 'O que a Lua guarda, o que não guarda, e o que sai do seu aparelho.'),
    h1: L('Privacy', 'Privacidade'),
    lead: L(
      'The short version is the one the app already says: Lua keeps none of it. No account, nothing saved, nothing sent. The long version is below, and it is not much longer.',
      'A versão curta é a que o app já diz: a Lua não guarda nada disso. Sem conta, nada salvo, nada enviado. A versão longa está abaixo, e não é muito mais longa.',
    ),
    sections: [
      {
        id: 'what', h: L('What Lua is', 'O que é a Lua'),
        ps: [L(
          'Lua shows you one reflective question at a time. It is available as a web app at luadaily.com/app and as apps for iOS and Android. This policy covers all of them.',
          'A Lua mostra uma pergunta de reflexão de cada vez. Está disponível como app de navegador em luadaily.com/app e como aplicativos para iOS e Android. Esta política cobre todos eles.',
        )],
      },
      {
        id: 'not', h: L('What we do not collect', 'O que não coletamos'),
        ps: [
          L(
            'There is no account, so there is no name, email, password or profile. Your answers never enter Lua: there is no text box, and the write button only copies the question to your clipboard. We do not collect your contacts, your location, your photos, or an advertising identifier. We do not use cookies.',
            'Não existe conta, então não há nome, e-mail, senha ou perfil. Suas respostas nunca entram na Lua: não há caixa de texto, e o botão de escrever só copia a pergunta para a área de transferência. Não coletamos seus contatos, sua localização, suas fotos, nem identificador de publicidade. Não usamos cookies.',
          ),
        ],
      },
      {
        id: 'device', h: L('What stays on your device', 'O que fica no seu aparelho'),
        ps: [
          L(
            'A few small things are stored on your phone so the app can pick up where you left off: how many days in a row you have opened a question, the questions you have put aside for later, which sources and weights you chose, which language you chose, whether you have seen the introduction, and how many questions you have opened today. If you leave an email at one of the “not open yet” doors and it cannot be delivered right away, it waits on your device until it can.',
            'Algumas coisas pequenas ficam no seu celular para o app continuar de onde parou: quantos dias seguidos você abriu uma pergunta, as perguntas que deixou para depois, quais origens e pesos escolheu, qual idioma escolheu, se já viu a introdução, e quantas perguntas abriu hoje. Se você deixar um e-mail em uma das portas “ainda não disponível” e ele não puder ser entregue na hora, ele espera no seu aparelho até poder.',
          ),
          L(
            'None of this leaves the device, and none of it says anything about what you thought or wrote. Clearing the site data in your browser, or uninstalling the app, removes all of it.',
            'Nada disso sai do aparelho, e nada disso diz algo sobre o que você pensou ou escreveu. Limpar os dados do site no navegador, ou desinstalar o app, remove tudo.',
          ),
        ],
      },
      {
        id: 'leaves', h: L('What leaves your device, and when', 'O que sai do seu aparelho, e quando'),
        ps: [
          L(
            'Anonymous usage events. To learn whether the app works, such as whether people who arrive actually shake the moon and which filters get touched, the web app sends a few events to PostHog, on servers in the European Union. They carry no name, no account, no cookie, no device identifier that survives the visit, no question text and no question id. They describe the control that was used, never the reader. Session recording, heat maps and surveys are switched off, and PostHog is not allowed to load any extra scripts. Because nothing identifies you across visits, these events cannot be linked to you, and there is nothing for us to look up or delete.',
            'Eventos de uso anônimos. Para saber se o app funciona, por exemplo se quem chega chacoalha a lua de verdade e quais filtros são tocados, o app de navegador envia alguns eventos ao PostHog, em servidores na União Europeia. Eles não carregam nome, conta, cookie, identificador de aparelho que sobreviva à visita, texto de pergunta nem id de pergunta. Descrevem o controle que foi usado, nunca quem leu. Gravação de sessão, mapas de calor e pesquisas estão desligados, e o PostHog não pode carregar nenhum script extra. Como nada identifica você entre visitas, esses eventos não podem ser ligados a você, e não há nada para consultarmos ou apagarmos.',
          ),
          L(
            'Page views. This website and the web app use Vercel Analytics, which counts page views without cookies and without identifying visitors.',
            'Visualizações de página. Este site e o app de navegador usam o Vercel Analytics, que conta visualizações sem cookies e sem identificar visitantes.',
          ),
          L(
            'Your email, only if you give it. Some parts of Lua are not open yet. If you type an email at one of those doors, that address and the name of the door are stored in a table we control, and nothing else goes with it. It is used for one message, when that part opens. To have it removed before then, write to the address at the end of this page.',
            'Seu e-mail, só se você der. Algumas partes da Lua ainda não estão abertas. Se você digitar um e-mail em uma dessas portas, esse endereço e o nome da porta são guardados em uma tabela que controlamos, e nada mais vai junto. Ele é usado para uma mensagem, quando essa parte abrir. Para removê-lo antes disso, escreva para o endereço no fim desta página.',
          ),
        ],
      },
      {
        id: 'apps', h: L('The iPhone and Android apps', 'Os aplicativos para iPhone e Android'),
        ps: [
          L(
            'The apps use the motion sensor only to notice a shake, and that happens entirely on the phone. If you turn on a daily reminder, it is scheduled on your phone; no server is involved and nothing is sent. The apps contain no advertising and no third-party SDKs beyond the analytics described above. Apple and Google may collect their own data through the App Store and Google Play, under their own policies.',
            'Os aplicativos usam o sensor de movimento só para perceber uma chacoalhada, e isso acontece inteiramente no celular. Se você ativar um lembrete diário, ele é agendado no seu celular; nenhum servidor participa e nada é enviado. Os aplicativos não têm publicidade nem SDKs de terceiros além da análise descrita acima. A Apple e o Google podem coletar dados próprios pela App Store e pelo Google Play, sob suas próprias políticas.',
          ),
        ],
      },
      {
        id: 'children', h: L('Children', 'Crianças'),
        ps: [L(
          'Lua is not directed at children under 13, and we do not knowingly collect anything from them. Since nothing identifies anyone, there is nothing to collect either way.',
          'A Lua não é dirigida a crianças com menos de 13 anos, e não coletamos conscientemente nada delas. Como nada identifica ninguém, não há o que coletar de qualquer forma.',
        )],
      },
      {
        id: 'changes', h: L('Changes', 'Mudanças'),
        ps: [L(
          'If any of this changes, this page changes with it and the date at the top moves. We will not quietly start collecting something this page says we do not.',
          'Se algo disto mudar, esta página muda junto e a data no topo avança. Não vamos começar a coletar em silêncio algo que esta página diz que não coletamos.',
        )],
      },
    ],
  },
  terms: {
    title: L('Terms of Use · Lua', 'Termos de Uso · Lua'),
    description: L('The terms for using Lua, in plain words.', 'Os termos para usar a Lua, em palavras simples.'),
    h1: L('Terms of Use', 'Termos de Uso'),
    lead: L(
      'These are short because there is little to govern: no account, no payment, no content of yours on our side.',
      'Estes termos são curtos porque há pouco a regular: sem conta, sem pagamento, nenhum conteúdo seu do nosso lado.',
    ),
    sections: [
      { id: 'use', h: L('Using Lua', 'Usar a Lua'), ps: [L(
        'Lua is offered by LEGAL_ENTITY_NAME. You may use it, on the web or as an app, for your own personal reflection. You do not need an account and you do not need to agree to anything beyond what is on this page.',
        'A Lua é oferecida por LEGAL_ENTITY_NAME. Você pode usá-la, na web ou como app, para a sua própria reflexão pessoal. Você não precisa de conta e não precisa concordar com nada além do que está nesta página.',
      )] },
      { id: 'questions', h: L('The questions', 'As perguntas'), ps: [L(
        'The questions, the drawings, the moon and the name are ours. You are welcome to share individual questions with people, using the app’s own share function or in your own words. Please do not copy the library as a whole or present it as your own.',
        'As perguntas, os desenhos, a lua e o nome são nossos. Você pode compartilhar perguntas individuais com pessoas, pela função de envio do app ou com suas próprias palavras. Por favor, não copie a biblioteca inteira nem a apresente como sua.',
      )] },
      { id: 'answers', h: L('Your answers', 'Suas respostas'), ps: [L(
        'Whatever you think, say or write in response to a question is yours. It never reaches us, and we claim no rights to it.',
        'O que você pensa, diz ou escreve em resposta a uma pergunta é seu. Nunca chega até nós, e não reivindicamos direito nenhum sobre isso.',
      )] },
      { id: 'therapy', h: L('Not therapy', 'Não é terapia'), ps: [L(
        'Lua is not therapy and does not replace it. It is not medical advice, psychological treatment or a crisis service. If you are struggling, please talk to a professional or to someone you trust.',
        'A Lua não é terapia e não a substitui. Não é orientação médica, tratamento psicológico nem serviço de emergência. Se você está passando por dificuldade, procure um profissional ou alguém de confiança.',
      )] },
      { id: 'asis', h: L('As it is', 'Como ela é'), ps: [L(
        'Lua is provided as it is, without warranties of any kind. We do our best to keep it working, and we may change or stop any part of it. To the extent the law allows, we are not liable for any loss arising from your use of it.',
        'A Lua é fornecida como ela é, sem garantias de nenhum tipo. Fazemos o possível para mantê-la funcionando, e podemos mudar ou encerrar qualquer parte dela. Na medida em que a lei permite, não somos responsáveis por perdas decorrentes do seu uso.',
      )] },
      { id: 'purchases', h: L('Purchases', 'Compras'), ps: [L(
        'Lua is free. If a paid part is ever offered inside the iPhone or Android app, the purchase will be handled by Apple or Google under their terms, and this page will say so first.',
        'A Lua é gratuita. Se algum dia uma parte paga for oferecida dentro do app para iPhone ou Android, a compra será processada pela Apple ou pelo Google sob os termos deles, e esta página dirá isso antes.',
      )] },
      { id: 'law', h: L('Law', 'Lei'), ps: [L(
        'These terms are governed by the laws of JURISDICTION. If any part of them cannot be enforced, the rest still applies.',
        'Estes termos são regidos pelas leis de JURISDICTION. Se alguma parte deles não puder ser aplicada, o restante continua valendo.',
      )] },
    ],
  },
  support: {
    title: L('Support · Lua', 'Ajuda · Lua'),
    description: L('Answers to the questions people ask about Lua.', 'Respostas às perguntas que as pessoas fazem sobre a Lua.'),
    h1: L('Support', 'Ajuda'),
    lead: L(
      'Most of what people ask is answered here. Anything else, write to the address at the end.',
      'A maior parte do que as pessoas perguntam está respondida aqui. Qualquer outra coisa, escreva para o endereço no fim.',
    ),
    faqs: [
      { id: 'reveal', q: L('How do I get a question?', 'Como eu consigo uma pergunta?'), a: L(
        'Press and hold the moon until it opens. On a phone you can shake it instead, once you have allowed motion access.',
        'Segure a lua até ela abrir. No celular você também pode chacoalhar, depois de permitir o acesso ao movimento.',
      ) },
      { id: 'shake', q: L('Shaking does nothing.', 'Chacoalhar não faz nada.'), a: L(
        'On iPhone, Safari only listens for motion after you have allowed it, and it asks the first time you press the moon. If you said no, holding the moon does exactly the same thing. Inside the iPhone app, motion access is under Settings.',
        'No iPhone, o Safari só escuta o movimento depois que você permite, e ele pergunta na primeira vez que você segura a lua. Se você disse não, segurar a lua faz exatamente a mesma coisa. Dentro do app para iPhone, o acesso ao movimento fica em Ajustes.',
      ) },
      { id: 'answers', q: L('Where do my answers go?', 'Para onde vão as minhas respostas?'), a: L(
        'Nowhere, on purpose. Lua has no text box. The write button copies the question to your clipboard so you can answer on paper or in the notes app you already use.',
        'Para lugar nenhum, de propósito. A Lua não tem caixa de texto. O botão de escrever copia a pergunta para a área de transferência, para você responder no papel ou no app de notas que já usa.',
      ) },
      { id: 'self', q: L('Why can I only open Self?', 'Por que só consigo abrir Você?'), a: L(
        'Life and Beyond You are still being finished. Tap either one and you can leave an email; you will get one message when it opens, and nothing else.',
        'Vida e Ao seu redor ainda estão sendo terminadas. Toque em qualquer uma e você pode deixar um e-mail; vai receber uma mensagem quando abrir, e nada além disso.',
      ) },
      { id: 'five', q: L('It says five a day.', 'Diz cinco por dia.'), a: L(
        'Five questions a day is the free limit for now. The count comes back at midnight. If you would like the limit lifted, the wall lets you say so.',
        'Cinco perguntas por dia é o limite gratuito por enquanto. A contagem volta à meia-noite. Se você quiser que o limite caia, a tela avisa como dizer isso.',
      ) },
      { id: 'home', q: L('How do I put it on my home screen?', 'Como coloco na tela inicial?'), a: L(
        'On iPhone, open luadaily.com/app in Safari, tap Share, then “Add to Home Screen”. On Android, open it in Chrome, open the menu, then “Add to Home screen”. It then opens like an app.',
        'No iPhone, abra luadaily.com/app no Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”. No Android, abra no Chrome, abra o menu e depois “Adicionar à tela inicial”. Aí ela abre como um app.',
      ) },
      { id: 'delete', q: L('How do I delete my data?', 'Como apago meus dados?'), a: L(
        'Everything Lua keeps is on your device. Clear the site data for luadaily.com in your browser, or uninstall the app, and it is gone. If you left an email at one of the doors and want it removed, write to the address below.',
        'Tudo o que a Lua guarda está no seu aparelho. Limpe os dados do site luadaily.com no navegador, ou desinstale o app, e pronto. Se você deixou um e-mail em uma das portas e quer removê-lo, escreva para o endereço abaixo.',
      ) },
      { id: 'language', q: L('Can I read it in Portuguese?', 'Posso ler em inglês?'), a: L(
        'Yes. Lua follows your phone’s language, and the gear in the top corner lets you choose English or Portuguese for good.',
        'Sim. A Lua segue o idioma do seu celular, e a engrenagem no canto de cima deixa você escolher português ou inglês de vez.',
      ) },
    ],
  },
};
