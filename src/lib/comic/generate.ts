/**
 * Roteiro via Grok (xAI), no servidor — a chave nunca vai ao browser.
 * Se a API falhar, devolve um roteiro local com a mesma estrutura.
 */
import { createServerFn } from "@tanstack/react-start";
import { buildFallbackStory } from "./fallback";
import { STYLE_META } from "./styles";
import { SUB_STYLES, type GenerateInput, type StoryDraft, type SubStyle } from "./types";

function isSubStyle(v: string): v is SubStyle {
  return (SUB_STYLES as readonly string[]).includes(v);
}

function normalizeInput(raw: unknown): GenerateInput {
  const data = (raw ?? {}) as Record<string, unknown>;
  const prompt = String(data.prompt ?? "").trim();
  const panelCount = Number(data.panelCount);
  const style = String(data.style ?? "fantasy");
  if (prompt.length < 8) throw new Error("Escreva um prompt um pouco mais longo.");
  if (prompt.length > 1600) throw new Error("O prompt passou do limite.");
  if (!Number.isFinite(panelCount) || panelCount < 4 || panelCount > 12) {
    throw new Error("Escolha entre 4 e 12 páginas.");
  }
  if (!isSubStyle(style)) throw new Error("Estilo inválido.");
  return { prompt, panelCount: Math.round(panelCount), style };
}

function extractJson(text: string): unknown {
  const fence = text.match(/```json\s*([\s\S]*?)```/i);
  const raw = fence?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Resposta sem JSON.");
  return JSON.parse(raw.slice(start, end + 1));
}

function asEmotion(v: unknown): "normal" | "shout" | "whisper" | "thought" {
  return v === "shout" || v === "whisper" || v === "thought" ? v : "normal";
}

function coerceDraft(raw: unknown, input: GenerateInput): StoryDraft {
  const d = (raw ?? {}) as Record<string, unknown>;
  const characters = Array.isArray(d.characters)
    ? d.characters.slice(0, 6).map((c) => {
        const x = (c ?? {}) as Record<string, unknown>;
        return {
          name: String(x.name ?? "Personagem").slice(0, 40),
          appearance: String(x.appearance ?? "anime character, expressive eyes").slice(0, 280),
          role: String(x.role ?? "").slice(0, 80),
        };
      })
    : [];
  const panels = Array.isArray(d.panels)
    ? d.panels.map((p) => {
        const x = (p ?? {}) as Record<string, unknown>;
        const dialogues = Array.isArray(x.dialogues)
          ? x.dialogues.slice(0, 3).map((dlg) => {
              const y = (dlg ?? {}) as Record<string, unknown>;
              return {
                speaker: String(y.speaker ?? "").slice(0, 40),
                text: String(y.text ?? "").slice(0, 180),
                emotion: asEmotion(y.emotion),
              };
            })
          : [];
        return {
          visual: String(x.visual ?? "").slice(0, 500),
          narration: String(x.narration ?? "").slice(0, 280),
          dialogues,
        };
      })
    : [];

  const fallback = buildFallbackStory(input.prompt, input.style, input.panelCount);
  const sliced = (panels.length ? panels : fallback.panels).slice(0, input.panelCount);
  while (sliced.length < input.panelCount) {
    const extra = fallback.panels[sliced.length % fallback.panels.length];
    if (!extra) break;
    sliced.push(extra);
  }

  return {
    title: String(d.title ?? fallback.title).slice(0, 80) || fallback.title,
    titleJP: String(d.titleJP ?? fallback.titleJP).slice(0, 40),
    synopsis: String(d.synopsis ?? fallback.synopsis).slice(0, 500) || fallback.synopsis,
    characters: characters.length ? characters : fallback.characters,
    coverVisual: String(d.coverVisual ?? fallback.coverVisual).slice(0, 500),
    panels: sliced.map((p, i) => ({
      visual: p.visual || fallback.panels[i]?.visual || "cinematic anime scene, expressive eyes",
      narration: p.narration,
      dialogues: p.dialogues.filter((x) => x.text.trim()),
    })),
  };
}

function systemPrompt(input: GenerateInput) {
  const meta = STYLE_META[input.style];
  return `Você é roteirista e diretor de mangá/anime. Escreva em português do Brasil (diálogos, narração, título, sinopse). Descrições visuais e "appearance" em INGLÊS, concretas, para um modelo de imagem.

ESTILO: ${meta.label} (${meta.jp}). ${meta.narrative} Visual: ${meta.image}.

REGRAS ABSOLUTAS:
- Sem gore, sangue, feridas explícitas, body horror, tortura, violência extrema, conteúdo sexual, ou menores em situação sexual.
- Conflito pode ser dramático (lâminas cruzadas, magia de luz, perseguição) mas o enquadramento é cinematográfico e limpo.
- Tom emocional e narrativo, não chocante.
- ${input.panelCount} painéis exatamente.
- No máximo 2 personagens falando por painel, 1–2 falas curtas (máx. 140 caracteres).
- Narração só quando agregar (caixa de legendas); pode ser string vazia.
- Cada visual deve especificar: plano (close/medium/wide), personagens presentes, cenário, luz, emoção, paleta.
- Personagens com appearance estável e reutilizável em TODOS os painéis.
- Capa (coverVisual) sem texto escrito na imagem.
- titleJP: curto, kanji/kana, opcional mas desejável.

Responda SOMENTE um JSON:
{
  "title": "",
  "titleJP": "",
  "synopsis": "",
  "characters": [{ "name": "", "appearance": "English visual", "role": "" }],
  "coverVisual": "English cover description",
  "panels": [{ "visual": "English", "narration": "PT-BR ou vazio", "dialogues": [{ "speaker": "", "text": "PT-BR", "emotion": "normal|shout|whisper|thought" }] }]
}

HISTÓRIA PEDIDA:
${input.prompt}`;
}

async function requestStory(input: GenerateInput): Promise<StoryDraft> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return buildFallbackStory(input.prompt, input.style, input.panelCount);

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.85,
      max_tokens: 3600,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt(input) },
        {
          role: "user",
          content: `Gere o roteiro completo de ${input.panelCount} painéis agora.`,
        },
      ],
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!res.ok) {
    throw new Error(`xAI API error ${res.status}`);
  }
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = body.choices?.[0]?.message?.content ?? "";
  return coerceDraft(extractJson(text), input);
}

export const generateStory = createServerFn({ method: "POST" })
  .validator((raw: unknown) => normalizeInput(raw))
  .handler(async ({ data }): Promise<{ ok: true; draft: StoryDraft; source: "ai" | "local" }> => {
    try {
      const draft = await requestStory(data);
      return { ok: true, draft, source: process.env.XAI_API_KEY ? "ai" : "local" };
    } catch {
      return {
        ok: true,
        draft: buildFallbackStory(data.prompt, data.style, data.panelCount),
        source: "local",
      };
    }
  });

export const rewritePanel = createServerFn({ method: "POST" })
  .validator((raw: unknown) => {
    const data = (raw ?? {}) as Record<string, unknown>;
    const prompt = String(data.prompt ?? "").slice(0, 1600);
    const visual = String(data.visual ?? "").slice(0, 500);
    const title = String(data.title ?? "").slice(0, 80);
    const style = String(data.style ?? "fantasy");
    if (!isSubStyle(style)) throw new Error("Estilo inválido.");
    return { prompt, visual, title, style };
  })
  .handler(async ({ data }): Promise<{ visual: string; narration: string; dialogues: StoryDraft["panels"][number]["dialogues"] }> => {
    const apiKey = process.env.XAI_API_KEY;
    const fallback = {
      visual: data.visual,
      narration: "",
      dialogues: [] as StoryDraft["panels"][number]["dialogues"],
    };
    if (!apiKey) return fallback;
    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.9,
          max_tokens: 500,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "Reescreva UM painel de mangá (sem gore). visual em inglês, narration e dialogues em PT-BR. JSON: {visual, narration, dialogues:[{speaker,text,emotion}]}",
            },
            {
              role: "user",
              content: `Título: ${data.title}\nEstilo: ${data.style}\nPrompt: ${data.prompt}\nPainel atual: ${data.visual}\nVarie o enquadramento, mantenha os personagens.`,
            },
          ],
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) return fallback;
      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const parsed = extractJson(body.choices?.[0]?.message?.content ?? "{}") as Record<string, unknown>;
      const dialogues = Array.isArray(parsed.dialogues)
        ? parsed.dialogues.slice(0, 3).map((dlg) => {
            const y = (dlg ?? {}) as Record<string, unknown>;
            return {
              speaker: String(y.speaker ?? "").slice(0, 40),
              text: String(y.text ?? "").slice(0, 180),
              emotion: asEmotion(y.emotion),
            };
          })
        : [];
      return {
        visual: String(parsed.visual ?? data.visual).slice(0, 500),
        narration: String(parsed.narration ?? "").slice(0, 280),
        dialogues: dialogues.filter((x) => x.text.trim()),
      };
    } catch {
      return fallback;
    }
  });
