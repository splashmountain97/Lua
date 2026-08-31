import { useState } from 'react';
import { WALL_COPY, looksLikeEmail, type Wall as WallKind } from '../lib/premium';
import { trackWallEmail } from '../lib/analytics';

// The soft wall. It is a closed door with a note on it, not an error: the same
// surface, hairline and lift as the category popover, no red, no warning icon,
// and it can always be walked away from.

export default function Wall({ wall, onClose }: { wall: WallKind; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const valid = looksLikeEmail(email);

  async function submit() {
    if (!valid || state !== 'idle') return;
    setState('sending');
    // The interest is recorded whatever the forwarding does — a missing mail
    // key should not lose the signal this whole test exists to collect.
    trackWallEmail(wall);
    try {
      await fetch('/api/interest', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), wall }),
      });
    } catch { /* the reader has done their part; nothing to put on them */ }
    setState('done');
  }

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      style={{
        position: 'absolute', inset: 0, zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 26px',
        background: 'rgba(6,6,12,.9)',
        animation: 'lua-dim 300ms linear both',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 296, padding: '20px 20px 16px', borderRadius: 12,
        background: '#20222f', boxShadow: '0 0 0 1px #3f424d, 0 14px 34px rgba(0,0,0,.6)',
        animation: 'lua-rise .32s cubic-bezier(.33,1,.68,1) both',
      }}>
        {state === 'done' ? (
          <>
            <div style={{ font: '400 13.5px/1.6 Inter,sans-serif', color: '#cfd3e5', margin: '0 0 18px' }}>
              Thank you — you’re on the list. We’ll be in touch as soon as there’s something to let you into.
            </div>
            <button type="button" onClick={onClose} style={primary}>Back to the moon</button>
          </>
        ) : (
          <>
            <div style={{ font: '400 13.5px/1.6 Inter,sans-serif', color: '#cfd3e5', margin: '0 0 16px' }}>
              {WALL_COPY}
            </div>
            <input
              type="email"
              inputMode="email"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="you@example.com"
              value={email}
              disabled={state === 'sending'}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              style={{
                width: '100%', padding: '12px 13px', margin: '0 0 10px', borderRadius: 8,
                background: 'rgba(233,237,245,.04)', border: '1px solid rgba(147,151,171,.22)',
                color: '#e9e9ed', font: '400 13.5px/1 Inter,sans-serif',
                outline: 'none', userSelect: 'text', WebkitUserSelect: 'text',
              }}
            />
            <button
              type="button"
              onClick={submit}
              disabled={!valid || state === 'sending'}
              style={{
                ...primary,
                opacity: valid && state === 'idle' ? 1 : .45,
                cursor: valid && state === 'idle' ? 'pointer' : 'default',
              }}
            >
              {state === 'sending' ? 'Sending…' : 'Add me to the list'}
            </button>
            <button type="button" onClick={onClose} style={quiet}>Not now</button>
          </>
        )}
      </div>
    </div>
  );
}

const primary: React.CSSProperties = {
  width: '100%', padding: 14, borderRadius: 100, cursor: 'pointer',
  border: '1px solid rgba(145,132,217,.55)', background: 'rgba(145,132,217,.08)',
  color: '#d2cefd', font: '400 14px/1 Inter,sans-serif', letterSpacing: '.01em',
  transition: 'opacity .18s',
};

const quiet: React.CSSProperties = {
  width: '100%', padding: '11px 0 2px', background: 'none', border: 0, cursor: 'pointer',
  color: '#9397ab', font: '400 12px/1 Inter,sans-serif',
};
