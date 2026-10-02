import { cn } from "@/lib/utils";

export function KomaMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <rect x="1" y="1" width="30" height="30" fill="currentColor" className="text-fg" />
      <rect x="3.2" y="3.2" width="11.4" height="11.4" fill="var(--koma-paper)" />
      <rect x="17.4" y="3.2" width="11.4" height="11.4" fill="var(--koma-paper)" />
      <rect x="3.2" y="17.4" width="11.4" height="11.4" fill="var(--koma-accent)" />
      <rect x="17.4" y="17.4" width="11.4" height="11.4" fill="var(--koma-paper)" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <KomaMark />
      <div className="leading-none">
        <p className="font-display text-xl tracking-tight text-fg">Koma</p>
        {!compact ? (
          <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-muted">
            estúdio de mangá
          </p>
        ) : null}
      </div>
    </div>
  );
}
