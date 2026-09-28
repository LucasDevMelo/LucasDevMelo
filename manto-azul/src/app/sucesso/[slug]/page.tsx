import type { Metadata } from "next";
import { SuccessLoader } from "@/components/success/success-loader";

export const metadata: Metadata = { title: "Homenagem pronta", robots: { index: false } };

export default async function SuccessPage({ params }: PageProps<"/sucesso/[slug]">) {
  const { slug } = await params;
  return <SuccessLoader slug={slug} />;
}
