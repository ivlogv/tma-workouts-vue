import { hapticFeedback } from "@tma.js/sdk-vue";

type ImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";

export const triggerHaptic = (style: ImpactStyle = "light") => {
  if (hapticFeedback.isSupported()) {
    hapticFeedback.impactOccurred(style);
  }
};
