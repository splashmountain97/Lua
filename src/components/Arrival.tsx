import AstronautBust from './AstronautBust';

/**
 * The beat before a question someone was sent.
 *
 * A shared link used to open straight onto the question, which is correct and
 * also slightly cold: the question arrives with no sign that a person chose it
 * and sent it. This says that, once, and gets out of the way — the whole moment
 * is one line and a tap.
 *
 * It is not a screen anyone can return to, and nothing is stored about having
 * seen it. Tapping anywhere goes on to the question itself, in the ordinary
 * reveal treatment, so the thing they were sent looks exactly like the thing
 * the app gives anyone.
 */
export default function Arrival({ onContinue }: { onContinue: () => void }) {
  return (
    <div
      onPointerDown={onContinue}
      style={{
        position: 'absolute', inset: 0, zIndex: 20, cursor: 'pointer',
        // Its own ground, and not for looks. The bust is lightened into
        // whatever is behind it so the drawing has no rectangle around it, and
        // a z-index makes this element the backdrop that blending sees — with
        // nothing painted here it blends into transparency and the cutout
        // reappears. The stage's own gradient, so nothing shifts underfoot.
        background: 'radial-gradient(120% 80% at 50% 34%, #1c1e2e 0%, #161826 46%, #0f101a 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '0 40px',
      }}
    >
      {/* Centred by the flex column above rather than by a transform. A
          transform makes its own stacking context, and the bust is lightened
          into what is behind it — inside one, 'behind it' is nothing, and the
          drawing comes back with its rectangle on. */}
      <div>
        <AstronautBust size={78} />
        <div style={{
          margin: '26px 0 0', textAlign: 'center',
          font: '400 17px/1.5 Inter,sans-serif', letterSpacing: '-.008em', color: '#f0eef2',
          animation: 'lua-rise .5s cubic-bezier(.33,1,.68,1) both',
        }}>Someone thought of you 🌙</div>
        <div style={{
          margin: '14px 0 0', textAlign: 'center',
          font: '400 11px/1.5 ui-monospace,Menlo,monospace', letterSpacing: '.06em',
          color: 'rgba(147,151,171,.9)',
          animation: 'lua-hint 5.2s ease-in-out infinite',
        }}>Tap to read it.</div>
      </div>
    </div>
  );
}
