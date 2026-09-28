"use client";

import dynamic from "next/dynamic";
import { PageLoading } from "@/components/layout/page-loading";

// The wizard reads the local draft on first render, so it only runs in the browser.
export const CreateWizardLoader = dynamic(
  () => import("./create-wizard").then((m) => m.CreateWizard),
  { ssr: false, loading: () => <PageLoading label="Preparando sua homenagem…" /> },
);
