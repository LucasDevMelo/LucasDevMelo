import type { Metadata } from "next";
import { CheckoutLoader } from "@/components/checkout/checkout-loader";

export const metadata: Metadata = { title: "Finalizar homenagem", robots: { index: false } };

export default function CheckoutPage() {
  return <CheckoutLoader />;
}
