export interface MessageSuggestion {
  id: string;
  label: string;
  text: string;
}

export const titleSuggestions = [
  "Para você, neste dia tão especial",
  "Com gratidão e carinho",
  "Um pedacinho do meu coração",
  "Com todo o meu amor",
];

export const messageSuggestions: MessageSuggestion[] = [
  {
    id: "gratidao",
    label: "Gratidão",
    text: "Hoje, no Dia de Nossa Senhora Aparecida, quero agradecer por tudo o que você é na minha vida. Cada gesto seu de cuidado, cada conselho e cada abraço ficaram guardados em mim. Gratidão por caminhar ao meu lado.",
  },
  {
    id: "carinho",
    label: "Carinho",
    text: "Nem sempre eu digo, mas hoje faço questão: você é uma das pessoas mais importantes da minha vida. Seu jeito de amar deixa tudo mais leve. Esta homenagem é um pequeno pedaço do carinho enorme que sinto por você.",
  },
  {
    id: "fe",
    label: "Fé",
    text: "Neste 12 de outubro, lembrei de você com o coração cheio. Foi com você que aprendi que a fé também se vive nos pequenos gestos do dia a dia. Gratidão por você ser presença, exemplo e abrigo.",
  },
  {
    id: "familia",
    label: "Família",
    text: "Família é quem segura a nossa mão nos dias bonitos e nos dias difíceis. E você sempre esteve lá. Neste dia tão especial, quero celebrar a nossa história e tudo o que construímos juntos.",
  },
  {
    id: "saudade",
    label: "Memórias",
    text: "Algumas das minhas lembranças mais bonitas têm você nelas: as conversas, as risadas, as orações em família. Hoje eu quis transformar esse sentimento em algo que você pudesse guardar. Com todo o meu amor.",
  },
];
