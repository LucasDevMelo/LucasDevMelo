import { tributeRepository } from "@/lib/repositories";
import { FakePaymentService } from "./fake-payment-service";
import type { PaymentService } from "./payment-service";

// TODO(mercado-pago): replace with `new MercadoPagoPaymentService()` that calls
// a server route (/api/checkout) creating a Mercado Pago preference.
export const paymentService: PaymentService = new FakePaymentService(tributeRepository);

export type { PaymentService, PaymentResult, StartPaymentInput } from "./payment-service";
