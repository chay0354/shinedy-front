import { useEffect, useState } from 'react';

function prefersStill() {
  if (typeof window === 'undefined') return true;
  const narrow = window.matchMedia('(max-width: 720px)').matches;
  const conn = navigator.connection;
  const slow = ['slow-2g', '2g', '3g'].includes(conn?.effectiveType || '');
  return narrow || Boolean(conn?.saveData) || slow;
}

/** On phones and slow networks, keep the poster and skip the hero video. */
export function usePreferStillMedia() {
  const [still, setStill] = useState(prefersStill);

  useEffect(() => {
    const narrow = window.matchMedia('(max-width: 720px)');
    const update = () => setStill(prefersStill());
    update();
    narrow.addEventListener('change', update);
    return () => narrow.removeEventListener('change', update);
  }, []);

  return still;
}
