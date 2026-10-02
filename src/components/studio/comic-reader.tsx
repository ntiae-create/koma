import { FileDown, Images, RefreshCw } from "lucide-react";
import { STYLE_META } from "@/lib/comic/styles";
import type { Comic, Panel } from "@/lib/comic/types";
import { Button } from "@/components/ui/button";
import { PanelImage } from "./panel-image";
import { cn } from "@/lib/utils";

function Bubbles({ panel }: { panel: Panel }) {
  if (!panel.dialogues.length) return null;
  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex flex-col items-start gap-2">
      {panel.dialogues.map((d, i) => (
        <div
          key={`${d.speaker}-${i}`}
          className={cn(
            "koma-bubble pointer-events-auto max-w-[92%]",
            d.emotion,
            i % 2 === 1 ? "self-end" : "self-start",
          )}
        >
          {d.speaker ? <span className="speaker">{d.speaker}</span> : null}
          <p>{d.text}</p>
        </div>
      ))}
    </div>
  );
}

function Cover({ comic, onRegen, busy }: { comic: Comic; onRegen: () => void; busy: boolean }) {
  const meta = STYLE_META[comic.style];
  return (
    <article className="koma-page relative overflow-hidden">
      <div className="relative aspect-[2/3] w-full">
        <PanelImage src={comic.coverUrl} alt={`Capa de ${comic.title}`} caption={comic.synopsis} />
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
        <div className="absolute left-4 top-4 z-20">
          <span className="koma-stamp text-[0.65rem]">{meta.jp}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-20 space-y-2 p-5">
          {comic.titleJP ? (
            <p className="font-display text-sm tracking-[0.2em] text-paper/80">{comic.titleJP}</p>
          ) : null}
          <h2 className="font-display text-3xl leading-tight text-paper">{comic.title}</h2>
          <p className="text-sm leading-relaxed text-paper/85">{comic.synopsis}</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t-2 border-ink bg-paper px-4 py-3">
        <p className="text-xs uppercase tracking-[0.16em] text-ink/60">
          {meta.label} · {comic.panelCount} páginas
        </p>
        <Button type="button" size="sm" variant="ghost" className="text-ink" disabled={busy} onClick={onRegen}>
          <RefreshCw />
          Regenerar capa
        </Button>
      </div>
    </article>
  );
}

function PanelPage({
  panel,
  onRegen,
  busy,
}: {
  panel: Panel;
  onRegen: () => void;
  busy: boolean;
}) {
  return (
    <article className="koma-page overflow-hidden">
      {panel.narration ? <p className="koma-narration">{panel.narration}</p> : null}
      <div className="koma-panel relative aspect-[2/3] w-full">
          <PanelImage
            src={panel.imageUrl}
            alt={panel.visual}
            caption={panel.visual}
            delayMs={panel.number * 700}
          />
        <Bubbles panel={panel} />
      </div>
      <div className="flex items-center justify-between gap-2 border-t-2 border-ink bg-paper px-4 py-3">
        <p className="font-display text-sm text-ink/70">Página {panel.number}</p>
        <Button type="button" size="sm" variant="ghost" className="text-ink" disabled={busy} onClick={onRegen}>
          <RefreshCw />
          Regenerar este painel
        </Button>
      </div>
    </article>
  );
}

type Props = {
  comic: Comic;
  busyId: string | null;
  exporting: boolean;
  onRegenPanel: (id: string) => void;
  onRegenCover: () => void;
  onPdf: () => void;
  onZip: () => void;
};

export function ComicReader({ comic, busyId, exporting, onRegenPanel, onRegenCover, onPdf, onZip }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="no-print flex flex-wrap gap-2">
        <Button type="button" variant="default" onClick={onPdf} disabled={exporting}>
          <FileDown />
          Exportar como PDF
        </Button>
        <Button type="button" variant="outline" onClick={onZip} disabled={exporting}>
          <Images />
          Baixar todas as imagens
        </Button>
      </div>
      <Cover comic={comic} onRegen={onRegenCover} busy={busyId === "cover"} />
      {comic.panels.map((panel) => (
        <PanelPage
          key={panel.id}
          panel={panel}
          busy={busyId === panel.id}
          onRegen={() => onRegenPanel(panel.id)}
        />
      ))}
      <p className="pb-10 text-center text-xs tracking-[0.18em] text-subtle">
        FIM · {comic.titleJP || comic.title}
      </p>
    </div>
  );
}
