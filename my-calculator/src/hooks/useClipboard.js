import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Copia al portapapeles y avisa durante un momento.
 *
 * Sólo se copia cuando el usuario lo pide: antes cada "=" sobrescribía el
 * portapapeles sin avisar. El `timeout` se limpia al desmontar para no tocar el
 * estado de un componente que ya no existe.
 */
export function useClipboard(resetAfter = 1200) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const copy = useCallback(
    async (text) => {
      const value = String(text ?? "");
      if (!value) return false;

      try {
        if (!navigator.clipboard?.writeText) return false;
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setCopied(false), resetAfter);
        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [resetAfter],
  );

  return { copied, copy };
}
