import { useEffect, useRef, useState } from "react";
import { Library, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { generateStory, rewritePanel } from "@/lib/comic/generate";
import { buildFallbackStory } from "@/lib/comic/fallback";
import { buildComic, panelImageUrl, regenerateCover, regeneratePanelImage } from "@/lib/comic/images";
import { clearHistory, loadHistory, removeComic, upsertComic } from "@/lib/comic/storage";
import type { Comic, SubStyle } from "@/lib/comic/types";
import { ComicReader } from "./comic-reader";
import { HistoryPanel } from "./history-panel";
import { Logo } from "./logo";
import { PromptForm } from "./prompt-form";

const SAMPLE_PROMPT =
  "uma jovem maga e um espadachim viajam por um reino amaldiçoado em busca de uma relíquia perdida";

export function StudioApp() {
  const { theme, toggle } = useTheme();
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT);
  const [style, setStyle] = useState<SubStyle>("fantasy");
  const [panelCount, setPanelCount] = useState(6);
  const [comic, setComic] = useState<Comic | null>(null);
  const [history, setHistory] = useState<Comic[]>([]);
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items = loadHistory();
    setHistory(items);
    if (items[0]) setComic(items[0]);
  }, []);

  function persist(next: Comic) {
    setComic(next);
    setHistory(upsertComic(next));
  }

  async function runGenerate() {
    const input = { prompt: prompt.trim(), style, panelCount };
    if (input.prompt.length < 8) {
      toast.error("Escreva um pouco mais sobre a história.");
      return;
    }
    setGenerating(true);
    setStep("Compondo o roteiro…");
    try {
      const result = await generateStory({ data: input });
      setStep("Preparando os pincéis…");
      const next = buildComic(result.draft, input, result.source);
      persist(next);
      if (result.source === "local") {
        toast.message("Roteiro local — a arte segue o mesmo estilo.");
      } else {
        toast.success("Capítulo composto.");
      }
      requestAnimationFrame(() => {
        readerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch {
      const next = buildComic(buildFallbackStory(input.prompt, input.style, input.panelCount), input, "local");
      persist(next);
      toast.message("Usamos um roteiro reserva. A arte continua no estilo escolhido.");
    } finally {
      setGenerating(false);
      setStep("");
    }
  }

  function loadExample() {
    const input = { prompt: SAMPLE_PROMPT, style: "fantasy" as const, panelCount: 8 };
    setPrompt(input.prompt);
    setStyle(input.style);
    setPanelCount(input.panelCount);
    const next = buildComic(buildFallbackStory(input.prompt, input.style, input.panelCount), input, "local");
    persist(next);
    toast.success("Exemplo carregado — as páginas estão sendo desenhadas.");
    requestAnimationFrame(() => {
      readerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function onRegenPanel(panelId: string) {
    if (!comic) return;
    setBusyId(panelId);
    const panel = comic.panels.find((p) => p.id === panelId);
    try {
      if (panel) {
        const rewritten = await rewritePanel({
          data: {
            prompt: comic.prompt,
            visual: panel.visual,
            title: comic.title,
            style: comic.style,
          },
        });
        const seed = Math.floor(Math.random() * 1_000_000_000);
        const updated: Comic = {
          ...comic,
          panels: comic.panels.map((p) =>
            p.id === panelId
              ? {
                  ...p,
                  visual: rewritten.visual || p.visual,
                  narration: rewritten.narration || p.narration,
                  dialogues: rewritten.dialogues.length ? rewritten.dialogues : p.dialogues,
                  seed,
                  imageUrl: panelImageUrl(
                    rewritten.visual || p.visual,
                    comic.style,
                    comic.characters,
                    seed,
                  ),
                }
              : p,
          ),
        };
        persist(updated);
      } else {
        persist(regeneratePanelImage(comic, panelId));
      }
    } catch {
      persist(regeneratePanelImage(comic, panelId));
    } finally {
      setBusyId(null);
    }
  }

  function onRegenCover() {
    if (!comic) return;
    setBusyId("cover");
    persist(regenerateCover(comic));
    setTimeout(() => setBusyId(null), 400);
  }

  async function onPdf() {
    if (!comic) return;
    setExporting(true);
    try {
      const { exportComicPdf } = await import("@/lib/comic/export");
      await exportComicPdf(comic);
      toast.success("PDF pronto.");
    } catch {
      window.print();
    } finally {
      setExporting(false);
    }
  }

  async function onZip() {
    if (!comic) return;
    setExporting(true);
    try {
      const { downloadAllImages } = await import("@/lib/comic/export");
      await downloadAllImages(comic);
      toast.success("Arquivo de imagens pronto.");
    } catch {
      toast.error("Não foi possível empacotar as imagens. Tente de novo em instantes.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="ink-wash min-h-dvh">
      <header className="no-print sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Logo compact />
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" onClick={() => setHistoryOpen(true)} aria-label="Histórico">
              <Library />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={toggle} aria-label="Alternar tema">
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-12 lg:py-12">
        <div className="no-print lg:sticky lg:top-24">
          <PromptForm
            prompt={prompt}
            style={style}
            panelCount={panelCount}
            generating={generating}
            onPrompt={setPrompt}
            onStyle={setStyle}
            onCount={setPanelCount}
            onGenerate={() => void runGenerate()}
            onExample={loadExample}
          />
          {generating ? (
            <p className="mt-4 text-sm text-muted" aria-live="polite">
              {step}
            </p>
          ) : null}
        </div>

        <div ref={readerRef} className="min-w-0">
          {comic ? (
            <ComicReader
              comic={comic}
              busyId={busyId}
              exporting={exporting}
              onRegenPanel={(id) => void onRegenPanel(id)}
              onRegenCover={onRegenCover}
              onPdf={() => void onPdf()}
              onZip={() => void onZip()}
            />
          ) : (
            <EmptyReader />
          )}
        </div>
      </main>

      <HistoryPanel
        open={historyOpen}
        items={history}
        currentId={comic?.id}
        onClose={() => setHistoryOpen(false)}
        onSelect={(c) => {
          setComic(c);
          setPrompt(c.prompt);
          setStyle(c.style);
          setPanelCount(c.panelCount);
          setHistoryOpen(false);
        }}
        onDelete={(id) => {
          const next = removeComic(id);
          setHistory(next);
          if (comic?.id === id) setComic(next[0] ?? null);
        }}
        onClear={() => {
          clearHistory();
          setHistory([]);
        }}
      />
    </div>
  );
}

function EmptyReader() {
  return (
    <div className="koma-page mx-auto flex min-h-[28rem] max-w-lg flex-col items-start justify-end gap-4 p-8">
      <span className="koma-stamp text-xs">空白</span>
      <h2 className="font-display text-3xl leading-tight text-ink">A página ainda está em branco.</h2>
      <p className="max-w-prose text-sm leading-relaxed text-ink/70">
        Escolha um estilo, descreva o mundo e gere o capítulo. As páginas sobem como um manhwa —
        capa, narração, balões e arte.
      </p>
    </div>
  );
}
