import type { TemplateId, Tribute } from "@/types/tribute";

/** Fictional example used on /exemplo and on the landing page. No real data. */
export const demoTribute: Tribute = {
  id: "demo",
  slug: "exemplo",
  recipientName: "Maria",
  recipientNickname: "Mãezinha",
  relationship: "mae",
  template: "classico-mariano",
  photos: [
    { id: "demo-1", src: "/demo/entardecer.svg", width: 800, height: 1000, size: 0, alt: "Ilustração de um entardecer dourado sobre colinas" },
    { id: "demo-2", src: "/demo/flores.svg", width: 800, height: 1000, size: 0, alt: "Ilustração de um vaso azul com rosas" },
    { id: "demo-3", src: "/demo/vela.svg", width: 800, height: 1000, size: 0, alt: "Ilustração de uma vela acesa" },
  ],
  title: "Para você, neste dia tão especial",
  message:
    "Mãe, hoje é dia de Nossa Senhora Aparecida e eu não consegui pensar em outra pessoa além de você.\n\nFoi no seu colo que aprendi a rezar, foi no seu exemplo que aprendi a ter paciência, e foi no seu abraço que sempre encontrei o caminho de volta pra casa.\n\nObrigada por cada vela acesa, por cada \"vai com Deus\" na porta e por nunca desistir de nenhum de nós. Esta homenagem é pequena perto de tudo o que você merece, mas carrega o meu amor inteiro.",
  senderName: "Ana",
  settings: {
    openingAnimation: true,
    decorations: true,
    visualEffect: true,
    music: { enabled: false, trackId: null },
  },
  paid: true,
  createdAt: "2026-10-01T12:00:00.000Z",
  updatedAt: "2026-10-01T12:00:00.000Z",
  schemaVersion: 1,
};

export function getDemoTribute(template?: TemplateId): Tribute {
  return template ? { ...demoTribute, template } : demoTribute;
}
