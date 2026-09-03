/**
 * The question id in a /q/<id> share link, if the app was opened through one.
 * The pages under /q are built at deploy time so the link previews correctly in
 * a chat app; this is how the running app recognises one and opens on that
 * question rather than a random one.
 */
export function sharedPromptId(): number | null {
  const path = /^\/q\/(\d+)\/?$/.exec(window.location.pathname);
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
 * Puts text on the clipboard without opening the share sheet — for taking a
 * question away to write about, which is a private act, not a send.
 */
export async function copyOnly(text: string, note: (t: string) => void) {
  try {
    await navigator.clipboard.writeText(text);
    note('Copied');
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
    note(ok ? 'Copied' : 'Couldn\u2019t copy');
  } catch {
    note('Couldn\u2019t copy');
  }
}

export async function shareOrCopy(
  message: string,
  note: (text: string) => void,
) {
  const nav = navigator as Navigator & { share?: (data: { text: string }) => Promise<void> };
  if (nav.share) {
    try {
      await nav.share({ text: message });
      return;
    } catch (err) {
      if (err && (err as Error).name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(message);
    note('Copied');
    return;
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
    note(ok ? 'Copied' : 'Couldn’t copy');
  } catch {
    note('Couldn’t copy');
  }
}
