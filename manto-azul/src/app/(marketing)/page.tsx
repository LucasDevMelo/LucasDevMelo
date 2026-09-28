import { Benefits } from "@/components/landing/benefits";
import { Examples } from "@/components/landing/examples";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { PageViewTracker } from "@/components/layout/page-view-tracker";

export default function HomePage() {
  return (
    <>
      <PageViewTracker event="landing_view" />
      <Hero />
      <HowItWorks />
      <Examples />
      <Benefits />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
