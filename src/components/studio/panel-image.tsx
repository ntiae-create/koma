import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { withNewSeed } from "@/lib/comic/images";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  className?: string;
  delayMs?: number;
  caption?: string;
};

export function PanelImage({ src, alt, className, delayMs = 0, caption }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [tries, setTries] = useState(0);

  useEffect(() => {
    setStatus("idle");
    setUrl(null);
    setTries(0);
    const t = window.setTimeout(() => {
      setUrl(src);
      setStatus("loading");
    }, delayMs);
    return () => window.clearTimeout(t);
  }, [src, delayMs]);

  function retry() {
    const seed = Math.floor(Math.random() * 1_000_000_000);
    setTries((n) => n + 1);
    setStatus("loading");
    setUrl(withNewSeed(src, seed));
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-surface-2", className)}>
      {status !== "ready" ? (
        <div className="absolute inset-0 flex flex-col justify-end ink-panel-fallback p-5">
          <span className="koma-stamp mb-auto self-start text-[0.65rem]">原稿</span>
          <p className="font-display text-lg leading-snug text-ink">
            {status === "loading" || status === "idle" ? "O pincel ainda está no ar." : "Cena em nanquim."}
          </p>
          <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-ink/70">{caption || alt}</p>
          {status === "error" ? (
            <button
              type="button"
              onClick={retry}
              className="mt-4 inline-flex h-11 items-center gap-2 self-start rounded-[var(--radius-md)] border border-ink/30 bg-paper px-3 text-sm text-ink"
            >
              <RefreshCw className="size-4" />
              Tentar de novo
            </button>
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
          onLoad={() => setStatus("ready")}
          onError={() => {
            if (tries >= 1) {
              setStatus("error");
              return;
            }
            const seed = Math.floor(Math.random() * 1_000_000_000);
            setTries(1);
            setStatus("loading");
            setUrl(withNewSeed(src, seed));
          }}
        />
      ) : null}
    </div>
  );
}
