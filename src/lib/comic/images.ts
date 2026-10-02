import { createServerFn } from "@tanstack/react-start";
import { IMAGE_SAFETY, STYLE_META } from "./styles";
import type { Comic, Panel, StoryDraft, SubStyle } from "./types";

const POLLINATIONS = "https://image.pollinations.ai/prompt";
const MAX_PROXY_ATTEMPTS = 3;

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

async function fetchPollinationsImage(prompt: string, seed: number, attempt: number): Promise<string> {
  const url = buildImageUrl(prompt, seed);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
    });

    if (!response.ok || response.status === 402 || response.status === 429 || response.status >= 500) {
      if (attempt < MAX_PROXY_ATTEMPTS) {
        return fetchPollinationsImage(prompt, randomSeed(), attempt + 1);
      }
      throw new Error(`Pollinations rejected the image request (${response.status})`);
    }

    const contentType = response.headers.get("content-type") ?? "image/png";
    const mimeType = contentType.startsWith("image/") ? contentType : "image/png";
    const bytes = Buffer.from(await response.arrayBuffer());
    return `data:${mimeType};base64,${bytes.toString("base64")}`;
  } catch (error) {
    if (attempt < MAX_PROXY_ATTEMPTS) {
      return fetchPollinationsImage(prompt, randomSeed(), attempt + 1);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export const getImageUrl = createServerFn({ method: "POST" })
  .validator((raw: unknown) => {
    const data = (raw ?? {}) as Record<string, unknown>;
    const prompt = String(data.prompt ?? "").trim();
    const seed = Number(data.seed ?? randomSeed());
    if (!prompt) throw new Error("Prompt de imagem ausente.");
    if (!Number.isFinite(seed)) throw new Error("Seed inválida.");
    return { prompt, seed };
  })
  .handler(async ({ data }): Promise<string> => {
    // Proxy no servidor para evitar 402, timeouts e bloqueios regionais do Pollinations no browser.
    return fetchPollinationsImage(data.prompt, data.seed, 1);
  });

export async function resolveImageUrl(prompt: string, seed: number): Promise<string> {
  try {
    return await getImageUrl({ data: { prompt, seed } });
  } catch {
    return buildImageUrl(prompt, seed);
  }
}

export async function buildComic(
  draft: StoryDraft,
  input: { prompt: string; style: SubStyle; panelCount: number },
  source: Comic["source"],
): Promise<Comic> {
  const characters = draft.characters.slice(0, 6);
  const coverSeed = randomSeed();
  const coverVisual =
    draft.coverVisual ||
    `cinematic manga cover, the main characters of the story, dramatic sky, ${STYLE_META[input.style].image}`;

  const panels: Panel[] = await Promise.all(
    draft.panels.slice(0, input.panelCount).map(async (p, i) => {
      const seed = randomSeed();
      return {
        id: uid("p"),
        number: i + 1,
        visual: p.visual,
        narration: p.narration || "",
        dialogues: (p.dialogues || []).slice(0, 3),
        seed,
        imageUrl: await resolveImageUrl(composeImagePrompt(p.visual, input.style, characters), seed),
      };
    }),
  );

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
    coverUrl: await resolveImageUrl(composeImagePrompt(coverVisual, input.style, characters), coverSeed),
    panels,
    source,
  };
}

export async function regeneratePanelImage(comic: Comic, panelId: string, visualOverride?: string): Promise<Comic> {
  const seed = randomSeed();
  const nextVisual = visualOverride ?? comic.panels.find((p) => p.id === panelId)?.visual ?? "";

  const panels = await Promise.all(
    comic.panels.map(async (p) =>
      p.id === panelId
        ? {
            ...p,
            seed,
            visual: nextVisual || p.visual,
            imageUrl: await resolveImageUrl(
              composeImagePrompt(nextVisual || p.visual, comic.style, comic.characters),
              seed,
            ),
          }
        : p,
    ),
  );

  return { ...comic, panels };
}

export async function regenerateCover(comic: Comic): Promise<Comic> {
  const seed = randomSeed();
  return {
    ...comic,
    coverSeed: seed,
    coverUrl: await resolveImageUrl(composeImagePrompt(comic.coverVisual, comic.style, comic.characters), seed),
  };
}
