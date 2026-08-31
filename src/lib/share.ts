/**
 * The question id in a /q/<id> share link, if the app was opened through one.
 * The pages under /q are built at deploy time so the link previews correctly in
 * a chat app; this is how the running app recognises one and opens on that
 * question rather than a random one.
 */
export function sharedPromptId(): number | null {
  const m = /^\/q\/(\d+)\/?$/.exec(window.location.pathname);
  if (!m) return null;
  const id = Number(m[1]);
  return Number.isSafeInteger(id) ? id : null;
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
