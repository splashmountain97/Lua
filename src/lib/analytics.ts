import type { PostHog } from 'posthog-js';
import type { CategoryId, Prompt, Weight } from '../data/content';
import { isDevDevice, setDevDevice } from './storage';

// The only measurement in the app, and it is held to the same bargain the rest
// of the app makes: nothing that leaves the device may identify a person or
// describe one across visits. No answers, no free text, no question ids, no
// account, no cookie.
//
// PostHog is configured against its own defaults to keep that true:
//
//   persistence: 'memory'   — the default is a cookie carrying an id that
//     follows someone between visits. Held in memory instead, the id lasts as
//     long as the tab and is never written to the device, so there is nothing
//     to carry and nothing to clear.
//   person_profiles: 'identified_only' — and identify() is never called, so no
//     person is ever created. Every event is anonymous.
//   autocapture: false      — the default records every click and input in the
//     DOM. Far too much, and impossible to promise anything about.
//   disable_session_recording — no replay, ever.
//   disable_external_dependency_loading — PostHog fetches extra scripts on its
//     own say-so, enabled by remote config rather than by anything here. A
//     first load pulled in surveys, dead-click autocapture and web vitals
//     unasked. Surveys are the serious one: that is a channel for putting a
//     dialog nobody here wrote on top of someone's question. Nothing loads.
//
// What this buys, honestly: it answers what happens inside one visit — whether
// someone who arrives actually shakes, whether the filters get touched, which
// of the four actions get used. It cannot answer whether anyone comes back,
// because that needs an identity that survives a visit, which is the one thing
// this will not keep.
//
// Properties describe the question or the control, never the reader. The
// question's own id stays out: per-question popularity is a fair thing to
// want, and the /q/<id> share routes already answer it in pageviews without
// anyone having to send it from inside a session.

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://eu.i.posthog.com';

let ph: PostHog | null = null;
let loading = false;
/** Events raised before the library finishes loading, replayed on arrival. */
const queued: [string, Record<string, string | number> | undefined][] = [];

/**
 * No key, no analytics — and, because the import is dynamic, no library
 * either. posthog-js is roughly the size of the rest of the app put together,
 * which is a lot to send someone in order to do nothing.
 */
export function initAnalytics() {
  // Before the key check, so ?lua-dev=1 still records the choice on a build
  // that sends nothing — the flag outlives whichever page happened to set it.
  devDevice = readDevFlag();
  if (loading || ph || !KEY) return;
  loading = true;
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init(KEY, {
      api_host: HOST,
      persistence: 'memory',
      person_profiles: 'identified_only',
      autocapture: false,
      disable_session_recording: true,
      // Off so the first pageview can be captured by hand below, after the
      // super properties are registered. Left on, posthog sends it during
      // init() — before register() has run — and the one event that every
      // visit produces is the one event that arrives untagged.
      capture_pageview: false,
      capture_pageleave: false,
      // Everything below is off by default in this app but ON by default in
      // PostHog, and several are switched on remotely rather than from here.
      // Left alone, a fresh project fetches surveys, dead-click autocapture and
      // web vitals on first load — none of which were asked for, and one of
      // which can put a dialog of someone else's choosing on top of a
      // question. The last line is the backstop: no external script at all.
      disable_surveys: true,
      disable_web_experiments: true,
      capture_dead_clicks: false,
      capture_performance: false,
      capture_heatmaps: false,
      advanced_disable_feature_flags: true,
      disable_external_dependency_loading: true,
    });
    // Registered before the first capture, so every event carries these —
    // including the pageview on the next line and the queued ones below.
    posthog.register({
      launched: launchedAs(),
      ...(devDevice ? { dev: 'true' } : {}),
    });
    posthog.capture('$pageview');
    ph = posthog;
    // A shake can easily beat the download; without this the first one is lost,
    // which is the single event least worth losing.
    for (const [event, props] of queued) posthog.capture(event, props);
    queued.length = 0;
  }).catch(() => { /* analytics is never worth breaking the app for */ });
}

/**
 * Whether the events from this page are the author's own.
 *
 * Testing happens on the real site — there is nowhere else a key exists, since
 * neither the dev server nor a preview deploy is given one — so the author's
 * visits land in the same project as everybody else's, and roughly a fifth of
 * the arrivals recorded so far are their own.
 *
 * Tagged rather than dropped. The author's device is the only one that can
 * confirm an event fires at all, and a switch that makes it silent takes that
 * away at exactly the moment it is wanted.
 */
let devDevice = false;

/**
 * Read from the URL on every load, not only from storage.
 *
 * The testing in question is done in a private Safari tab, which throws away
 * localStorage at the end of the session, so a flag that could only be stored
 * would be gone by the next visit. The URL carries it instead, and the stored
 * copy is a convenience for ordinary browsers, which then need it only once.
 *
 * Put ?lua-dev=1 on a home-screen shortcut and every launch is tagged.
 */
function readDevFlag(): boolean {
  let fromUrl: boolean | null = null;
  try {
    const v = new URLSearchParams(window.location.search).get('lua-dev');
    if (v === '1') fromUrl = true;
    else if (v === '0') fromUrl = false;
  } catch { /* no URL to read is the same as nothing being asked for */ }
  if (fromUrl === null) return isDevDevice();
  setDevDevice(fromUrl);
  return fromUrl;
}

/**
 * Whether this was opened from a home-screen icon or from a browser tab.
 *
 * Asked because 'did anyone keep it?' is the one question a daily habit has to
 * answer, and an install is the only evidence of it this app can see without
 * keeping an identity. It says how the app was opened, never by whom.
 *
 * Both checks are needed. iOS Safari has carried navigator.standalone since
 * long before it understood the display-mode query, and iOS is where the home
 * screen actually gets used.
 */
function launchedAs(): 'standalone' | 'browser' {
  try {
    if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
    if ((window.navigator as Navigator & { standalone?: boolean }).standalone) return 'standalone';
  } catch { /* an environment with neither is a browser as far as this cares */ }
  return 'browser';
}

function send(event: string, props?: Record<string, string | number>) {
  if (!KEY) return;
  // dev and launched are registered as super properties instead of being added
  // here, so they reach $pageview too — which this function never sees.
  if (ph) { ph.capture(event, props); return; }
  if (queued.length < 50) queued.push([event, props]);
}

/** The moon was shaken. Paired with prompt_shown, this is the whole funnel. */
export function trackShake() {
  send('moon_shaken');
}

/**
 * Coarse on purpose.
 *
 * A raw count is a sharper thing than it looks. Events carry no identity and
 * cannot be joined across visits, but within one visit they all belong to one
 * person, and in a small readership 'day 23' is a cohort of one. Banding keeps
 * every value a group rather than a person, and still answers the question the
 * bands were made for.
 */
function band(n: number): string {
  if (n <= 0) return '0';
  if (n <= 2) return String(n);
  if (n <= 6) return '3-6';
  if (n <= 13) return '7-13';
  if (n <= 29) return '14-29';
  return '30+';
}

/**
 * One question was revealed.
 *
 * The two counts are how this app can say anything about coming back without
 * keeping an identity to recognise anyone by. Retention normally needs
 * something durable on the device to join one visit to the next; that is the
 * one thing this will not keep. But the device has already worked out the
 * answer for its own reasons — the streak is literally how many days running
 * someone has come back — so the answer travels instead of the identity, in
 * bands, attached to the question rather than the reader.
 *
 * It buys the distribution, not the path: how many questions are opened by
 * people on day one against day seven, never whether these two events are the
 * same person. That distribution is the whole of what was being asked.
 *
 * `trigger` says who asked for the question. A first visit is now handed one
 * on arrival rather than being made to earn it through an introduction, so
 * without this the event cannot tell a question someone wanted from one that
 * was simply put in front of them, and every conversion rate built on it reads
 * as though the product converts everyone who lands. Anything other than
 * 'auto' is a reader who asked. It describes the gesture, never the reader.
 */
export type RevealTrigger =
  /** Handed over on arrival, unasked. The introduction used to occupy this moment. */
  | 'auto'
  /** The reader shook the moon, by hand or by pressing it. */
  | 'shake'
  /** The reader pressed 'Shake again' on a question they already had. */
  | 'again'
  /** The reader pressed 'Start now' on the last introduction screen. */
  | 'start';

export function trackPromptShown(
  prompt: Prompt,
  streakDays: number,
  lifetimeReveals: number,
  trigger: RevealTrigger,
) {
  send('prompt_shown', {
    category: prompt.c,
    weight: prompt.w,
    streak_day: band(streakDays),
    lifetime_reveals: band(lifetimeReveals),
    trigger,
  });
}

/** Did anyone ever change the defaults the filters ship with? */
export function trackFilter(kind: 'category' | 'weight', value: CategoryId | Weight | 'any') {
  send('filter_changed', { kind, value: String(value) });
}

/** Which of the four things on the reveal screen actually get used. */
export function trackAction(action: 'write' | 'save' | 'unsave' | 'share' | 'again' | 'close') {
  send('reveal_action', { action });
}

/** Whether the three screens are read or skipped. */
export function trackOnboarding(outcome: 'completed' | 'skipped') {
  send('onboarding', { outcome });
}

/**
 * The wall was reached, and by which door. Per-door counts are the entire
 * result of the test: which gate people actually hit, and which one they will
 * leave an address for. The address itself is never sent here.
 */
export function trackWallShown(door: string) {
  send('wall_shown', { door });
}

/** An address was left. Which door, never the address. */
export function trackWaitlist(door: string) {
  send('waitlist_joined', { door });
}

/** The saved drawer was opened, and how much was in it. */
export function trackSavedOpened(saved: number, done: number) {
  send('saved_opened', { saved, done });
}
