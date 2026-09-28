import type { Relationship } from "@/types/tribute";

interface RelationshipInfo {
  label: string;
  /** Used in sentences, e.g. "Para minha mãe". */
  phrase: string;
}

export const relationshipInfo: Record<Relationship, RelationshipInfo> = {
  mae: { label: "Mãe", phrase: "minha mãe" },
  pai: { label: "Pai", phrase: "meu pai" },
  avo_f: { label: "Avó", phrase: "minha avó" },
  avo_m: { label: "Avô", phrase: "meu avô" },
  esposa: { label: "Esposa", phrase: "minha esposa" },
  marido: { label: "Marido", phrase: "meu marido" },
  namorada: { label: "Namorada", phrase: "minha namorada" },
  namorado: { label: "Namorado", phrase: "meu namorado" },
  madrinha: { label: "Madrinha", phrase: "minha madrinha" },
  padrinho: { label: "Padrinho", phrase: "meu padrinho" },
  amiga: { label: "Amiga", phrase: "minha amiga" },
  amigo: { label: "Amigo", phrase: "meu amigo" },
  outro: { label: "Outro", phrase: "alguém muito especial" },
};

export function relationshipPhrase(relationship: Relationship, custom?: string): string {
  if (relationship === "outro" && custom?.trim()) return custom.trim();
  return relationshipInfo[relationship].phrase;
}
