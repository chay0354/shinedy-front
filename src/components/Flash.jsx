import { useApp } from '../state/AppContext';
import { api } from '../api';

export default function Flash() {
  const { state, run, setError } = useApp();
  if (!state?.flash) return null;

  function dismiss() {
    setError(null);
    void run(() => api.clearFlash());
  }

  return (
    <div className="flash" onClick={dismiss} style={{ cursor: 'pointer' }}>
      {state.flash}
    </div>
  );
}
