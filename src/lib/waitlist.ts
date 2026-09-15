import { getWaitlist, joinWaitlist as keepLocally, setWaitlist, type WaitlistEntry } from './storage';

/**
 * The one place an address leaves the device.
 *
 * It goes to a table that the publishable key may only insert into: there is no
 * select, update or delete policy for it, so the key compiled into this bundle
 * can add a row and can do nothing else with the table — not read it back, not
 * change it, not empty it. That is checked behaviour rather than an intention;
 * a read through this key returns an empty list.
 *
 * `Prefer: return=minimal` is load-bearing. PostgREST otherwise selects the new
 * row back to return it, that select is refused by the same policy, and the
 * whole insert fails with a row-level-security error. The insert-only design
 * and reading the row back are mutually exclusive on purpose.
 *
 * Nothing else is sent. Not which questions were seen, not when, not the day
 * count — only the address someone typed and which door they typed it at,
 * which is the entire result the test is after.
 *
 * ── Why the order below matters ──────────────────────────────────────────────
 *
 * The address is written to the device BEFORE the request, and removed only
 * once the server has accepted it. The previous version did the opposite: it
 * kept a copy only when the send visibly failed, and nothing ever read that
 * copy back.
 *
 * That has already cost one address. On 12 September a visit read two
 * questions, went looking for Life, hit the wall and submitted an address; the
 * row never arrived. Four waitlist_joined events exist against five rows, and
 * the doors do not reconcile — two 'life' events against one 'life' row, whose
 * timestamp ties it to a different visit. So a submission was accepted by the
 * card and lost on the way to the table.
 *
 * Who submitted it is not known and is not knowable from this data: an id here
 * survives one page load, and guessing at a person from their country and
 * browser is how you end up asserting things that are not true.
 *
 * Writing first also closes a hole the old order could not: a send that is
 * still in flight when the tab closes runs neither its `catch` nor its `!ok`
 * branch, so the address would have been lost with no trace anywhere. The card
 * says 'You're on the list' immediately and does not wait for the network, so
 * that race is entirely realistic.
 */
const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** True only when the row is actually in the table. */
async function post(entry: WaitlistEntry): Promise<boolean> {
  if (!URL || !KEY) return false;
  try {
    const res = await fetch(`${URL}/rest/v1/waitlist_emails`, {
      method: 'POST',
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ email: entry.email, source_tag: entry.door }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Drop one entry, re-reading first so a concurrent write is not clobbered. */
function forget(entry: WaitlistEntry) {
  setWaitlist(getWaitlist().filter(e => !(e.email === entry.email && e.at === entry.at)));
}

export async function sendWaitlist(email: string, door: string): Promise<void> {
  const entry: WaitlistEntry = { email, door, at: Date.now() };
  // Kept first, so nothing can lose it in between.
  keepLocally(entry);
  if (await post(entry)) forget(entry);
}

/**
 * Send anything a previous visit could not, on the next visit that can.
 *
 * Called once at startup. Failures are left in place to be tried again rather
 * than dropped, and each is sent in turn rather than all at once: a queue this
 * size has no reason to open several connections, and if the table is still
 * unreachable the first failure is representative of the rest.
 */
export async function flushWaitlist(): Promise<void> {
  if (!URL || !KEY) return;
  for (const entry of getWaitlist()) {
    if (await post(entry)) forget(entry);
    else return;
  }
}
