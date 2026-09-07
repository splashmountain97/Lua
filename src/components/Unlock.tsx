import MoonMini from './MoonMini';
import { useLang } from '../hooks/useLang';
import { UI } from '../lib/strings';
import type { Localized } from '../lib/i18n';

const UNLOCK_ROWS: { dot: string; text: Localized; tag: Localized }[] = [
  { dot: 'rgba(147,151,171,.4)', text: UI.unlock.rowCategories, tag: UI.unlock.tagFree },
  { dot: 'rgba(147,151,171,.4)', text: UI.unlock.rowPool, tag: UI.unlock.tagFree },
  { dot: '#b5abfc', text: UI.unlock.rowSix, tag: UI.unlock.tagUnlock },
  { dot: '#b5abfc', text: UI.unlock.rowMany, tag: UI.unlock.tagUnlock },
  { dot: '#b5abfc', text: UI.unlock.rowPrivacy, tag: UI.unlock.tagAlways },
];

export default function Unlock({ unlocked, onUnlock, onNotNow }: {
  unlocked: boolean; onUnlock: () => void; onNotNow: () => void;
}) {
  const { t } = useLang();
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '96px 30px 46px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ margin: '0 auto 26px' }}>
        <MoonMini size={150} driftDur={15} swirlDur={20} glowAlpha={0.32} breatheDur={7} />
      </div>
      <h2 style={{ font: '300 27px/1.24 Inter,sans-serif', letterSpacing: '-.022em', margin: '0 0 13px', color: '#f0eef2', textAlign: 'center' }}>
        {t(UI.unlock.title)}
      </h2>
      <p style={{ font: '400 13px/1.6 Inter,sans-serif', color: '#9397ab', margin: '0 0 26px', textAlign: 'center' }}>
        {t(UI.unlock.sub)}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, margin: '0 0 26px' }}>
        {UNLOCK_ROWS.map((u, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '0 4px' }}>
            <span style={{ flex: 'none', width: 6, height: 6, borderRadius: '50%', background: u.dot, transform: 'translateY(-2px)' }} />
            <span style={{ flex: 1, font: '400 12.5px/1.5 Inter,sans-serif', color: '#cfd3e5' }}>{t(u.text)}</span>
            <span style={{ font: '400 11px/1.5 ui-monospace,Menlo,monospace', color: '#9397ab' }}>{t(u.tag)}</span>
          </div>
        ))}
      </div>
      <div style={{ margin: '0 0 auto', padding: '14px 16px', borderRadius: 8, background: 'rgba(145,132,217,.06)', boxShadow: 'inset 0 0 0 1px rgba(145,132,217,.16)' }}>
        <div style={{ font: '400 11.5px/1.55 Inter,sans-serif', color: '#b2b6ca' }}>
          {t(UI.unlock.note)}
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
        {unlocked ? t(UI.unlock.unlocked) : 'Unlock — $8.99 once'}
      </button>
      <button
        type="button" onClick={onNotNow}
        style={{ width: '100%', padding: 9, background: 'none', border: 0, color: '#9397ab', font: '400 12px/1 Inter,sans-serif', cursor: 'pointer' }}
      >
        {t(UI.unlock.notNow)}
      </button>
    </div>
  );
}
