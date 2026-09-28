import type { Metadata } from "next";
import { CreateWizardLoader } from "@/components/create/create-wizard-loader";

export const metadata: Metadata = {
  title: "Criar homenagem",
  description: "Crie em poucos minutos uma homenagem personalizada para o Dia de Nossa Senhora Aparecida.",
};

export default function CreatePage() {
  return <CreateWizardLoader />;
}
