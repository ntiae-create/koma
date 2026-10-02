import { useEffect, useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { withNewSeed } from "@/lib/comic/images";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  className?: string;
  delayMs?: number;
  caption?: string;
};

const MAX_AUTO_RETRIES = 3;
// Delays entre tentativas automáticas: 300ms, 800ms, 1500ms
const RETRY_DELAYS = [300, 800, 1500];

export function PanelImage({ src, alt, className, delayMs = 0, caption }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [tries, setTries] = useState(0);
  const [loadingPercentage, setLoadingPercentage] = useState(0);

  useEffect(() => {
    setStatus("idle");
    setUrl(null);
    setTries(0);
    setLoadingPercentage(0);
    const t = window.setTimeout(() => {
      setUrl(src);
      setStatus("loading");
      setLoadingPercentage(10);
    }, delayMs);
    return () => window.clearTimeout(t);
  }, [src, delayMs]);

  function retry() {
    const seed = Math.floor(Math.random() * 1_000_000_000);
    setTries((n) => n + 1);
    setStatus("loading");
    setLoadingPercentage(10);
    setUrl(withNewSeed(src, seed));
  }

  function handleError() {
    // Se ainda temos tentativas automáticas, procede com delay crescente
    if (tries < MAX_AUTO_RETRIES) {
      const nextDelay = RETRY_DELAYS[tries];
      const seed = Math.floor(Math.random() * 1_000_000_000);
      
      // Simula o progresso visual enquanto aguarda
      let progress = 10;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        setLoadingPercentage(Math.min(progress, 90));
      }, 100);
      
      const timer = window.setTimeout(() => {
        clearInterval(interval);
        setTries((n) => n + 1);
        setStatus("loading");
        setLoadingPercentage(10);
        setUrl(withNewSeed(src, seed));
      }, nextDelay);
      
      return () => window.clearTimeout(timer);
    } else {
      // Esgotou as tentativas automáticas, mostra erro
      setStatus("error");
      setLoadingPercentage(0);
    }
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-surface-2", className)}>
      {status !== "ready" ? (
        <div className="absolute inset-0 flex flex-col justify-end ink-panel-fallback p-5">
          <span className="koma-stamp mb-auto self-start text-[0.65rem]">原稿</span>
          
          {status === "loading" || status === "idle" ? (
            <>
              <div className="mb-4 flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-ink/60" />
                <span className="text-sm text-ink/60">O pincel ainda está no ar…</span>
              </div>
              {/* Indicador de progresso: barra sutil */}
              <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full bg-ink/30 transition-all duration-300"
                  style={{ width: `${loadingPercentage}%` }}
                />
              </div>
              <p className="text-xs text-ink/50">Tentativa {tries + 1} de {MAX_AUTO_RETRIES + 1}</p>
            </>
          ) : status === "error" ? (
            <>
              <p className="font-display text-lg leading-snug text-ink">Cena em nanquim.</p>
              <p className="mt-3 mb-4 line-clamp-4 text-sm leading-relaxed text-ink/70">{caption || alt}</p>
              <p className="mb-4 text-xs text-ink/50">
                Não conseguimos carregar a imagem após {MAX_AUTO_RETRIES} tentativas automáticas.
                O serviço de arte pode estar indisponível em sua região.
              </p>
              <button
                type="button"
                onClick={retry}
                className="inline-flex h-11 items-center gap-2 self-start rounded-[var(--radius-md)] border border-ink/30 bg-paper px-3 text-sm text-ink transition-colors hover:border-ink/50 hover:bg-paper/80 active:scale-95"
              >
                <RefreshCw className="size-4" />
                Tentar de novo
              </button>
            </>
          ) : null}
        </div>
      ) : null}
      
      {url ? (
        <img
          src={url}
          alt={alt}
          className={cn(
            "relative z-10 h-full w-full object-cover transition-opacity duration-500",
            status === "ready" ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => {
            setStatus("ready");
            setLoadingPercentage(0);
          }}
          onError={handleError}
        />
      ) : null}
    </div>
  );
}
