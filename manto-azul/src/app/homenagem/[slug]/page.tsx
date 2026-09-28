import type { Metadata } from "next";
import { TributePageLoader } from "@/components/tribute/tribute-page-loader";
import { productConfig } from "@/config/product";

export async function generateMetadata({ params }: PageProps<"/homenagem/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  // TODO(supabase): fetch ONLY the recipient's first name server-side to personalize the title,
  // e.g. "Uma homenagem para Maria". Never expose the message or photos in metadata.
  const title = "Uma homenagem especial para você";
  const description = `Alguém preparou uma homenagem com carinho neste ${productConfig.eventName}. Toque para abrir.`;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: `/homenagem/${slug}` },
    openGraph: { title, description, type: "website" },
  };
}

export default async function TributePage({ params }: PageProps<"/homenagem/[slug]">) {
  const { slug } = await params;
  return <TributePageLoader slug={slug} />;
}
