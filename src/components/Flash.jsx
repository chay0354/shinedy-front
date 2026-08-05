import { useApp } from '../state/AppContext';
import { api } from '../api';

export default function Flash() {
  const { state, run } = useApp();
  if (!state?.flash) return null;
  return (
    <div className="flash" onClick={() => run(() => api.clearFlash())} style={{ cursor: 'pointer' }}>
      {state.flash}
    </div>
  );
}
