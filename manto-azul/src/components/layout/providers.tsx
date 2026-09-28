"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  // Honors the OS "reduce motion" setting for every framer-motion animation.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
