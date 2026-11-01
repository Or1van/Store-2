type IconProps = { size?: number };

export function ArrowUpRight({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 11 11 3M4.5 3H11v6.5" />
    </svg>
  );
}

export function BagIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M5 8h14l-1.2 12H6.2L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

/** The shop mark: a coat hanger. */
export function HangerMark({ size = 30 }: IconProps) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 40 28" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 6.5a4 4 0 1 1 5.6 3.7c-1 .4-1.6 1.3-1.6 2.3v1.2" />
      <path d="M20 13.7 3 24.5h34L20 13.7Z" />
    </svg>
  );
}
