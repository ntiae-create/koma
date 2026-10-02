import type { Comic } from "./types";

const HISTORY_KEY = "koma-history-v1";
const THEME_KEY = "koma-theme";
const MAX_ITEMS = 24;

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadHistory(): Comic[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Comic[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(items: Comic[]) {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // Quota excedida: descarta os mais antigos.
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 8)));
    } catch {
      /* ignore */
    }
  }
}

export function upsertComic(comic: Comic): Comic[] {
  const prev = loadHistory().filter((c) => c.id !== comic.id);
  const next = [comic, ...prev].slice(0, MAX_ITEMS);
  saveHistory(next);
  return next;
}

export function removeComic(id: string): Comic[] {
  const next = loadHistory().filter((c) => c.id !== id);
  saveHistory(next);
  return next;
}

export function clearHistory() {
  if (!canUseStorage()) return;
  localStorage.removeItem(HISTORY_KEY);
}

export function loadTheme(): "light" | "dark" {
  if (!canUseStorage()) return "light";
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

export function saveTheme(theme: "light" | "dark") {
  if (!canUseStorage()) return;
  localStorage.setItem(THEME_KEY, theme);
}
