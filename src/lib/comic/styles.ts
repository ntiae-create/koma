import type { SubStyle } from "./types";

export type StyleMeta = {
  id: SubStyle;
  label: string;
  jp: string;
  blurb: string;
  /** Modificador visual em inglês para o modelo de imagem. */
  image: string;
  /** Direção narrativa para o roteirista. */
  narrative: string;
  colors: string;
};

export const STYLE_META: Record<SubStyle, StyleMeta> = {
  shonen: {
    id: "shonen",
    label: "Shonen",
    jp: "少年",
    blurb: "Determinação, laços e impulso.",
    image:
      "shonen anime, dynamic heroic poses, determined expressive eyes, speed-line energy, vibrant saturated colors, cinematic action framing, clean manga linework",
    narrative:
      "Ritmo de shonen clássico: amizade, coragem e crescimento. Conflito físico sugerido, nunca sangrento. Final esperançoso.",
    colors: "vibrant saturated colors, dramatic skies, high contrast",
  },
  seinen: {
    id: "seinen",
    label: "Seinen leve",
    jp: "青年",
    blurb: "Maduro, contemplativo, humano.",
    image:
      "mature seinen anime, grounded faces, detailed quiet backgrounds, muted cinematic colors, contemplative mood, realistic anime proportions, refined linework",
    narrative:
      "Tom adulto e introspectivo, sem niilismo. Drama emocional, escolhas pesadas, violência apenas implícita.",
    colors: "muted cinematic palette, ochre, slate blue, soft grain",
  },
  shojo: {
    id: "shojo",
    label: "Shojo",
    jp: "少女",
    blurb: "Olhares, flores, sentimento.",
    image:
      "shojo manga, delicate linework, sparkling expressive eyes, floral motifs, soft pastel colors, emotional close-ups, elegant composition, flowing hair",
    narrative:
      "Foco em relações, vulnerabilidade e beleza cotidiana. Gestos pequenos carregam o plot. Romance leve permitido.",
    colors: "soft pastel colors, petal pink, window light, delicate highlights",
  },
  fantasy: {
    id: "fantasy",
    label: "Fantasy anime",
    jp: "幻想",
    blurb: "Magia, relíquias, reinos.",
    image:
      "fantasy anime, ornate costumes, magical particles, dramatic painted skies, lush detailed worlds, jewel-tone colors, epic cinematic scale, clean manga lines",
    narrative:
      "Aventura high-fantasy com maravilha e mistério. Magia visível, relíquias, juramentos. Sem horror corporal.",
    colors: "jewel tones, dusk gold, forest green, soft magical violet",
  },
  slice: {
    id: "slice",
    label: "Slice of life",
    jp: "日常",
    blurb: "O extraordinário no comum.",
    image:
      "slice of life anime, everyday clothing, warm indoor lighting, gentle expressions, quiet intimate moments, soft natural colors, cozy detailed interiors",
    narrative:
      "Vida cotidiana com calor e humor suave. Conflitos pequenos, refeições, estações, crescimento quieto.",
    colors: "warm natural light, tea tones, wood interiors, late afternoon sky",
  },
  adventure: {
    id: "adventure",
    label: "Aventura",
    jp: "冒険",
    blurb: "Estrada, ruínas, horizonte.",
    image:
      "adventure anime, travel landscapes, wind-blown flowing hair, ancient ruins and maps, golden hour light, sense of wonder, wide cinematic shots, clean manga lineart",
    narrative:
      "Viagem e descoberta. Cada página avança o mapa. Perigo atmosférico, nunca gratuito. Maravilha em primeiro plano.",
    colors: "golden hour, dusty gold, distant blue, trail green",
  },
};

export const STYLE_LIST = Object.values(STYLE_META);

export const IMAGE_SAFETY =
  "anime style, manga style, clean lines, expressive eyes, detailed, cinematic lighting, high quality, no gore, no extreme violence, no blood, no body horror, no wounds, no text, no letters, no written signs, no speech bubbles, no watermark, no signature";
