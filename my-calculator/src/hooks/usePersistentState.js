import { useEffect, useRef, useState } from "react";
import { readStored, writeStored } from "../lib/storage.js";

/**
 * `useState` que se guarda en localStorage.
 *
 * El valor inicial se lee de forma perezosa dentro de `useState`, no en un
 * `useEffect` posterior: así no hay parpadeo al cargar y, sobre todo, no se
 * pisa el valor guardado. `validate` filtra datos corruptos o de versiones
 * antiguas.
 */
export function usePersistentState(key, defaultValue, validate) {
  const [value, setValue] = useState(() => {
    const stored = readStored(key, undefined);
    if (stored === undefined) return defaultValue;
    if (validate && !validate(stored)) return defaultValue;
    return stored;
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    writeStored(key, value);
  }, [key, value]);

  return [value, setValue];
}
