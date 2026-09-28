import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const fieldBase =
  "w-full rounded-2xl border border-navy-900/12 bg-white px-4 text-base text-ink-900 shadow-[inset_0_1px_2px_rgba(13,31,63,0.04)] placeholder:text-ink-400 transition focus:border-marian-500 focus:outline-none focus:ring-4 focus:ring-marian-500/15 aria-[invalid=true]:border-red-600 aria-[invalid=true]:ring-red-600/10";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldBase, "h-13", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(fieldBase, "min-h-40 py-3.5 leading-relaxed", className)} {...props} />;
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("mb-2 block text-[15px] font-medium text-navy-900", className)} {...props} />;
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-sm text-red-700">
      {message}
    </p>
  );
}

export function FieldHint({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-2 text-sm text-ink-600">
      {children}
    </p>
  );
}
