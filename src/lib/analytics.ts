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
