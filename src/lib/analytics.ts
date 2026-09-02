import type { PostHog } from 'posthog-js';
import type { CategoryId, Prompt, Weight } from '../data/content';

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
  if (loading || ph || !KEY) return;
  loading = true;
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init(KEY, {
      api_host: HOST,
      persistence: 'memory',
      person_profiles: 'identified_only',
      autocapture: false,
      disable_session_recording: true,
      capture_pageview: true,
      capture_pageleave: false,
    });
    ph = posthog;
    // A shake can easily beat the download; without this the first one is lost,
    // which is the single event least worth losing.
    for (const [event, props] of queued) posthog.capture(event, props);
    queued.length = 0;
  }).catch(() => { /* analytics is never worth breaking the app for */ });
}

function send(event: string, props?: Record<string, string | number>) {
  if (!KEY) return;
  if (ph) { ph.capture(event, props); return; }
  if (queued.length < 50) queued.push([event, props]);
}

/** The moon was shaken. Paired with prompt_shown, this is the whole funnel. */
export function trackShake() {
  send('moon_shaken');
}

/** One question was revealed. Aggregate only — see the note above. */
export function trackPromptShown(prompt: Prompt) {
  send('prompt_shown', { category: prompt.c, weight: prompt.w });
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

/** The saved drawer was opened, and how much was in it. */
export function trackSavedOpened(saved: number, done: number) {
  send('saved_opened', { saved, done });
}
