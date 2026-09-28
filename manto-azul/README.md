# Manto Azul — Homenagens digitais para o Dia de Nossa Senhora Aparecida

> Nome temporário. Nome, preço, limites e contato ficam em [`src/config/product.ts`](src/config/product.ts).

Micro-SaaS brasileiro para criar **homenagens digitais personalizadas** no Dia de Nossa Senhora Aparecida (12 de outubro). A pessoa escolhe um estilo, adiciona fotos e uma mensagem, e recebe um link exclusivo para enviar pelo WhatsApp para mãe, pai, avós, cônjuge, padrinhos, amigos…

O produto vende uma **homenagem digital personalizada**. Não promete bênçãos, milagres, cura, proteção ou qualquer outro resultado religioso.

Esta é a **V1 100% local**: sem backend, sem banco, sem gateway de pagamento. Os dados ficam no `localStorage` do navegador e o checkout é **simulado**. A arquitetura já separa as interfaces das implementações para facilitar a migração para Supabase + Mercado Pago.

---

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) + React 19 |
| Linguagem | TypeScript (strict) |
| Estilo | Tailwind CSS v4 (tokens em `src/app/globals.css`), container queries |
| Componentes | Primitivos no estilo shadcn/ui (`cva` + `tailwind-merge` + Radix Alert Dialog / Slot) |
| Ícones | lucide-react |
| Animação | framer-motion (respeita `prefers-reduced-motion`) |
| Formulários | React Hook Form + Zod (`@hookform/resolvers`) |
| Persistência | `localStorage`, isolado atrás de repositórios |
| Fontes | Cormorant Garamond (títulos) + Inter (textos) via `next/font` |

## Como instalar e executar

Requisitos: Node.js 20.9+ (testado com Node 22) e npm.

```bash
cd manto-azul
npm install
npm run dev          # http://localhost:3000
```

### Testar no celular (mesma rede Wi-Fi)

```bash
npm run celular      # build + servidor aberto para a rede local na porta 3000
```

Descubra o IP do computador (Windows: `ipconfig` → “Endereço IPv4”; macOS: `ipconfig getifaddr en0`; Linux: `hostname -I`) e abra `http://SEU-IP:3000` no navegador do celular. Se não abrir, libere a porta 3000 no firewall do computador. Em `http://` o botão “Compartilhar” nativo não aparece no celular (exige HTTPS); ele copia o link automaticamente.

Outros comandos:

```bash
npm run lint         # ESLint (config do Next 16)
npx tsc --noEmit     # checagem de tipos
npm run build        # build de produção
npm run start        # servir o build
```

Variáveis de ambiente são opcionais nesta versão (veja `.env.example`).

## Rotas

| Rota | O que é |
| --- | --- |
| `/` | Landing page comercial (hero, como funciona, exemplos, benefícios, preço, FAQ) |
| `/criar` | Wizard em 6 etapas com rascunho automático |
| `/checkout` | Checkout **demonstrativo** (nenhum pagamento real) |
| `/sucesso/[slug]` | Link pronto + compartilhar / copiar / WhatsApp |
| `/homenagem/[slug]` | A homenagem recebida (tela de abertura, mensagem, galeria, assinatura) |
| `/exemplo` | Homenagem fictícia (Maria / Ana). Aceita `?estilo=classico-mariano \| luz-e-fe \| gratidao` |
| `/termos`, `/privacidade`, `/contato` | Páginas institucionais (versão preliminar) |

## Estrutura de pastas

```
src/
├── app/                        # Rotas (App Router)
│   ├── (marketing)/            # Landing + páginas institucionais (com header/footer)
│   ├── criar/  checkout/  sucesso/[slug]/  homenagem/[slug]/  exemplo/
│   ├── layout.tsx              # Fontes, metadata global, MotionConfig
│   ├── icon.svg                # Favicon original
│   └── opengraph-image.tsx     # Imagem OG gerada
├── components/
│   ├── brand/                  # Logo e ornamentos SVG originais (coroa, raios, rosa, estrelas)
│   ├── landing/                # Hero, HowItWorks, Examples, Benefits, Pricing, Faq, FinalCta
│   ├── create/                 # CreateWizard, WizardProgress e steps/*
│   ├── checkout/               # CheckoutView, CheckoutSummary
│   ├── success/                # SuccessView
│   ├── tribute/                # TributeRenderer, OpeningVeil, PhotoGallery, ShareButtons, frames de preview
│   ├── layout/                 # Header, footer, avisos, loaders
│   └── ui/                     # Button, Input/Textarea/Label, ConfirmDialog
├── config/product.ts           # ⭐ Configuração central (nome, preço, limites, data, e-mail)
├── data/demo-tribute.ts        # Fixture fictícia para /exemplo e landing
├── hooks/use-tribute.ts        # Carrega homenagem via repositório
├── lib/
│   ├── repositories/           # ⭐ TributeRepository / DraftRepository + implementações locais
│   ├── payments/               # ⭐ PaymentService + FakePaymentService
│   ├── analytics/              # track() + AnalyticsProvider
│   ├── storage/                # ÚNICO módulo que toca no localStorage
│   ├── images/compress-image.ts# Compressão/redimensionamento client-side
│   ├── validation/             # Schemas Zod (mensagens em português)
│   └── templates.ts, relationships.ts, message-suggestions.ts, slug.ts, format.ts
└── types/tribute.ts            # Modelo de dados
```

## Modelo de dados

```ts
interface Tribute {
  id: string;
  slug: string;                 // ex.: "para-maria-k3f9qa" (sufixo aleatório, difícil de adivinhar)
  recipientName: string;
  recipientNickname?: string;
  relationship: Relationship;   // mae | pai | avo_f | avo_m | esposa | ... | outro
  customRelationship?: string;
  template: "classico-mariano" | "luz-e-fe" | "gratidao";
  photos: TributePhoto[];       // { id, src, width, height, size, alt? }
  title: string;
  message: string;
  senderName: string;
  settings: { openingAnimation; decorations; visualEffect; music: { enabled: false; trackId: null } };
  paid: boolean;
  paidAt?: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: 1;
}
```

## Como funciona o armazenamento local

- **Nenhum componente chama `localStorage` diretamente.** Só `src/lib/storage/browser-storage.ts` faz isso, com prefixo `manto-azul:` e tratamento de `QuotaExceededError` (vira `StorageQuotaError` com mensagem amigável).
- `LocalTributeRepository` guarda as homenagens em `manto-azul:tributes`.
- `LocalDraftRepository` guarda o rascunho do wizard em `manto-azul:draft` (salvo automaticamente ~400 ms após cada alteração e a cada troca de etapa). Ao recarregar, o progresso e a etapa são restaurados. “Começar novamente” pede confirmação antes de apagar.
- **Fotos:** `compressImage()` redimensiona para no máximo 1080 px e reduz a qualidade JPEG até ~170 KB por foto. Se o espaço acabar, a foto é descartada e a pessoa vê uma mensagem explicando o que fazer.
- Os eventos de analytics ficam em `manto-azul:analytics` (últimos 200) e são logados no console em desenvolvimento.

## Como funciona o fake checkout

`/checkout` usa apenas a interface `PaymentService` (`src/lib/payments`). O fluxo já imita o real:

1. Cria (ou reaproveita) a homenagem com `paid: false` — equivalente a um “pedido pendente”.
2. Chama `paymentService.startPayment({ tributeId, amountInCents, description })`.
3. `FakePaymentService` espera ~1,2 s, marca `paid: true` e retorna `status: "approved"`.
4. A UI registra `purchase_completed`, limpa o rascunho e redireciona para `/sucesso/[slug]`.

A tela mostra claramente: **“Ambiente local — nenhum pagamento será realizado.”** Enquanto `productConfig.isLocalDemo` for `true`, os avisos de versão local aparecem no wizard, no checkout e na tela de sucesso.

## Como migrar para Supabase

1. Crie o projeto e as tabelas (sugestão):
   ```sql
   create table tributes (
     id uuid primary key default gen_random_uuid(),
     slug text unique not null,
     recipient_name text not null,
     recipient_nickname text,
     relationship text not null,
     custom_relationship text,
     template text not null,
     photos jsonb not null default '[]',   -- [{ id, path, width, height, size }]
     title text not null,
     message text not null,
     sender_name text not null,
     settings jsonb not null,
     paid boolean not null default false,
     paid_at timestamptz,
     payment_id text,
     created_at timestamptz default now(),
     updated_at timestamptz default now()
   );
   ```
   Ative RLS: leitura pública **apenas** por `slug` e `paid = true`; escrita só via rotas de servidor.
2. Crie `src/lib/repositories/supabase-tribute-repository.ts` implementando `TributeRepository` (mapeando snake_case ↔ camelCase).
3. Troque a instância em `src/lib/repositories/index.ts` (há um `TODO(supabase)` marcando o ponto).
4. **Storage:** crie o bucket `tribute-photos`. Continue usando `compressImage()` no cliente, mas envie o `Blob` para o Storage e salve em `photos[].src` a URL pública/assinada (o campo `src` já foi pensado para isso).
5. `/homenagem/[slug]` pode virar Server Component buscando os dados no servidor. Em `generateMetadata` (há `TODO(supabase)`), use **somente** o primeiro nome do presenteado — nunca a mensagem ou as fotos.
6. O rascunho pode continuar local (é privado) ou ir para uma tabela `drafts`.

## Como integrar Mercado Pago

1. Crie uma rota de servidor `app/api/checkout/route.ts` que:
   - valida o conteúdo com o mesmo `tributeContentSchema`;
   - cria a homenagem com `paid = false`;
   - cria uma *preference* no Mercado Pago (Checkout Pro ou Pix) com `external_reference = tribute.id` e `back_urls` apontando para `/sucesso/[slug]`;
   - retorna `init_point`.
2. Implemente `MercadoPagoPaymentService` (`isSimulated = false`) cujo `startPayment` chama essa rota e retorna `{ status: "pending", redirectUrl: init_point }`. A UI de checkout **já trata `redirectUrl`**.
3. Troque a instância em `src/lib/payments/index.ts` (`TODO(mercado-pago)`).
4. Crie `app/api/webhooks/mercado-pago/route.ts`: valide a assinatura (`x-signature`), consulte o pagamento na API, e só então marque `paid = true` usando a service role do Supabase. **Nunca** confie no redirecionamento do navegador para liberar a homenagem.
5. Na tela de sucesso, se a homenagem ainda estiver `paid = false`, mostre “Confirmando pagamento…” e consulte novamente (Pix pode levar alguns segundos).
6. Mude `productConfig.isLocalDemo` para `false`.

## Variáveis de ambiente futuras

Veja `.env.example`:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`
- `MERCADO_PAGO_ACCESS_TOKEN`, `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY`, `MERCADO_PAGO_WEBHOOK_SECRET`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `SENTRY_DSN`

## Analytics

`track(event, props)` em `src/lib/analytics`. Eventos: `landing_view`, `create_started`, `template_selected`, `preview_viewed`, `checkout_started`, `purchase_completed`, `tribute_viewed`, `share_clicked`, `create_another_clicked`. Para adicionar GA4/PostHog, implemente `AnalyticsProvider` e registre em `providers`. Não envie nomes, mensagens ou fotos como propriedades.

## Acessibilidade e mobile

- Mobile first, testado em 375/390/430 px e 1280/1440/1920 px sem overflow horizontal.
- O renderizador da homenagem usa **container queries**, então a prévia “Celular” e “Computador” mostram o layout real, independente da tela de quem está criando.
- Labels em todos os campos, `aria-invalid`/`aria-describedby` nos erros, foco visível, `role="switch"` nos toggles, lightbox com Esc/setas, link “Pular para o conteúdo”, `prefers-reduced-motion` respeitado (CSS + `MotionConfig`).

## Imagens e direitos

Não há imagens de terceiros. Ornamentos (coroa, raios, rosa, estrelas, manto) e as ilustrações de exemplo em `public/demo/*.svg` são SVGs originais e abstratos. Não usamos representação específica da imagem de Nossa Senhora Aparecida. Música ficou como funcionalidade futura (`settings.music`), aguardando trilhas com licença adequada.

## Limitações da versão local

- A homenagem **só abre no navegador em que foi criada**; o link não funciona em outro aparelho.
- O `localStorage` tem ~5 MB por site: cabem poucas homenagens com fotos. Limpar os dados do navegador apaga tudo.
- O pagamento é simulado; qualquer pessoa pode “pagar”.
- Não há edição depois de finalizar, nem painel administrativo, nem autenticação.
- A metadata de `/homenagem/[slug]` é genérica, porque o servidor não tem acesso aos dados locais.

## Próximos passos para produção

1. **Supabase/PostgreSQL** — `SupabaseTributeRepository`, RLS por slug + `paid`.
2. **Supabase Storage** — upload das fotos já comprimidas; URLs assinadas ou públicas.
3. **Mercado Pago** — Checkout Pro e/ou Pix via rota de servidor.
4. **Webhook de confirmação** — assinatura validada, idempotência por `payment_id`.
5. **Domínio** — `NEXT_PUBLIC_SITE_URL`, HTTPS, imagem OG por homenagem (só com o primeiro nome).
6. **Analytics** — GA4/PostHog via `AnalyticsProvider`, com consentimento.
7. **Tratamento LGPD** — termos e política definitivos, base legal, canal de exclusão, consentimento para fotos de terceiros.
8. **Rate limiting** — nas rotas de checkout/upload (ex.: Upstash) e limite de tamanho no Storage.
9. **Política de retenção/exclusão** — prazo de disponibilidade informado antes da compra, job que expira/apaga homenagens e fotos.
10. **Monitoramento de erros** — Sentry (cliente + servidor) e alertas de falha no webhook.
