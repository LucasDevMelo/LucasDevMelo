import { Mail } from "lucide-react";
import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { Button } from "@/components/ui/button";
import { productConfig } from "@/config/product";

export const metadata: Metadata = { title: "Contato" };

export default function ContactPage() {
  return (
    <LegalPage title="Fale com a gente">
      <p className="text-lg">
        Ficou com alguma dúvida sobre sua homenagem ou tem uma sugestão? Escreva para nós — respondemos com carinho.
      </p>
      <Button asChild size="lg">
        <a href={`mailto:${productConfig.supportEmail}`}>
          <Mail /> {productConfig.supportEmail}
        </a>
      </Button>
    </LegalPage>
  );
}
