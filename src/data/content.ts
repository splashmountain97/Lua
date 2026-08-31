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
  /**
   * Stable identity, used in share links. Assigned once and never reused or
   * renumbered — a link shared today has to still resolve to the same question
   * after the library is edited, and array position does not survive that.
   * New questions take the next number above the current highest.
   */
  id: number;
  c: CategoryId;
  w: Weight;
  t: string;
}

export const PROMPTS: Prompt[] = [
  { id: 1, c: 'you', w: 1, t: 'What can I do?' },
  { id: 2, c: 'you', w: 1, t: 'What is your body asking for right now?' },
  { id: 3, c: 'you', w: 1, t: 'Are you satisfied with how you spent your attention today?' },
  { id: 4, c: 'you', w: 1, t: 'What is one thing you are grateful for?' },
  { id: 5, c: 'you', w: 1, t: 'What is one thing you are excited about?' },
  { id: 6, c: 'you', w: 1, t: 'What is one virtue you want to exhibit today?' },
  { id: 7, c: 'you', w: 1, t: 'What have other people done lately, in small ways, that made your day?' },
  { id: 8, c: 'you', w: 1, t: 'Which of your abilities brings you the most joy when you use it?' },
  { id: 9, c: 'you', w: 1, t: 'What in the last two weeks has energised you, and what has drained you?' },
  { id: 10, c: 'you', w: 1, t: 'What pet peeves do you have, and do you know why they get to you?' },
  { id: 11, c: 'you', w: 1, t: 'Which quotes or pieces of advice have stayed with you, and why those?' },
  { id: 12, c: 'you', w: 1, t: 'Which songs carry the most vivid memories for you?' },
  { id: 13, c: 'you', w: 1, t: 'Why do you dress the way that you do?' },
  { id: 14, c: 'you', w: 1, t: 'What is one topic you are fascinated enough by to teach a class about?' },
  { id: 15, c: 'you', w: 1, t: 'Out of ten, where is your physical health right now?' },
  { id: 16, c: 'you', w: 2, t: 'If the version of you from five years ago could see your life today, what would surprise them most?' },
  { id: 17, c: 'you', w: 2, t: 'What is the last piece of feedback you resisted?' },
  { id: 18, c: 'you', w: 2, t: 'What have you avoided because doing it would make you look foolish while you are still learning?' },
  { id: 19, c: 'you', w: 2, t: 'When feedback comes in, do you welcome it or fight it?' },
  { id: 20, c: 'you', w: 2, t: 'What are you doing purely for yourself, and not for how it looks?' },
  { id: 21, c: 'you', w: 2, t: 'What are you avoiding?' },
  { id: 22, c: 'you', w: 2, t: 'Where are you feeling dissatisfied?' },
  { id: 23, c: 'you', w: 2, t: 'How do the opinions of others affect you?' },
  { id: 24, c: 'you', w: 2, t: 'How do you feel about asking for help?' },
  { id: 25, c: 'you', w: 2, t: 'What annoys you about other people that you sometimes do yourself?' },
  { id: 26, c: 'you', w: 2, t: 'Who has the right answer, and you ignore them because they communicate badly?' },
  { id: 27, c: 'you', w: 2, t: 'Whose substance is thin, and you listen anyway because they communicate well?' },
  { id: 28, c: 'you', w: 2, t: 'What frustrates you, and which of your values explains why it bothers you so much?' },
  { id: 29, c: 'you', w: 2, t: 'What do you need to give yourself more credit for?' },
  { id: 30, c: 'you', w: 2, t: 'What does ready feel like to you? How did you know you were ready for a major step you have taken?' },
  { id: 31, c: 'you', w: 2, t: 'What happens when you are angry?' },
  { id: 32, c: 'you', w: 2, t: 'What is a reminder you would like to give yourself the next time you are in a downward spiral?' },
  { id: 33, c: 'you', w: 2, t: 'What is something you grew out of that meant a great deal to you at the time?' },
  { id: 34, c: 'you', w: 2, t: 'What made you feel most alive when you were young?' },
  { id: 35, c: 'you', w: 2, t: 'When did you last have to hold your tongue, and what would you have said?' },
  { id: 36, c: 'you', w: 2, t: 'Who is somebody you miss, and why?' },
  { id: 37, c: 'you', w: 2, t: 'What was a mistake that taught you something about yourself?' },
  { id: 38, c: 'you', w: 2, t: 'Which aspect of your own personality do you appreciate when you see it in other people?' },
  { id: 39, c: 'you', w: 2, t: 'In a room holding everyone you have ever met, who do you look for first?' },
  { id: 40, c: 'you', w: 2, t: 'When you wake up, do you expect the day to hold more joys or more frustrations?' },
  { id: 41, c: 'you', w: 2, t: 'If you could live one moment again, which would it be?' },
  { id: 42, c: 'you', w: 2, t: 'When did you last change your mind?' },
  { id: 43, c: 'you', w: 2, t: 'Out of ten, where is your mental health right now?' },
  { id: 44, c: 'you', w: 3, t: 'What story about yourself would you have to retire in order to grow?' },
  { id: 45, c: 'you', w: 3, t: 'Where are you self-sabotaging with a behaviour nobody else imposed on you?' },
  { id: 46, c: 'you', w: 3, t: 'What are you still carrying that was never yours?' },
  { id: 47, c: 'you', w: 3, t: 'Where are you avoiding disappointing someone else at the cost of disappointing yourself?' },
  { id: 48, c: 'you', w: 3, t: 'What do you think people say about you when you are not in the room?' },
  { id: 49, c: 'you', w: 3, t: 'In what ways are you holding yourself back?' },
  { id: 50, c: 'you', w: 3, t: 'Whose life do you admire that is secretly miserable?' },
  { id: 51, c: 'you', w: 3, t: 'What do you believe only because believing it keeps you in good standing with your people?' },
  { id: 52, c: 'you', w: 3, t: 'Which of your values would be different if you had been raised by different parents?' },
  { id: 53, c: 'you', w: 3, t: 'What do you believe most strongly on the least evidence?' },
  { id: 54, c: 'you', w: 3, t: 'Think about the last time you cried. If those tears could talk, what would they say?' },
  { id: 55, c: 'you', w: 3, t: 'What is a made-up rule you apply to your own life, and what has it cost you?' },
  { id: 56, c: 'you', w: 3, t: 'What is a question you are afraid to know the answer to?' },
  { id: 57, c: 'you', w: 3, t: 'What do you have a hard time being honest about, even with the people you trust most?' },
  { id: 58, c: 'you', w: 3, t: 'Which sensations or experiences do you arrange your life to avoid?' },
  { id: 59, c: 'you', w: 3, t: 'Which emotions in other people are hardest for you to be around?' },
  { id: 60, c: 'you', w: 3, t: 'When things go well for others, do you enjoy cheering them on, or does their success sting?' },
  { id: 61, c: 'you', w: 3, t: 'When things go wrong, do you treat it as yours to improve, or do you look for who is at fault?' },

  { id: 62, c: 'life', w: 1, t: 'What can you do today to feel like you are growing?' },
  { id: 63, c: 'life', w: 1, t: 'What can you eliminate this week to free up attention?' },
  { id: 64, c: 'life', w: 1, t: 'What is the one thing you need to do?' },
  { id: 65, c: 'life', w: 1, t: 'How did you bond with one of the best friends you have ever had?' },
  { id: 66, c: 'life', w: 1, t: 'What could you spend a little more money on to make life smoother?' },
  { id: 67, c: 'life', w: 1, t: 'What do you wish you could do more quickly? What do you wish you could do more slowly?' },
  { id: 68, c: 'life', w: 1, t: 'What is a positive habit you would like to cultivate, and how could you start?' },
  { id: 69, c: 'life', w: 1, t: 'Which part of your work do you most enjoy, and which part least?' },
  { id: 70, c: 'life', w: 1, t: 'What would you do if you could stop time for two months?' },
  { id: 71, c: 'life', w: 1, t: 'Who has been your greatest teacher?' },
  { id: 72, c: 'life', w: 1, t: 'Where is your dream destination?' },
  { id: 73, c: 'life', w: 1, t: 'Are you getting a little better today?' },
  { id: 74, c: 'life', w: 1, t: 'Out of ten, where are your friendships right now?' },
  { id: 75, c: 'life', w: 1, t: 'Out of ten, where is your learning right now?' },
  { id: 76, c: 'life', w: 1, t: 'Out of ten, where are your experiences right now?' },
  { id: 77, c: 'life', w: 2, t: 'Are you building, or maintaining?' },
  { id: 78, c: 'life', w: 2, t: 'If your family inherited only your habits, which would be the richest gift?' },
  { id: 79, c: 'life', w: 2, t: 'Are you playing a game worth losing?' },
  { id: 80, c: 'life', w: 2, t: 'What needs to happen for you to look back in December and call this year a success?' },
  { id: 81, c: 'life', w: 2, t: 'You may want the result. Do you want the lifestyle?' },
  { id: 82, c: 'life', w: 2, t: 'Are your goals big enough, or have you shrunk them to something safely achievable?' },
  { id: 83, c: 'life', w: 2, t: 'Is this a problem to solve, or a tension to live with?' },
  { id: 84, c: 'life', w: 2, t: 'What have you known for a while you should let go of, and still haven’t?' },
  { id: 85, c: 'life', w: 2, t: 'Who removes uncertainty for you just by being reliable? Are you that person for someone?' },
  { id: 86, c: 'life', w: 2, t: 'Whose presence has quietly made your life better, and have you told them?' },
  { id: 87, c: 'life', w: 2, t: 'Who in your life is an energy catalyst, and who is an energy vampire?' },
  { id: 88, c: 'life', w: 2, t: 'Are you impatient with results, or impatient with effort?' },
  { id: 89, c: 'life', w: 2, t: 'Are you hungry for excellence, or just for success?' },
  { id: 90, c: 'life', w: 2, t: 'What is the goal, and what is the bottleneck?' },
  { id: 91, c: 'life', w: 2, t: 'Which goal would have the greatest impact on your life?' },
  { id: 92, c: 'life', w: 2, t: 'Do you work for your business, or does it work for you?' },
  { id: 93, c: 'life', w: 2, t: 'What would you do if money were no object?' },
  { id: 94, c: 'life', w: 2, t: 'How would you use your talents and skills to serve others?' },
  { id: 95, c: 'life', w: 2, t: 'If you had unlimited time, money and courage, what would you want to experience, achieve, create or contribute to?' },
  { id: 96, c: 'life', w: 2, t: 'What is the biggest bottleneck to your next goal?' },
  { id: 97, c: 'life', w: 2, t: 'Are you taking enough risks? Would you like to change your relationship to risk?' },
  { id: 98, c: 'life', w: 2, t: 'What could you do to make your life more meaningful?' },
  { id: 99, c: 'life', w: 2, t: 'What did you learn from your last relationship, or from one you have watched closely?' },
  { id: 100, c: 'life', w: 2, t: 'What is a boundary you need to draw?' },
  { id: 101, c: 'life', w: 2, t: 'What is holding you back from being productive at the moment, and what can you do about it?' },
  { id: 102, c: 'life', w: 2, t: 'What was a seemingly inconsequential decision that changed the shape of your life?' },
  { id: 103, c: 'life', w: 2, t: 'Who is the most difficult person in your life, and why?' },
  { id: 104, c: 'life', w: 2, t: 'When an opportunity appears, do you lean towards action or towards postponing the decision?' },
  { id: 105, c: 'life', w: 2, t: 'Better waves make better surfers. Are you on the right beach?' },
  { id: 106, c: 'life', w: 2, t: 'What kinds of accomplishment feel most worthwhile to you?' },
  { id: 107, c: 'life', w: 2, t: 'What is your definition of success in friendship?' },
  { id: 108, c: 'life', w: 2, t: 'What in your profession is impossible to know, however good you get?' },
  { id: 109, c: 'life', w: 2, t: 'Out of ten, where is your family life right now?' },
  { id: 110, c: 'life', w: 2, t: 'Out of ten, where is your romantic life right now?' },
  { id: 111, c: 'life', w: 2, t: 'Out of ten, where is your career right now?' },
  { id: 112, c: 'life', w: 2, t: 'Out of ten, where are your finances right now?' },
  { id: 113, c: 'life', w: 3, t: 'If you met your eighty-year-old self today, what would they beg you to stop postponing?' },
  { id: 114, c: 'life', w: 3, t: 'If you knew you had two years left, how would you spend them?' },
  { id: 115, c: 'life', w: 3, t: 'What would you like people to say at your funeral?' },
  { id: 116, c: 'life', w: 3, t: 'Imagine you have lived to a hundred in good health, and you are watching your own funeral from above. What would you want people to say about how you lived?' },
  { id: 117, c: 'life', w: 3, t: 'If you repeated this week for ten years, where would it lead, and is that where you want to be?' },
  { id: 118, c: 'life', w: 3, t: 'If you never do the thing that scares you, what does your life look like in six months, a year, three years?' },
  { id: 119, c: 'life', w: 3, t: 'How much do your current goals reflect what you want, and how much what someone else wants?' },
  { id: 120, c: 'life', w: 3, t: 'What is your definition of success in life?' },

  { id: 121, c: 'world', w: 1, t: 'If you could ask one long-dead person a single question, who and what?' },
  { id: 122, c: 'world', w: 1, t: 'What do you use every day that would have looked like magic a few hundred years ago?' },
  { id: 123, c: 'world', w: 1, t: 'What life lessons, advice or habits have you picked up from novels?' },
  { id: 124, c: 'world', w: 1, t: 'You have been temporarily blinded by a bright light. When your vision clears, what do you see?' },
  { id: 125, c: 'world', w: 1, t: 'What’s a question you asked as a kid that adults quietly stopped trying to answer?' },
  { id: 126, c: 'world', w: 1, t: 'If you met another form of intelligent life tomorrow, what’s the first thing you’d want to ask them?' },
  { id: 127, c: 'world', w: 2, t: 'A hundred years from now, what about how we live will people find hard to believe?' },
  { id: 128, c: 'world', w: 2, t: 'What question do you not expect an answer to, but still think about?' },
  { id: 129, c: 'world', w: 2, t: 'If everyone on Earth could see what you are doing right now, would you do it differently?' },
  { id: 130, c: 'world', w: 2, t: 'What problems or challenges would you set out to remedy in the world around you?' },
  { id: 131, c: 'world', w: 2, t: 'If you could leave one lasting positive change in the world, what would it be?' },
  { id: 132, c: 'world', w: 2, t: 'What is a view about the world that has changed for you as you have got older?' },
  { id: 133, c: 'world', w: 2, t: 'If we found out tomorrow we’re completely alone in the universe, would your life feel bigger or smaller?' },
  { id: 134, c: 'world', w: 2, t: 'We know more facts than any generation in history. Do we understand more, or just more things?' },
  { id: 135, c: 'world', w: 2, t: 'Everything you’ll ever see or touch is a tiny sliver of what exists. Is that a limitation or a relief?' },
  { id: 136, c: 'world', w: 3, t: 'What story about humanity do your daily actions tell?' },
  { id: 137, c: 'world', w: 3, t: 'What about being human would be hardest to explain to something that had never felt it?' },
  { id: 138, c: 'world', w: 3, t: 'If humanity disappeared tomorrow, what one thing we made should survive us?' },
  { id: 139, c: 'world', w: 3, t: 'What is the most ordinary thing about being alive that is actually strange?' },
  { id: 140, c: 'world', w: 3, t: 'What do you take for a universal truth that is really just a norm of your own culture?' },
  { id: 141, c: 'world', w: 3, t: 'Why do you think we are here?' },
  { id: 142, c: 'world', w: 3, t: 'Do you have more free will than the universe does?' },
  { id: 143, c: 'world', w: 3, t: 'Are you the same person you were a decade ago, or a different one wearing their memories?' },
  { id: 144, c: 'world', w: 3, t: 'What’s something wonderful about being alive sitting right next to something terrible about it?' },
  { id: 145, c: 'world', w: 3, t: 'If this really is your only shot at existing, is it going the way you’d want a story to go?' },
  { id: 146, c: 'world', w: 3, t: 'Would you trade the freedom to choose your life for the certainty of just surviving it?' },
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

export const LANDING_URL = 'https://lua-coral.vercel.app';

/** The page built for one question — see scripts/generate-share-pages.mjs. */
export const shareUrl = (id: number) => `${LANDING_URL}/q/${id}`;

export function promptIndexById(id: number): number {
  return PROMPTS.findIndex(p => p.id === id);
}

export const shareText = (prompt: Prompt) =>
  `Lua asked me: “${prompt.t}” — thought of you 🌙\n${shareUrl(prompt.id)}`;
