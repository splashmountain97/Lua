import MoonMini from './MoonMini';
import { useLang } from '../hooks/useLang';
import { UI } from '../lib/strings';

const DOT_COUNT = 28;

export default function Streak({ streakDays, onBack }: { streakDays: number; onBack: () => void }) {
  const { t } = useLang();
  const litPct = Math.min(0.16, 0.02 + streakDays * 0.008);
  const terminatorStyle: React.CSSProperties = {
    mixBlendMode: 'screen',
    background: `radial-gradient(circle at ${22 + streakDays * 1.4}% 24%, rgba(214,222,240,${litPct.toFixed(3)}) 0%, rgba(214,222,240,0) 48%)`,
  };

  return (
    <div style={{ position: 'absolute', inset: 0, padding: '104px 32px 56px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ font: '500 10px/1 ui-monospace,Menlo,monospace', letterSpacing: '.16em', textTransform: 'uppercase', color: '#9397ab', margin: '0 0 30px' }}>
        {t(UI.streak.kicker)}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 11, margin: '0 0 8px' }}>
        <span style={{ font: '300 62px/1 Inter,sans-serif', letterSpacing: '-.04em', color: '#f0eef2' }}>{streakDays}</span>
        <span style={{ font: '400 14px/1 Inter,sans-serif', color: '#9397ab' }}>{t(UI.streak.inARow(streakDays))}</span>
      </div>
      <p style={{ font: '400 13px/1.62 Inter,sans-serif', color: '#9397ab', margin: '0 0 40px', maxWidth: 290 }}>
        {t(UI.streak.body)}
      </p>
      <div style={{ position: 'relative', width: 210, height: 210, margin: '0 auto 34px' }}>
        <MoonMini size={210} driftDur={16} swirlDur={24} glowAlpha={0.26} terminatorStyle={terminatorStyle} />
      </div>
      <div style={{ display: 'flex', gap: 5, justifyContent: 'center', margin: '0 0 auto' }}>
        {Array.from({ length: DOT_COUNT }, (_, i) => (
          <span key={i} style={{
            display: 'block', width: 4, height: 4, borderRadius: '50%',
            background: i < streakDays ? 'rgba(181,171,252,.72)' : 'rgba(147,151,171,.18)',
          }} />
        ))}
      </div>
      <button
        type="button" onClick={onBack}
        style={{
          width: '100%', padding: 14, borderRadius: 100, cursor: 'pointer',
          border: '1px solid rgba(145,132,217,.34)', background: 'none',
          color: '#b5abfc', font: '400 14px/1 Inter,sans-serif',
        }}
      >
        {t(UI.streak.back)}
      </button>
    </div>
  );
}
