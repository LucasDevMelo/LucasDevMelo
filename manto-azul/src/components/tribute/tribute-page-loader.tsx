"use client";

import dynamic from "next/dynamic";
import { PageLoading } from "@/components/layout/page-loading";

export const TributePageLoader = dynamic(() => import("./tribute-page-view").then((m) => m.TributePageView), {
  ssr: false,
  loading: () => <PageLoading dark label="Abrindo homenagem…" />,
});
