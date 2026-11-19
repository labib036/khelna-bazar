"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "system" | "light" | "dark";
export type ThemeMode = Theme;

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("kb_theme") as Theme | null;
        if (stored === "light" || stored === "dark" || stored === "system") {
          return stored;
        }
        const dataTheme = document.documentElement.getAttribute("data-theme") as Theme | null;
        if (dataTheme === "light" || dataTheme === "dark") {
          return dataTheme;
        }
      } catch {
        // Storage access restricted
      }
    }
    return "system";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("kb_theme");
        if (stored === "light" || stored === "dark") return stored;
        if (
          document.documentElement.classList.contains("dark") ||
          document.documentElement.getAttribute("data-theme") === "dark"
        ) {
          return "dark";
        }
        if (
          document.documentElement.classList.contains("light") ||
          document.documentElement.getAttribute("data-theme") === "light"
        ) {
          return "light";
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      } catch {
        // Window access restricted
      }
    }
    return "light";
  });

  const applyThemeToDOM = (target: "light" | "dark") => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (target === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    }
  };

  // Sync with OS preference & state changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const resolveAndApply = () => {
      const isSystemDark = mediaQuery.matches;
      let target: "light" | "dark" = "light";

      if (theme === "dark") {
        target = "dark";
      } else if (theme === "light") {
        target = "light";
      } else {
        target = isSystemDark ? "dark" : "light";
      }

      setResolvedTheme(target);
      applyThemeToDOM(target);
    };

    resolveAndApply();

    const listener = () => {
      if (theme === "system") {
        resolveAndApply();
      }
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("kb_theme", newTheme);
    } catch {
      // localStorage may fail in private mode
    }

    // Immediately apply to DOM for zero-latency tactile feedback
    if (typeof window !== "undefined") {
      let target: "light" | "dark" = "light";
      if (newTheme === "dark") {
        target = "dark";
      } else if (newTheme === "light") {
        target = "light";
      } else {
        target = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      setResolvedTheme(target);
      applyThemeToDOM(target);
    }
  };

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "system" as Theme,
      resolvedTheme: "light" as "light" | "dark",
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}
