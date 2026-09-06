// Ported from the "Lua Onboarding Paper" design (Newsreader + Source Sans 3,
// hand-drawn paper aesthetic). Screens one and two; screen three reverts to
// the real moon object rather than the design's photographed visor — see the
// comment at the top of Onboarding.tsx for why.

export type OnboardScreen = 1 | 2 | 3;

export const HEADS: Record<OnboardScreen, string> = {
  1: 'The question is ours. The answer is yours.',
  2: 'Earth is loud. The moon isn’t.',
  3: 'A question, once a day.',
};

export const BODY: Record<1 | 2, [string, string]> = {
  1: [
    'Journaling is just answering an honest question about your own life, on purpose. People have done it for two thousand years — emperors did it, and so did people with nothing.',
    'A few hundred questions, handpicked slowly.',
  ],
  2: [
    'One question a day. Answer it on paper, in your head, or out loud — alone or with friends. You decide.',
    'Lua keeps none of it. No account, nothing saved, nothing sent.',
  ],
};
