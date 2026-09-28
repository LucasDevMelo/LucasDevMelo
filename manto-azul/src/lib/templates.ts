import type { CSSProperties } from "react";
import type { TemplateId } from "@/types/tribute";

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  mood: string;
  /** Short line shown in the faith/gratitude section of the tribute. */
  reflection: string;
  ornament: "crown" | "rays" | "roses";
  gallery: "arches" | "minimal" | "polaroid";
  /** CSS variables consumed by the tribute renderer. */
  vars: CSSProperties;
  swatches: [string, string, string];
}

type Vars = Record<`--t-${string}`, string>;

const classicVars: Vars = {
  "--t-bg": "#0d1f3f",
  "--t-bg-2": "#132b55",
  "--t-surface": "rgba(255,255,255,0.06)",
  "--t-surface-border": "rgba(214,185,120,0.28)",
  "--t-ink": "#f7f3ea",
  "--t-muted": "#c7cfe0",
  "--t-accent": "#d9b86c",
  "--t-accent-soft": "rgba(217,184,108,0.18)",
  "--t-glow": "rgba(236,211,150,0.55)",
  "--t-photo-border": "#d9b86c",
};

const lightVars: Vars = {
  "--t-bg": "#fbfaf6",
  "--t-bg-2": "#eef3fb",
  "--t-surface": "#ffffff",
  "--t-surface-border": "rgba(43,92,171,0.14)",
  "--t-ink": "#172747",
  "--t-muted": "#5a6782",
  "--t-accent": "#2f62b3",
  "--t-accent-soft": "rgba(47,98,179,0.08)",
  "--t-glow": "rgba(255,236,190,0.9)",
  "--t-photo-border": "#ffffff",
};

const gratitudeVars: Vars = {
  "--t-bg": "#f7eee2",
  "--t-bg-2": "#f1dfca",
  "--t-surface": "#fffaf3",
  "--t-surface-border": "rgba(160,106,60,0.2)",
  "--t-ink": "#3a2618",
  "--t-muted": "#7a5b45",
  "--t-accent": "#b0703d",
  "--t-accent-soft": "rgba(176,112,61,0.1)",
  "--t-glow": "rgba(255,214,160,0.8)",
  "--t-photo-border": "#fffdf8",
};

export const templates: Record<TemplateId, TemplateDefinition> = {
  "classico-mariano": {
    id: "classico-mariano",
    name: "Clássico Mariano",
    description: "Azul profundo, branco e detalhes dourados. Elegante e solene.",
    mood: "Elegante",
    reflection: "Há amores que nos envolvem como um manto: em silêncio, com paciência e por inteiro.",
    ornament: "crown",
    gallery: "arches",
    vars: classicVars as CSSProperties,
    swatches: ["#0d1f3f", "#d9b86c", "#f7f3ea"],
  },
  "luz-e-fe": {
    id: "luz-e-fe",
    name: "Luz e Fé",
    description: "Claro, delicado e minimalista, com muita luz e respiro.",
    mood: "Delicado",
    reflection: "A fé mora nos gestos simples: num abraço, numa oração dita baixinho, numa mão estendida.",
    ornament: "rays",
    gallery: "minimal",
    vars: lightVars as CSSProperties,
    swatches: ["#fbfaf6", "#2f62b3", "#f3dca2"],
  },
  gratidao: {
    id: "gratidao",
    name: "Gratidão",
    description: "Tons quentes e acolhedores, com clima de álbum de família.",
    mood: "Afetuoso",
    reflection: "Tudo o que sou carrega um pouco do seu cuidado. Por isso, hoje, a palavra é gratidão.",
    ornament: "roses",
    gallery: "polaroid",
    vars: gratitudeVars as CSSProperties,
    swatches: ["#f7eee2", "#b0703d", "#3a2618"],
  },
};

export const templateList = Object.values(templates);
