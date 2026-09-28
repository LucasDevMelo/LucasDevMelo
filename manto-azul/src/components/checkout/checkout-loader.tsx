"use client";

import dynamic from "next/dynamic";
import { PageLoading } from "@/components/layout/page-loading";

export const CheckoutLoader = dynamic(() => import("./checkout-view").then((m) => m.CheckoutView), {
  ssr: false,
  loading: () => <PageLoading label="Carregando seu pedido…" />,
});
