// אייקוני קו דקים בסגנון המוקאפים — stroke יחיד, ללא מילוי
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const Svg = ({ children, size = 26 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base} aria-hidden="true">{children}</svg>
)

export const IconDiamond = (p) => (
  <Svg {...p}><path d="M7 3h10l4 6-9 12L3 9l4-6Z" /><path d="M3 9h18M9.5 9 12 21 14.5 9M7 3l2.5 6M17 3l-2.5 6" /></Svg>
)

export const IconInfinity = (p) => (
  <Svg {...p}><path d="M8.5 15.5C6.6 15.5 5 13.9 5 12s1.6-3.5 3.5-3.5c3.5 0 3.5 7 7 7 1.9 0 3.5-1.6 3.5-3.5s-1.6-3.5-3.5-3.5c-3.5 0-3.5 7-7 7Z" /></Svg>
)

export const IconCalendar = (p) => (
  <Svg {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="1" /><path d="M3.5 9.5h17M8 2.8v4M16 2.8v4" /></Svg>
)

export const IconTruck = (p) => (
  <Svg {...p}><path d="M2.5 6h11v10h-11zM13.5 9.5H18l3.5 3.5v3h-8" /><circle cx="6.5" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></Svg>
)

export const IconShield = (p) => (
  <Svg {...p}><path d="M12 3 5 5.5v5.2c0 4.4 3 7.6 7 9.3 4-1.7 7-4.9 7-9.3V5.5L12 3Z" /><path d="m9 11.5 2.2 2.2L15.5 9" /></Svg>
)

export const IconRefresh = (p) => (
  <Svg {...p}><path d="M4.5 12a7.5 7.5 0 0 1 13-5.1L20 9.5M19.5 12a7.5 7.5 0 0 1-13 5.1L4 14.5" /><path d="M20 4.5v5h-5M4 19.5v-5h5" /></Svg>
)

export const IconSparkle = (p) => (
  <Svg {...p}><path d="M12 3c.6 3.9 2.1 5.4 6 6-3.9.6-5.4 2.1-6 6-.6-3.9-2.1-5.4-6-6 3.9-.6 5.4-2.1 6-6Z" /><path d="M19 14.5c.3 1.9 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1.1 3-3Z" /></Svg>
)

export const IconUser = (p) => (
  <Svg {...p}><circle cx="12" cy="8" r="3.5" /><path d="M5 20.5c.8-3.8 3.6-5.5 7-5.5s6.2 1.7 7 5.5" /></Svg>
)

export const IconBag = (p) => (
  <Svg {...p}><path d="M5 8h14l-1 12.5H6L5 8Z" /><path d="M8.5 10.5V6.8a3.5 3.5 0 0 1 7 0v3.7" /></Svg>
)

export const IconPhone = (p) => (
  <Svg {...p}><path d="M7.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 5 5l1.5-2 4 1.5v3c0 1-.8 1.9-1.9 1.8C10.9 17.6 6.4 13.1 5.7 5.4a1.8 1.8 0 0 1 1.8-1.9Z" /></Svg>
)

export const IconMail = (p) => (
  <Svg {...p}><rect x="3" y="5.5" width="18" height="13" rx="1" /><path d="m3.5 6.5 8.5 6 8.5-6" /></Svg>
)

export const IconClock = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2.5" /></Svg>
)

export const IconBox = (p) => (
  <Svg {...p}><path d="m12 3 8 4v10l-8 4-8-4V7l8-4Z" /><path d="m4.5 7.3 7.5 3.7 7.5-3.7M12 11v9" /></Svg>
)

export const IconNecklace = (p) => (
  <Svg {...p}><path d="M4 4c1.5 6 5 8.5 8 8.5s6.5-2.5 8-8.5" /><path d="m12 12.5-1.8 2.5 1.8 3 1.8-3-1.8-2.5Z" /></Svg>
)

export const IconList = (p) => (
  <Svg {...p}><rect x="4" y="3.5" width="16" height="17" rx="1" /><path d="M8 8h8M8 12h8M8 16h5" /></Svg>
)

export { default as JewelArt } from './JewelArt.jsx'
