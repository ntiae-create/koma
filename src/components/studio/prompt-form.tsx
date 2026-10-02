import { PenLine } from "lucide-react";
import { STYLE_LIST } from "@/lib/comic/styles";
import type { SubStyle } from "@/lib/comic/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "uma jovem maga e um espadachim viajam por um reino amaldiçoado em busca de uma relíquia perdida",
  "dois colegas descobrem que a biblioteca da escola esconde um portal para um mundo de estações invertidas",
  "uma espiã desastrada tenta viver uma vida comum com a família que ela mesma inventou",
];

const COUNTS = [4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

type Props = {
  prompt: string;
  style: SubStyle;
  panelCount: number;
  generating: boolean;
  onPrompt: (v: string) => void;
  onStyle: (v: SubStyle) => void;
  onCount: (v: number) => void;
  onGenerate: () => void;
  onExample: () => void;
};

export function PromptForm({
  prompt,
  style,
  panelCount,
  generating,
  onPrompt,
  onStyle,
  onCount,
  onGenerate,
  onExample,
}: Props) {
  return (
    <section className="flex flex-col gap-6">
      <header className="space-y-2">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-accent">
          第1話 · novo capítulo
        </p>
        <h1 className="font-display text-3xl leading-tight tracking-tight text-fg sm:text-4xl">
          Escreva o mundo.
          <span className="block text-muted">Nós desenhamos as páginas.</span>
        </h1>
        <p className="max-w-prose text-sm leading-relaxed text-muted">
          Um prompt, um estilo, e um mangá vertical — roteiro, balões e arte em
          nanquim digital. Sem conta. Sem créditos.
        </p>
      </header>

      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
          Prompt da história
        </span>
        <Textarea
          value={prompt}
          onChange={(e) => onPrompt(e.target.value)}
          placeholder="uma jovem maga e um espadachim viajam por um reino amaldiçoado…"
          maxLength={1600}
          className="min-h-36 font-sans"
        />
        <span className="block text-right text-xs tabular-nums text-subtle">{prompt.length}/1600</span>
      </label>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => onPrompt(ex)}
            className="max-w-full rounded-full border border-border bg-surface px-3 py-2 text-left text-xs leading-snug text-muted transition-colors hover:border-border-strong hover:text-fg"
          >
            {ex}
          </button>
        ))}
      </div>

      <fieldset className="space-y-3">
        <legend className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Estilo</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {STYLE_LIST.map((item) => {
            const active = item.id === style;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onStyle(item.id)}
                className={cn(
                  "flex min-h-16 flex-col items-start rounded-[var(--radius-lg)] border px-3 py-3 text-left transition-colors",
                  active
                    ? "border-accent bg-surface-2"
                    : "border-border bg-surface hover:border-border-strong",
                )}
              >
                <span className="font-display text-sm text-fg">{item.label}</span>
                <span className="text-[0.65rem] tracking-[0.18em] text-accent">{item.jp}</span>
                <span className="mt-1 text-xs text-muted">{item.blurb}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
          Páginas · {panelCount}
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onCount(n)}
              className={cn(
                "size-11 rounded-[var(--radius-sm)] border text-sm tabular-nums transition-colors",
                n === panelCount
                  ? "border-fg bg-fg text-bg"
                  : "border-border bg-surface text-fg hover:border-border-strong",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="accent"
          size="lg"
          className="flex-1"
          disabled={generating || prompt.trim().length < 8}
          onClick={onGenerate}
        >
          <PenLine />
          {generating ? "Compondo o capítulo…" : "Gerar história completa"}
        </Button>
        <Button type="button" variant="outline" size="lg" disabled={generating} onClick={onExample}>
          Ver exemplo
        </Button>
      </div>
    </section>
  );
}
