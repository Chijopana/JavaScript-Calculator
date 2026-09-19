import { useEffect, useState } from "react";
import { usePersistentState } from "./usePersistentState.js";
import { STORAGE_KEYS } from "../lib/storage.js";

const VALID = ["system", "light", "dark"];
const MEDIA = "(prefers-color-scheme: dark)";

/**
 * Tema con tres estados. La versión anterior ignoraba la preferencia del
 * sistema y pintaba el fondo escribiendo en `document.body.style`, así que el
 * color vivía en dos sitios a la vez.
 */
export function useTheme() {
  const [theme, setTheme] = usePersistentState(STORAGE_KEYS.theme, "system", (value) =>
    VALID.includes(value),
  );

  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia?.(MEDIA).matches ?? false,
  );

  useEffect(() => {
    const query = window.matchMedia?.(MEDIA);
    if (!query) return undefined;
    const onChange = (event) => setSystemPrefersDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const resolved = theme === "system" ? (systemPrefersDark ? "dark" : "light") : theme;

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", resolved === "dark" ? "#070b14" : "#eef2f8");
  }, [resolved]);

  const cycleTheme = () =>
    setTheme((previous) => VALID[(VALID.indexOf(previous) + 1) % VALID.length]);

  return { theme, resolved, setTheme, cycleTheme };
}
