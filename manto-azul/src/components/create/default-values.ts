import { titleSuggestions } from "@/lib/message-suggestions";
import type { TributeFormValues } from "@/lib/validation/tribute-schema";

export const defaultTributeValues: Partial<TributeFormValues> = {
  recipientName: "",
  recipientNickname: "",
  customRelationship: "",
  template: "classico-mariano",
  photos: [],
  title: titleSuggestions[0],
  message: "",
  senderName: "",
  settings: {
    openingAnimation: true,
    decorations: true,
    visualEffect: true,
    music: { enabled: false, trackId: null },
  },
};
