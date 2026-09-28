"use client";

import dynamic from "next/dynamic";
import { PageLoading } from "@/components/layout/page-loading";

export const SuccessLoader = dynamic(() => import("./success-view").then((m) => m.SuccessView), {
  ssr: false,
  loading: () => <PageLoading />,
});
