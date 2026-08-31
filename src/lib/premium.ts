// The fake-door premium test. Nothing here unlocks anything or takes payment —
// it measures whether anyone wants the thing before it gets built.

/** Which wall a reader ran into. The tag travels with the event and the email. */
export type Wall = 'your_life' | 'world' | 'daily_limit';

/** Questions a free reader may reveal per local day. The next attempt walls. */
export const FREE_REVEALS_PER_DAY = 3;

export const WALL_COPY =
  'Oops — this feature is exclusive to premium users. Leave your email and we’ll add you as soon as we can.';

/** The one category a free reader may draw from. */
export const FREE_CATEGORY = 'you';

export const WALL_FOR_CATEGORY: Record<string, Wall> = {
  life: 'your_life',
  world: 'world',
};

// Deliberately loose. This is a demand signal, not an account: the cost of
// turning away a real address that happens to look odd is higher than the cost
// of collecting one that bounces.
export function looksLikeEmail(value: string): boolean {
  const v = value.trim();
  return v.length > 3 && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
