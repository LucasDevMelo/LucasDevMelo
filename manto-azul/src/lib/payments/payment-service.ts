export type PaymentStatus = "approved" | "pending" | "rejected";

export interface StartPaymentInput {
  tributeId: string;
  amountInCents: number;
  description: string;
}

export interface PaymentResult {
  status: PaymentStatus;
  paymentId: string;
  /**
   * For hosted checkouts (e.g. Mercado Pago Checkout Pro) the UI must redirect here.
   * The fake service confirms immediately and returns no URL.
   */
  redirectUrl?: string;
}

/**
 * Payment contract used by the checkout UI.
 *
 * V1: FakePaymentService — approves instantly, no money involved.
 * Production: MercadoPagoPaymentService — creates a preference on the server
 * and confirms via webhook (see README → "Como integrar Mercado Pago").
 */
export interface PaymentService {
  readonly isSimulated: boolean;
  startPayment(input: StartPaymentInput): Promise<PaymentResult>;
}
