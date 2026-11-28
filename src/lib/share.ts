import { SHARE_VARIANTS, type ShareVariant } from '../data/content';

/**
 * The two words this module can say, handed in by the caller so that nothing
 * here has to know which language is on screen.
 */
export interface CopyWords { copied: string; failed: string }
const COPY_WORDS: Record<'en', CopyWords> = {
  en: { copied: 'Copied', failed: 'Couldn\u2019t copy' },
};

/**
 * The question id in an /app/q/<id> share link, if the app was opened through one.
 * The pages under /q are built at deploy time so the link previews correctly in
 * a chat app; this is how the running app recognises one and opens on that
 * question rather than a random one.
 */
export function sharedPromptId(): number | null {
  // /app/q/<id> is English and /app/q/pt/<id> Portuguese; both name the same question.
  // Which language it was sent in is lib/i18n's business, not this one's.
  const path = /^\/app\/q\/(?:pt\/)?(\d+)\/?$/.exec(window.location.pathname);
  // ?p= is accepted as well as /q/<id>, so a hand-written or hand-edited link
  // still finds its question. Links are not made this way: /q/<id> is a real
  // page built at deploy time carrying that question's own preview, and a
  // query on the root would fall back to the generic one.
  const query = new URLSearchParams(window.location.search).get('p');
  const raw = path ? path[1] : query;
  if (!raw || !/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}

/**
 * The wording the link this page was opened through was sent with (?v=), if
 * it carries one this build knows. A link with no tag, or a tag from a
 * retired wording, is simply a link.
 */
export function sharedVariant(): ShareVariant | null {
  try {
    const v = new URLSearchParams(window.location.search).get('v');
    return v && (SHARE_VARIANTS as readonly string[]).includes(v) ? (v as ShareVariant) : null;
  } catch {
    return null;
  }
}

/** One wording, drawn afresh for every send. */
export function pickShareVariant(): ShareVariant {
  return SHARE_VARIANTS[Math.floor(Math.random() * SHARE_VARIANTS.length)];
}

/**
 * What became of a share: the sheet was completed, backed out of, or — where
 * there is no sheet — the text landed on the clipboard, or nothing did.
 */
export type ShareOutcome = 'shared' | 'cancelled' | 'copied' | 'failed';

/**
 * Puts text on the clipboard without opening the share sheet — for taking a
 * question away to write about, which is a private act, not a send.
 */
export async function copyOnly(text: string, note: (t: string) => void, words = COPY_WORDS.en) {
  try {
    await navigator.clipboard.writeText(text);
    note(words.copied);
    return;
  } catch { /* fall through to the legacy path */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    note(ok ? words.copied : words.failed);
  } catch {
    note(words.failed);
  }
}

export async function shareOrCopy(
  message: string,
  note: (text: string) => void,
  words = COPY_WORDS.en,
): Promise<ShareOutcome> {
  const nav = navigator as Navigator & { share?: (data: { text: string }) => Promise<void> };
  if (nav.share) {
    try {
      await nav.share({ text: message });
      return 'shared';
    } catch (err) {
      if (err && (err as Error).name === 'AbortError') return 'cancelled';
    }
  }
  try {
    await navigator.clipboard.writeText(message);
    note(words.copied);
    return 'copied';
  } catch { /* fall through to the legacy path */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = message;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    note(ok ? words.copied : words.failed);
    return ok ? 'copied' : 'failed';
  } catch {
    note(words.failed);
    return 'failed';
  }
}
