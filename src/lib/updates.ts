import { registerSW } from 'virtual:pwa-register';

/**
 * Taking a new version without anyone having to know there was one.
 *
 * The app is precached, so a tab that is already open serves what it cached and
 * keeps serving it. Nothing about a deploy reaches it: the browser only looks
 * for a new worker when the page navigates, and a tab left open for a week
 * never navigates. Someone who keeps Lua in a tab could sit a fortnight behind
 * and have no way of knowing.
 *
 * So two things happen here that did not before. The worker is asked for an
 * update on a timer and whenever the tab is looked at again, rather than only
 * on navigation. And when one is waiting, it is applied — which means a reload,
 * because the running page is still the old bundle however new the worker is.
 *
 * A reload is rude at the wrong moment. Taking a question off the screen
 * mid-sentence to install a new version of the thing that gave it to you would
 * be worse than being a version behind, so the app says when it is safe: at
 * rest, with nothing open over it. The update waits for that, however long it
 * takes, and applies the instant both are true.
 */
const CHECK_MS = 20 * 60 * 1000;

let applyUpdate: ((reload?: boolean) => Promise<void>) | null = null;
let check: (() => void) | null = null;
let waiting = false;
let safe = false;

function maybeApply() {
  if (!waiting || !safe || !applyUpdate) return;
  waiting = false;
  void applyUpdate(true);
}

export function watchForUpdates() {
  applyUpdate = registerSW({
    immediate: true,
    onNeedRefresh() { waiting = true; maybeApply(); },
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      const ask = () => { void registration.update().catch(() => {}); };
      check = ask;
      setInterval(ask, CHECK_MS);
      // A tab comes back to the front far more often than it navigates, and
      // that is the moment someone is about to look at it.
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) ask();
      });
    },
  });
}

/**
 * The app is at rest and nothing is open over it.
 *
 * Coming to rest is also a good moment to go looking: someone who has just put
 * a question down is between things, which is exactly when a reload costs
 * nothing and exactly when the timer is most likely to be halfway through.
 */
export function setSafeToUpdate(value: boolean) {
  const cameToRest = value && !safe;
  safe = value;
  if (cameToRest) check?.();
  maybeApply();
}
