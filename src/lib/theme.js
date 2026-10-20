export const PALETTES = [
  { id: 'high-end', label: 'High-end', colors: ['#E2D9D0', '#F4F1EC', '#0B282C'] },
  { id: 'warm', label: 'Warm', colors: ['#D9B47A', '#ECE5DD', '#1E1711'] },
  { id: 'classic', label: 'Classic', colors: ['#4C4747', '#917F59', '#F9F9F8'] },
];

const DEFAULT_PALETTE = 'high-end';
const THEME_KEY = 'shinedy-palette';
const PICKER_KEY = 'shinedy-palette-picker';

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
}

function known(id) {
  return PALETTES.some((p) => p.id === id) ? id : DEFAULT_PALETTE;
}

/** A stored choice only counts while the review picker is on; everyone else sees the default. */
export function currentPalette() {
  return read(PICKER_KEY) === '1' ? known(read(THEME_KEY)) : DEFAULT_PALETTE;
}

export function applyPalette(id) {
  const palette = known(id);
  if (palette === DEFAULT_PALETTE) document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', palette);
  write(THEME_KEY, palette === DEFAULT_PALETTE ? null : palette);
  return palette;
}

/** The picker is for reviewing palettes; `?palette=1` turns it on, `?palette=0` off. */
export function pickerEnabled() {
  const flag = new URLSearchParams(window.location.search).get('palette');
  if (flag === '1') write(PICKER_KEY, '1');
  if (flag === '0') {
    write(PICKER_KEY, null);
    applyPalette(DEFAULT_PALETTE);
  }
  return read(PICKER_KEY) === '1';
}
