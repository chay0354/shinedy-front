import { useState } from 'react';

export default function Button({
  loading: loadingProp,
  loadingText,
  children,
  onClick,
  disabled,
  className = '',
  type = 'button',
  ...rest
}) {
  const [pending, setPending] = useState(false);
  const loading = loadingProp ?? pending;

  function handleClick(e) {
    if (loading || disabled) return;
    if (!onClick) return;
    const result = onClick(e);
    if (result != null && typeof result.then === 'function') {
      setPending(true);
      result.finally(() => setPending(false));
    }
  }

  const label = loading && loadingText != null ? loadingText : children;

  return (
    <button
      type={type}
      className={[className, loading && 'is-loading'].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="btn-spinner" aria-hidden="true" /> : null}
      <span className="btn-label">{label}</span>
    </button>
  );
}
