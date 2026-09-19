import { useEffect, useRef } from "react";
import Key from "./Key.jsx";

function formatTime(timestamp) {
  try {
    return new Intl.DateTimeFormat("es", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  } catch {
    return "";
  }
}

/**
 * Panel lateral del historial.
 *
 * El anterior era un `absolute` dentro de la tarjeta: en móvil tapaba la
 * calculadora sin fondo que lo separase, se recortaba por el `overflow-hidden`
 * del contenedor y sólo se podía cerrar con el ratón.
 */
export default function HistoryDrawer({ open, entries, onClose, onUse, onCopy, onDelete, onClear }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    closeRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Cerrar el historial"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-[2px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Historial de operaciones"
        className="relative flex h-full w-full max-w-sm flex-col border-l border-line bg-surface shadow-2xl"
      >
        <header className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
          <h2 className="text-base font-bold text-ink">Historial</h2>
          <div className="flex gap-2">
            <Key
              variant="ghost"
              size="small"
              onClick={onClear}
              disabled={entries.length === 0}
              className="border-line"
            >
              Vaciar
            </Key>
            <Key ref={closeRef} variant="function" size="small" onClick={onClose}>
              Cerrar
            </Key>
          </div>
        </header>

        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {entries.length === 0 ? (
            <p className="px-1 py-8 text-center text-sm text-muted">
              Todavía no hay operaciones.
              <br />
              Lo que calcules aparecerá aquí.
            </p>
          ) : (
            entries.map((entry) => (
              <article
                key={entry.id}
                className="rounded-2xl border border-line bg-elevated p-3 transition hover:border-brand/40"
              >
                <p className="tnum break-all text-xs text-muted">{entry.expression}</p>
                <p className="tnum break-all text-lg font-bold text-ink">{entry.resultText}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <time className="text-[10px] uppercase tracking-wider text-muted">
                    {formatTime(entry.at)}
                  </time>
                  <div className="flex gap-1.5">
                    <Key variant="ghost" size="small" onClick={() => onUse(entry)}>
                      Usar
                    </Key>
                    <Key variant="ghost" size="small" onClick={() => onCopy(entry.resultText)}>
                      Copiar
                    </Key>
                    <Key
                      variant="ghost"
                      size="small"
                      onClick={() => onDelete(entry.id)}
                      aria-label="Eliminar del historial"
                      className="hover:!text-danger"
                    >
                      ✕
                    </Key>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
