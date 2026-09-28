"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PhoneFrame({
  children,
  className,
  screenClassName,
  label = "Pré-visualização no celular",
}: {
  children: ReactNode;
  className?: string;
  screenClassName?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[380px] rounded-[48px] border-[10px] border-navy-950 bg-navy-950 shadow-lifted",
        className,
      )}
    >
      <div aria-hidden="true" className="absolute left-1/2 top-2 z-20 h-6 w-28 -translate-x-1/2 rounded-full bg-navy-950" />
      <div
        role="region"
        aria-label={label}
        tabIndex={0}
        className={cn("relative h-[720px] max-h-[75svh] overflow-y-auto overflow-x-hidden rounded-[38px] bg-white", screenClassName)}
      >
        {children}
      </div>
    </div>
  );
}

const DESKTOP_WIDTH = 1280;

/** Renders children at a real desktop width and scales it down to fit. */
export function BrowserFrame({ children, url }: { children: ReactNode; url: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / DESKTOP_WIDTH));
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const viewportHeight = 760;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-lifted">
      <div className="flex items-center gap-2 border-b border-navy-900/10 bg-cream-100 px-4 py-3">
        <span className="size-3 rounded-full bg-[#ec6a5e]" aria-hidden="true" />
        <span className="size-3 rounded-full bg-[#f4bf4f]" aria-hidden="true" />
        <span className="size-3 rounded-full bg-[#61c554]" aria-hidden="true" />
        <span className="ml-3 truncate rounded-full bg-white px-4 py-1 text-xs text-ink-600">{url}</span>
      </div>
      <div ref={hostRef} className="w-full" style={{ height: viewportHeight * scale }}>
        <div
          role="region"
          aria-label="Pré-visualização no computador"
          tabIndex={0}
          className="origin-top-left overflow-y-auto overflow-x-hidden"
          style={{ width: DESKTOP_WIDTH, height: viewportHeight, transform: `scale(${scale})` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
