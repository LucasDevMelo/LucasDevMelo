"use client";

import { Check, Copy, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  url: string;
  recipientName: string;
  className?: string;
}

export function ShareButtons({ url, recipientName, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const text = `Fiz uma homenagem especial para você, ${recipientName}, neste Dia de Nossa Senhora Aparecida 💙`;

  async function copy(source: string) {
    track("share_clicked", { method: source });
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for older browsers / insecure contexts.
      const input = document.createElement("textarea");
      input.value = url;
      input.setAttribute("readonly", "");
      input.style.position = "absolute";
      input.style.left = "-9999px";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function share() {
    if (typeof navigator.share === "function") {
      try {
        track("share_clicked", { method: "web_share" });
        await navigator.share({ title: "Uma homenagem para você", text, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await copy("share_fallback_copy");
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;

  return (
    <div className={cn("grid gap-3", className)}>
      <Button size="lg" onClick={share} className="w-full">
        <Share2 aria-hidden="true" /> Compartilhar
      </Button>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" size="lg" onClick={() => copy("copy_link")} className="w-full px-3">
          {copied ? <Check className="text-green-700" aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? "Copiado!" : "Copiar link"}
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full px-3">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => track("share_clicked", { method: "whatsapp" })}>
            <MessageCircle aria-hidden="true" /> WhatsApp
          </a>
        </Button>
      </div>
      <p className="sr-only" aria-live="polite">
        {copied ? "Link copiado para a área de transferência" : ""}
      </p>
    </div>
  );
}
