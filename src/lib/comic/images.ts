import { IMAGE_SAFETY, STYLE_META } from "./styles";
import type { Comic, Panel, StoryDraft, SubStyle } from "./types";

const POLLINATIONS = "https://image.pollinations.ai/prompt";

function randomSeed() {
  return Math.floor(Math.random() * 1_000_000_000);
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

/** Monta o prompt visual de um painel, com personagens estáveis e estilo escolhido. */
export function composeImagePrompt(
  visual: string,
  style: SubStyle,
  characters: StoryDraft["characters"],
): string {
  const meta = STYLE_META[style];
  const cast = characters
    .slice(0, 4)
    .map((c) => `${c.name} (${c.appearance})`)
    .join("; ");
  const prompt = [
    meta.image,
    cast ? `consistent characters: ${cast}` : "",
    visual,
    meta.colors,
    IMAGE_SAFETY,
  ]
    .filter(Boolean)
    .join(", ");
  return prompt.slice(0, 420);
}

export function buildImageUrl(prompt: string, seed: number): string {
  const encoded = encodeURIComponent(prompt);
  // URL mínima: parâmetros extras (model/nologo/size) disparam 402 em alguns IPs.
  return `${POLLINATIONS}/${encoded}?seed=${seed}`;
}

export function panelImageUrl(panelVisual: string, style: SubStyle, characters: StoryDraft["characters"], seed: number) {
  return buildImageUrl(composeImagePrompt(panelVisual, style, characters), seed);
}

export function withNewSeed(url: string, seed: number): string {
  try {
    const u = new URL(url);
    u.searchParams.set("seed", String(seed));
    return u.toString();
  } catch {
    return url;
  }
}

/** Transforma o roteiro cru num quadrinho pronto para desenhar. */
export function buildComic(
  draft: StoryDraft,
  input: { prompt: string; style: SubStyle; panelCount: number },
  source: Comic["source"],
): Comic {
  const characters = draft.characters.slice(0, 6);
  const coverSeed = randomSeed();
  const coverVisual =
    draft.coverVisual ||
    `cinematic manga cover, the main characters of the story, dramatic sky, ${STYLE_META[input.style].image}`;

  const panels: Panel[] = draft.panels.slice(0, input.panelCount).map((p, i) => {
    const seed = randomSeed();
    return {
      id: uid("p"),
      number: i + 1,
      visual: p.visual,
      narration: p.narration || "",
      dialogues: (p.dialogues || []).slice(0, 3),
      seed,
      imageUrl: panelImageUrl(p.visual, input.style, characters, seed),
    };
  });

  return {
    id: uid("koma"),
    createdAt: Date.now(),
    prompt: input.prompt,
    style: input.style,
    panelCount: panels.length,
    title: draft.title || "Sem título",
    titleJP: draft.titleJP || "",
    synopsis: draft.synopsis || "",
    characters,
    coverVisual,
    coverSeed,
    coverUrl: panelImageUrl(coverVisual, input.style, characters, coverSeed),
    panels,
    source,
  };
}

export function regeneratePanelImage(comic: Comic, panelId: string): Comic {
  const seed = randomSeed();
  return {
    ...comic,
    panels: comic.panels.map((p) =>
      p.id === panelId
        ? {
            ...p,
            seed,
            imageUrl: panelImageUrl(p.visual, comic.style, comic.characters, seed),
          }
        : p,
    ),
  };
}

export function regenerateCover(comic: Comic): Comic {
  const seed = randomSeed();
  return {
    ...comic,
    coverSeed: seed,
    coverUrl: panelImageUrl(comic.coverVisual, comic.style, comic.characters, seed),
  };
}
