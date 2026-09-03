import astronaut from '../assets/onboard-astronaut-2048.jpg';
import glassSwirl from '../assets/glass-swirl.png';

/**
 * The prologue's astronaut, cropped to the bust and standing still.
 *
 * The drawing is graphite on cream. Inverted it becomes white line on
 * near-black, and lightened into whatever it sits on, the near-black drops out
 * — so there is no cutout to cut and no rectangle edge to hide. The visor holds
 * the same swirl the moon carries, which is what makes it the same object
 * rather than a picture of one.
 *
 * Never animated here. The swirl turning is the moon being alive; this is a
 * small still portrait, and it appears in places that are already saying
 * something.
 */
export default function AstronautBust({ size = 70, ground }: { size?: number; ground?: string }) {
  const visor: React.CSSProperties = {
    position: 'absolute', left: '44.3%', top: '37.4%', width: '59.6%', height: '49.1%',
    transform: 'translate(-50%,-50%)', borderRadius: '50%',
  };
  return (
    <div style={{
      width: size, height: Math.round(size * 78 / 70), position: 'relative',
      margin: '0 auto', mixBlendMode: 'lighten', background: ground,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${astronaut})`,
        backgroundSize: '340% auto', backgroundPosition: '52.3% 42.7%',
        filter: 'invert(1) grayscale(1) brightness(.92) contrast(1.08)',
      }} />
      <div style={{
        ...visor, overflow: 'hidden',
        background: 'radial-gradient(120% 120% at 34% 24%, #2a1c3f 0%, #150e22 70%, #0d0916 100%)',
      }}>
        <img src={glassSwirl} alt="" style={{
          position: 'absolute', left: '-9%', top: '-9%', width: '118%', height: '118%',
          filter: 'blur(.5px) saturate(.95) brightness(.92)',
        }} />
      </div>
      <div style={{
        ...visor,
        boxShadow: 'inset 0 3px 8px rgba(233,237,245,.22), inset 0 -10px 18px rgba(0,0,0,.6), inset 0 0 0 1px rgba(233,237,245,.08)',
      }} />
    </div>
  );
}
