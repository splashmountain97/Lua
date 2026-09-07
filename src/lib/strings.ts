/**
 * Every string the chrome says, in both languages.
 *
 * Pairs are adjacent on purpose: a reviewer reads the English and the
 * Portuguese on consecutive lines, which is how this translation was reviewed
 * in the first place. Entries that interpolate are functions returning a pair
 * rather than templates with holes in them, so the two languages stay free to
 * put the number wherever their grammar wants it.
 */

import type { Localized } from './i18n';

const L = (en: string, pt: string): Localized => ({ en, pt });

export const UI = {
  home: {
    tapToChoose: L(
      "Tap to choose what you'd like to reflect on",
      'Toque para escolher sobre o que refletir',
    ),
    howHard: L(
      'How hard do you want to think?',
      'Quanto você quer pensar hoje?',
    ),
    dayAllSpent: L(
      'That’s five today. Come back tomorrow.',
      'Foram cinco hoje. Volte amanhã.',
    ),
    dayOneLeft: L(
      'One question left today.',
      'Falta uma pergunta hoje.',
    ),
    dayLabel: (used: number, cap: number) => L(
      `${used} / ${cap} today`,
      `${used} / ${cap} hoje`,
    ),
    savedAria: (n: number) => L(
      `Saved questions: ${n}`,
      `Perguntas salvas: ${n}`,
    ),
    streakAria: (n: number) => L(
      `Streak: ${n} ${n === 1 ? 'day' : 'days'}`,
      `Sequência: ${n} ${n === 1 ? 'dia' : 'dias'}`,
    ),
    aboutCategory: L('About this category', 'Sobre esta categoria'),
    notOpenYet: (label: string) => L(
      `${label} — not open yet`,
      `${label} — ainda não disponível`,
    ),
    closeQuestion: L('Close this question', 'Fechar esta pergunta'),
    close: L('Close', 'Fechar'),
    writeAria: L('Write about this question', 'Escrever sobre esta pergunta'),
    writeTitle: L('Write about it', 'Escrever sobre ela'),
    saveFullAria: L(
      'Saved list full — remove one to save another',
      'Lista de salvos cheia — remova uma para salvar outra',
    ),
    unsaveAria: L('Remove this question from saved', 'Remover esta pergunta dos salvos'),
    saveAria: L('Save this question for later', 'Salvar esta pergunta para depois'),
    savedTitle: L('Saved', 'Salva'),
    saveFullTitle: L('Saved list full', 'Lista cheia'),
    saveTitle: L('Save for later', 'Salvar para depois'),
    shareAria: L('Send this question to someone', 'Enviar esta pergunta para alguém'),
    shareTitle: L('Send to a friend', 'Enviar para um amigo'),
    shakeAgain: L('Shake again', 'Chacoalhar de novo'),
    shakeAgainLockedAria: L(
      'Shake again — five a day is the free limit',
      'Chacoalhar de novo — cinco por dia é o limite gratuito',
    ),
  },

  intro: {
    reflection: L(
      "That's a reflection. Sit with it as long as you like.",
      'Isso é uma reflexão. Fique com ela o tempo que quiser.',
    ),
    close: L(
      'Done with it? Close it here and the moon comes back.',
      'Terminou? Feche aqui e a lua volta.',
    ),
    write: L(
      'Copy it to your clipboard, to answer wherever you keep your words.',
      'Copie para a área de transferência e responda onde você guarda suas palavras.',
    ),
    share: L(
      "Send a question to someone — they'll get the prompt, no app required to open it.",
      'Mande uma pergunta para alguém — a pessoa recebe a pergunta e não precisa de app nenhum para abrir.',
    ),
    again: L(
      'Not the one? Shake again for another.',
      'Não era essa? Chacoalhe de novo para outra.',
    ),
    cats: L(
      'Pick the ground your question comes from — yourself, your life, or the world beyond it. Change it whenever you like.',
      'Escolha de onde a pergunta vem — de você, da sua vida ou do mundo ao seu redor. Mude quando quiser.',
    ),
    weights: L(
      'And how far you want to be pushed. Some questions are a passing thought, some stay with you for days.',
      'E até onde você quer ir. Algumas perguntas são um pensamento passageiro; outras ficam com você por dias.',
    ),
    saved: L(
      'Anything you put aside is kept here — the questions you liked when the moment was wrong.',
      'Tudo que você deixa de lado fica aqui — as perguntas de que você gostou na hora errada.',
    ),
    streak: L(
      'The moon fills as you come back — a little more every few days, full at twenty-five.',
      'A lua vai enchendo conforme você volta — um pouco mais a cada poucos dias, cheia aos vinte e cinco.',
    ),
  },

  write: {
    copiedAria: L('Copied to your clipboard', 'Copiado para a área de transferência'),
    stillNoBoxAria: L('Still no text box', 'Continua sem caixa de texto'),
    copiedKicker: L('Copied to your clipboard.', 'Copiado para a área de transferência.'),
    copiedBody: L(
      'Lua’s not built for typing — paper works better for this. Paste it into your favourite notes app if you’d rather write there instead.',
      'A Lua não foi feita para digitar — papel funciona melhor aqui. Cole no seu app de notas favorito se preferir escrever lá.',
    ),
    stillNoBox: L('Still no text box — on purpose.', 'Continua sem caixa de texto — de propósito.'),
    copy: L('Copy to clipboard', 'Copiar para a área de transferência'),
    copied: L('Copied', 'Copiado'),
  },

  panel: {
    aria: L('Saved questions', 'Perguntas salvas'),
    kicker: L('Put aside for later', 'Deixado para depois'),
    title: L('Saved', 'Salvas'),
    sectionSaved: L('Saved', 'Salvas'),
    sectionDone: L('Reflected on', 'Já refletidas'),
    atCap: L(
      'Twenty is the free limit. Remove one to make room for another.',
      'Vinte é o limite gratuito. Remova uma para abrir espaço.',
    ),
    privacy: L(
      'Only the question is kept — never what you did with it.',
      'Só a pergunta é guardada — nunca o que você fez com ela.',
    ),
    empty: L(
      'Nothing put aside. Bookmark a question when you like it but the moment is wrong.',
      'Nada deixado de lado. Salve uma pergunta quando gostar dela mas a hora estiver errada.',
    ),
    remove: L('Remove', 'Remover'),
    removed: L('Removed', 'Removida'),
    undo: L('Undo', 'Desfazer'),
    markDone: L('Mark as reflected on', 'Marcar como refletida'),
    markUndone: L('Move back to saved', 'Voltar para salvas'),
  },

  streak: {
    kicker: L('The light has moved', 'A luz se moveu'),
    inARow: (n: number) => L(
      `${n === 1 ? 'day' : 'days'} in a row`,
      `${n === 1 ? 'dia seguido' : 'dias seguidos'}`,
    ),
    body: L(
      'There is no chart here, and nothing to lose. The object keeps the count for you: each day you come back, a little more of it is lit.',
      'Não tem gráfico aqui, e não tem nada a perder. A lua guarda a conta para você: a cada dia que você volta, um pouco mais dela se acende.',
    ),
    back: L('Back', 'Voltar'),
  },

  arrival: {
    line: L('Someone thought of you 🌙', 'Alguém pensou em você 🌙'),
    tap: L('Tap to read it.', 'Toque para ler.'),
  },

  onboarding: {
    // The typewriter on these headings counts characters, so a translation
    // simply types at its own length — nothing here is measured in English.
    heads: {
      1: L(
        'The question is ours. The answer is yours.',
        'A pergunta é nossa. A resposta é sua.',
      ),
      2: L(
        'Earth is loud. The moon isn’t.',
        'A Terra é barulhenta. A Lua não.',
      ),
      // Not 'Pronto para...': that makes the reader pick a gender before
      // they have answered anything. The question form asks the same thing
      // and asks it of everyone.
      3: L(
        'Ready to know yourself better?',
        'Quer se conhecer melhor?',
      ),
    },
    body: {
      1: [
        L(
          'Journaling is just answering an honest question about your own life, on purpose. People have done it for two thousand years — emperors did it, and so did people with nothing.',
          'Escrever sobre si mesmo é só responder, de propósito, uma pergunta honesta sobre a própria vida. As pessoas fazem isso há dois mil anos — imperadores fizeram, e quem não tinha nada também.',
        ),
        L(
          'A few hundred questions, handpicked slowly.',
          'Algumas centenas de perguntas, escolhidas a dedo, sem pressa.',
        ),
      ],
      2: [
        L(
          'One question a day. Answer it on paper, in your head, or out loud — alone or with friends. You decide.',
          'Uma pergunta por dia. Responda no papel, na cabeça ou em voz alta — só você ou com amigos. Você decide.',
        ),
        L(
          'Lua keeps none of it. No account, nothing saved, nothing sent.',
          'A Lua não guarda nada disso. Sem conta, nada salvo, nada enviado.',
        ),
      ],
    },
    next: L('Continue', 'Continuar'),
    start: L('Start now', 'Começar agora'),
    skip: L('Skip', 'Pular'),
  },

  wall: {
    locked: L(
      'This one’s still behind the moon. Leave your email and we’ll let you know the moment it unlocks.',
      'Esta ainda está atrás da lua. Deixe seu e-mail e a gente avisa assim que abrir.',
    ),
    lifts: (what: Localized) => L(
      `${what.en} — for now. Leave your email and we’ll let you know the moment that limit goes away.`,
      `${what.pt} — por enquanto. Deixe seu e-mail e a gente avisa assim que esse limite cair.`,
    ),
    limitDay: L('Five questions a day is the free limit', 'Cinco perguntas por dia é o limite gratuito'),
    limitSave: L('Twenty saved is the free limit', 'Vinte salvas é o limite gratuito'),
    kickerLife: L('Life · not open yet', 'Vida · ainda não disponível'),
    kickerWorld: L('Beyond You · not open yet', 'Ao seu redor · ainda não disponível'),
    kickerDay: L('Five a day · free limit', 'Cinco por dia · limite gratuito'),
    kickerSave: L('Twenty saved · free limit', 'Vinte salvas · limite gratuito'),
    headNotOpen: L('Not open yet', 'Ainda não disponível'),
    headDay: L('Come back tomorrow', 'Volte amanhã'),
    headSave: L('Full — for now', 'Cheio — por enquanto'),
    ctaOpens: L('Tell me when it opens', 'Me avise quando abrir'),
    ctaLifts: L('Tell me when it lifts', 'Me avise quando cair'),
    dismissCategory: L('Stay with Self for now', 'Ficar com Você por enquanto'),
    dismissDay: L('That’s enough for today', 'Por hoje chega'),
    dismissSave: L('I’ll clear a few first', 'Vou limpar algumas antes'),
    onList: L('You’re on the list', 'Você está na lista'),
    onListBody: L(
      'One message, when that happens. Nothing else — that hasn’t changed.',
      'Uma mensagem, quando acontecer. Nada além disso — isso não mudou.',
    ),
    backToQuestion: L('Back to your question', 'Voltar para a pergunta'),
    emailPlaceholder: L('you@example.com', 'voce@exemplo.com'),
    emailAria: L('Email address', 'Endereço de e-mail'),
    noteBadAddress: L(
      'That address looks incomplete — mind checking it?',
      'Esse endereço parece incompleto — pode conferir?',
    ),
    noteNoAddress: L(
      'An address first, then we can tell you.',
      'Primeiro o e-mail, aí a gente consegue avisar.',
    ),
  },

  unlock: {
    title: L('Open the whole library', 'Abra a biblioteca inteira'),
    sub: L(
      'One payment. No subscription, no renewal, nothing to cancel.',
      'Um pagamento só. Sem assinatura, sem renovação, nada para cancelar.',
    ),
    rowCategories: L('All three categories, always open', 'As três categorias, sempre abertas'),
    rowPool: L('One question a day, from a pool of forty', 'Uma pergunta por dia, de um conjunto de quarenta'),
    rowSix: L('Six hundred questions, written not generated', 'Seiscentas perguntas, escritas e não geradas'),
    rowMany: L('As many as you want in a day', 'Quantas você quiser por dia'),
    rowPrivacy: L('Still no account, still nothing stored', 'Continua sem conta, continua sem guardar nada'),
    tagFree: L('free', 'grátis'),
    tagUnlock: L('unlock', 'desbloqueio'),
    tagAlways: L('always', 'sempre'),
    note: L(
      "The three categories stay open either way. What you're buying is more questions, and as many as you like in a day.",
      'As três categorias continuam abertas de qualquer jeito. O que você compra são mais perguntas, e quantas quiser por dia.',
    ),
    unlocked: L('Unlocked', 'Desbloqueado'),
    notNow: L('Not now', 'Agora não'),
  },

  toast: {
    copied: L('Copied', 'Copiado'),
    copyFailed: L('Couldn’t copy', 'Não deu para copiar'),
    savedForLater: L('Saved for later', 'Salva para depois'),
  },

  settings: {
    title: L('Settings', 'Ajustes'),
    close: L('Close', 'Fechar'),
    language: L('Language', 'Idioma'),
    // Language names themselves are not here: English is always 'English' and
    // Português always 'Português', in either interface — see LANGS. Only
    // 'Automatic' and its note are UI copy, and so only they translate.
    auto: L('Automatic', 'Automático'),
    autoNote: (name: string) => L(
      `Follows your device — ${name}`,
      `Segue o seu aparelho — ${name}`,
    ),
    // The row's value says the outcome, not the mechanism: someone on
    // Automatic wants to know which language they are actually getting.
    autoValue: (name: string) => L(
      `Automatic · ${name}`,
      `Automático · ${name}`,
    ),
    // Settings is where people go looking for account and data controls. Lua's
    // answer is that there are none, and saying so is more useful than an
    // empty section.
    footer: L(
      'Nothing here leaves your device. There is no account to manage.',
      'Nada daqui sai do seu aparelho. Não existe conta para gerenciar.',
    ),
  },
} as const;
