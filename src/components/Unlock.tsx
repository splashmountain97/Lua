import MoonMini from './MoonMini';

const UNLOCK_ROWS: { dot: string; text: string; tag: string }[] = [
  { dot: 'rgba(147,151,171,.4)', text: 'All three categories, always open', tag: 'free' },
  { dot: 'rgba(147,151,171,.4)', text: 'One question a day, from a pool of forty', tag: 'free' },
  { dot: '#b5abfc', text: 'Six hundred questions, written not generated', tag: 'unlock' },
  { dot: '#b5abfc', text: 'As many as you want in a day', tag: 'unlock' },
  { dot: '#b5abfc', text: 'Still no account, still nothing stored', tag: 'always' },
];

export default function Unlock({ unlocked, onUnlock, onNotNow }: {
  unlocked: boolean; onUnlock: () => void; onNotNow: () => void;
}) {
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '96px 30px 46px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ margin: '0 auto 26px' }}>
        <MoonMini size={150} driftDur={15} swirlDur={20} glowAlpha={0.32} breatheDur={7} />
      </div>
      <h2 style={{ font: '300 27px/1.24 Inter,sans-serif', letterSpacing: '-.022em', margin: '0 0 13px', color: '#f0eef2', textAlign: 'center' }}>
        Open the whole library
      </h2>
      <p style={{ font: '400 13px/1.6 Inter,sans-serif', color: '#9397ab', margin: '0 0 26px', textAlign: 'center' }}>
        One payment. No subscription, no renewal, nothing to cancel.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, margin: '0 0 26px' }}>
        {UNLOCK_ROWS.map((u, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '0 4px' }}>
            <span style={{ flex: 'none', width: 6, height: 6, borderRadius: '50%', background: u.dot, transform: 'translateY(-2px)' }} />
            <span style={{ flex: 1, font: '400 12.5px/1.5 Inter,sans-serif', color: '#cfd3e5' }}>{u.text}</span>
            <span style={{ font: '400 11px/1.5 ui-monospace,Menlo,monospace', color: '#9397ab' }}>{u.tag}</span>
          </div>
        ))}
      </div>
      <div style={{ margin: '0 0 auto', padding: '14px 16px', borderRadius: 8, background: 'rgba(145,132,217,.06)', boxShadow: 'inset 0 0 0 1px rgba(145,132,217,.16)' }}>
        <div style={{ font: '400 11.5px/1.55 Inter,sans-serif', color: '#b2b6ca' }}>
          The three categories stay open either way. What you're buying is more questions, and as many as you like in a day.
        </div>
      </div>
      <button
        type="button" onClick={onUnlock}
        style={{
          width: '100%', padding: 16, borderRadius: 100, cursor: 'pointer', margin: '22px 0 10px',
          border: '1px solid rgba(145,132,217,.55)', background: 'rgba(145,132,217,.08)',
          color: '#d2cefd', font: '400 15px/1 Inter,sans-serif', letterSpacing: '.01em',
        }}
      >
        {unlocked ? 'Unlocked' : 'Unlock — $8.99 once'}
      </button>
      <button
        type="button" onClick={onNotNow}
        style={{ width: '100%', padding: 9, background: 'none', border: 0, color: '#9397ab', font: '400 12px/1 Inter,sans-serif', cursor: 'pointer' }}
      >
        Not now
      </button>
    </div>
  );
}
