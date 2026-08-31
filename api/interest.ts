// Receives an address left at one of the premium walls and forwards it to the
// inbox that offered to take it. The address is passed straight on and never
// stored here — there is no database, and the analytics side is sent the wall
// tag without it, so the only copy that exists is the one in the inbox.

export const config = { runtime: 'edge' };

const TO = 'prmurgel@gmail.com';
const WALLS = new Set(['your_life', 'world', 'daily_limit']);

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  let email: unknown;
  let wall: unknown;
  try {
    ({ email, wall } = await req.json() as { email?: unknown; wall?: unknown });
  } catch {
    return json(400, { error: 'bad_json' });
  }

  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return json(400, { error: 'bad_email' });
  }
  if (typeof wall !== 'string' || !WALLS.has(wall)) {
    return json(400, { error: 'bad_wall' });
  }

  const key = process.env.RESEND_API_KEY;
  // Without a key the wall still works and the interest is still counted on the
  // analytics side — only the forwarding is missing, so say so plainly rather
  // than failing in a way that looks like the reader's problem.
  if (!key) return json(501, { error: 'email_not_configured' });

  const tag = `wanted:${wall}`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: process.env.INTEREST_FROM ?? 'Lua <onboarding@resend.dev>',
      to: [TO],
      reply_to: email.trim(),
      subject: `Lua premium interest — ${tag}`,
      text: [
        `Someone asked to be added to Lua premium.`,
        ``,
        `Email: ${email.trim()}`,
        `Wall:  ${tag}`,
      ].join('\n'),
    }),
  });

  if (!res.ok) return json(502, { error: 'send_failed', status: res.status });
  return json(200, { ok: true });
}
