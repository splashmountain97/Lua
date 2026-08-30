import MoonMini from './MoonMini';
import { WELCOME_COPY } from '../data/content';

export default function Welcome({ onPickItUp }: { onPickItUp: () => void }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      justifyContent: 'flex-end', padding: '0 32px 56px',
    }}>
      <div style={{ position: 'absolute', left: '50%', top: 212, transform: 'translate(-50%,-50%)' }}>
        <MoonMini size={196} driftDur={14} swirlDur={22} glowAlpha={0.3} breatheDur={6} />
      </div>

      <div style={{ font: '300 64px/1 Inter,sans-serif', letterSpacing: '-.045em', color: '#f0eef2', margin: '0 0 20px' }}>Lua</div>
      <h2 style={{ font: '300 27px/1.24 Inter,sans-serif', letterSpacing: '-.025em', margin: '0 0 16px', color: '#cfd3e5' }}>
        A question,<br />once a day.
      </h2>
      <p style={{ font: '400 14px/1.62 Inter,sans-serif', color: '#b2b6ca', margin: '0 0 32px', maxWidth: 296 }}>
        {WELCOME_COPY}
      </p>
      <button
        type="button"
        onClick={onPickItUp}
        style={{
          width: '100%', padding: 15, borderRadius: 100, cursor: 'pointer',
          border: '1px solid rgba(145,132,217,.5)', background: 'rgba(145,132,217,.06)',
          color: '#d2cefd', font: '400 14.5px/1 Inter,sans-serif', letterSpacing: '.02em',
        }}
      >
        Pick it up
      </button>
    </div>
  );
}
