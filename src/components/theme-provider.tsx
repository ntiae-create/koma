import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadTheme, saveTheme } from "@/lib/comic/storage";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initial = loadTheme();
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggle: () => {
        setTheme((prev) => {
          const next = prev === "dark" ? "light" : "dark";
          saveTheme(next);
          document.documentElement.classList.toggle("dark", next === "dark");
          return next;
        });
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
