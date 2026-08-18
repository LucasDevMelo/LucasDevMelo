# 💎 R$1K CLUB

Um clube digital para quem tem coragem de gastar R$1.000 para provar que pode.

> **Loop do produto:** TikTok → Landing → Compra → Perfil → Compartilhamento → TikTok

---

## O que está implementado

**MVP completo (Fase 1 do roadmap)**

| Etapa | Onde |
|---|---|
| Landing | `src/pages/Landing.tsx` |
| Checkout | `src/pages/Checkout.tsx` + `supabase/functions/create-checkout` |
| Pagamento | `supabase/functions/mercadopago-webhook` |
| Member number | `grant_membership()` em `supabase/migrations/0002_functions.sql` |
| Onboarding | `src/pages/Welcome.tsx` |
| Perfil público | `src/pages/Profile.tsx` (`/u/:username`) |
| Certificado | `src/features/certificate.ts` (PNG + PDF) |
| Compartilhar | `src/features/shareCard.ts` + `src/components/ShareSheet.tsx` |

**Fase 2 (viralização)** — referral (`/join?ref=0042`), rankings (entrada, dinheiro,
influencers), badges automáticas, social cards 9:16 e 1:1, analytics com os eventos
da seção 14 e atribuição de origem (TikTok / Instagram / direto).

**Operação** — dashboard do membro, painel admin com métricas e bloqueio de contas,
lista de espera (Fase 0), termos e privacidade.

**Não implementado de propósito:** upgrades de tier estão prontos no backend
(`tier_for_amount`, rota `/checkout?tier=whale`) mas não são promovidos na landing.
Conforme a seção 18: primeiro provar que alguém compra R$1.000.

---

## Rodar agora (modo demonstração)

```bash
npm install
npm run dev
```

Sem `VITE_SUPABASE_URL` o app sobe com dados de exemplo e todas as telas ficam
navegáveis — inclusive certificado, social card e a cerimônia de onboarding em
`/welcome?session_id=cs_test_demo`. Serve para gravar os vídeos da seção 20 antes
de existir backend. O checkout real fica desativado.

---

## Colocar no ar

### 1. Supabase

```bash
supabase link --project-ref SEU_PROJETO
supabase db push          # aplica as 4 migrations de supabase/migrations
```

Configure os segredos das Edge Functions:

```bash
supabase secrets set \
  STRIPE_SECRET_KEY=sk_live_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  SITE_URL=https://r1kclub.com \
  ALLOWED_ORIGINS=https://r1kclub.com
```

Deploy das funções:

```bash
supabase functions deploy create-checkout
supabase functions deploy payment-status
supabase functions deploy waitlist
supabase functions deploy mercadopago-webhook --no-verify-jwt   # o MP não manda JWT
```

### 2. Mercado Pago

Em **Suas integrações → sua aplicação**:

1. **Credenciais** → copie o *Access Token*. Comece com o de teste (`TEST-...`);
   o app detecta e usa o `sandbox_init_point` sozinho.
2. **Webhooks → Configurar notificações** → URL:

```
https://SEU_PROJETO.supabase.co/functions/v1/mercadopago-webhook
```

   Evento a marcar: **Pagamentos** (`payment`).

3. Copie a **assinatura secreta** que o painel mostra ao salvar e coloque em
   `MERCADOPAGO_WEBHOOK_SECRET`. Sem ela o webhook rejeita tudo com 401 — que é o
   comportamento correto, mas nenhum pagamento é liberado.

> A assinatura é por aplicação **e por ambiente**: a de teste não vale em produção.

O checkout usa **Checkout Pro** (redirect), o que já traz Pix, boleto e cartão sem
você tocar em dado de cartão. Se um dia quiser o formulário dentro do site, o
caminho é o Checkout Bricks — só `create-checkout` e a tela de checkout mudam; o
webhook e o banco continuam iguais.

### 3. Vercel

Variáveis de ambiente do projeto:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SITE_URL
VITE_POSTHOG_KEY        (opcional)
VITE_POSTHOG_HOST       (opcional)
```

O `vercel.json` já cuida do fallback de SPA, dos headers de segurança e de mandar
crawlers de link (WhatsApp, X, Telegram…) para `/api/profile-meta`, que devolve o
preview com o nome e o número do membro.

### 4. Virar admin

Depois de criar sua conta, no SQL Editor:

```sql
update public.users set is_admin = true where email = 'voce@email.com';
```

O painel fica em `/admin`.

---

## Segurança (seção 17)

O produto movimenta R$1.000 por transação. As decisões estruturais:

- **O member number não é gerado no React.** Sai de `next_member_number()`, que
  incrementa uma linha travada em `member_counter` dentro da mesma transação que
  cria a membership. Sem gaps, sem colisão, sem chance de manipulação pelo cliente.
- **Confirmação server-side.** A única forma de virar membro é `grant_membership()`,
  chamada pelo webhook depois de (a) validar o HMAC do `x-signature` e (b) consultar
  o pagamento na API do Mercado Pago. Nada do corpo da notificação é tratado como
  verdade — dele sai só o id. O frontend nunca libera nada.
- **`external_reference` não é adivinhável.** Ele carrega o id de um
  `checkout_intent` criado no servidor, não o `user_id`. Isso fecha o ataque de
  apontar um pagamento de R$0,01 para o próprio id: a intenção define de quem é o
  pagamento e congela o valor esperado, e valor menor que o combinado não libera
  nada.
- **Idempotência.** `payments` tem `unique (provider, transaction_id)`. Reentregas
  do webhook — que o Mercado Pago faz quando recebe 5xx — devolvem o estado existente
  em vez de emitir um segundo número ou somar o valor de novo.
- **Replay barrado.** A verificação de assinatura recusa notificações com
  `ts` fora de uma janela de 10 minutos.
- **Concorrência.** `pg_advisory_xact_lock` por usuário serializa duas entregas
  simultâneas do mesmo evento.
- **O preço não vem do cliente.** O checkout recebe só o id do tier; o valor sai de
  `supabase/functions/_shared/tiers.ts`.
- **RLS em tudo.** Todas as tabelas com RLS ligado e sem policy para `anon`. O que é
  público sai por views (`public_profiles`, `public_ranking`, `public_referrers`,
  `public_badges`) que expõem só colunas seguras — e-mail nunca aparece.
- **Endpoints administrativos.** `admin_metrics()` e `admin_set_blocked()` checam
  `is_admin()` no Postgres. Esconder o botão no React não é proteção.
- **Rate limiting.** `check_rate_limit()` com janela fixa contada atomicamente:
  8 checkouts por IP a cada 10 min, 10 inscrições na lista de espera.
- **Logs.** `audit_log` registra criação de checkout, concessão de membership,
  reembolso e ações administrativas.
- **UPDATE restrito.** `authenticated` só pode alterar `display_name` e `avatar_url`
  do próprio registro; `username`, `email` e `is_admin` estão fora do grant.

---

## Estrutura

```
src/
  components/    UI, layout, share sheet, certificado, error boundary
  features/      geração de imagens em canvas (certificado, social card, download)
  hooks/         auth, referral, contagem animada
  lib/           supabase, api, analytics, tiers, formatação, dados de demo
  pages/         landing, checkout, welcome, profile, ranking, dashboard, admin…
supabase/
  migrations/    schema, funções de domínio, RLS, seed do admin
  functions/     create-checkout, mercadopago-webhook, payment-status, waitlist
api/             preview de link para crawlers (Vercel)
```

---

## Testes do banco

A lógica que mexe com dinheiro tem suíte própria, rodável num Postgres descartável:

```bash
./supabase/tests/run.sh
```

O que ela verifica:

- validação de username (curto, reservado, `_` nas pontas, colisão case-insensitive);
- **idempotência**: o mesmo evento reentregue 3× não gera segundo número nem soma
  o valor de novo;
- referral por número e por username, e código inválido sem criar lixo;
- badges automáticas e upgrade de tier preservando o member number;
- rate limiting;
- **intenções de checkout**: R$0,01 numa entrada de R$1.000 é recusado,
  `external_reference` forjado é recusado, e a tabela é invisível para
  `anon`/`authenticated`;
- **RLS**: `anon` bloqueado em `users`/`payments`/`memberships`/`audit_log`/
  `member_counter`, membro comum sem conseguir se auto-promover a admin, trocar o
  próprio username ou editar outra conta;
- **concorrência**: 40 compras simultâneas com 20 reentregas duplicadas →
  40 números distintos, 1 a 40, zero gaps, R$40.000 cobrados exatamente.

E a validação de assinatura do webhook, que roda em Deno:

```bash
npm run test:functions     # testes da assinatura do webhook
npm run check:functions    # typecheck das Edge Functions
```

Cobre o formato do manifesto, um valor de referência gerado por uma implementação
independente (Node), e as recusas: `data.id` trocado mantendo a assinatura, segredo
errado, replay antigo, header ausente ou malformado, segredo não configurado.

---

## Comandos

```bash
npm run dev              # servidor de desenvolvimento
npm run build            # typecheck + build de produção
npm run preview          # serve o build
npm run lint             # typecheck do frontend
npm run check:functions  # typecheck das Edge Functions (Deno)
npm run test:functions   # testes da assinatura do webhook
npm run test:db          # migrations + suíte SQL num Postgres descartável
```

---

## Próximos passos (Fase 3)

Só depois das primeiras vendas: abrir os tiers na landing, benefícios de membro,
comunidade e eventos.
