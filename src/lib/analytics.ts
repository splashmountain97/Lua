import { track } from '@vercel/analytics';
import posthog from 'posthog-js';
import type { Prompt } from '../data/content';
import type { Wall } from './premium';

// Two destinations, on purpose. Vercel Web Analytics carries the page-level
// picture; PostHog carries the premium test, because that needs a funnel —
// how many hit each wall against how many then leave an address — and Vercel's
// custom events are behind a plan this account is not on.
//
// Nothing sent from here identifies a reader. No answers, no free text, and no
// email address: the address a reader types goes to the inbox it was offered
// to and nowhere else, so the analytics tool never holds anyone's contact
// details. The event carries only which wall it converted.

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://eu.i.posthog.com';

let posthogReady = false;

export function initAnalytics() {
  if (posthogReady || !POSTHOG_KEY) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // The app promises it keeps no account and stores nothing. PostHog's
    // default is a cookie and an id that follows someone between visits, which
    // would make that untrue, so persistence is held in memory: the id lasts
    // as long as the tab and is never written to disk. The wall and the email
    // that follows it happen seconds apart in one visit, so the funnel this
    // test exists to measure still joins up.
    persistence: 'memory',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
  });
  posthogReady = true;
}

function capture(event: string, props?: Record<string, string | number>) {
  if (!posthogReady) return;
  posthog.capture(event, props);
}

/** One question was revealed. Aggregate only — see the note above. */
export function trackPromptShown(prompt: Prompt) {
  track('prompt_shown', { category: prompt.c, weight: prompt.w });
}

/** A reader ran into one of the premium walls. One event name per wall. */
export function trackWallHit(wall: Wall) {
  capture(`wall_hit_${wall}`, { wall });
  track('wall_hit', { wall });
}

/** A reader left an address at a wall. Carries the wall, never the address. */
export function trackWallEmail(wall: Wall) {
  capture('wall_email_submitted', { wall });
  track('wall_email_submitted', { wall });
}
