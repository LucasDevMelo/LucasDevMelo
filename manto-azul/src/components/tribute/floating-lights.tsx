import { Sparkle } from "@/components/brand/ornaments";

// Deterministic positions (no Math.random during render).
const LIGHTS = [
  { left: 6, top: 92, size: 10, delay: 0, duration: 11 },
  { left: 18, top: 70, size: 6, delay: 2.5, duration: 9 },
  { left: 31, top: 96, size: 8, delay: 5, duration: 12 },
  { left: 47, top: 80, size: 5, delay: 1.2, duration: 10 },
  { left: 58, top: 98, size: 9, delay: 3.8, duration: 13 },
  { left: 71, top: 75, size: 6, delay: 6.1, duration: 9.5 },
  { left: 83, top: 94, size: 11, delay: 0.8, duration: 12.5 },
  { left: 93, top: 82, size: 7, delay: 4.4, duration: 10.5 },
];

const STARS = [
  { left: 8, top: 10, size: 12, delay: 0 },
  { left: 88, top: 14, size: 16, delay: 1.1 },
  { left: 78, top: 36, size: 9, delay: 2.2 },
  { left: 14, top: 44, size: 10, delay: 0.6 },
  { left: 92, top: 62, size: 12, delay: 1.7 },
  { left: 5, top: 74, size: 9, delay: 2.8 },
];

/** Purely decorative light particles and twinkling stars. */
export function FloatingLights({ floating = true, fixed = false }: { floating?: boolean; fixed?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none inset-0 z-0 overflow-hidden ${fixed ? "fixed" : "absolute"}`}
    >
      {STARS.map((s, i) => (
        <Sparkle
          key={`s${i}`}
          className="absolute animate-twinkle text-[var(--t-accent)]"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
        />
      ))}
      {floating &&
        LIGHTS.map((l, i) => (
          <span
            key={`l${i}`}
            className="absolute animate-float rounded-full bg-[var(--t-glow)] blur-[1px]"
            style={{
              left: `${l.left}%`,
              top: `${l.top}%`,
              width: l.size,
              height: l.size,
              animationDelay: `${l.delay}s`,
              animationDuration: `${l.duration}s`,
            }}
          />
        ))}
    </div>
  );
}
