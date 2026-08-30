import Stage from './components/Stage';
import Welcome from './components/Welcome';
import Home from './components/Home';
import Streak from './components/Streak';
import Unlock from './components/Unlock';
import { useLua } from './hooks/useLua';

export default function App() {
  const lua = useLua();
  const { state, streakDays, actions } = lua;

  return (
    <Stage onPointerDown={actions.onDown} onPointerMove={actions.onMove} onPointerUp={actions.onUp}>
      {state.screen === 'onboard1' && <Welcome onPickItUp={actions.askMotion} />}
      {state.screen === 'home' && <Home lua={lua} />}
      {state.screen === 'streak' && <Streak streakDays={streakDays} onBack={actions.goHome} />}
      {state.screen === 'unlock' && (
        <Unlock unlocked={state.unlocked} onUnlock={actions.doUnlock} onNotNow={actions.goHome} />
      )}
    </Stage>
  );
}
