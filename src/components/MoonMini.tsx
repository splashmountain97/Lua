import moonBody from '../assets/moon-body.png';
import glassSwirl from '../assets/glass-swirl.png';

interface MoonMiniProps {
  size: number;
  driftDur: number;
  swirlDur: number;
  glowAlpha: number;
  breatheDur?: number;
  terminatorStyle?: React.CSSProperties;
}

// The decorative (non-interactive) moon used on Welcome / Streak / Unlock —
// same two assets as the interactive object on Home, always turning, never
// perfectly still (a Nocturne rule: "minimum one slow loop, 14s or longer").
export default function MoonMini({ size, driftDur, swirlDur, glowAlpha, breatheDur, terminatorStyle }: MoonMiniProps) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <img
        src={moonBody} alt=""
        style={{ width: '100%', height: '100%', display: 'block', animation: `lua-drift ${driftDur}s ease-in-out infinite` }}
      />
      {terminatorStyle && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none', ...terminatorStyle }} />}
      <div style={{ position: 'absolute', left: '42.94%', top: '17.82%', width: '34.8%', height: '34.8%', borderRadius: '50%', overflow: 'hidden' }}>
        <img
          src={glassSwirl} alt=""
          style={{ position: 'absolute', left: '-8%', top: '-8%', width: '116%', height: '116%', animation: `lua-swirl ${swirlDur}s linear infinite`, filter: 'blur(.7px)' }}
        />
      </div>
      <div style={{
        position: 'absolute', left: '42.94%', top: '17.82%', width: '34.8%', height: '34.8%', borderRadius: '50%',
        boxShadow: `inset 0 2px 5px rgba(233,237,245,.2), inset 0 -8px 15px rgba(0,0,0,.6), 0 0 30px 6px rgba(142,63,168,${glowAlpha})`,
        animation: breatheDur ? `lua-breathe ${breatheDur}s ease-in-out infinite` : undefined,
      }} />
    </div>
  );
}
