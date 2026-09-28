import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  tone = "dark",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      <p className={cn("text-xs font-semibold uppercase tracking-[0.25em]", tone === "dark" ? "text-gold-600" : "text-gold-300")}>
        {eyebrow}
      </p>
      <h2
        className={cn(
          "mt-4 text-balance font-serif text-4xl font-semibold leading-tight sm:text-5xl",
          tone === "dark" ? "text-navy-900" : "text-cream-50",
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn("mt-4 text-pretty text-lg", tone === "dark" ? "text-ink-600" : "text-cream-100/75")}>
          {description}
        </p>
      )}
    </div>
  );
}
