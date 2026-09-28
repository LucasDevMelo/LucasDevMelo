import { CrownOrnament, RaysOrnament, RoseOrnament } from "@/components/brand/ornaments";
import type { TemplateDefinition } from "@/lib/templates";
import { cn } from "@/lib/utils";

export function TemplateOrnament({
  ornament,
  className,
}: {
  ornament: TemplateDefinition["ornament"];
  className?: string;
}) {
  const base = cn("text-[var(--t-accent)]", className);
  if (ornament === "crown") return <CrownOrnament className={cn("w-28 @md:w-36", base)} />;
  if (ornament === "rays") return <RaysOrnament className={cn("w-32 @md:w-40", base)} />;
  return <RoseOrnament className={cn("w-36 @md:w-44", base)} />;
}
