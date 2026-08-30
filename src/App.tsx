import Stage from './components/Stage';
import Welcome from './components/Welcome';
import Home from './components/Home';
import Streak from './components/Streak';
import Unlock from './components/Unlock';
import { EASE_IN, EASE_OUT, PHASES } from './lib/phases';
import { useLua } from './hooks/useLua';

export default function App() {
  const lua = useLua();
  const { state, streakDays, actions } = lua;

  // On the screens the stage can't fill — too short for the composition, too
  // wide to blow the design up — the home vignette would darken the canvas and
  // leave the margin behind it lit, redrawing the frame it was meant to remove.
  // Hand the stage the same darkening so the margin follows it down.
  const spec = PHASES[state.phase];
  const onHome = state.screen === 'home';

  return (
    <Stage
      dim={onHome ? spec.vig : 0}
      dimTransition={`opacity ${Math.round(spec.dur * 0.85)}ms ${state.phase === 'reveal' ? EASE_IN : EASE_OUT}`}
      onPointerDown={actions.onDown}
      onPointerMove={actions.onMove}
      onPointerUp={actions.onUp}
    >
      {state.screen === 'onboard1' && <Welcome onPickItUp={actions.askMotion} />}
      {onHome && <Home lua={lua} />}
      {state.screen === 'streak' && <Streak streakDays={streakDays} onBack={actions.goHome} />}
      {state.screen === 'unlock' && (
        <Unlock unlocked={state.unlocked} onUnlock={actions.doUnlock} onNotNow={actions.goHome} />
      )}
    </Stage>
  );
}
