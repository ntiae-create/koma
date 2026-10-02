import { Library, Trash2, X } from "lucide-react";
import type { Comic } from "@/lib/comic/types";
import { STYLE_META } from "@/lib/comic/styles";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  items: Comic[];
  currentId?: string;
  onClose: () => void;
  onSelect: (comic: Comic) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
};

export function HistoryPanel({ open, items, currentId, onClose, onSelect, onDelete, onClear }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Fechar histórico"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-bg-elevated shadow-[var(--shadow-soft)]">
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Library className="size-4 text-accent" />
            <h2 className="font-display text-lg">Histórico</h2>
          </div>
          <Button type="button" size="icon" variant="ghost" onClick={onClose} aria-label="Fechar">
            <X />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="px-2 py-10 text-sm text-muted">Nenhum capítulo salvo neste aparelho.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((c) => (
                <li key={c.id}>
                  <div
                    className={`flex gap-3 rounded-[var(--radius-lg)] border p-2 ${
                      currentId === c.id ? "border-accent bg-surface-2" : "border-border bg-surface"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(c)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <img
                        src={c.coverUrl}
                        alt=""
                        className="size-14 shrink-0 rounded-[var(--radius-sm)] object-cover"
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-display text-sm text-fg">{c.title}</span>
                        <span className="block truncate text-xs text-muted">
                          {STYLE_META[c.style].label} · {c.panelCount} pág.
                        </span>
                      </span>
                    </button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Apagar ${c.title}`}
                      onClick={() => onDelete(c.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 ? (
          <footer className="border-t border-border p-4">
            <Button type="button" variant="outline" className="w-full" onClick={onClear}>
              Limpar histórico
            </Button>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
