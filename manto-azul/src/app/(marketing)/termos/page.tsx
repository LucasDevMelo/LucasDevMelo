import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { LocalDemoNotice } from "@/components/layout/local-demo-notice";
import { productConfig } from "@/config/product";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Termos de uso" };

export default function TermsPage() {
  return (
    <LegalPage title="Termos de uso" updatedAt="versão preliminar">
      <LocalDemoNotice>
        <strong className="font-semibold">Documento provisório.</strong> Estes termos são um rascunho para a versão
        de demonstração e serão revisados antes do lançamento oficial.
      </LocalDemoNotice>
      <h2>1. O serviço</h2>
      <p>
        O {productConfig.productName} permite criar páginas digitais personalizadas (“homenagens”) com nome, fotos e
        mensagem, para presentear alguém no {productConfig.eventName}. O produto é uma homenagem digital: não
        oferecemos, prometemos ou garantimos qualquer resultado religioso ou espiritual.
      </p>
      <h2>2. Conteúdo enviado</h2>
      <p>
        Você é responsável pelas fotos e textos que adiciona e declara ter autorização para usá-los. Não é permitido
        publicar conteúdo ofensivo, ilegal ou que viole direitos de terceiros.
      </p>
      <h2>3. Pagamento</h2>
      <p>
        O valor de cada homenagem é {formatPrice()}, em {productConfig.paymentLabel.toLowerCase()}. Na versão de
        demonstração, o pagamento é apenas simulado e nenhuma cobrança é realizada.
      </p>
      <h2>4. Disponibilidade</h2>
      <p>
        O prazo de disponibilidade das homenagens será informado antes da compra na versão oficial. Na versão de
        demonstração, os dados ficam somente no navegador de quem criou a homenagem.
      </p>
      <h2>5. Contato</h2>
      <p>Dúvidas: {productConfig.supportEmail}.</p>
    </LegalPage>
  );
}
