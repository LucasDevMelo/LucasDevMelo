import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { LocalDemoNotice } from "@/components/layout/local-demo-notice";
import { productConfig } from "@/config/product";

export const metadata: Metadata = { title: "Privacidade" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de privacidade" updatedAt="versão preliminar">
      <LocalDemoNotice>
        <strong className="font-semibold">Documento provisório.</strong> A política definitiva, adequada à LGPD, será
        publicada antes do lançamento oficial.
      </LocalDemoNotice>
      <h2>Como seus dados são tratados nesta versão</h2>
      <ul>
        <li>Fotos, nomes e mensagens ficam salvos apenas no armazenamento local (localStorage) do seu navegador.</li>
        <li>Nenhuma informação é enviada para servidores, bancos de dados ou serviços externos.</li>
        <li>As fotos são reduzidas e comprimidas no próprio aparelho antes de serem salvas.</li>
        <li>Eventos de uso anônimos (ex.: “prévia visualizada”) também ficam apenas no seu navegador.</li>
      </ul>
      <h2>Como apagar seus dados</h2>
      <p>
        Você pode apagar o rascunho a qualquer momento pelo botão “Começar novamente” na criação da homenagem, ou
        limpar todos os dados do site nas configurações do seu navegador.
      </p>
      <h2>Na versão oficial</h2>
      <p>
        Quando a homenagem passar a ser hospedada online, informaremos claramente quais dados são armazenados, por
        quanto tempo, e como solicitar a exclusão, conforme a Lei Geral de Proteção de Dados (LGPD).
      </p>
      <h2>Contato</h2>
      <p>{productConfig.supportEmail}</p>
    </LegalPage>
  );
}
