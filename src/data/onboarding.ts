// Ported from the "Lua Onboarding Paper" design (Newsreader + Source Sans 3,
// hand-drawn paper aesthetic — the astronaut visor doubles as the moon's own
// purple/gold glass). Three screens: ruins, walking, helmet.

export type OnboardScreen = 1 | 2 | 3;

export const HEADS: Record<OnboardScreen, string> = {
  1: 'The question is ours. The answer is yours.',
  2: 'Earth is loud. The moon isn’t.',
  3: 'Ready to know yourself better?',
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

export const SAMPLE_QUESTION = 'What did you avoid today, and what was it protecting you from?';

// The push-in is one transform on the artwork, pivoted on the visor's measured
// centre — 50.36% / 41.93% of the image (a saturation scan of the source: the
// swirl is the only saturated region in a graphite drawing). Scaling about
// that point holds the visor still while everything else leaves the frame.
export const CAM_REST = 'translate(0px,0px) scale(1)';
export const CAM_FULL = 'translate(-2.9px,240.3px) scale(7.2)';
export const VISOR_ORIGIN = '50.36% 41.93%';
