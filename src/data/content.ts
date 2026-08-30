// Ported verbatim from the Lua design prototype (project/Lua.dc.html <script>).

export type CategoryId = 'you' | 'life' | 'world';
export type Weight = 1 | 2 | 3; // 1 light · 2 firm · 3 heavy — weight, never duration

export interface Category {
  id: CategoryId;
  label: string;
  desc: string;
}

export const CATS: Category[] = [
  { id: 'you', label: 'Self', desc: 'Who you are, right now: your feelings, your character, the day you just lived.' },
  { id: 'life', label: 'Life', desc: 'What you do with your time: work, direction, relationships, how you spend the years.' },
  { id: 'world', label: 'World', desc: 'Bigger than you: curiosity, the existential, the questions without an obvious answer.' },
];

export interface Prompt {
  c: CategoryId;
  w: Weight;
  t: string;
}

export const PROMPTS: Prompt[] = [
  { c: 'you', w: 1, t: 'What can I do?' },
  { c: 'you', w: 1, t: 'What is this teaching me?' },
  { c: 'you', w: 1, t: 'What is your body asking for right now?' },
  { c: 'you', w: 1, t: 'Instead of asking someone what they do, ask what they love to do. Ask yourself that too.' },
  { c: 'you', w: 1, t: 'Are you satisfied with how you spent your attention today?' },
  { c: 'you', w: 2, t: 'If the version of you from five years ago could see your life today, what would surprise them most?' },
  { c: 'you', w: 2, t: 'What is the last piece of feedback you resisted?' },
  { c: 'you', w: 2, t: 'What have you avoided because doing it would make you look foolish while you are still learning?' },
  { c: 'you', w: 2, t: 'When feedback comes in, do you welcome it or fight it?' },
  { c: 'you', w: 2, t: 'What are you doing purely for yourself, and not for how it looks?' },
  { c: 'you', w: 3, t: 'What story about yourself would you have to retire in order to grow?' },
  { c: 'you', w: 3, t: 'Where are you self-sabotaging with a behaviour nobody else imposed on you?' },
  { c: 'you', w: 3, t: 'What are you still carrying that was never yours?' },
  { c: 'you', w: 3, t: 'Where are you avoiding disappointing someone else at the cost of disappointing yourself?' },
  { c: 'you', w: 3, t: 'What do you think people say about you when you are not in the room?' },

  { c: 'life', w: 1, t: 'What can you do today to feel like you are growing?' },
  { c: 'life', w: 1, t: 'What can you eliminate this week to free up attention?' },
  { c: 'life', w: 2, t: 'Are you building, or maintaining?' },
  { c: 'life', w: 2, t: 'If your family inherited only your habits, which would be the richest gift?' },
  { c: 'life', w: 2, t: 'Are you playing a game worth losing?' },
  { c: 'life', w: 2, t: 'What needs to happen for you to look back in December and call this year a success?' },
  { c: 'life', w: 2, t: 'You may want the result. Do you want the lifestyle?' },
  { c: 'life', w: 2, t: 'Are your goals big enough, or have you shrunk them to something safely achievable?' },
  { c: 'life', w: 2, t: 'Is this a problem to solve, or a tension to live with?' },
  { c: 'life', w: 2, t: 'What have you known for a while you should let go of, and still haven’t?' },
  { c: 'life', w: 2, t: 'Who removes uncertainty for you just by being reliable? Are you that person for someone?' },
  { c: 'life', w: 2, t: 'Whose presence has quietly made your life better, and have you told them?' },
  { c: 'life', w: 2, t: 'Who in your life is an energy catalyst, and who is an energy vampire?' },
  { c: 'life', w: 2, t: 'Are you impatient with results, or impatient with effort?' },
  { c: 'life', w: 2, t: 'Are you hungry for excellence, or just for success?' },
  { c: 'life', w: 3, t: 'If you met your eighty-year-old self today, what would they beg you to stop postponing?' },

  { c: 'world', w: 1, t: 'If you could ask one long-dead person a single question, who and what?' },
  { c: 'world', w: 1, t: 'What do you use every day that would have looked like magic a few hundred years ago?' },
  { c: 'world', w: 1, t: 'When did you last think about where your food actually came from?' },
  { c: 'world', w: 2, t: 'Seen from space, what are you stressed about that would suddenly look small?' },
  { c: 'world', w: 2, t: 'A hundred years from now, what about how we live will people find hard to believe?' },
  { c: 'world', w: 2, t: 'What question do you not expect an answer to, but still think about?' },
  { c: 'world', w: 2, t: 'If everyone on Earth could see what you are doing right now, would you do it differently?' },
  { c: 'world', w: 3, t: 'What story about humanity do your daily actions tell?' },
  { c: 'world', w: 3, t: 'What about being human would be hardest to explain to something that had never felt it?' },
  { c: 'world', w: 3, t: 'If humanity disappeared tomorrow, what one thing we made should survive us?' },
  { c: 'world', w: 3, t: 'What is the most ordinary thing about being alive that is actually strange?' },
];

export const WEIGHTS: { id: Weight | null; label: string }[] = [
  { id: null, label: 'Any' },
  { id: 1, label: 'Light' },
  { id: 2, label: 'Firm' },
  { id: 3, label: 'Heavy' },
];

export const WEIGHT_NAME: Record<Weight, string> = { 1: 'Light', 2: 'Firm', 3: 'Heavy' };

// Welcome body copy — swap the index to change the whole screen.
export const WELCOME_ALTS = [
  'Everything else on your phone is built to keep you moving. This is built to stop you, for about a minute.',
  'The tube, the kettle boiling, a spare minute — most of it disappears without a thought. Lua asks you to spend just one of those minutes actually thinking, about something real. No account, no journal, nothing stored.',
  'The world isn’t going to slow down for you, so slow down on purpose. One real question, once a day, and a minute to sit with it. No account, no journal, nothing stored.',
  'Long before apps, people carried a single question around for a day and let it do its work. That is all this is. No account, no journal, nothing stored.',
  'You probably know less about yourself than you think — most of us are too busy to check. One question a day, one minute of actually thinking. No account, no journal, nothing stored.',
];
export const WELCOME_COPY = WELCOME_ALTS[0];

export const IDLE_FIRST = [
  'Shake to look inside.',
  'Give it a shake.',
  'There’s something in here for you.',
];
export const IDLE_RETURN = [
  'One question, whenever you’re ready.',
  'Welcome back. Shake for today’s question.',
  'Pause for a second. Then shake.',
  'Go on, give it a shake.',
  'A quiet moment, whenever you want one.',
  'Ready when you are.',
  'Something’s waiting inside.',
  'Take a breath. Then shake.',
  'Back again? Let’s see what’s inside today.',
  'No rush. Shake whenever.',
  'Give the moon a shake.',
  'Whenever you’re ready — no rush.',
];

// placeholder — swap for the real landing page
export const LANDING_URL = 'https://lua.app';
export const shareText = (prompt: string) =>
  `Lua asked me: “${prompt}” — thought of you 🌙\n${LANDING_URL}`;
