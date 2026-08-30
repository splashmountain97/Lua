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
