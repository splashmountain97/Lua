import { joinWaitlist as keepLocally } from './storage';

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
 */
const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export async function sendWaitlist(email: string, door: string): Promise<void> {
  if (!URL || !KEY) { keepLocally({ email, door, at: Date.now() }); return; }
  try {
    const res = await fetch(`${URL}/rest/v1/waitlist_emails`, {
      method: 'POST',
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ email, source_tag: door }),
    });
    // The card has already said 'You're on the list', because making someone
    // wait on a network round trip to be told that is worse than the rare case
    // of it failing. So a failure is kept on the device rather than dropped:
    // the address is still there to send later, and nobody was told something
    // untrue that cost them anything.
    if (!res.ok) keepLocally({ email, door, at: Date.now() });
  } catch {
    keepLocally({ email, door, at: Date.now() });
  }
}
