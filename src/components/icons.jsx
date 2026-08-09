/* Thin line icons matching the boutique design language. */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function IconBag(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export function IconDiamond(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M6 3h12l4 6-10 12L2 9Z" />
      <path d="M2 9h20" />
      <path d="M12 21 8 9l2-6" />
      <path d="m12 21 4-12-2-6" />
    </svg>
  );
}

export function IconCalendar(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </svg>
  );
}

export function IconTruck(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M3 16V6a1 1 0 0 1 1-1h10v11" />
      <path d="M14 9h4l3 3v4h-7" />
      <circle cx="7.5" cy="17.5" r="2" />
      <circle cx="17.5" cy="17.5" r="2" />
    </svg>
  );
}

export function IconRefresh(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 4v4h-4M3 20v-4h4" />
    </svg>
  );
}

export function IconPhone(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </svg>
  );
}

export function IconNecklace(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M5 4c0 6 3 9 7 9s7-3 7-9" />
      <path d="m12 13-2 3 2 4 2-4Z" />
    </svg>
  );
}

export function IconBox(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="m3 8 9-5 9 5v8l-9 5-9-5Z" />
      <path d="m3 8 9 5 9-5M12 13v8" />
    </svg>
  );
}

export function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="m4 12 5 5L20 6" />
    </svg>
  );
}

export function IconChevron(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconMail(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  );
}

export function IconPin(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function IconInstagram(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

export function IconFacebook(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2Z" />
    </svg>
  );
}

export function IconHeart(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 20s-7-4.6-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.4 12 20 12 20Z" />
    </svg>
  );
}

export function IconShield(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 3 5 6v6c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconSparkle(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
      <path d="m6.5 6.5 3 3M14.5 14.5l3 3M17.5 6.5l-3 3M9.5 14.5l-3 3" />
    </svg>
  );
}

export function IconRing(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="12" cy="15" r="6" />
      <path d="m9 6 1.5-3h3L15 6l-3 3Z" />
    </svg>
  );
}

/* Decorative artwork used in image placeholders. */
export function JewelArt({ variant = 'ring', ...props }) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.1, strokeLinejoin: 'round' };
  if (variant === 'necklace') {
    return (
      <svg viewBox="0 0 120 120" {...props}>
        <path d="M28 26c0 30 14 46 32 46s32-16 32-46" {...stroke} />
        <path d="m60 72-8 12 8 16 8-16Z" {...stroke} />
        <path d="M52 84h16" {...stroke} opacity="0.55" />
      </svg>
    );
  }
  if (variant === 'earring') {
    return (
      <svg viewBox="0 0 120 120" {...props}>
        <circle cx="44" cy="34" r="9" {...stroke} />
        <path d="M44 43v22" {...stroke} />
        <path d="m44 65-9 13 9 16 9-16Z" {...stroke} />
        <circle cx="80" cy="34" r="9" {...stroke} />
        <path d="M80 43v22" {...stroke} />
        <path d="m80 65-9 13 9 16 9-16Z" {...stroke} />
      </svg>
    );
  }
  if (variant === 'bracelet') {
    return (
      <svg viewBox="0 0 120 120" {...props}>
        <ellipse cx="60" cy="60" rx="38" ry="24" {...stroke} />
        <ellipse cx="60" cy="60" rx="27" ry="15" {...stroke} opacity="0.5" />
        <path d="m60 30-6 9 6 9 6-9Z" {...stroke} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 120" {...props}>
      <circle cx="60" cy="74" r="28" {...stroke} />
      <circle cx="60" cy="74" r="19" {...stroke} opacity="0.5" />
      <path d="m44 40 8-14h16l8 14-16 18Z" {...stroke} />
      <path d="M44 40h32M52 26l8 32M68 26l-8 32" {...stroke} opacity="0.55" />
    </svg>
  );
}
