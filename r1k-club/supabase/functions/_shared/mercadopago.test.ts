// =============================================================================
// Testes da validacao de assinatura do webhook do Mercado Pago.
//
//   npx deno test --allow-env supabase/functions/_shared/mercadopago.test.ts
//
// Esta funcao e a fronteira entre "notificacao do Mercado Pago" e "qualquer um
// consegue virar membro de graca", entao ela tem teste.
// =============================================================================
import { buildManifest, verifyWebhookSignature } from './mercadopago.ts'

// Asserts locais: o teste nao depende de rede para rodar.
function assert(condition: unknown, message?: string): void {
  if (!condition) throw new Error(message ?? 'esperava um valor verdadeiro')
}

function assertEquals<T>(actual: T, expected: T, message?: string): void {
  const a = JSON.stringify(actual)
  const b = JSON.stringify(expected)
  if (a !== b) throw new Error(message ?? `esperava ${b}, recebeu ${a}`)
}

const SECRET = 'r1k-test-secret'

Deno.env.set('MERCADOPAGO_WEBHOOK_SECRET', SECRET)

async function sign(manifest: string, secret = SECRET): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(manifest))
  return [...new Uint8Array(signed)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function request(headers: Record<string, string>): Request {
  return new Request('https://example.com/webhook', { method: 'POST', headers })
}

// ---------------------------------------------------------------------------
Deno.test('manifesto segue o formato do Mercado Pago', () => {
  assertEquals(
    buildManifest('1234567890', 'req-1', '1700000000000'),
    'id:1234567890;request-id:req-1;ts:1700000000000;',
  )
})

Deno.test('id alfanumerico entra em minusculas', () => {
  assertEquals(buildManifest('AbC123', 'r', '1'), 'id:abc123;request-id:r;ts:1;')
})

Deno.test('partes ausentes saem do manifesto', () => {
  assertEquals(buildManifest(null, null, '1700000000000'), 'ts:1700000000000;')
  assertEquals(buildManifest('99', null, '1'), 'id:99;ts:1;')
})

Deno.test('HMAC bate com implementacao independente (Node)', async () => {
  // Valor gerado por: crypto.createHmac('sha256', secret).update(manifest)
  const manifest = 'id:1234567890;request-id:9f1a2b3c-0000-4d5e-8f90-abcdefabcdef;ts:1700000000000;'
  assertEquals(
    await sign(manifest),
    '5c69c440485d55dd9c67c96806715ef1dff4da90b0b61ca587ea26a4015cb9eb',
  )
})

// ---------------------------------------------------------------------------
Deno.test('aceita notificacao assinada corretamente', async () => {
  const ts = String(Date.now())
  const dataId = '1234567890'
  const requestId = 'req-abc'
  const v1 = await sign(buildManifest(dataId, requestId, ts))

  const result = await verifyWebhookSignature(
    request({ 'x-signature': `ts=${ts},v1=${v1}`, 'x-request-id': requestId }),
    dataId,
  )
  assert(result.ok, result.reason)
})

Deno.test('recusa assinatura de outro payload (data.id trocado)', async () => {
  const ts = String(Date.now())
  const v1 = await sign(buildManifest('1111', 'req-abc', ts))

  const result = await verifyWebhookSignature(
    request({ 'x-signature': `ts=${ts},v1=${v1}`, 'x-request-id': 'req-abc' }),
    '2222', // atacante troca o pagamento mantendo a assinatura
  )
  assertEquals(result.ok, false)
})

Deno.test('recusa assinatura feita com outro segredo', async () => {
  const ts = String(Date.now())
  const v1 = await sign(buildManifest('1234567890', 'req-abc', ts), 'segredo-errado')

  const result = await verifyWebhookSignature(
    request({ 'x-signature': `ts=${ts},v1=${v1}`, 'x-request-id': 'req-abc' }),
    '1234567890',
  )
  assertEquals(result.ok, false)
})

Deno.test('recusa replay antigo', async () => {
  const ts = String(Date.now() - 60 * 60 * 1000) // 1 hora atras
  const dataId = '1234567890'
  const v1 = await sign(buildManifest(dataId, 'req-abc', ts))

  const result = await verifyWebhookSignature(
    request({ 'x-signature': `ts=${ts},v1=${v1}`, 'x-request-id': 'req-abc' }),
    dataId,
  )
  assertEquals(result.ok, false)
  assertEquals(result.reason, 'timestamp fora da janela')
})

Deno.test('recusa header ausente ou malformado', async () => {
  assertEquals((await verifyWebhookSignature(request({}), '1')).ok, false)
  assertEquals((await verifyWebhookSignature(request({ 'x-signature': 'lixo' }), '1')).ok, false)
  assertEquals(
    (await verifyWebhookSignature(request({ 'x-signature': 'ts=123' }), '1')).ok,
    false,
  )
})

Deno.test('recusa quando o segredo nao esta configurado', async () => {
  Deno.env.delete('MERCADOPAGO_WEBHOOK_SECRET')
  const result = await verifyWebhookSignature(
    request({ 'x-signature': 'ts=1,v1=abc' }),
    '1',
  )
  assertEquals(result.ok, false)
  Deno.env.set('MERCADOPAGO_WEBHOOK_SECRET', SECRET)
})
