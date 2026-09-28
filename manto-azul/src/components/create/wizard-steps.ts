import type { TributeFormValues } from "@/lib/validation/tribute-schema";

export interface WizardStepMeta {
  id: string;
  label: string;
  title: string;
  description: string;
  fields: (keyof TributeFormValues)[];
}

export const WIZARD_STEPS: WizardStepMeta[] = [
  {
    id: "para-quem",
    label: "Para quem",
    title: "Para quem é a homenagem?",
    description: "Comece contando quem vai receber esse carinho.",
    fields: ["recipientName", "recipientNickname", "relationship", "customRelationship"],
  },
  {
    id: "estilo",
    label: "Estilo",
    title: "Escolha o estilo",
    description: "Cada estilo muda cores, ornamentos e a forma como as fotos aparecem.",
    fields: ["template"],
  },
  {
    id: "fotos",
    label: "Fotos",
    title: "Adicione fotos especiais",
    description: "Momentos que vocês viveram juntos deixam tudo mais emocionante.",
    fields: ["photos"],
  },
  {
    id: "mensagem",
    label: "Mensagem",
    title: "Escreva sua mensagem",
    description: "Fale do jeito de vocês. Se precisar, use uma sugestão como ponto de partida.",
    fields: ["title", "message", "senderName"],
  },
  {
    id: "detalhes",
    label: "Detalhes",
    title: "Toques finais",
    description: "Ajuste os efeitos visuais da homenagem.",
    fields: ["settings"],
  },
  {
    id: "previa",
    label: "Prévia",
    title: "Veja como ficou",
    description: "É assim que a pessoa vai ver a homenagem. Revise com calma.",
    fields: [],
  },
];
