import { useState } from 'react';
import { PALETTES, applyPalette, currentPalette, pickerEnabled } from '../lib/theme';

export default function PalettePicker() {
  const [enabled] = useState(pickerEnabled);
  const [active, setActive] = useState(currentPalette);
  if (!enabled) return null;

  return (
    <div className="palette-picker" dir="ltr" role="group" aria-label="בחירת פלטת צבעים">
      {PALETTES.map((p) => (
        <button
          key={p.id}
          type="button"
          className={`palette-option${active === p.id ? ' is-active' : ''}`}
          aria-pressed={active === p.id}
          onClick={() => setActive(applyPalette(p.id))}
        >
          <span className="palette-swatches" aria-hidden="true">
            {p.colors.map((c) => (
              <i key={c} style={{ background: c }} />
            ))}
          </span>
          {p.label}
        </button>
      ))}
    </div>
  );
}
