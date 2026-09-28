import type { TributeRepository } from "@/lib/repositories";
import { createId } from "@/lib/utils";
import type { PaymentResult, PaymentService, StartPaymentInput } from "./payment-service";

/**
 * Simulated checkout for local development.
 * NO real payment happens. It only marks the local tribute as paid.
 */
export class FakePaymentService implements PaymentService {
  readonly isSimulated = true;

  constructor(private readonly tributes: TributeRepository) {}

  async startPayment(input: StartPaymentInput): Promise<PaymentResult> {
    // Small delay so the UI can show a realistic "processing" state.
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const paymentId = `simulado_${createId()}`;
    // In production this update happens in the Mercado Pago webhook, never in the browser.
    await this.tributes.update(input.tributeId, {
      paid: true,
      paidAt: new Date().toISOString(),
      paymentId,
    });
    return { status: "approved", paymentId };
  }
}
