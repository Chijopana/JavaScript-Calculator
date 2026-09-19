import { useEffect, useRef } from "react";
import { cx } from "../lib/cx.js";

/** Cuanto más larga es la expresión, más pequeña la tipografía. */
function resultSize(text) {
  if (text.length <= 9) return "text-5xl sm:text-6xl";
  if (text.length <= 14) return "text-4xl sm:text-5xl";
  if (text.length <= 20) return "text-3xl sm:text-4xl";
  return "text-2xl sm:text-3xl";
}

export default function Display({
  hint,
  value,
  error,
  badges = [],
  copied,
  onCopy,
  copyDisabled,
}) {
  const hintRef = useRef(null);
  const valueRef = useRef(null);

  // Al escribir una expresión larga, mantener a la vista lo último tecleado.
  useEffect(() => {
    if (hintRef.current) hintRef.current.scrollLeft = hintRef.current.scrollWidth;
    if (valueRef.current) valueRef.current.scrollLeft = valueRef.current.scrollWidth;
  }, [hint, value]);

  return (
    <section
      aria-label="Pantalla"
      className="rounded-3xl border border-line bg-elevated px-4 py-4 shadow-inner sm:px-5"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {badges.map((badge) => (
            <span
              key={badge.label}
              title={badge.title}
              className={cx(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
                badge.active
                  ? "bg-brand text-brand-ink"
                  : "bg-keyalt text-muted",
              )}
            >
              {badge.label}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={onCopy}
          disabled={copyDisabled}
          className={cx(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
            "text-muted hover:bg-keyalt hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent",
            copied && "text-ok",
          )}
          aria-label="Copiar resultado al portapapeles"
        >
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>

      <div
        ref={hintRef}
        className="no-scrollbar tnum h-6 overflow-x-auto whitespace-nowrap text-right text-sm text-muted"
      >
        {hint || " "}
      </div>

      <output
        ref={valueRef}
        aria-live="polite"
        className={cx(
          "no-scrollbar tnum block overflow-x-auto whitespace-nowrap py-1 text-right font-bold leading-tight",
          resultSize(String(value)),
        )}
      >
        {value}
      </output>

      <p
        role="alert"
        className={cx(
          "min-h-5 text-right text-xs font-medium text-danger transition-opacity",
          error ? "opacity-100" : "opacity-0",
        )}
      >
        {error || " "}
      </p>
    </section>
  );
}
