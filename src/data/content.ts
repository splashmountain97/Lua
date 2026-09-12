// Ported verbatim from the Lua design prototype (project/Lua.dc.html <script>).
//
// Every reader-facing string here carries both languages. English is the one
// the library was written in; see lib/i18n.ts.

import type { Lang, Localized } from '../lib/i18n';

export type CategoryId = 'you' | 'life' | 'world';
export type Weight = 1 | 2 | 3; // 1 light · 2 firm · 3 heavy — weight, never duration

export interface Category {
  id: CategoryId;
  label: Localized;
  desc: Localized;
}

// The ids are the record. They are written into lua.saved and lua.prefs and
// sent with every prompt_shown, so 'world' stays 'world' however the pill is
// labelled — renaming one would orphan saved questions and split a year of
// counts in two.
export const CATS: Category[] = [
  {
    id: 'you',
    label: { en: 'Self', pt: 'Você' },
    desc: {
      en: 'Who you are, right now — your feelings, your character, the day you just lived.',
      pt: 'Quem você é, agora — seus sentimentos, seu jeito, o dia que você acabou de viver.',
    },
  },
  {
    id: 'life',
    label: { en: 'Life', pt: 'Vida' },
    desc: {
      en: 'What you do with your time — work, relationships, family, the dreams you’re chasing or postponing, how you’re spending the years you have.',
      pt: 'O que você faz com o seu tempo — trabalho, relações, família, os sonhos que você persegue ou adia, como você gasta os anos que tem.',
    },
  },
  {
    id: 'world',
    label: { en: 'Beyond You', pt: 'Ao seu redor' },
    desc: {
      en: 'Bigger than you — curiosity, existence, the universe, the questions nobody has a clean answer to.',
      pt: 'Maior que você — curiosidade, existência, o universo, as perguntas que ninguém responde direito.',
    },
  },
];

export interface Prompt {
  /**
   * Stable identity, used in share links. Assigned once and never reused or
   * renumbered — a link shared today has to still resolve to the same question
   * after the library is edited, and array position does not survive that.
   * New questions take the next number above the current highest.
   */
  id: number;
  c: CategoryId;
  w: Weight;
  t: Localized;
}

export const PROMPTS: Prompt[] = [
  { id: 1, c: 'you', w: 1, t: { en: 'What can I do?', pt: 'O que está ao seu alcance hoje?' } },
  { id: 2, c: 'you', w: 1, t: { en: 'What is your body asking for right now?', pt: 'O que o seu corpo está pedindo agora?' } },
  { id: 3, c: 'you', w: 1, t: { en: 'Are you satisfied with how you spent your attention today?', pt: 'Você gastou sua atenção hoje do jeito que queria?' } },
  { id: 4, c: 'you', w: 1, t: { en: 'What is one thing you are grateful for?', pt: 'Qual é uma coisa pela qual você sente gratidão?' } },
  { id: 5, c: 'you', w: 1, t: { en: 'What is one thing you are excited about?', pt: 'Qual é uma coisa que te empolga?' } },
  { id: 6, c: 'you', w: 1, t: { en: 'What is one virtue you want to exhibit today?', pt: 'Qual virtude você quer exercitar hoje?' } },
  { id: 7, c: 'you', w: 1, t: { en: 'What have other people done lately, in small ways, that made your day?', pt: 'Que pequenos gestos de outras pessoas alegraram o seu dia recentemente?' } },
  { id: 8, c: 'you', w: 1, t: { en: 'Which of your abilities brings you the most joy when you use it?', pt: 'Qual das suas habilidades te dá mais alegria quando você usa?' } },
  { id: 9, c: 'you', w: 1, t: { en: 'What in the last two weeks has energised you, and what has drained you?', pt: 'Nas últimas duas semanas, o que te deu energia e o que te esgotou?' } },
  { id: 10, c: 'you', w: 1, t: { en: 'What pet peeves do you have, and do you know why they get to you?', pt: 'Que pequenas coisas te irritam, e você sabe por que elas te afetam?' } },
  { id: 11, c: 'you', w: 1, t: { en: 'Which quotes or pieces of advice have stayed with you, and why those?', pt: 'Que frases ou conselhos ficaram com você, e por que justamente esses?' } },
  { id: 12, c: 'you', w: 1, t: { en: 'Which songs carry the most vivid memories for you?', pt: 'Quais músicas carregam as memórias mais vivas para você?' } },
  { id: 13, c: 'you', w: 1, t: { en: 'Why do you dress the way that you do?', pt: 'Por que você se veste do jeito que se veste?' } },
  { id: 14, c: 'you', w: 1, t: { en: 'What is one topic you are fascinated enough by to teach a class about?', pt: 'Sobre qual assunto você gosta tanto que daria uma aula?' } },
  { id: 15, c: 'you', w: 1, t: { en: 'Out of ten, where is your physical health right now?', pt: 'De zero a dez, como está a sua saúde física agora?' } },
  { id: 159, c: 'you', w: 1, t: { en: 'What have you been obsessed with lately?', pt: 'Qual tem sido a sua obsessão ultimamente?' } },
  { id: 195, c: 'you', w: 1, t: { en: 'Does your internal monologue sound more like a supportive friend or a harsh critic?', pt: 'Sua voz interior soa mais como um amigo que apoia ou como um crítico duro?' } },
  { id: 220, c: 'you', w: 1, t: { en: 'When do you feel proud?', pt: 'Quando você sente orgulho?' } },
  { id: 221, c: 'you', w: 1, t: { en: 'When are you happiest?', pt: 'Quando você é mais feliz?' } },
  { id: 224, c: 'you', w: 1, t: { en: 'What parts of nature do you like best?', pt: 'De quais partes da natureza você mais gosta?' } },
  { id: 225, c: 'you', w: 1, t: { en: 'What colour makes you think of happiness, and why?', pt: 'Qual cor te faz pensar em felicidade, e por quê?' } },
  { id: 226, c: 'you', w: 1, t: { en: 'What talents do you have?', pt: 'Quais talentos você tem?' } },
  { id: 228, c: 'you', w: 1, t: { en: 'What do you like most about yourself?', pt: 'Do que você mais gosta em você?' } },
  { id: 237, c: 'you', w: 1, t: { en: 'What is something you do well?', pt: 'Qual é algo que você faz bem?' } },
  { id: 238, c: 'you', w: 1, t: { en: 'What is something you are optimistic about?', pt: 'Sobre o que você está otimista?' } },
  { id: 239, c: 'you', w: 1, t: { en: 'What is your first memory?', pt: 'Qual é a sua primeira memória?' } },
  { id: 241, c: 'you', w: 1, t: { en: 'What is a smell that you remember from growing up?', pt: 'Qual cheiro você lembra da sua infância?' } },
  { id: 244, c: 'you', w: 1, t: { en: 'Where is your favourite place to be, and why?', pt: 'Qual é o seu lugar preferido para estar, e por quê?' } },
  { id: 245, c: 'you', w: 1, t: { en: 'What is the best thing and the worst thing that happened to you this week?', pt: 'Qual foi a melhor e a pior coisa que aconteceu com você esta semana?' } },
  { id: 254, c: 'you', w: 1, t: { en: 'What tempted you today?', pt: 'O que te tentou hoje?' } },
  { id: 275, c: 'you', w: 1, t: { en: 'What did you eat as a child that you cannot stand now as an adult?', pt: 'O que você comia quando criança e não suporta mais como adulto?' } },
  { id: 276, c: 'you', w: 1, t: { en: 'What is a happy memory you’ll cherish forever?', pt: 'Qual memória feliz você vai guardar para sempre?' } },
  { id: 279, c: 'you', w: 1, t: { en: 'Where were you happiest living?', pt: 'Em que lugar você foi mais feliz morando?' } },
  { id: 280, c: 'you', w: 1, t: { en: 'What was the best meal you have ever had?', pt: 'Qual foi a melhor refeição da sua vida?' } },
  { id: 281, c: 'you', w: 1, t: { en: 'If you had to eat the same food every day, what would it be?', pt: 'Se você tivesse que comer a mesma comida todo dia, qual seria?' } },
  { id: 16, c: 'you', w: 2, t: { en: 'If the version of you from five years ago could see your life today, what would surprise them most?', pt: 'Se a sua versão de cinco anos atrás visse a sua vida hoje, o que mais a surpreenderia?' } },
  { id: 17, c: 'you', w: 2, t: { en: 'What is the last piece of feedback you resisted?', pt: 'Qual foi o último feedback que você resistiu em aceitar?' } },
  { id: 18, c: 'you', w: 2, t: { en: 'What have you avoided because doing it would make you look foolish while you are still learning?', pt: 'O que você evitou porque te faria passar vergonha enquanto ainda está aprendendo?' } },
  { id: 19, c: 'you', w: 2, t: { en: 'When feedback comes in, do you welcome it or fight it?', pt: 'Quando chega um feedback, você acolhe ou briga com ele?' } },
  { id: 20, c: 'you', w: 2, t: { en: 'What are you doing purely for yourself, and not for how it looks?', pt: 'O que você faz puramente por você, e não pela aparência que tem?' } },
  { id: 21, c: 'you', w: 2, t: { en: 'What are you avoiding?', pt: 'O que você está evitando?' } },
  { id: 22, c: 'you', w: 2, t: { en: 'Where are you feeling dissatisfied?', pt: 'Em que parte da sua vida você sente insatisfação?' } },
  { id: 23, c: 'you', w: 2, t: { en: 'How do the opinions of others affect you?', pt: 'Como as opiniões dos outros afetam você?' } },
  { id: 24, c: 'you', w: 2, t: { en: 'How do you feel about asking for help?', pt: 'Como você se sente ao pedir ajuda?' } },
  { id: 25, c: 'you', w: 2, t: { en: 'What annoys you about other people that you sometimes do yourself?', pt: 'O que te irrita nos outros e que você também faz às vezes?' } },
  { id: 26, c: 'you', w: 2, t: { en: 'Who has the right answer, and you ignore them because they communicate badly?', pt: 'Quem tem a resposta certa e você ignora porque se comunica mal?' } },
  { id: 27, c: 'you', w: 2, t: { en: 'Whose substance is thin, and you listen anyway because they communicate well?', pt: 'Quem tem pouco conteúdo e você escuta mesmo assim porque se comunica bem?' } },
  { id: 28, c: 'you', w: 2, t: { en: 'What frustrates you, and which of your values explains why it bothers you so much?', pt: 'O que te frustra, e qual dos seus valores explica por que isso te incomoda tanto?' } },
  { id: 29, c: 'you', w: 2, t: { en: 'What do you need to give yourself more credit for?', pt: 'Pelo que você precisa se dar mais crédito?' } },
  { id: 30, c: 'you', w: 2, t: { en: 'What does ready feel like to you? How did you know you were ready for a major step you have taken?', pt: 'Como você reconhece a hora certa? Como soube que era hora de dar um passo grande que já deu?' } },
  { id: 31, c: 'you', w: 2, t: { en: 'What happens when you are angry?', pt: 'O que acontece quando você está com raiva?' } },
  { id: 32, c: 'you', w: 2, t: { en: 'What is a reminder you would like to give yourself the next time you are in a downward spiral?', pt: 'Que lembrete você gostaria de deixar para si na próxima vez que entrar em uma espiral para baixo?' } },
  { id: 33, c: 'you', w: 2, t: { en: 'What is something you grew out of that meant a great deal to you at the time?', pt: 'O que você deixou para trás mas significava muito para você na época?' } },
  { id: 34, c: 'you', w: 2, t: { en: 'What made you feel most alive when you were young?', pt: 'O que fazia você sentir que estava realmente vivendo quando era jovem?' } },
  { id: 35, c: 'you', w: 2, t: { en: 'When did you last have to hold your tongue, and what would you have said?', pt: 'Quando foi a última vez que você teve que segurar a língua, e o que teria dito?' } },
  { id: 36, c: 'you', w: 2, t: { en: 'Who is somebody you miss, and why?', pt: 'De quem você sente falta, e por quê?' } },
  { id: 37, c: 'you', w: 2, t: { en: 'What was a mistake that taught you something about yourself?', pt: 'Qual erro te ensinou algo sobre você?' } },
  { id: 38, c: 'you', w: 2, t: { en: 'Which aspect of your own personality do you appreciate when you see it in other people?', pt: 'Qual traço da sua personalidade você admira quando vê nas outras pessoas?' } },
  { id: 39, c: 'you', w: 2, t: { en: 'In a room holding everyone you have ever met, who do you look for first?', pt: 'Numa sala com todas as pessoas que você já conheceu, quem você procura primeiro?' } },
  { id: 40, c: 'you', w: 2, t: { en: 'When you wake up, do you expect the day to hold more joys or more frustrations?', pt: 'Quando você acorda, espera mais alegrias ou mais frustrações do dia?' } },
  { id: 41, c: 'you', w: 2, t: { en: 'If you could live one moment again, which would it be?', pt: 'Se você pudesse viver um momento de novo, qual seria?' } },
  { id: 42, c: 'you', w: 2, t: { en: 'When did you last change your mind?', pt: 'Quando foi a última vez que você mudou de ideia?' } },
  { id: 43, c: 'you', w: 2, t: { en: 'Out of ten, where is your mental health right now?', pt: 'De zero a dez, como está a sua saúde mental agora?' } },
  { id: 147, c: 'you', w: 2, t: { en: 'Where do you go when you want your mind to stop? Be specific. Does it actually work?', pt: 'Para onde você vai quando quer que a sua cabeça pare? Dê detalhes. Funciona mesmo?' } },
  { id: 150, c: 'you', w: 2, t: { en: 'What’s the smallest possible action you could take on the thing you’re anxious about?', pt: 'Qual é a menor ação possível que você poderia tomar sobre aquilo que te dá ansiedade?' } },
  { id: 152, c: 'you', w: 2, t: { en: 'What’s a lesson you’ve learned more than once?', pt: 'Qual lição você já aprendeu mais de uma vez?' } },
  { id: 190, c: 'you', w: 2, t: { en: 'Are the beliefs you hold about yourself today based on who you were or who you want to become?', pt: 'As crenças que você tem sobre si hoje vêm de quem você foi ou de quem você quer ser?' } },
  { id: 193, c: 'you', w: 2, t: { en: 'Do you view your mistakes as failures of character or as necessary steps in your training?', pt: 'Você vê seus erros como falhas de caráter ou como etapas necessárias do seu aprendizado?' } },
  { id: 194, c: 'you', w: 2, t: { en: 'Which parts of your true nature are you still waiting for permission to express?', pt: 'Quais partes da sua verdadeira natureza ainda esperam permissão para aparecer?' } },
  { id: 196, c: 'you', w: 2, t: { en: 'Are you prioritizing being understood by others over truly understanding yourself?', pt: 'Você prioriza que os outros te entendam, em vez de entender a si?' } },
  { id: 219, c: 'you', w: 2, t: { en: 'When was the last time you cried, and why?', pt: 'Quando foi a última vez que você chorou, e por quê?' } },
  { id: 222, c: 'you', w: 2, t: { en: 'How do you feel about your appearance?', pt: 'Como você se sente em relação à sua aparência?' } },
  { id: 227, c: 'you', w: 2, t: { en: 'What are you afraid of, and why?', pt: 'Do que você tem medo, e por quê?' } },
  { id: 229, c: 'you', w: 2, t: { en: 'What do you think people like most about you?', pt: 'O que você acha que as pessoas mais gostam em você?' } },
  { id: 236, c: 'you', w: 2, t: { en: 'What is something you dislike about yourself?', pt: 'Do que você não gosta em você?' } },
  { id: 240, c: 'you', w: 2, t: { en: 'What would you tell your ten-year-old self?', pt: 'O que você diria para você aos dez anos?' } },
  { id: 247, c: 'you', w: 2, t: { en: 'What do you wish people knew about you without your having to tell them?', pt: 'O que você queria que as pessoas soubessem sobre você sem precisar contar?' } },
  { id: 249, c: 'you', w: 2, t: { en: 'What is your most treasured memory from high school?', pt: 'Qual é a sua memória mais querida do ensino médio?' } },
  { id: 250, c: 'you', w: 2, t: { en: 'What is your fondest memory of an animal or pet you once had?', pt: 'Qual é a sua memória mais carinhosa de um animal que você teve?' } },
  { id: 252, c: 'you', w: 2, t: { en: 'If you could return to one moment and relive it without changing anything, which would you choose, and why?', pt: 'Se você pudesse voltar a um momento e revivê-lo sem mudar nada, qual escolheria, e por quê?' } },
  { id: 256, c: 'you', w: 2, t: { en: 'When were you happiest this year?', pt: 'Quando você foi mais feliz este ano?' } },
  { id: 257, c: 'you', w: 2, t: { en: 'What is a scary dream you remember from your past?', pt: 'De qual sonho assustador você ainda se lembra?' } },
  { id: 277, c: 'you', w: 2, t: { en: 'What do you miss the most in your life?', pt: 'Do que você mais sente falta na sua vida?' } },
  { id: 278, c: 'you', w: 2, t: { en: 'What are you most proud of?', pt: 'Do que você mais se orgulha?' } },
  { id: 44, c: 'you', w: 3, t: { en: 'What story about yourself would you have to retire in order to grow?', pt: 'Qual história sobre você teria que ser aposentada para você crescer?' } },
  { id: 45, c: 'you', w: 3, t: { en: 'Where are you self-sabotaging with a behaviour nobody else imposed on you?', pt: 'Onde você se sabota com um comportamento que ninguém te impôs?' } },
  { id: 46, c: 'you', w: 3, t: { en: 'What are you still carrying that was never yours?', pt: 'O que você ainda carrega que nunca foi seu?' } },
  { id: 47, c: 'you', w: 3, t: { en: 'Where are you avoiding disappointing someone else at the cost of disappointing yourself?', pt: 'Onde você evita decepcionar outra pessoa ao custo de decepcionar a si?' } },
  { id: 48, c: 'you', w: 3, t: { en: 'What do you think people say about you when you are not in the room?', pt: 'O que você acha que dizem de você quando você não está na sala?' } },
  { id: 49, c: 'you', w: 3, t: { en: 'In what ways are you holding yourself back?', pt: 'De que formas você está se segurando?' } },
  { id: 50, c: 'you', w: 3, t: { en: 'Whose life do you admire that is secretly miserable?', pt: 'Qual vida que você admira é, no fundo, infeliz?' } },
  { id: 51, c: 'you', w: 3, t: { en: 'What do you believe only because believing it keeps you in good standing with your people?', pt: 'Em que você acredita só porque isso mantém a sua boa relação com o seu grupo?' } },
  { id: 52, c: 'you', w: 3, t: { en: 'Which of your values would be different if you had been raised by different parents?', pt: 'Quais dos seus valores seriam diferentes se outros pais tivessem te criado?' } },
  { id: 53, c: 'you', w: 3, t: { en: 'What do you believe most strongly on the least evidence?', pt: 'No que você acredita com mais força e menos evidência?' } },
  { id: 54, c: 'you', w: 3, t: { en: 'Think about the last time you cried. If those tears could talk, what would they say?', pt: 'Pense na última vez que você chorou. Se aquelas lágrimas falassem, o que diriam?' } },
  { id: 55, c: 'you', w: 3, t: { en: 'What is a made-up rule you apply to your own life, and what has it cost you?', pt: 'Qual regra inventada você aplica à sua própria vida, e o que ela já te custou?' } },
  { id: 56, c: 'you', w: 3, t: { en: 'What is a question you are afraid to know the answer to?', pt: 'De qual pergunta você tem medo de saber a resposta?' } },
  { id: 57, c: 'you', w: 3, t: { en: 'What do you have a hard time being honest about, even with the people you trust most?', pt: 'Sobre o que você tem dificuldade de falar com honestidade, mesmo com quem mais confia?' } },
  { id: 58, c: 'you', w: 3, t: { en: 'Which sensations or experiences do you arrange your life to avoid?', pt: 'Quais sensações ou experiências você organiza a sua vida para evitar?' } },
  { id: 59, c: 'you', w: 3, t: { en: 'Which emotions in other people are hardest for you to be around?', pt: 'Quais emoções nos outros são as mais difíceis de suportar por perto?' } },
  { id: 60, c: 'you', w: 3, t: { en: 'When things go well for others, do you enjoy cheering them on, or does their success sting?', pt: 'Quando as coisas dão certo para os outros, você vibra junto ou o sucesso deles dói?' } },
  { id: 61, c: 'you', w: 3, t: { en: 'When things go wrong, do you treat it as yours to improve, or do you look for who is at fault?', pt: 'Quando algo dá errado, você trata como algo seu para melhorar ou procura de quem é a culpa?' } },
  { id: 151, c: 'you', w: 3, t: { en: 'Are you happier than you were three years ago — yes or no, before you start explaining?', pt: 'Você está mais feliz do que há três anos — sim ou não, antes de começar a explicar?' } },
  { id: 153, c: 'you', w: 3, t: { en: 'Make two lists: people who love you, and things you love. Which was easier to write?', pt: 'Faça duas listas: pessoas que te amam e coisas que você ama. Qual foi mais fácil de escrever?' } },
  { id: 154, c: 'you', w: 3, t: { en: 'What’s a comfortable story you tell about your life that you’re not fully sure is true?', pt: 'Qual história confortável você conta sobre a sua vida sem ter certeza de que é verdade?' } },
  { id: 158, c: 'you', w: 3, t: { en: 'What’s something true you’ve been softening when you say it out loud?', pt: 'Que verdade você tem suavizado na hora de dizer em voz alta?' } },
  { id: 170, c: 'you', w: 3, t: { en: 'What have you promised recently and not delivered? What have you learned afterwards?', pt: 'O que você prometeu recentemente e não cumpriu? O que aprendeu depois?' } },
  { id: 173, c: 'you', w: 3, t: { en: 'Does it bother you when someone is far better than you at something you care about? Why?', pt: 'Te incomoda quando alguém é muito melhor que você em algo que te importa? Por quê?' } },
  { id: 191, c: 'you', w: 3, t: { en: 'How much of your current personality is a result of conscious choice rather than social conditioning?', pt: 'Quanto da sua personalidade atual vem de escolha consciente e não de condicionamento social?' } },
  { id: 192, c: 'you', w: 3, t: { en: 'If you were stripped of your job and your possessions, what core parts of your identity would remain?', pt: 'Se você perdesse o seu trabalho e os seus bens, que partes essenciais da sua identidade restariam?' } },
  { id: 197, c: 'you', w: 3, t: { en: 'What is the one truth about your life you are currently trying to ignore?', pt: 'Qual é a verdade sobre a sua vida que você está tentando ignorar agora?' } },
  { id: 255, c: 'you', w: 3, t: { en: 'Are you a good person?', pt: 'Você é uma boa pessoa?' } },
  { id: 260, c: 'you', w: 3, t: { en: 'How well do you know yourself?', pt: 'O quanto você se conhece?' } },
  { id: 262, c: 'you', w: 3, t: { en: 'Would you be a different person today if you had a different childhood, and how?', pt: 'Você seria uma pessoa diferente hoje se tivesse tido outra infância? Como?' } },
  { id: 263, c: 'you', w: 3, t: { en: 'Did you have a happy childhood?', pt: 'Você teve uma infância feliz?' } },
  { id: 282, c: 'you', w: 3, t: { en: 'Would your fifteen-year-old self be proud of what you have become?', pt: 'Você aos quinze anos teria orgulho de quem você se tornou?' } },

  { id: 62, c: 'life', w: 1, t: { en: 'What can you do today to feel like you are growing?', pt: 'O que você pode fazer hoje para sentir que está crescendo?' } },
  { id: 63, c: 'life', w: 1, t: { en: 'What can you eliminate this week to free up attention?', pt: 'O que você pode eliminar esta semana para liberar atenção?' } },
  { id: 64, c: 'life', w: 1, t: { en: 'What is the one thing you need to do?', pt: 'Qual é a única coisa que você precisa fazer?' } },
  { id: 65, c: 'life', w: 1, t: { en: 'How did you bond with one of the best friends you have ever had?', pt: 'Como nasceu a sua ligação com um dos melhores amigos que você já teve?' } },
  { id: 66, c: 'life', w: 1, t: { en: 'What could you spend a little more money on to make life smoother?', pt: 'Em que você poderia gastar um pouco mais para deixar a vida mais leve?' } },
  { id: 67, c: 'life', w: 1, t: { en: 'What do you wish you could do more quickly? What do you wish you could do more slowly?', pt: 'O que você queria fazer mais rápido? E o que queria fazer mais devagar?' } },
  { id: 68, c: 'life', w: 1, t: { en: 'What is a positive habit you would like to cultivate, and how could you start?', pt: 'Qual hábito positivo você gostaria de cultivar, e como poderia começar?' } },
  { id: 69, c: 'life', w: 1, t: { en: 'Which part of your work do you most enjoy, and which part least?', pt: 'De qual parte do seu trabalho você mais gosta, e de qual menos?' } },
  { id: 70, c: 'life', w: 1, t: { en: 'What would you do if you could stop time for two months?', pt: 'O que você faria se pudesse parar o tempo por dois meses?' } },
  { id: 71, c: 'life', w: 1, t: { en: 'Who has been your greatest teacher?', pt: 'Quem foi o seu maior professor?' } },
  { id: 72, c: 'life', w: 1, t: { en: 'Where is your dream destination?', pt: 'Qual é o seu destino dos sonhos?' } },
  { id: 73, c: 'life', w: 1, t: { en: 'Are you getting a little better today?', pt: 'Você está ficando um pouco melhor hoje?' } },
  { id: 74, c: 'life', w: 1, t: { en: 'Out of ten, where are your friendships right now?', pt: 'De zero a dez, como estão as suas amizades agora?' } },
  { id: 75, c: 'life', w: 1, t: { en: 'Out of ten, where is your learning right now?', pt: 'De zero a dez, como está o seu aprendizado agora?' } },
  { id: 76, c: 'life', w: 1, t: { en: 'Out of ten, where are your experiences right now?', pt: 'De zero a dez, como estão as suas experiências agora?' } },
  { id: 148, c: 'life', w: 1, t: { en: 'What three things in your life right now would have felt like luxuries five years ago?', pt: 'Quais três coisas na sua vida hoje pareceriam luxo cinco anos atrás?' } },
  { id: 165, c: 'life', w: 1, t: { en: 'Name one person whose work you admire. What’s a specific, concrete thing you could do for them this week?', pt: 'Cite uma pessoa cujo trabalho você admira. O que de concreto você poderia fazer por ela esta semana?' } },
  { id: 198, c: 'life', w: 1, t: { en: 'Does the decision you have been postponing make your world feel larger or smaller?', pt: 'A decisão que você vem adiando deixa o seu mundo maior ou menor?' } },
  { id: 201, c: 'life', w: 1, t: { en: 'How much of your daily stress comes from things you cannot actually influence?', pt: 'Quanto do seu estresse diário vem de coisas que você não pode influenciar?' } },
  { id: 203, c: 'life', w: 1, t: { en: 'Who in your life makes you feel like the most authentic version of yourself?', pt: 'Quem na sua vida faz você ser a sua versão mais autêntica?' } },
  { id: 207, c: 'life', w: 1, t: { en: 'What would change if you treated your willpower as a muscle that needs regular exercise?', pt: 'O que mudaria se você tratasse a sua força de vontade como um músculo que precisa de exercício?' } },
  { id: 232, c: 'life', w: 1, t: { en: 'When was the last time you did something for the first time?', pt: 'Quando foi a última vez que você fez algo pela primeira vez?' } },
  { id: 235, c: 'life', w: 1, t: { en: 'If you could live anywhere in the world, where would it be?', pt: 'Se você pudesse morar em qualquer lugar do mundo, onde seria?' } },
  { id: 243, c: 'life', w: 1, t: { en: 'What would you do if you won the lottery?', pt: 'O que você faria se ganhasse na loteria?' } },
  { id: 268, c: 'life', w: 1, t: { en: 'What would be your ideal birthday present, and why?', pt: 'Qual seria o presente de aniversário ideal para você, e por quê?' } },
  { id: 284, c: 'life', w: 1, t: { en: 'What did you use to buy that you don’t anymore?', pt: 'O que você comprava e não compra mais?' } },
  { id: 286, c: 'life', w: 1, t: { en: 'What is something you have learned from someone you love?', pt: 'O que você aprendeu com alguém que você ama?' } },
  { id: 77, c: 'life', w: 2, t: { en: 'Are you building, or maintaining?', pt: 'Você está construindo ou mantendo?' } },
  { id: 78, c: 'life', w: 2, t: { en: 'If your family inherited only your habits, which would be the richest gift?', pt: 'Se a sua família herdasse só os seus hábitos, qual seria o presente mais valioso?' } },
  { id: 79, c: 'life', w: 2, t: { en: 'Are you playing a game worth losing?', pt: 'Você está jogando um jogo que vale a pena perder?' } },
  { id: 80, c: 'life', w: 2, t: { en: 'What needs to happen for you to look back in December and call this year a success?', pt: 'O que precisa acontecer para que, em dezembro, você olhe para trás e chame este ano de bom?' } },
  { id: 81, c: 'life', w: 2, t: { en: 'You may want the result. Do you want the lifestyle?', pt: 'Você pode querer o resultado. Mas você quer o estilo de vida?' } },
  { id: 82, c: 'life', w: 2, t: { en: 'Are your goals big enough, or have you shrunk them to something safely achievable?', pt: 'Suas metas são grandes o bastante, ou você as encolheu para algo seguro de alcançar?' } },
  { id: 83, c: 'life', w: 2, t: { en: 'Is this a problem to solve, or a tension to live with?', pt: 'Isto é um problema para resolver ou uma tensão para conviver?' } },
  { id: 84, c: 'life', w: 2, t: { en: 'What have you known for a while you should let go of, and still haven’t?', pt: 'O que você já sabe há um tempo que deveria largar, e ainda não largou?' } },
  { id: 85, c: 'life', w: 2, t: { en: 'Who removes uncertainty for you just by being reliable? Are you that person for someone?', pt: 'Quem tira a sua incerteza só por ser confiável? Você é essa pessoa para alguém?' } },
  { id: 86, c: 'life', w: 2, t: { en: 'Whose presence has quietly made your life better, and have you told them?', pt: 'A presença de quem melhorou a sua vida em silêncio, e você já disse isso a essa pessoa?' } },
  { id: 87, c: 'life', w: 2, t: { en: 'Who in your life is an energy catalyst, and who is an energy vampire?', pt: 'Quem na sua vida é uma fonte de energia, e quem é um vampiro de energia?' } },
  { id: 88, c: 'life', w: 2, t: { en: 'Are you impatient with results, or impatient with effort?', pt: 'Você é impaciente com resultados ou impaciente com esforço?' } },
  { id: 89, c: 'life', w: 2, t: { en: 'Are you hungry for excellence, or just for success?', pt: 'Você tem fome de excelência ou só de sucesso?' } },
  { id: 90, c: 'life', w: 2, t: { en: 'What is the goal, and what is the bottleneck?', pt: 'Qual é o objetivo, e qual é o gargalo?' } },
  { id: 91, c: 'life', w: 2, t: { en: 'Which goal would have the greatest impact on your life?', pt: 'Qual objetivo teria o maior impacto na sua vida?' } },
  { id: 92, c: 'life', w: 2, t: { en: 'Do you work for your business, or does it work for you?', pt: 'Você trabalha para o seu negócio, ou ele trabalha para você?' } },
  { id: 93, c: 'life', w: 2, t: { en: 'What would you do if money were no object?', pt: 'O que você faria se dinheiro não fosse problema?' } },
  { id: 94, c: 'life', w: 2, t: { en: 'How would you use your talents and skills to serve others?', pt: 'Como você usaria seus talentos e habilidades para servir aos outros?' } },
  { id: 97, c: 'life', w: 2, t: { en: 'Are you taking enough risks? Would you like to change your relationship to risk?', pt: 'Você corre riscos suficientes? Gostaria de mudar a sua relação com o risco?' } },
  { id: 98, c: 'life', w: 2, t: { en: 'What could you do to make your life more meaningful?', pt: 'O que você poderia fazer para dar mais sentido à sua vida?' } },
  { id: 99, c: 'life', w: 2, t: { en: 'What did you learn from your last relationship, or from one you have watched closely?', pt: 'O que você aprendeu com o seu último relacionamento, ou com um que acompanhou de perto?' } },
  { id: 100, c: 'life', w: 2, t: { en: 'What is a boundary you need to draw?', pt: 'Qual limite você precisa estabelecer?' } },
  { id: 101, c: 'life', w: 2, t: { en: 'What is holding you back from being productive at the moment, and what can you do about it?', pt: 'O que está atrapalhando a sua produtividade agora, e o que você pode fazer sobre isso?' } },
  { id: 102, c: 'life', w: 2, t: { en: 'What was a seemingly inconsequential decision that changed the shape of your life?', pt: 'Qual decisão aparentemente sem importância mudou o rumo da sua vida?' } },
  { id: 103, c: 'life', w: 2, t: { en: 'Who is the most difficult person in your life, and why?', pt: 'Quem é a pessoa mais difícil da sua vida, e por quê?' } },
  { id: 104, c: 'life', w: 2, t: { en: 'When an opportunity appears, do you lean towards action or towards postponing the decision?', pt: 'Quando aparece uma oportunidade, você tende à ação ou a adiar a decisão?' } },
  { id: 105, c: 'life', w: 2, t: { en: 'Better waves make better surfers. Are you on the right beach?', pt: 'Ondas melhores fazem surfistas melhores. Você está na praia certa?' } },
  { id: 106, c: 'life', w: 2, t: { en: 'What kinds of accomplishment feel most worthwhile to you?', pt: 'Que tipo de conquista vale mais a pena para você?' } },
  { id: 107, c: 'life', w: 2, t: { en: 'What is your definition of success in friendship?', pt: 'Qual é a sua definição de sucesso em uma amizade?' } },
  { id: 108, c: 'life', w: 2, t: { en: 'What in your profession is impossible to know, however good you get?', pt: 'O que na sua profissão é impossível saber, por melhor que você fique?' } },
  { id: 109, c: 'life', w: 2, t: { en: 'Out of ten, where is your family life right now?', pt: 'De zero a dez, como está a sua vida familiar agora?' } },
  { id: 110, c: 'life', w: 2, t: { en: 'Out of ten, where is your romantic life right now?', pt: 'De zero a dez, como está a sua vida amorosa agora?' } },
  { id: 111, c: 'life', w: 2, t: { en: 'Out of ten, where is your career right now?', pt: 'De zero a dez, como está a sua carreira agora?' } },
  { id: 112, c: 'life', w: 2, t: { en: 'Out of ten, where are your finances right now?', pt: 'De zero a dez, como estão as suas finanças agora?' } },
  { id: 155, c: 'life', w: 2, t: { en: 'When did you last feel genuinely close to another person? What was different about that moment?', pt: 'Quando foi a última vez que você sentiu proximidade real com alguém? O que aquele momento tinha de diferente?' } },
  { id: 156, c: 'life', w: 2, t: { en: 'What have you made enough of to have real opinions about, and what rule do you follow now that you didn’t at the start?', pt: 'O que você já fez o bastante para ter opiniões de verdade, e qual regra você segue hoje que não seguia no começo?' } },
  { id: 160, c: 'life', w: 2, t: { en: 'What did you build this week — not what you finished, but what exists now that didn’t on Monday?', pt: 'O que você construiu esta semana — não o que terminou, mas o que existe agora e não existia na segunda?' } },
  { id: 161, c: 'life', w: 2, t: { en: 'If your job title vanished tomorrow, what could you still do that someone would pay for?', pt: 'Se o seu cargo sumisse amanhã, o que você ainda saberia fazer que alguém pagaria por?' } },
  { id: 163, c: 'life', w: 2, t: { en: 'Out of ten, how would you rate what you know, who trusts you, and what you own?', pt: 'De zero a dez, como você avalia o que sabe, quem confia em você e o que possui?' } },
  { id: 164, c: 'life', w: 2, t: { en: 'Who do you know that makes you want to work harder? When did you last spend real time with them?', pt: 'Quem te dá vontade de trabalhar mais? Quando foi a última vez que passou um tempo de verdade com essa pessoa?' } },
  { id: 166, c: 'life', w: 2, t: { en: 'What’s the thing you keep saying you’d make if you had time, and what are the three things its first version would have to do?', pt: 'O que você vive dizendo que faria se tivesse tempo, e quais três coisas a primeira versão disso teria que fazer?' } },
  { id: 167, c: 'life', w: 2, t: { en: 'If you could genuinely learn anything in the next 90 days, what would change your life most?', pt: 'Se você pudesse realmente aprender qualquer coisa nos próximos 90 dias, o que mudaria mais a sua vida?' } },
  { id: 168, c: 'life', w: 2, t: { en: 'Which relationship in your life took the longest to build?', pt: 'Qual relação da sua vida levou mais tempo para ser construída?' } },
  { id: 169, c: 'life', w: 2, t: { en: 'If you named everyone actually on your team right now, in work or in life, who would be on the list?', pt: 'Se você listasse quem realmente está no seu time agora, no trabalho ou na vida, quem entraria?' } },
  { id: 199, c: 'life', w: 2, t: { en: 'Are you spending your time building a life that looks good to others or feels good to you?', pt: 'Você está construindo uma vida que parece boa para os outros ou que é boa para você?' } },
  { id: 200, c: 'life', w: 2, t: { en: 'If you knew you couldn’t fail, would you still be doing exactly what you are doing now?', pt: 'Se você soubesse que não podia falhar, ainda estaria fazendo exatamente o que faz agora?' } },
  { id: 205, c: 'life', w: 2, t: { en: 'Are you chasing happiness in a way that is actually pushing it further away?', pt: 'Você está perseguindo a felicidade de um jeito que a afasta ainda mais?' } },
  { id: 206, c: 'life', w: 2, t: { en: 'How often do you choose the “sure thing” at the expense of your own growth?', pt: 'Com que frequência você escolhe a aposta segura em troca do seu próprio crescimento?' } },
  { id: 217, c: 'life', w: 2, t: { en: 'Who or what has had a strong influence in your life?', pt: 'Quem ou o que teve uma influência forte na sua vida?' } },
  { id: 218, c: 'life', w: 2, t: { en: 'Which is least important to you — money, power, fame — and why?', pt: 'O que é menos importante para você — dinheiro, poder ou fama — e por quê?' } },
  { id: 251, c: 'life', w: 2, t: { en: 'You have to invite three people to dinner, dead or alive. Who do you invite, and why?', pt: 'Você tem que chamar três pessoas para jantar, vivas ou mortas. Quem você chama, e por quê?' } },
  { id: 258, c: 'life', w: 2, t: { en: 'What situation has caused you to confront your ethics recently?', pt: 'Que situação recente te fez confrontar a sua ética?' } },
  { id: 261, c: 'life', w: 2, t: { en: 'Which parts of your work and your life are good as they stand, and which are not?', pt: 'Quais partes do seu trabalho e da sua vida estão boas como estão, e quais não estão?' } },
  { id: 265, c: 'life', w: 2, t: { en: 'What is your most valuable asset?', pt: 'Qual é o seu bem mais valioso?' } },
  { id: 267, c: 'life', w: 2, t: { en: 'What is your proudest accomplishment?', pt: 'Qual é a conquista de que você mais se orgulha?' } },
  { id: 269, c: 'life', w: 2, t: { en: 'How and when did you fall in love with your favourite hobby?', pt: 'Como e quando você se apaixonou pelo seu hobby favorito?' } },
  { id: 271, c: 'life', w: 2, t: { en: 'Who is the most authentic person you have ever met, and what is so special about them?', pt: 'Quem é a pessoa mais autêntica que você já conheceu, e o que ela tem de tão especial?' } },
  { id: 283, c: 'life', w: 2, t: { en: 'What event has changed your life?', pt: 'Qual acontecimento mudou a sua vida?' } },
  { id: 287, c: 'life', w: 2, t: { en: 'Is there anything you want to do in life that you haven’t done?', pt: 'Tem algo que você quer fazer na vida e ainda não fez?' } },
  { id: 290, c: 'life', w: 2, t: { en: 'What would you like to have spent more time doing in your life?', pt: 'No que você gostaria de ter passado mais tempo na sua vida?' } },
  { id: 113, c: 'life', w: 3, t: { en: 'If you met your eighty-year-old self today, what would they beg you to stop postponing?', pt: 'Se você encontrasse você aos oitenta anos hoje, o que essa pessoa imploraria para você parar de adiar?' } },
  { id: 114, c: 'life', w: 3, t: { en: 'If you knew you had two years left, how would you spend them?', pt: 'Se você soubesse que tem dois anos de vida, como os gastaria?' } },
  { id: 115, c: 'life', w: 3, t: { en: 'What would you like people to say at your funeral?', pt: 'O que você gostaria que dissessem no seu velório?' } },
  { id: 117, c: 'life', w: 3, t: { en: 'If you repeated this week for ten years, where would it lead, and is that where you want to be?', pt: 'Se você repetisse esta semana por dez anos, onde isso te levaria, e é lá que você quer estar?' } },
  { id: 118, c: 'life', w: 3, t: { en: 'If you never do the thing that scares you, what does your life look like in six months, a year, three years?', pt: 'Se você nunca fizer aquilo que te assusta, como fica a sua vida em seis meses, um ano, três anos?' } },
  { id: 119, c: 'life', w: 3, t: { en: 'How much do your current goals reflect what you want, and how much what someone else wants?', pt: 'Quanto das suas metas atuais reflete o que você quer, e quanto reflete o que outra pessoa quer?' } },
  { id: 120, c: 'life', w: 3, t: { en: 'What is your definition of success in life?', pt: 'Qual é a sua definição de sucesso na vida?' } },
  { id: 149, c: 'life', w: 3, t: { en: 'Name one thing in your life that isn’t working but isn’t bad enough to quit. How long has it been like that?', pt: 'Cite algo na sua vida que não funciona mas não é ruim o bastante para largar. Há quanto tempo está assim?' } },
  { id: 157, c: 'life', w: 3, t: { en: 'Who in your life tells you the truth even when you’d rather they didn’t? When did you last actually let them?', pt: 'Quem te diz a verdade mesmo quando você preferia que não dissesse? Quando foi a última vez que você deixou?' } },
  { id: 162, c: 'life', w: 3, t: { en: 'Be honest: is the way your industry is changing making your skills worth more or less?', pt: 'Sem enrolação: o jeito como o seu setor está mudando faz suas habilidades valerem mais ou menos?' } },
  { id: 202, c: 'life', w: 3, t: { en: 'Is your current work a contribution to the world or merely a means of survival?', pt: 'O seu trabalho hoje é uma contribuição para o mundo ou só um meio de sobrevivência?' } },
  { id: 204, c: 'life', w: 3, t: { en: 'If your life were a story, are you the main character or a supporting actor in someone else’s plot?', pt: 'Se a sua vida fosse uma história, você seria o protagonista ou um coadjuvante no enredo de outra pessoa?' } },
  { id: 259, c: 'life', w: 3, t: { en: 'What is your biggest regret?', pt: 'Qual é o seu maior arrependimento?' } },
  { id: 264, c: 'life', w: 3, t: { en: 'When did you realise your parents were living their lives for the first time too?', pt: 'Quando você percebeu que os seus pais também estavam vivendo pela primeira vez?' } },
  { id: 274, c: 'life', w: 3, t: { en: 'What would you say to someone you have lost, if you could see them again?', pt: 'O que você diria a alguém que você perdeu, se pudesse ver essa pessoa de novo?' } },
  { id: 285, c: 'life', w: 3, t: { en: 'What three words describe how you want to be remembered?', pt: 'Quais três palavras descrevem a lembrança que você quer deixar?' } },
  { id: 288, c: 'life', w: 3, t: { en: 'Have you given up on a dream you once had? What would you do differently now?', pt: 'Você desistiu de algum sonho que já teve? O que faria diferente agora?' } },
  { id: 289, c: 'life', w: 3, t: { en: 'Describe a moment you faced a real fork in the road. What did you choose, and why?', pt: 'Descreva um momento em que você esteve diante de uma encruzilhada de verdade. O que escolheu, e por quê?' } },
  { id: 291, c: 'life', w: 3, t: { en: 'What is something you should have said but never did? To whom?', pt: 'O que você deveria ter dito e nunca disse? Para quem?' } },

  { id: 121, c: 'world', w: 1, t: { en: 'If you could ask one long-dead person a single question, who and what?', pt: 'Se você pudesse fazer uma única pergunta a alguém que morreu há muito tempo, quem e o quê?' } },
  { id: 122, c: 'world', w: 1, t: { en: 'What do you use every day that would have looked like magic a few hundred years ago?', pt: 'O que você usa todo dia que pareceria mágica há algumas centenas de anos?' } },
  { id: 123, c: 'world', w: 1, t: { en: 'What life lessons, advice or habits have you picked up from novels?', pt: 'Que lições de vida, conselhos ou hábitos você tirou de romances?' } },
  { id: 124, c: 'world', w: 1, t: { en: 'You have been temporarily blinded by a bright light. When your vision clears, what do you see?', pt: 'Uma luz forte te cegou por um instante. Quando a visão volta, o que você vê?' } },
  { id: 125, c: 'world', w: 1, t: { en: 'What’s a question you asked as a kid that adults quietly stopped trying to answer?', pt: 'Qual pergunta você fazia quando criança e os adultos foram deixando de responder?' } },
  { id: 126, c: 'world', w: 1, t: { en: 'If you met another form of intelligent life tomorrow, what’s the first thing you’d want to ask them?', pt: 'Se você encontrasse outra forma de vida inteligente amanhã, o que perguntaria primeiro?' } },
  { id: 176, c: 'world', w: 1, t: { en: 'If you could put a chip in your head tomorrow that made you smarter, would you?', pt: 'Se você pudesse colocar um chip na cabeça amanhã que te deixasse mais inteligente, colocaria?' } },
  { id: 177, c: 'world', w: 1, t: { en: 'If something out there was watching us and deliberately not saying hello, would you want to know?', pt: 'Se algo lá fora estivesse nos observando e escolhendo não dizer oi, você iria querer saber?' } },
  { id: 242, c: 'world', w: 1, t: { en: 'If you saw an alien, what would you do?', pt: 'Se você visse um alienígena, o que faria?' } },
  { id: 253, c: 'world', w: 1, t: { en: 'How do you feel when you stare at the stars?', pt: 'Como você se sente ao olhar para as estrelas?' } },
  { id: 266, c: 'world', w: 1, t: { en: 'What time period would you like to have been born in?', pt: 'Em que época você gostaria de ter nascido?' } },
  { id: 295, c: 'world', w: 1, t: { en: 'If you could grab a coffee with any historical figure, who would that person be?', pt: 'Se você pudesse tomar um café com qualquer figura histórica, quem seria?' } },
  { id: 127, c: 'world', w: 2, t: { en: 'A hundred years from now, what about how we live will people find hard to believe?', pt: 'Daqui a cem anos, o que do nosso jeito de viver as pessoas vão achar difícil de acreditar?' } },
  { id: 128, c: 'world', w: 2, t: { en: 'What question do you not expect an answer to, but still think about?', pt: 'Qual pergunta você não espera que tenha resposta, mas ainda assim pensa nela?' } },
  { id: 129, c: 'world', w: 2, t: { en: 'If everyone on Earth could see what you are doing right now, would you do it differently?', pt: 'Se todo mundo na Terra pudesse ver o que você está fazendo agora, você faria diferente?' } },
  { id: 131, c: 'world', w: 2, t: { en: 'If you could leave one lasting positive change in the world, what would it be?', pt: 'Se você pudesse deixar uma mudança positiva duradoura no mundo, qual seria?' } },
  { id: 132, c: 'world', w: 2, t: { en: 'What is a view about the world that has changed for you as you have got older?', pt: 'Qual visão sobre o mundo mudou em você com o passar dos anos?' } },
  { id: 133, c: 'world', w: 2, t: { en: 'If we found out tomorrow we’re completely alone in the universe, would your life feel bigger or smaller?', pt: 'Se amanhã descobríssemos que estamos completamente sozinhos no universo, a sua vida pareceria maior ou menor?' } },
  { id: 134, c: 'world', w: 2, t: { en: 'We know more facts than any generation in history. Do we understand more, or just more things?', pt: 'Sabemos mais fatos que qualquer geração da história. Entendemos mais, ou só sabemos mais coisas?' } },
  { id: 135, c: 'world', w: 2, t: { en: 'Everything you’ll ever see or touch is a tiny sliver of what exists. Is that a limitation or a relief?', pt: 'Tudo que você vai ver ou tocar é uma fatia mínima do que existe. Isso é uma limitação ou um alívio?' } },
  { id: 171, c: 'world', w: 2, t: { en: 'If you could live for five hundred years, would you take it? Why?', pt: 'Se você pudesse viver quinhentos anos, aceitaria? Por quê?' } },
  { id: 172, c: 'world', w: 2, t: { en: 'Name a job that existed when your grandparents were young and doesn’t now. What replaced it? What’s next on that list?', pt: 'Cite uma profissão que existia quando seus avós eram jovens e não existe mais. O que a substituiu?' } },
  { id: 174, c: 'world', w: 2, t: { en: 'What’s one habit you’ve changed in the last year because of technology, without ever deciding to?', pt: 'Qual hábito você mudou no último ano por causa da tecnologia, sem nunca ter decidido isso?' } },
  { id: 175, c: 'world', w: 2, t: { en: 'Who are you definitely not?', pt: 'Quem você definitivamente não é?' } },
  { id: 178, c: 'world', w: 2, t: { en: 'A machine can give you a perfect life you’d never know was fake. Do you plug in?', pt: 'Uma máquina pode te dar uma vida perfeita que você nunca saberia ser falsa. Você se conecta?' } },
  { id: 179, c: 'world', w: 2, t: { en: 'Does a person need one purpose, or is that just a story we like?', pt: 'Uma pessoa precisa de um propósito só, ou isso é apenas uma história de que gostamos?' } },
  { id: 180, c: 'world', w: 2, t: { en: 'The sky is full of stars and completely silent. What do you think that silence means?', pt: 'O céu está cheio de estrelas e completamente silencioso. O que você acha que esse silêncio significa?' } },
  { id: 181, c: 'world', w: 2, t: { en: 'If nobody ever paid you again, how would you decide what to do with your days?', pt: 'Se ninguém nunca mais te pagasse, como você decidiria o que fazer com os seus dias?' } },
  { id: 182, c: 'world', w: 2, t: { en: 'What would a machine have to do before you’d feel bad about switching it off?', pt: 'O que uma máquina teria que fazer para você se sentir mal ao desligá-la?' } },
  { id: 183, c: 'world', w: 2, t: { en: 'Almost nobody in history got to ask what to do with their life. Is that a gift or a burden?', pt: 'Quase ninguém na história pôde perguntar o que fazer com a própria vida. Isso é um presente ou um peso?' } },
  { id: 186, c: 'world', w: 2, t: { en: 'Money only works because everyone agrees to pretend it does. What else are we all agreeing to pretend?', pt: 'O dinheiro só funciona porque todos concordam em fingir que sim. O que mais estamos fingindo juntos?' } },
  { id: 210, c: 'world', w: 2, t: { en: 'Is the purpose of knowledge to find the truth or to gain power?', pt: 'O propósito do conhecimento é encontrar a verdade ou obter poder?' } },
  { id: 213, c: 'world', w: 2, t: { en: 'Is true freedom found in having more choices or in having fewer desires?', pt: 'A liberdade verdadeira está em ter mais escolhas ou em ter menos desejos?' } },
  { id: 214, c: 'world', w: 2, t: { en: 'Does the world become better through technological progress or through human connection?', pt: 'O mundo melhora pelo progresso tecnológico ou pela conexão humana?' } },
  { id: 216, c: 'world', w: 2, t: { en: 'Should animals be used for medical research?', pt: 'Animais deveriam ser usados em pesquisa médica?' } },
  { id: 223, c: 'world', w: 2, t: { en: 'How would you change the world to make it better?', pt: 'Como você mudaria o mundo para melhorá-lo?' } },
  { id: 230, c: 'world', w: 2, t: { en: 'What do you think courage means?', pt: 'O que você acha que é coragem?' } },
  { id: 231, c: 'world', w: 2, t: { en: 'What do you think the world will be like when the youngest person you know is grown up?', pt: 'Como você acha que o mundo vai estar quando a pessoa mais nova que você conhece crescer?' } },
  { id: 233, c: 'world', w: 2, t: { en: 'If you owned a store, what would you do to discourage people from stealing from you?', pt: 'Se você tivesse uma loja, o que faria para desencorajar furtos?' } },
  { id: 234, c: 'world', w: 2, t: { en: 'If there were no rules, what do you think would happen?', pt: 'Se não houvesse regras, o que você acha que aconteceria?' } },
  { id: 246, c: 'world', w: 2, t: { en: 'How would you go about saving the world, and what do those words mean to you?', pt: 'Como você salvaria o mundo, e o que essas palavras significam para você?' } },
  { id: 248, c: 'world', w: 2, t: { en: 'Can you buy happiness?', pt: 'Dá para comprar felicidade?' } },
  { id: 272, c: 'world', w: 2, t: { en: 'If you suddenly woke up and realised all of this was a simulation, what would your reaction be?', pt: 'Se você acordasse de repente e percebesse que tudo isto é uma simulação, qual seria a sua reação?' } },
  { id: 273, c: 'world', w: 2, t: { en: 'If you suddenly woke up and realised all of this was a simulation, who would you look for first in the real world?', pt: 'Se tudo isto fosse uma simulação e você acordasse agora, quem procuraria primeiro no mundo real?' } },
  { id: 293, c: 'world', w: 2, t: { en: 'What do you think is beautiful about life?', pt: 'O que você acha bonito na vida?' } },
  { id: 294, c: 'world', w: 2, t: { en: 'What impresses you the most about modern society?', pt: 'O que mais te impressiona na sociedade moderna?' } },
  { id: 136, c: 'world', w: 3, t: { en: 'What story about humanity do your daily actions tell?', pt: 'Que história sobre a humanidade as suas ações diárias contam?' } },
  { id: 137, c: 'world', w: 3, t: { en: 'What about being human would be hardest to explain to something that had never felt it?', pt: 'O que em ser humano seria mais difícil de explicar a algo que nunca sentiu isso?' } },
  { id: 138, c: 'world', w: 3, t: { en: 'If humanity disappeared tomorrow, what one thing we made should survive us?', pt: 'Se a humanidade desaparecesse amanhã, que única coisa que criamos deveria sobreviver a nós?' } },
  { id: 139, c: 'world', w: 3, t: { en: 'What is the most ordinary thing about being alive that is actually strange?', pt: 'Qual é a coisa mais comum de estar vivo que, no fundo, é estranha?' } },
  { id: 140, c: 'world', w: 3, t: { en: 'What do you take for a universal truth that is really just a norm of your own culture?', pt: 'O que você toma por verdade universal e é só uma norma da sua própria cultura?' } },
  { id: 141, c: 'world', w: 3, t: { en: 'Why do you think we are here?', pt: 'Por que você acha que estamos aqui?' } },
  { id: 142, c: 'world', w: 3, t: { en: 'Do you have more free will than the universe does?', pt: 'Você tem mais livre-arbítrio do que o universo?' } },
  { id: 145, c: 'world', w: 3, t: { en: 'If this really is your only shot at existing, is it going the way you’d want a story to go?', pt: 'Se esta é mesmo a sua única chance de existir, ela está indo como você gostaria que uma história fosse?' } },
  { id: 146, c: 'world', w: 3, t: { en: 'Would you trade the freedom to choose your life for the certainty of just surviving it?', pt: 'Você trocaria a liberdade de escolher a sua vida pela certeza de apenas sobreviver a ela?' } },
  { id: 184, c: 'world', w: 3, t: { en: 'Replace every plank of a boat, one at a time, and it’s still called the same boat. Are you still the same person you were at ten?', pt: 'Troque cada tábua de um barco, uma por uma, e ele continua o mesmo barco. Você ainda é a mesma pessoa que era aos dez anos?' } },
  { id: 185, c: 'world', w: 3, t: { en: 'If the universe has no meaning of its own, does the meaning you make still count?', pt: 'Se o universo não tem sentido próprio, o sentido que você cria ainda vale?' } },
  { id: 187, c: 'world', w: 3, t: { en: 'Would you accept your life exactly as it went — or is there one thing you’d refuse to make peace with?', pt: 'Você aceitaria a sua vida exatamente como ela foi — ou há algo com que você se recusaria a fazer as pazes?' } },
  { id: 188, c: 'world', w: 3, t: { en: 'What’s something about being alive that feels wonderful and unbearable at the same time?', pt: 'O que em estar vivo é maravilhoso e insuportável ao mesmo tempo?' } },
  { id: 189, c: 'world', w: 3, t: { en: 'Has anything ever made your own death feel real, rather than just an idea?', pt: 'Alguma coisa já fez a sua própria morte parecer real, e não apenas uma ideia?' } },
  { id: 208, c: 'world', w: 3, t: { en: 'Does a person’s value come from what they produce or simply from their existence?', pt: 'O valor de uma pessoa vem do que ela produz ou simplesmente de ela existir?' } },
  { id: 209, c: 'world', w: 3, t: { en: 'Can love truly exist if the physical presence of the other person is gone?', pt: 'O amor pode existir de verdade quando a presença física da outra pessoa se foi?' } },
  { id: 211, c: 'world', w: 3, t: { en: 'How much of what we call “reality” is just a story we’ve agreed to believe?', pt: 'Quanto daquilo que chamamos de realidade é só uma história que concordamos em acreditar?' } },
  { id: 212, c: 'world', w: 3, t: { en: 'If suffering is inevitable, what is the one thing that makes it worth enduring?', pt: 'Se o sofrimento é inevitável, o que faz valer a pena suportá-lo?' } },
  { id: 215, c: 'world', w: 3, t: { en: 'What would happen to society if everyone suddenly felt they already had enough?', pt: 'O que aconteceria com a sociedade se todos de repente sentissem que já têm o suficiente?' } },
  { id: 270, c: 'world', w: 3, t: { en: 'Why do you think wars exist in the world?', pt: 'Por que você acha que existem guerras no mundo?' } },
  { id: 292, c: 'world', w: 3, t: { en: 'How do you see God? Has this changed over time?', pt: 'Como você vê Deus? Isso mudou com o tempo?' } },
];

export const WEIGHTS: { id: Weight | null; label: Localized }[] = [
  { id: null, label: { en: 'Any', pt: 'Qualquer' } },
  { id: 1, label: { en: 'Light', pt: 'Leve' } },
  { id: 2, label: { en: 'Medium', pt: 'Médio' } },
  { id: 3, label: { en: 'Heavy', pt: 'Pesado' } },
];

export const WEIGHT_NAME: Record<Weight, Localized> = {
  1: { en: 'Light', pt: 'Leve' },
  2: { en: 'Medium', pt: 'Médio' },
  3: { en: 'Heavy', pt: 'Pesado' },
};

// Every level explains itself when tapped. Light and Heavy always did; the
// middle one fell through to the unfiltered line, so choosing it looked like
// nothing had happened.
export const WEIGHT_NOTE: Record<Weight, Localized> = {
  1: {
    en: 'A gentler set. Nothing here will ambush you — answer it however you like, and take your time.',
    pt: 'Um conjunto mais gentil. Nada aqui vai te pegar de surpresa — responda como quiser, sem pressa.',
  },
  2: {
    en: 'Enough to make you stop and think properly, without following you around for the rest of the day.',
    pt: 'O bastante para você parar e pensar de verdade, sem te acompanhar pelo resto do dia.',
  },
  3: {
    en: 'The ones that take a while to put down. Answer however you like, and take your time.',
    pt: 'As que demoram para largar. Responda como quiser, sem pressa.',
  },
};
export const WEIGHT_ANY_NOTE: Localized = {
  en: 'Filter, give it a shake, then answer however you want — pen and paper, out loud, or just in your head. Take your time.',
  pt: 'Filtre, chacoalhe e responda do jeito que quiser — no papel, em voz alta ou só na sua cabeça. Sem pressa.',
};

// Welcome body copy — swap the index to change the whole screen.
export const WELCOME_ALTS = [
  'Everything else on your phone is built to keep you moving. This is built to stop you, for about a minute.',
  'The tube, the kettle boiling, a spare minute — most of it disappears without a thought. Lua asks you to spend just one of those minutes actually thinking, about something real. No account, no journal, nothing stored.',
  'The world isn’t going to slow down for you, so slow down on purpose. One real question, once a day, and a minute to sit with it. No account, no journal, nothing stored.',
  'Long before apps, people carried a single question around for a day and let it do its work. That is all this is. No account, no journal, nothing stored.',
  'You probably know less about yourself than you think — most of us are too busy to check. One question a day, one minute of actually thinking. No account, no journal, nothing stored.',
];
export const WELCOME_COPY = WELCOME_ALTS[0];

// The dedicated first-ever-open pool. A newcomer is told what to do with the
// object in front of them; every other line assumes they already know.
export const IDLE_FIRST: Record<Lang, string[]> = {
  en: [
    'Shake your phone or tap the Moon to start',
    'Shake to look inside.',
    'Give it a shake.',
    'There’s something in here for you.',
    'Give the moon a shake',
    'Tap the moon to start',
    'Tap the moon and get out of your comfort zone',
  ],
  pt: [
    'Chacoalhe o celular ou toque na Lua para começar',
    'Chacoalhe para ver o que tem dentro.',
    'Chacoalhe seu celular',
    'Tem algo aqui dentro para você.',
    'Chacoalhe a lua',
    'Toque na lua para começar',
    'Toque na lua e saia da sua zona de conforto',
  ],
};
// The line below the moon. Shorter nudge above, longer thought below — both
// present on every open.
export const IDLE_TIPS: Record<Lang, string[]> = {
  en: [
    'Journaling is said to help untangle thoughts you didn’t know you were carrying.',
    'People have kept some version of this ritual for thousands of years, long before notebooks existed.',
    'Ready to know a little more about yourself?',
    'Some of the clearest thinking happens in the sixty seconds before you write anything down.',
    'Writing about your day for even a few minutes is said to make it feel a little lighter.',
    'You don’t need the right words. Just one honest one.',
    'The hardest part is usually just starting. You’re already here.',
    'Small moments of reflection add up more than big ones you never get around to.',
    'This isn’t therapy. It’s a minute of actually listening to yourself.',
    'Curious what today’s question will bring up?',
    'Nobody’s watching. Not even us.',
    'Sometimes the most interesting person to learn about is the one you already are.',
    'Some people write pages. Some just sit with it for a second. Both count.',
    'What would you tell a stranger about today, if they actually asked?',
  ],
  pt: [
    'Dizem que escrever ajuda a desembaraçar pensamentos que você nem sabia que carregava.',
    'As pessoas mantêm alguma versão desse ritual há milhares de anos, muito antes de existir caderno.',
    'Quer saber um pouco mais sobre você?',
    'Boa parte do pensamento mais claro acontece nos sessenta segundos antes de você escrever qualquer coisa.',
    'Dizem que escrever sobre o seu dia, mesmo que por poucos minutos, deixa ele um pouco mais leve.',
    'Você não precisa das palavras certas. Só de uma palavra honesta.',
    'A parte mais difícil costuma ser começar. Você já está aqui.',
    'Pequenos momentos de reflexão somam mais do que os grandes que nunca acontecem.',
    'Isto não é terapia. É um minuto de realmente se escutar.',
    'Quer ver o que a pergunta de hoje traz?',
    'Ninguém está olhando. Nem a gente.',
    'Às vezes a pessoa mais interessante de conhecer é a que você já é.',
    'Tem gente que escreve páginas. Tem gente que só fica um segundo com a pergunta. Os dois valem.',
    'O que você contaria para um estranho sobre hoje, se ele perguntasse de verdade?',
  ],
};

// Shown while the object is settling, in place of the one line that used to
// carry that whole beat.
// Shown on every write tap after the first, one at a time. They all argue the
// same thing from a different side — that the absence of a text box is the
// point — because the modal has to earn being in the way more than once.
export const WRITE_TIPS: Record<Lang, readonly string[]> = {
  en: [
    'Paper slows you down enough to actually think.',
    'No autocorrect, no undo — just what you actually meant.',
    'A blank page is more private than any app.',
    'Some of the best thinking happens with a pen in hand.',
  ],
  pt: [
    'O papel te desacelera o suficiente para pensar de verdade.',
    'Sem corretor, sem desfazer — só o que você quis dizer mesmo.',
    'Uma página em branco é mais privada que qualquer app.',
    'Boa parte do melhor pensamento acontece com uma caneta na mão.',
  ],
} as const;

export const SETTLING: Record<Lang, string[]> = {
  en: [
    'Let it settle',
    'Almost.',
    'Still finding it.',
    'One second more.',
    'Nearly there.',
  ],
  pt: [
    'Quase lá.',
    'Ainda procurando.',
    'Mais um segundo.',
  ],
};

export const IDLE_RETURN: Record<Lang, string[]> = {
  en: [
    'One question, whenever you’re ready.',
    'Welcome back. Shake for today’s question.',
    'Pause for a second. Then shake.',
    'Go on, give it a shake.',
    'A quiet moment, whenever you want one.',
    'Ready when you are.',
    'Something’s waiting inside.',
    'Take a breath. Then shake.',
  ],
  pt: [
    'Apenas uma pergunta. Quando você quiser.',
    'Que bom te ver! Chacoalhe para a pergunta de hoje.',
    'Pare por um momento. Depois chacoalhe.',
    'Vai, dá uma chacoalhada.',
    'Um momento de silêncio, quando você quiser.',
    'Estamos prontos?',
    'Tem algo esperando aí dentro.',
    'Respire fundo. Depois chacoalhe.',
  ],
};

export const LANDING_URL = 'https://luadaily.com';

/** The page built for one question — see scripts/generate-share-pages.mjs. */
export const shareUrl = (id: number, lang: Lang) =>
  lang === 'pt' ? `${LANDING_URL}/q/pt/${id}` : `${LANDING_URL}/q/${id}`;

export function promptIndexById(id: number): number {
  return PROMPTS.findIndex(p => p.id === id);
}

/** The moon is passed in rather than worked out here: this file is the library, and the sender's streak is not part of it. */
export const shareText = (prompt: Prompt, lang: Lang, moon = '🌙') =>
  lang === 'pt'
    ? `A Lua me perguntou: “${prompt.t.pt}” — pensei em você ${moon}\n${shareUrl(prompt.id, lang)}`
    : `Lua asked me: “${prompt.t.en}” — thought of you ${moon}\n${shareUrl(prompt.id, lang)}`;
