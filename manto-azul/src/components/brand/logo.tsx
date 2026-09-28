import Link from "next/link";
import { productConfig } from "@/config/product";
import { cn } from "@/lib/utils";
import { MantleMark } from "./ornaments";

export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Link
      href="/"
      aria-label={`${productConfig.productName} — página inicial`}
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <MantleMark className={cn("size-8", tone === "dark" ? "text-marian-600" : "text-marian-500")} />
      <span
        className={cn(
          "font-serif text-[1.45rem] font-semibold tracking-tight",
          tone === "dark" ? "text-navy-900" : "text-cream-50",
        )}
      >
        {productConfig.productName}
      </span>
    </Link>
  );
}
