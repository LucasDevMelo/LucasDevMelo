"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS } from "./wizard-steps";

interface WizardProgressProps {
  current: number;
  maxReached: number;
  onJump: (index: number) => void;
}

export function WizardProgress({ current, maxReached, onJump }: WizardProgressProps) {
  const percent = ((current + 1) / WIZARD_STEPS.length) * 100;
  return (
    <nav aria-label="Etapas da criação" className="w-full">
      <div className="flex items-center justify-between text-sm">
        <p className="font-medium text-navy-900">
          Etapa {current + 1} de {WIZARD_STEPS.length}
          <span className="text-ink-400"> · {WIZARD_STEPS[current].label}</span>
        </p>
        <p className="text-ink-400">{Math.round(percent)}%</p>
      </div>
      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-navy-900/8"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={WIZARD_STEPS.length}
        aria-valuenow={current + 1}
        aria-label="Progresso"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-marian-600 to-gold-500 transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <ol className="mt-4 hidden justify-between gap-1 sm:flex">
        {WIZARD_STEPS.map((step, i) => {
          const done = i < current;
          const reachable = i <= maxReached && i !== current;
          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onJump(i)}
                aria-current={i === current ? "step" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition",
                  i === current && "bg-navy-900 text-white",
                  i !== current && reachable && "text-navy-900 hover:bg-navy-900/5",
                  !reachable && i !== current && "text-ink-400",
                )}
              >
                {done ? <Check className="size-3.5" aria-hidden="true" /> : <span aria-hidden="true">{i + 1}.</span>}
                {step.label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
