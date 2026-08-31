import { track } from '@vercel/analytics';
import type { Prompt } from '../data/content';

// Vercel Web Analytics, cookieless and aggregate — the only measurement in the
// app. Nothing here may identify a person or describe one across visits: no
// ids, no session keys, no answers, no free text. The app tells people on its
// own welcome screen that it keeps no account and stores nothing, and that has
// to stay true of what leaves the device as well as what stays on it.
//
// The properties below describe the question, not the reader: which of the
// three grounds it came from and how heavy it was. They answer whether the
// filters are worth their place on the screen. The question's own id is
// deliberately not sent — per-question popularity is a fair thing to want, but
// it is a much finer record of what a given visitor sat with, and it is not
// needed to answer that.

/** One question was revealed. Aggregate only — see the note above. */
export function trackPromptShown(prompt: Prompt) {
  track('prompt_shown', { category: prompt.c, weight: prompt.w });
}
