import { Section } from '@/components/ui'

const TERMS = [
  [
    'O que você está comprando',
    'Uma entrada no R$1K CLUB: um número de membro único e sequencial, um perfil público, um certificado digital e o direito de aparecer no ranking. É um produto de status e colecionável digital. Não é investimento, não rende, não promete retorno financeiro e não dá direito a nenhum bem físico.',
  ],
  [
    'Pagamento',
    'Cobrança única, processada pelo Mercado Pago (Pix, boleto ou cartão). Não guardamos dados de cartão. O acesso é liberado somente após a confirmação do pagamento pelo provedor — nunca com base em qualquer ação feita no navegador. Pagamentos por boleto podem levar até 3 dias úteis para compensar; o número de membro é atribuído na confirmação, não na emissão do boleto.',
  ],
  [
    'Número de membro',
    'O número é atribuído no servidor, em ordem de confirmação de pagamento, e é definitivo. Não é possível escolher, trocar ou transferir um número.',
  ],
  [
    'Reembolso',
    'Compras feitas à distância seguem o direito de arrependimento previsto no Código de Defesa do Consumidor: 7 dias corridos a partir da compra. Após o reembolso, a membership é encerrada e o perfil sai dos rankings públicos. O número não retorna para a fila.',
  ],
  [
    'Conduta',
    'Podemos bloquear contas com nome, username ou avatar ofensivos, que se passem por terceiros ou que tentem manipular o sistema de indicações. Bloqueio por fraude não gera reembolso.',
  ],
  [
    'O que é público',
    'Ficam públicos: nome de exibição, username, número de membro, nível, valor pago, data de entrada, badges e número de indicações. Seu e-mail nunca é público.',
  ],
]

const PRIVACY = [
  [
    'Dados que coletamos',
    'Nome de exibição, username e e-mail (fornecidos por você) e dados de pagamento processados pelo Mercado Pago — recebemos apenas o identificador, o valor e o status da transação, nunca o número do cartão.',
  ],
  [
    'Como usamos',
    'Para criar sua conta, emitir o certificado, exibir seu perfil público e enviar comunicações sobre a sua compra.',
  ],
  [
    'Analytics',
    'Usamos PostHog para medir o funil (visita → checkout → compra) e a origem do tráfego. A coleta é de eventos de produto, sem captura automática de conteúdo digitado.',
  ],
  [
    'Seus direitos (LGPD)',
    'Você pode pedir acesso, correção, portabilidade ou exclusão dos seus dados. A exclusão remove seu perfil público; o registro contábil do pagamento é mantido pelo prazo legal.',
  ],
  [
    'Contato',
    'Para qualquer pedido relativo aos seus dados, escreva para o e-mail de suporte informado no rodapé do seu recibo.',
  ],
]

export function Terms() {
  return <LegalPage title="Termos de uso" sections={TERMS} />
}

export function Privacy() {
  return <LegalPage title="Privacidade" sections={PRIVACY} />
}

function LegalPage({ title, sections }: { title: string; sections: string[][] }) {
  return (
    <Section className="max-w-2xl">
      <h1 className="font-display text-4xl">{title}</h1>
      <p className="mt-3 text-xs text-white/30">
        Modelo inicial. Revise com apoio jurídico antes de operar com pagamentos reais.
      </p>

      <div className="mt-12 flex flex-col gap-10">
        {sections.map(([heading, body]) => (
          <div key={heading}>
            <h2 className="font-display text-xl text-gold-100">{heading}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/50">{body}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
