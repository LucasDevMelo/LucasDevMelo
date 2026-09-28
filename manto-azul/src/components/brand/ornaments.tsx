import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

/** Original, abstract Marian symbols. No third-party imagery. */

export function MantleMark(props: P) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <path d="M24 9C16.5 16.5 13 26.5 13 41h22c0-14.5-3.5-24.5-11-32Z" fill="currentColor" opacity="0.9" />
      <path d="M24 9c-4.2 7.4-5.8 17.4-5.8 32h11.6c0-14.6-1.6-24.6-5.8-32Z" fill="currentColor" opacity="0.55" />
      <path d="M17.5 10.5 19.6 6l4.4 3.2L28.4 6l2.1 4.5h-13Z" fill="#d9b86c" />
      <circle cx="24" cy="17.5" r="2.2" fill="#f6edd8" />
    </svg>
  );
}

export function Sparkle(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CrownOrnament(props: P) {
  return (
    <svg viewBox="0 0 160 110" fill="none" aria-hidden="true" {...props}>
      <path
        d="M22 78 14 30l32 24 34-40 34 40 32-24-8 48H22Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path d="M22 88h116" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M28 97h104" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="14" cy="26" r="5" fill="currentColor" />
      <circle cx="80" cy="9" r="6" fill="currentColor" />
      <circle cx="146" cy="26" r="5" fill="currentColor" />
      <circle cx="46" cy="50" r="3" fill="currentColor" opacity="0.8" />
      <circle cx="114" cy="50" r="3" fill="currentColor" opacity="0.8" />
      <path d="M80 44l6 10-6 10-6-10 6-10Z" fill="currentColor" />
      <circle cx="54" cy="70" r="3.5" fill="currentColor" opacity="0.7" />
      <circle cx="106" cy="70" r="3.5" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function RaysOrnament(props: P) {
  const rays = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden="true" {...props}>
      <circle cx="100" cy="100" r="30" fill="currentColor" fillOpacity="0.12" />
      <circle cx="100" cy="100" r="44" stroke="currentColor" strokeOpacity="0.35" />
      <circle cx="100" cy="100" r="62" stroke="currentColor" strokeOpacity="0.2" strokeDasharray="2 6" />
      {rays.map((deg, i) => (
        <line
          key={deg}
          x1="100"
          y1={i % 2 ? 44 : 36}
          x2="100"
          y2={i % 2 ? 22 : 8}
          stroke="currentColor"
          strokeOpacity={i % 2 ? 0.35 : 0.6}
          strokeWidth="1.5"
          strokeLinecap="round"
          transform={`rotate(${deg} 100 100)`}
        />
      ))}
      <path d="M100 78c2 11 11 20 22 22-11 2-20 11-22 22-2-11-11-20-22-22 11-2 20-11 22-22Z" fill="currentColor" />
    </svg>
  );
}

export function RoseOrnament(props: P) {
  return (
    <svg viewBox="0 0 200 120" fill="none" aria-hidden="true" {...props}>
      <path
        d="M100 88C84 70 40 64 12 80M100 88c16-18 60-24 88-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path d="M46 72c-6-10 2-18 10-14-2 8-4 12-10 14ZM154 72c6-10-2-18-10-14 2 8 4 12 10 14Z" fill="currentColor" opacity="0.55" />
      <circle cx="100" cy="56" r="26" fill="currentColor" fillOpacity="0.14" />
      <path
        d="M100 34c10 0 18 8 18 18 0 12-9 22-18 22s-18-10-18-22c0-10 8-18 18-18Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M92 48c4-6 12-6 16 0-2 8-14 8-16 0Z" stroke="currentColor" strokeWidth="2" />
      <path d="M86 58c6 6 22 6 28 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M100 74v24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Divider(props: P) {
  return (
    <svg viewBox="0 0 240 16" fill="none" aria-hidden="true" {...props}>
      <path d="M0 8h100M140 8h100" stroke="currentColor" strokeOpacity="0.5" />
      <path d="M120 0c.5 4.2 3.8 7.5 8 8-4.2.5-7.5 3.8-8 8-.5-4.2-3.8-7.5-8-8 4.2-.5 7.5-3.8 8-8Z" fill="currentColor" />
      <circle cx="104" cy="8" r="1.5" fill="currentColor" />
      <circle cx="136" cy="8" r="1.5" fill="currentColor" />
    </svg>
  );
}
